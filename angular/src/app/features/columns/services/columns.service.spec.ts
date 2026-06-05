import { TestBed } from '@angular/core/testing';

import { ColumnHandlerService } from './column-handler.service';

describe('ColumnHandlerService', () => {
  let service: ColumnHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColumnHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
