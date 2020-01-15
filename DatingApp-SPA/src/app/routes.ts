import { ListsResolver } from './_resolver/lists.resolver';
import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberListResolver } from './_resolver/member-list.resolver';
import { MemberDetailResolver } from './_resolver/member-detail.resolver';
import { MemberEditResolver } from './_resolver/member-edit.resolver';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { HomeComponent } from './home/home.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';
import { MessagesResolver } from './_resolver/messages.resolver';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent},
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      { path: 'members', component: MemberListComponent, resolve: { users: MemberListResolver} },
      { path: 'members/:id', component: MemberDetailComponent, resolve: { user: MemberDetailResolver} },
      { path: 'member/edit', component: MemberEditComponent, resolve: { user: MemberEditResolver}, canDeactivate: [PreventUnsavedChanges] },
      { path: 'messages', component: MessagesComponent, resolve: { messages: MessagesResolver} },
      { path: 'lists', component: ListsComponent, resolve: { users: ListsResolver } },
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
