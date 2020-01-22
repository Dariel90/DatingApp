using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace DatingApp.API.Data
{
    public static class Seed
    {
        public static async Task SeedUsers(DataContext dataContext, IServiceProvider SvcProv){
            var roleManager = SvcProv.GetRequiredService<RoleManager<Role>>();
            var userManager = SvcProv.GetRequiredService<UserManager<User>>();
            if(!userManager.Users.Any()){
                var userData = System.IO.File.ReadAllText("Data/UserSeedData.json");
                var users = JsonConvert.DeserializeObject<List<User>>(userData);

                //Create some roles
                var roles = new List<Role>{
                    new Role{ Name = "Member"},
                    new Role{ Name = "Admin"},
                    new Role{ Name = "Moderator"},
                    new Role{ Name = "VIP"},
                };
                //Strorage roles in DB
                foreach (var role in roles)
                {
                    await roleManager.CreateAsync(role);
                }
                //Storage users from UserSeedData.json as members
                foreach (var user in users)
                {
                    user.Photos.SingleOrDefault().IsApproved = true;
                    await userManager.CreateAsync(user, "password");
                    await userManager.AddToRoleAsync(user, "Member");
                }
                //Create an Admin user
                var adminUser = new User{
                    UserName = "Admin"
                };
                //Storage the Admin user in DB
                var result = userManager.CreateAsync(adminUser, "password").Result;
                //If the result of create an admin user was succeeded
                //then add the roles of "Admin" and "Moderator" to the admin user
                if(result.Succeeded){
                    var admin = userManager.FindByNameAsync("Admin").Result;
                    await userManager.AddToRolesAsync(admin, new[]{"Admin", "Moderator"});
                }
            }
        }

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using(var hmac = new System.Security.Cryptography.HMACSHA512()){
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }
    }
}