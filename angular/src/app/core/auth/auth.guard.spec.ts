import { TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';

import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
