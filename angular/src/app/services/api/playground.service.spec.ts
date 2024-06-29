import { TestBed } from '@angular/core/testing';

import { IntroductionsService } from './introductions.service';

describe('IntroductionsService', () => {
  let service: IntroductionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntroductionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
