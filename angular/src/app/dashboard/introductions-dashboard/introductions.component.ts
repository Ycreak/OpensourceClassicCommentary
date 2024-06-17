import { Component, OnInit } from '@angular/core';

// Service imports
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';
import { Introduction } from '@oscc/models/Introduction';
import { IntroductionsApiService } from '@oscc/services/api/introductions.service';

@Component({
  selector: 'app-introductions-dashboard',
  templateUrl: './introductions.component.html',
  styleUrls: ['./introductions.component.scss'],
})
export class IntroductionsComponent implements OnInit {
  protected introduction: Introduction;

  // This is used for alerting the user that the introduction texts have been saved.
  show_changes_saved_hint = false;

  constructor(
    protected auth_service: AuthService,
    protected api: IntroductionsApiService,
    protected dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.introduction = new Introduction({});
  }

  protected save_introduction(introduction: Introduction): void {
    this.api.post_document(introduction, this.api.create).subscribe({});
  }

  /**
   * Requests an introduction from the server given the key
   * @param introduction (Introduction) serves as key for the api to filter on
   * @author Ycreak
   */
  protected request_introduction(introduction: Introduction): void {
    this.api.get_introduction(introduction).subscribe({});
  }
}
