import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Events } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Platform } from '@ionic/angular';
import { PopoverController, ToastController, ActionSheetController  } from '@ionic/angular';
import { ExportToCsv } from 'export-to-csv';
import { ApiService } from '../shared/services/api.service';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { interval } from 'rxjs';

@Component({
  selector: 'app-contacts',
  templateUrl: 'contacts.html',
  styleUrls: ['contacts.scss'],
  animations: [
    trigger(
      'SlideLeftRight', [
        transition(':enter', [
          style({ transform: 'translatex(50%)', opacity: 0 }),
          animate('.5s ease-in-out', style({ transform: 'translatex(0%)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translatex(0%)', opacity: 1 }),
          animate('0.3s ease-in-out', style({ transform: 'translatex(50%)', opacity: 0 }))
        ])
      ]
    ),
    trigger(
      'Fade', [
        transition(':enter', [
          style({ transform: 'translatey(0%)', opacity: 0 }),
          animate('.5s ease-in-out', style({ transform: 'translatex(0%)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translatex(0%)', opacity: 1 }),
          animate('0.3s ease-in-out', style({ transform: 'translatey(0%)', opacity: 0 }))
        ])
      ]
    )
  ]
})
export class Contacts implements OnInit, OnDestroy {

  items;
  searchText = '';
  checkboxes;
  checkedCount = 1;
  allChecked;
  actionSheet;

  constructor(
    private events: Events,
    public popoverController: PopoverController,
    public actionSheetController: ActionSheetController,
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private apiService: ApiService
  ) {
    this.platform.backButton.subscribe(() => {
      if (this.items && this.checkboxes) {
        this.clearCheckboxes();
        this.actionSheet.dismiss();
      }
    });

    // this.router.events.forEach((event) => {
    //   if (event instanceof NavigationEnd) {
    //
    //   }
    // });
  }

  ngOnInit() {
    this.items = this.apiService.getContacts();
    this.events.subscribe('getContacts', () => {
      setTimeout(() => {
        this.items = this.apiService.getContacts();
        this.searchText = '';
      }, 100);
    });
  }

  onPress(item) {
    if (!this.checkboxes) {
      this.checkedCount = 1;
      this.checkboxes = true;
      item.isChecked = true;
      this.allChecked = false;
    }
  }

  checkChecked(item) {
    this.allChecked = false;
    if (this.checkboxes) {
      setTimeout(() => {
        let checkedCount = 0;
        this.items.forEach(x => {
          if (x.isChecked) {
            checkedCount += 1;
          }
        });
        if (this.checkedCount != checkedCount) {
          this.checkedCount = checkedCount;
        }
        if (checkedCount == 0) {
          this.checkboxes = false;
        }
      }, 100);
    }
  }

  clearCheckboxes() {
    this.items.forEach(item => {
      item.isChecked = false;
    });
    this.checkedCount = 1;
    this.checkboxes = false;
    this.allChecked = false;
  }


  doRefresh(event) {
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  handleInput(event) {
    this.searchText = event.target.value.toLowerCase();
  }

  onCancel(event) {
    this.searchText = '';
  }

  checkAll(){
    this.items.forEach(item => {
      item.isChecked = true;
    })
    this.allChecked = true;
  }


  delArray() {
    let data = [];
      this.items.forEach(item => {
        if (item.isChecked == true) {
          data.push(item);
        }
      });
    this.items = this.apiService.delContact(data);
    if (this.items) {
      this.clearCheckboxes();
    }
  }


  async presentPopover(event: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: event,
      animated: false,
      translucent: true
    });
    return await popover.present();
  }

  async presentActionSheet(item) {
  this.actionSheet = await this.actionSheetController.create({
    header: item.lname + ' ' + item.fname,
    buttons: [
    {
      text: 'Make a call',
      icon: 'call',
      handler: () => {
        //this.callNumber.callNumber(item.phone, true);
        window.location.href = "tel:+"+item.phone;
      }
    },
    {
      text: 'Edit contact',
      icon: 'create',
      handler: () => {
        this.router.navigate(['/contacts/', item.id]);
      }
    },
    {
      text: 'Delete contact',
      role: 'destructive',
      icon: 'trash',
      handler: () => {
        this.apiService.delContact([item]);
      }
    },
     {
      text: 'Close',
      icon: 'close',
      role: 'cancel',
      handler: () => {

      }
    }]
  });
  await this.actionSheet.present();
}

  ngOnDestroy() {
    this.events.unsubscribe('getContacts');
  }

}

@Component({
  template: `
    <ion-list no-margin>
    <ion-item button lines="none" (click)="getFile()">
        <ion-icon name="sync" class="mr-5"></ion-icon>
        <ion-label>Import Phonebook</ion-label>
    </ion-item>
    <ion-item button lines="none" (click)="getCSV()">
        <ion-icon name="download" class="mr-5"></ion-icon>
        <ion-label>Export Phonebook</ion-label>
    </ion-item>
    </ion-list>
    <input type="file" style="display: none" #csvReader name="Upload CSV" id="txtFileUpload" (change)="uploadListener($event)" accept=".csv" />
    `,
  providers: [FileChooser]
})
export class PopoverComponent {

  event;
  records = [];
  items;

  csvExporter;
  options = {
    filename: 'My contacts',
    fieldSeparator: ';',
    quoteStrings: '',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: false,
    title: '',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  };

  @ViewChild('csvReader') csvReader: ElementRef;

  constructor(
    private popoverController: PopoverController,
    public toastController: ToastController,
    private fileChooser: FileChooser,
    private apiService: ApiService
  ) {
    this.csvExporter = new ExportToCsv(this.options);
  }

  getFile() {
    // this.fileChooser.open()
    // .then(uri => this.checkFile(uri))
    // .catch(e => console.log(e));
    this.csvReader.nativeElement.click();
  }

  // checkFile(file) {
  //   console.log(file);
  // }

  getCSV() {
    this.items = this.apiService.getContacts();
    if (this.items && this.items.length > 0) {
      this.csvExporter.generateCsv(this.items);
    }
    else {
      this.presentToast('No contacts for export');
    }
    this.onDismiss();
  }


  uploadListener($event: any): void {

    let text = [];
    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {

      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

        let headersRow = this.getHeaderArray(csvRecordsArray);

        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray);
        this.apiService.sync(this.records, true);
      };

      reader.onerror = () => {
        this.presentToast('error is occured while reading file!');
      };

    } else {
      this.presentToast('Please import valid .csv file.');
      this.fileReset();
    }
    this.onDismiss();
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, ) {
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(';');
      if (curruntRecord[0]) {
        let csvRecord = [];
        csvArr.push({ id: curruntRecord[0], lname: curruntRecord[1], fname: curruntRecord[2], phone: curruntRecord[3], text: curruntRecord[4] });
      }
    }

    return csvArr;
  }


  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  fileReset() {
    this.csvReader.nativeElement.value = "";
    this.records = [];
  }

  onDismiss() {
    this.popoverController.dismiss('');
  }

  async presentToast(text: string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 2000
    });
    toast.present();
  }

}
