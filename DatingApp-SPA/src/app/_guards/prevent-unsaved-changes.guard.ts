import { MemberEditComponent } from './../members/member-edit/member-edit.component';
import { Injectable } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';

@Injectable()
export class PreventUnsavedChanges implements CanDeactivate<MemberEditComponent> {
  constructor(private alertify: AlertifyService) {}
    canDeactivate(component: MemberEditComponent) {
    if (component.editForm.dirty) {
      return confirm('Are you sure you want to continue? Any usaved changes will be lost');
    }
    return true;
}


}
