import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
   intercept(
     req: import('@angular/common/http').HttpRequest<any>,
     next: import('@angular/common/http').HttpHandler
   ): import('rxjs').Observable<import('@angular/common/http').HttpEvent<any>> {
     return next.handle(req).pipe(
       catchError(error => {
         //Error 401
         if (error.status == 401) {
           return throwError(error.statusText);
         }
         //Error 500
         if (error instanceof HttpErrorResponse) {
            const applicationError =  error.headers.get('Application-Error');
            if (applicationError) {
              return throwError(applicationError);
            }
            //Error al registrar que puede enviarse vacio usuario y/o contraseña,
            //o que el password no concuerde con el Data Annotation establecido en el DTO
            // Se obtienen los errores y se separan las llaves de Username y Password
            // con sus respectivos errores.
            const serverError = error.error;
            let modalStateError = '';
            if (serverError.errors && typeof serverError.errors === 'object') {
              for (const key in serverError.errors) {
                if (serverError.errors[key]) {
                  modalStateError += serverError.errors[key] + '\n';
                }
              }
            }
            return throwError(modalStateError || serverError || 'Server Error');
         }
       })
     );
   }
}

export const ErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true,
}
