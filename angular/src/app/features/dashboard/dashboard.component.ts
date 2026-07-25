// Library imports
import { Component, OnInit } from '@angular/core';

// Component imports
import { ApiService } from '@oscc/services/api.service';
import { AuthService } from '@oscc/features/auth/services/auth.service';
import { UtilityService } from '@oscc/services/utility.service';
import { UsersComponent } from './components/users/users.component';
import { IntroductionsDashboardComponent } from './components/introductions-dashboard/introductions-dashboard.component';
import { TestimoniaDashboardComponent } from './components/testimonia-dashboard/testimonia-dashboard.component';
import { FragmentsDashboardComponent } from './components/fragments-dashboard/fragments-dashboard.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    MatProgressBarModule,
    MatExpansionModule,
    FragmentsDashboardComponent,
    TestimoniaDashboardComponent,
    IntroductionsDashboardComponent,
    UsersComponent,
  ],
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
