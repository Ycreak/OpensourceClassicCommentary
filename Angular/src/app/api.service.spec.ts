import { TestBed, inject } from '@angular/core/testing';

import { ApiService } from './api.service';

import { HttpClientModule } from '@angular/common/http';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import {of} from 'rxjs';
import { defer } from 'rxjs';
// Other imports
// import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


describe('ApiService', () => {
  let service: ApiService;
  let httpClient: HttpClient;

  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let apiService: ApiService;

  // let httpTestingController: HttpTestingController;
  beforeEach(() => {

    TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
        ],
    }).compileComponents();
    // ;
    service = TestBed.inject(ApiService);
    // Inject the http service and test controller for each test
    httpClient = TestBed.inject(HttpClient);
    // httpTestingController = TestBed.inject(HttpTestingController);

  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});

/** Create async observable that emits-once and completes
 *  after a JS engine turn */
 export function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}