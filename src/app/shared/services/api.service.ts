import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable, BehaviorSubject, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent, throwError } from 'rxjs';
import { catchError, retry, map, filter, scan } from 'rxjs/operators';

@Injectable()
export class ApiService {
  items;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  }

  private handleError(error: HttpErrorResponse) {
    this.presentToast('Erroooor!');
    return throwError('-_-');
  };

  constructor(
    private events: Events,
    public toastController: ToastController,
    private httpClient: HttpClient,
    private storage: Storage
  ) { }


  setContacts() {
    this.storage.get('contacts').then((val) => {
      if (val) {
        this.items = val;
      }
      else {
        this.items = [];
      }
      this.items.forEach(item => {
        item.global = false;
      })
      this.httpContacts();
      this.events.publish('getContacts');
    });


  }

  httpContacts(){
    this.httpClient
      .get('https://api.anking.ru/hotels/contacts', this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((Response) => {
        if(Response) {
          this.sync(Response, false);
        }
      });
  }

  getContacts() {
    return this.items;
  }

  sync(formData, action) {

    formData.forEach(item => {
      if (this.items.find(x => x.id == item.id)) {
        let newItem = this.items.find(x => x.id == item.id);

        newItem.id = item.id;
        newItem.fname = item.fname;
        newItem.lname = item.lname;
        newItem.phone = item.phone;
        newItem.text = item.text;
        newItem.global = true;
      }
      else {
        item.global = true;
        this.items.push(item);
      }
    });
    if (action) {
      this.httpClient
        .post('https://api.anking.ru/hotels/contacts', this.items, this.httpOptions)
        .pipe(catchError(this.handleError))
        .subscribe((Response) => {
          this.storage.set('contacts', this.items);
          this.presentToast('Synced');
          this.events.publish('getContacts');
        });
    }
    else {
      this.storage.set('contacts', this.items);
      this.presentToast('Synced');
      this.events.publish('getContacts');
    }


  }

  addContact(formData: FormData) {
    this.httpClient
      .post('https://api.anking.ru/hotels/contacts', [formData], this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((Response) => {
        formData.id = Response['id'];
        formData.global = true;
        this.items.push(formData);
        this.presentToast('Contact added');
        this.storage.set('contacts', this.items);
        this.events.publish('getContacts');
      });
  }

  editContact(formData: FormData) {
    this.items.forEach(item => {
      if (item.id == formData.id) {
        item.lname = formData.lname;
        item.fname = formData.fname;
        item.phone = formData.phone;
        item.text = formData.text;
        item.global = true;
      }
    });
    this.httpClient
      .post('https://api.anking.ru/hotels/contacts', [formData], this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((Response) => {
        this.presentToast('Contact edited');
        this.storage.set('contacts', this.items);
        this.events.publish('getContacts');
      });
  }

  delContact(items: any) {
    let count = 0;
    items.forEach(item => {
      const index: number = this.items.indexOf(item);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
      this.httpClient
        .get('https://api.anking.ru/hotels/contacts?id=' + item.id, this.httpOptions)
        .pipe(catchError(this.handleError))
        .subscribe((Response) => {
          this.storage.set('contacts', this.items);
          count += 1;
        });
    });

    if (count == items.length) {
      if (items.length > 1) {
        this.presentToast('Contacts deleted');
      }
      else {
        this.presentToast('Contact deleted');
      }
      this.events.publish('getContacts');
    }

    return this.items;
  }

  async presentToast(text: string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 2000
    });
    toast.present();
  }

}

export class FormData {
  public id: any;
  public fname: any;
  public lname: any;
  public phone: any;
  public text: any;
  public global: any;
}
