// Library imports

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Library used for interacting with the page
import { environment } from '@src/environments/environment';

// Service imports
import { ApiService } from '@oscc/api.service';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';
import { WindowSizeWatcherService } from '@oscc/services/window-watcher.service';
//import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';

import { FragmentsComponent } from '@oscc/fragments/fragments.component';

// Component imports
import { LoginComponent } from '@oscc/login/login.component';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { ColumnHandlerService } from '@oscc/services/column-handler.service';
import { LocalStorageService } from '@oscc/services/local-storage.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [FragmentsComponent],
})
export class OverviewComponent implements OnInit, OnDestroy {
  protected commentary_enabled = true;
  protected commentary_is_reduced_size = false;
  protected playground_enabled = true;

  protected current_fragment: Fragment;

  constructor(
    protected api: ApiService,
    // protected utility: UtilityService,
    protected auth_service: AuthService,
    protected dialog: DialogService,
    protected settings: SettingsService,
    public localstorage: LocalStorageService,
    protected window_watcher: WindowSizeWatcherService,
    private matdialog: MatDialog,
    protected column_handler: ColumnHandlerService,
    protected fragments: FragmentsComponent
  ) {}

  ngOnInit(): void {
    // Create the window watcher for mobile devices
    this.window_watcher.init(window.innerWidth);
    this.current_fragment = new Fragment({});

    // Load the user's previously used setting from local storage using the LocalStorageService service
    this.settings.load_settings();
  }

  ngOnDestroy() {
    if (this.window_watcher.subscription$) {
      this.window_watcher.subscription$.unsubscribe();
    }
  }

  test(item?: any) {
    console.log('hi', item);
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
   * Simple function to toggle the commentary column size
   * @author CptVickers
   */
  protected toggle_commentary_size(): void {
    this.commentary_is_reduced_size = !this.commentary_is_reduced_size;
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
  public login(): void {
    const dialogRef = this.matdialog.open(LoginComponent, {});
  }

  /**
   * Returns the title from the environment for the frontend to print
   * @param kind to print: either long or short
   * @author Ycreak
   */
  protected get_title(kind: string) {
    return kind == 'long' ? environment.title : environment.short_title;
  }
}
