import { TestBed } from '@angular/core/testing';

import { ApiInterfaceService } from './api-interface.service';

describe('ApiInterfaceService', () => {
  let service: ApiInterfaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiInterfaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
