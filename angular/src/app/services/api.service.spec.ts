import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { defer } from 'rxjs';

describe('ApiService', () => {
  let service: ApiService;

  // let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }).compileComponents();
    // ;
    service = TestBed.inject(ApiService);
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
