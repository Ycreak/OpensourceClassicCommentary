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

import { Author } from './models/Author';


describe('ApiService', () => {
  let service: ApiService;
  let httpClient: HttpClient;

  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let apiService: ApiService;

  // let httpTestingController: HttpTestingController;
  beforeEach(() => {

    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    apiService = new ApiService(httpClientSpy);

    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
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

  it('should return expected heroes (HttpClient called once)', (done: DoneFn) => {
    const expectedHeroes: Author[] =
      [{ name: 'Luuk'}];
  
    httpClientSpy.get.and.returnValue(asyncData(expectedHeroes));
  
    apiService.get_authors().subscribe({
      next: heroes => {
        
        console.log(heroes)
        
        expect(heroes)
          .withContext('expected heroes')
          .toEqual(expectedHeroes);
        done();
      },
      error: done.fail
    });
    expect(httpClientSpy.get.calls.count())
      .withContext('one call')
      .toBe(1);
  });


  // it('should handleErrorObservable', inject([ApiService], (service: ApiService) => {
  //   const urlString = '/data';
  //   const emsg = 'deliberate 404 error';

  //   // spyOn(service, 'handleErrorObservable').and.callThrough();

  //   service.get_authors().subscribe(
  //       data => fail('should have failed with the 404 error'),
  //       (error: HttpErrorResponse) => {

  //         // expect(service.handleErrorObservable).toHaveBeenCalled(); // check if executed

  //         expect(error.status).toEqual(404, 'status');
  //         expect(error.error).toEqual(emsg, 'message');
  //       },
  // );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('retrieves all the cars', waitForAsync(inject([CarService], (carService) => {
  //   carService.getCars().subscribe(result => expect(result.length).toBeGreaterThan(0)); 
  // }));

  // it('does a thing', async function() {
  //   const result = await service.get_authors();
  //   expect(result[0]).toEqual({name: 'Ennius'});
  // });

  // it('does a thing', function(done) {
  //   service.get_authors(function(result) {
  //     expect(result).toEqual(10);
  //     done();
  //   });
  // });

//   it('#getObservableValue should return value from observable',
//   (done: DoneFn) => {
//      service.get_authors().subscribe(value => {
//      expect(value).toBeInstanceOf(Number);
//      done();
//   });
// });

  // it('#getObservableValue should return value from observable',
  //   (done: DoneFn) => {
  //   service.get_authors().subscribe(data => {
  //     // console.log(data)
  //     expect(data[0].name).toEqual('Ennius');

  //     // expect(data[0]).toContain(jasmine.objectContaining({
  //     //   name: "Ennius"
  //     // }));
  //     done();

  //   });
  // });

  // const obj = {"_t":"user","id":1978569710,"email":"email5@example.org","name":"Manage"};

  // expect(data[0]).toContain(jasmine.objectContaining({
  //   name: "Ennius"
  // }));

});

/** Create async observable that emits-once and completes
 *  after a JS engine turn */
 export function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}


    // this.api.get_authors().subscribe(data => {
    //   if (data.find(e => e.name === 'Ennius')){
    //     console.log('Get authors failed')
    //   }
    // }