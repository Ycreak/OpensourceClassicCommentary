import { TestBed } from '@angular/core/testing';

import { DialogService } from './dialog.service';

import { MatDialogModule } from '@angular/material/dialog';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
      ],      
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
