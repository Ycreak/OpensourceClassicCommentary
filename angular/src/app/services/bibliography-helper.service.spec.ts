import { TestBed } from '@angular/core/testing';

import { BibliographyHelperService } from './bibliography-helper.service';

describe('BibliographyHelperService', () => {
  let service: BibliographyHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BibliographyHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
