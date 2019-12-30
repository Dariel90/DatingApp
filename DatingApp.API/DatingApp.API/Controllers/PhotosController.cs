using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace DatingApp.API.Controllers {
    [Authorize]
    [Route ("api/users/{userId}/photos")]
    [ApiController]
    public class PhotosController : ControllerBase{
        private readonly IDatingRepository _repo;
        private readonly Cloudinary _cloudinary;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;

        public PhotosController (IDatingRepository repo, IMapper mapper,
            IOptions<CloudinarySettings> cloudinaryConfig) {
            _cloudinaryConfig = cloudinaryConfig;
            _mapper = mapper;
            _repo = repo;
            _cloudinary = new Cloudinary(
                new Account(
                    _cloudinaryConfig.Value.CloudName,
                    _cloudinaryConfig.Value.ApiKey,
                    cloudinaryConfig.Value.ApiSecret)
            );
        }

        [HttpGet ("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id){
            var photoFromRepo = await _repo.GetPhoto(id);
            var photo = _mapper.Map<PhotoForReturnDto>(photoFromRepo);
            return Ok(photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotosForUser(int userId, [FromForm]PhotoForCreationDto photoForCreationDto){

            //Comporuebo que el usuario que realizó la petición exista en la BD
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) return Unauthorized();
            var userFromRepo = await _repo.GetUser(userId);
            //Obtengo el fichero que el usuario subió
            var file = photoForCreationDto.File;
            //Creo la instancia para almacenar los datos de la imagen que se va a subir
            var uploadResult = new ImageUploadResult();

            //Se comprueba que el fichero tenga datos
            if(file.Length > 0){
                //Se lee el stream del fichero
                using (var stream = file.OpenReadStream())
                {
                    //Se prepara la instancia del objeto con el fichero y la transforamción de la imagen
                    var uploadParams = new ImageUploadParams(){
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };
                    //Se sube el fichero a Cloudinary
                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }
            //Se obtienen los datos de la foto que se subio para preparar el dato para guardarlo en la bd
            photoForCreationDto.Url = uploadResult.Uri.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;

            //Se realiza el mapeo a la clase Photo para guardarla en la BD
            var photo = _mapper.Map<Photo>(photoForCreationDto);

            //Si el usuario no tiene alguna foto marcada como principal
            //se marca la foto subida como principal
            if(!userFromRepo.Photos.Any(u => u.isMain))
                photo.isMain = true;

            //Se guardan los metadatos de la foto subida
            userFromRepo.Photos.Add(photo);

            //Se salvan los datos en la BD
            if(await _repo.SaveAll()){
                var photoToReturn = _mapper.Map<PhotoForReturnDto>(photo);

                return CreatedAtRoute("GetPhoto", new { id = photo.Id}, photoToReturn);
            }
            //En caso de error se envía una BadRequest
            return BadRequest("Could not add the photo");

        }

        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> setMainPhotlo(int userId, int id){
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) return Unauthorized();
            var user = await _repo.GetUser(userId);

            if(!user.Photos.Any(p => p.Id == id)) return Unauthorized();

            var photoFromRepo = await _repo.GetPhoto(id);

            if(photoFromRepo.isMain) return BadRequest("This is alredy the main photo");

            var currentMainPhoto = await _repo.GetMainPhotoForUser(userId);
            currentMainPhoto.isMain = false;

            photoFromRepo.isMain = true;

            if(await _repo.SaveAll())
                return NoContent();

            return BadRequest("Cloud not set photo to main");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id){
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) return Unauthorized();
            var user = await _repo.GetUser(userId);

            if(!user.Photos.Any(p => p.Id == id)) return Unauthorized();

            var photoFromRepo = await _repo.GetPhoto(id);

            if(photoFromRepo.isMain) return BadRequest("You cannot delete the main photo");

            if(photoFromRepo.PublicId != null){
                var deleteParams = new DeletionParams(photoFromRepo.PublicId);
                var result = _cloudinary.Destroy(deleteParams);

                if(result.Result == "OK") {
                    _repo.Delete(photoFromRepo);
                };
            }

            if(photoFromRepo.PublicId == null){
                _repo.Delete(photoFromRepo);
            }

            if(await _repo.SaveAll()) return Ok();

            return BadRequest("Fail to delete the photo");
        }
    }
}