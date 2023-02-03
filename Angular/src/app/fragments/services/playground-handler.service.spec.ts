import { TestBed } from '@angular/core/testing';

import { PlaygroundHandlerService } from './playground-handler.service';

describe('PlaygroundHandlerService', () => {
  let service: PlaygroundHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaygroundHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
