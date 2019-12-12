import { ErrorInterceptorProvider } from './_services/error.interceptor';
//Servicio de Autenticación
import { AuthService } from './_services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//Modulo para ejecutar las llamdas a la api
import { HttpClientModule } from '@angular/common/http';
//Componente principal
import { AppComponent } from './app.component';
//Componente del NavBar
import { NavComponent } from './nav/nav.component';
//Modulo para poder utilizar el envio de formularios
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
   declarations: [
      AppComponent,
      NavComponent,
      HomeComponent,
      RegisterComponent
   ],
   imports: [
      BrowserModule,
      HttpClientModule,
      FormsModule
   ],
   providers: [
      ErrorInterceptorProvider,
      AuthService
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
