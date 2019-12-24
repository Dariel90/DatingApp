import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberListResolver } from './_resolver/member-list.resolver';
import { MemberDetailResolver } from './_resolver/member-detail.resolver';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { UserService } from './_services/user.service';
import { appRoutes } from './routes';
import { AlertifyService } from './_services/alertify.service';
import { ErrorInterceptorProvider } from './_services/error.interceptor';
//Servicio de Autenticación
import { AuthService } from './_services/auth.service';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
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
//Para usar ngx-Bootstrap
import { BsDropdownModule, TabsModule } from 'ngx-bootstrap';
import { MemberListComponent } from './members/member-list/member-list.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { RouterModule } from '@angular/router';
import { MemberCardComponent } from './members/member-card/member-card.component';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxGalleryModule } from 'ngx-gallery';
import { MemberEditResolver } from './_resolver/member-edit.resolver';
import { AuthGuard } from './_guards/auth.guard';

export class CustomHammerConfig extends HammerGestureConfig  {
  overrides = {
      pinch: { enable: false },
      rotate: { enable: false }
  };
}

@NgModule({
   declarations: [
      AppComponent,
      NavComponent,
      HomeComponent,
      RegisterComponent,
      MemberListComponent,
      MemberCardComponent,
      MemberDetailComponent,
      MemberEditComponent,
      ListsComponent,
      MessagesComponent,

   ],
   imports: [
      BrowserModule,
      HttpClientModule,
      FormsModule,
      BsDropdownModule.forRoot(),
      NgxGalleryModule,
      TabsModule.forRoot(),
      RouterModule.forRoot(appRoutes),
      JwtModule.forRoot({
        config: {
          tokenGetter: () => {
            return localStorage.getItem('token');
          },
          whitelistedDomains: ['localhost:5000'],
          blacklistedRoutes: ['localhost:5000/api/auth/']
        }
      }),
   ],
   providers: [
      AlertifyService,
      ErrorInterceptorProvider,
      AlertifyService,
      AuthGuard,
      UserService,
      MemberDetailResolver,
      MemberListResolver,
      MemberEditResolver,
      PreventUnsavedChanges,
      {
        provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig
      }
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
