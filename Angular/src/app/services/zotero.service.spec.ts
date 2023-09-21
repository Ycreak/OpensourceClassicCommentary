import { TestBed } from '@angular/core/testing';

import { ZoteroService } from './zotero.service';

describe('ZoteroService', () => {
  let service: ZoteroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoteroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
