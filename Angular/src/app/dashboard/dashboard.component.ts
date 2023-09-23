// Library imports
import { Component } from '@angular/core';

// Component imports
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  constructor(protected api: ApiService, protected auth_service: AuthService) {}

  /**
   * Requests Flask to resync the bibliography
   */
  protected request_bibliography_resync(): void {
    this.api.sync_bibliography().subscribe((bib) => {
      console.debug('Bibliography resynced', bib);
    });
  }
}
