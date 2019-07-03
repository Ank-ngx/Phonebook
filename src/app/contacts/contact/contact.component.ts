import { Component, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-contact',
  templateUrl: 'contact.html',
  styleUrls: ['contact.scss']
})
export class ContactComponent implements OnInit {
  id;
  items;
  item;
  required;

  formData = new FormGroup({
    id: new FormControl(0),
    fname: new FormControl('', Validators.compose([Validators.required])),
    lname: new FormControl('', Validators.compose([Validators.required])),
    phone: new FormControl('', Validators.compose([Validators.required])),
    text: new FormControl('')
  });

  constructor(
    private events: Events,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.events.publish('getContacts');
  }

  ngOnInit() {
    if (this.id != 0) {
          this.items = this.apiService.getContacts();
          this.item = this.items.find(s => s.id == this.id);

          this.formData = new FormGroup({
            id: new FormControl(this.id, Validators.compose([Validators.required])),
            fname: new FormControl(this.item.fname, Validators.compose([Validators.required])),
            lname: new FormControl(this.item.lname, Validators.compose([Validators.required])),
            phone: new FormControl(this.item.phone, Validators.compose([Validators.required])),
            text: new FormControl(this.item.text)
          });
    }
  }

  delContact() {
    let data = [];
    data.push(this.item);
    let item = this.apiService.delContact(data);
    if (item) {
      this.router.navigate(['/contacts']);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  send() {
    this.validateAllFormFields(this.formData);
    if (!this.formData.invalid) {
      if(this.formData.value.id==0) {
        this.apiService.addContact(this.formData.value);
        this.formData.reset();
      }
      else {
        this.apiService.editContact(this.formData.value);
      }
      this.router.navigate(['/contacts']);
    }
    else {
      this.required = true;
    }
  }


}
