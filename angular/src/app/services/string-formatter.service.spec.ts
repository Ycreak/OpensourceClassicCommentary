import { TestBed } from '@angular/core/testing';

import { StringFormatterService } from './string-formatter.service';

describe('StringFormatterService', () => {
  let service: StringFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StringFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
