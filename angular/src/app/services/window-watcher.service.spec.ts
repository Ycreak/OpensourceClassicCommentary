import { TestBed } from '@angular/core/testing';

import { WindowSizeWatcherService } from './window-watcher.service';

describe('WindowSizeWatcherService', () => {
  let service: WindowSizeWatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowSizeWatcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
