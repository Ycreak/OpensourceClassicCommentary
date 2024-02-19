import { TestBed } from '@angular/core/testing';

import { FragmentsService } from './fragments.service';

describe('FragmentsService', () => {
  let service: FragmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FragmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
