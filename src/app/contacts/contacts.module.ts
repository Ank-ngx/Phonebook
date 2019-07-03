import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Contacts } from './contacts.component';
import { FilterPipe } from '../shared/pipes/filter.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: Contacts,
      }
    ])
  ],
  declarations: [Contacts, FilterPipe]
})
export class ContactsModule { }
