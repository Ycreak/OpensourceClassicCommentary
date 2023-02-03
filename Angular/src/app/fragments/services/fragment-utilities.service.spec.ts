import { TestBed } from '@angular/core/testing';

import { FragmentHandlerService } from './fragment-utilities.service';

describe('FragmentHandlerService', () => {
  let service: FragmentHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FragmentHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
