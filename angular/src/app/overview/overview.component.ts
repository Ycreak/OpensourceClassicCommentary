// Library imports
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Library used for interacting with the page
import { environment } from '@src/environments/environment';

// Service imports
import { ApiService } from '@oscc/api.service';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';
import { WindowSizeWatcherService } from '@oscc/services/window-watcher.service';
import { AuthService } from '@oscc/auth/auth.service';

// Component imports
import { LoginComponent } from '@oscc/login/login.component';

// Model imports
import { ColumnsService } from '@oscc/columns/columns.service';
import { LocalStorageService } from '@oscc/services/local-storage.service';
import { CommentaryComponent } from '@oscc/commentary/commentary.component';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  @ViewChild('commentary') commentary: CommentaryComponent;

  protected commentary_enabled = true;
  protected playground_enabled = true;

  constructor(
    private mat_dialog: MatDialog,
    private viewportscroller: ViewportScroller,
    protected api: ApiService,
    protected auth_service: AuthService,
    protected columns: ColumnsService,
    protected dialog: DialogService,
    protected settings: SettingsService,
    protected window_watcher: WindowSizeWatcherService,
    public localstorage: LocalStorageService
  ) {}

  ngOnInit(): void {
    // Create the window watcher for mobile devices
    this.window_watcher.init(window.innerWidth);

    // Load the user's previously used setting from local storage using the LocalStorageService service
    this.settings.load_settings();
  }

  ngOnDestroy() {
    if (this.window_watcher.subscription$) {
      this.window_watcher.subscription$.unsubscribe();
    }
  }

  /**
   * Returns the size of the commentary window in (css style) percentage.
   * @returns number%
   * @author Ycreak
   */
  protected get_drawer_size(): string {
    return `${this.settings.fragments.commentary_size}%`;
  }

  /**
   * Simple function to toggle the commentary column
   * @author Ycreak
   */
  protected toggle_commentary(): void {
    this.commentary_enabled = !this.commentary_enabled;
  }

  /**
   * Simple function to toggle the playground column
   * @author Ycreak
   */
  protected toggle_playground(): void {
    this.playground_enabled = !this.playground_enabled;
  }

  /**
   * Function to handle the login dialog
   * @author Ycreak
   */
  protected login(): void {
    this.mat_dialog.open(LoginComponent, {});
  }

  /**
   * Returns the title from the environment for the frontend to print
   * @param kind to print: either long or short
   * @author Ycreak
   */
  protected get_title(kind: string) {
    return kind == 'long' ? environment.title : environment.short_title;
  }

  /**
   * Used to scroll the viewport to a certain part of the page.
   * @param anchor The id of the element to scroll to. ('#' can be omitted)
   * @author sajvanwijk
   */
  protected scroll_viewport_to(anchor: string): void {
    setTimeout(() => {
      this.viewportscroller.scrollToAnchor(anchor);
    }, 200); //FIXME: An async/await on the playground renderer would be nicer, but this works for now.
  }
}
