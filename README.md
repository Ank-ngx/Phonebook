# Phonebook
Example: https://contacts.anking.ru

This app working with API on Codeigniter (PHP) and Mysql

Using external storage for Offline mode and Sync on startup. 
If you log in from two devices and delete a contact on one of them, on the second device the contact will remain, but cloud icon (which mean saved on mysql) will disappear.

You can check contacts by push one of them, delete, edit add contacts, Import/Export contacts by .csv, search and make a call.

The work took 16 hours


# How to start:

npm install @ionic/angular@latest --save

npm install -g ionic cordova

npm install

ionic serve 

Simulate Mobile Devices with Device Mode in Chrome DevTools (https://developers.google.com/web/tools/chrome-devtools/device-mode/)

You can start it on mobile phone by Ionic Dev App (https://ionicframework.com/docs/appflow/devapp) (Import/Export will work only in Browser mode. For work on mobile need add ionic native)
https://ionicframework.com/docs/native/file-chooser
