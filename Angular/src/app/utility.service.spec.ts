import { TestBed } from '@angular/core/testing';

import { UtilityService } from './utility.service';

import { MatSnackBarModule } from '@angular/material/snack-bar';


describe('UtilityService', () => {
  let service: UtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
      ],      
    });
    service = TestBed.inject(UtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
