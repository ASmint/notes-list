# NoteListAngular

## Live demo

Live [DEMO](http://f0215139.xsph.ru/)

## Prerequisites

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.
Install Angular CLI. It is possible to do a manual setup with Webpack or a SystemJS build as well.

`npm install @angular/cli`

## Install

Download or clone repository
Navigate root directory of project in cmd (bash) and run `npm install`

## Add Firebase config to environments variable

Open `/src/environments/environment.ts` and add your Firebase configuration. You can find your project configuration in [the Firebase Console](https://console.firebase.google.com). From the project overview page, click **Add Firebase to your web app**.

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: '<your-key>',
    authDomain: '<your-project-authdomain>',
    databaseURL: '<your-database-URL>',
    projectId: '<your-project-id>',
    storageBucket: '<your-storage-bucket>',
    messagingSenderId: '<your-messaging-sender-id>'
  }
};
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Add your Firebase configuration into prod environments file `/src/environments/environment.prod.ts`

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
