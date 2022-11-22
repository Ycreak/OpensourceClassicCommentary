// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment([
  BrowserDynamicTestingModule,
  MatDialogModule,
  MatSnackBarModule,
  MatMenuModule,
  HttpClientTestingModule,
  ReactiveFormsModule,
  FormsModule,
  MatAutocompleteModule,
],
  platformBrowserDynamicTesting()
);
