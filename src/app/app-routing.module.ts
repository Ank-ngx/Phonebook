import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'contacts', pathMatch: 'full' },
  { path: 'contacts', loadChildren: './contacts/contacts.module#ContactsModule' },
  {
    path: 'contacts',
    children: [
      {
        path: ':id',
        children: [
          {
            path: '',
            loadChildren: './contacts/contact/contact.module#ContactModule'
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
