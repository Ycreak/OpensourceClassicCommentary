import { TestBed } from '@angular/core/testing';

import { TestimoniaService } from './testimonia.service';

describe('TestimoniaService', () => {
  let service: TestimoniaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestimoniaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
