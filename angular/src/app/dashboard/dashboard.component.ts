// Library imports
import { Component, OnInit } from '@angular/core';

// Component imports
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    protected api: ApiService,
    protected auth_service: AuthService,
    private utility: UtilityService
  ) {}

  ngOnInit(): void {
    // Always make sure we use the correct index for the dashboard
    this.api.request_index().subscribe({});
  }

  /**
   * Requests Flask to resync the bibliography
   */
  protected request_bibliography_resync(): void {
    this.api.sync_bibliography().subscribe({
      next: () => {
        this.utility.open_snackbar('Bibliography resynced');
      },
      error: () => {
        this.utility.open_snackbar('Zotero did not like that.');
      },
    });
  }

  /**
   * Runs a test function on the bibliography endpoint
   */
  protected request_bibliography_test(): void {
    this.api.test_bibliography().subscribe({
      next: () => {
        this.utility.open_snackbar('Bibliography tested');
      },
      error: () => {
        this.utility.open_snackbar('Zotero did not like that.');
      },
    });
  }
}
