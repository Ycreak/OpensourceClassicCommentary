import { TestBed } from '@angular/core/testing';

import { BibliographyService } from './bibliography.service';

describe('BibliographyService', () => {
  let service: BibliographyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BibliographyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
