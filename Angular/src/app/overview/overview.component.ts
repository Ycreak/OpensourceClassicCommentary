// Library imports
import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Library used for interacting with the page
import { trigger, transition, style, animate } from '@angular/animations';
import { environment } from '@src/environments/environment';

// Service imports
import { ApiService } from '@oscc/api.service';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';
import { WindowSizeWatcherService } from '@oscc/services/window-watcher.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';

import { FragmentsComponent } from '@oscc/fragments/fragments.component';

// Component imports
import { LoginComponent } from '@oscc/login/login.component';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { ColumnHandlerService } from '@oscc/services/column-handler.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  protected commentary_enabled = true;
  protected commentary_is_reduced_size = false;
  protected playground_enabled = true;

  protected current_fragment: Fragment;

  protected temp = 'col-2';

  constructor(
    protected api: ApiService,
    // protected utility: UtilityService,
    protected auth_service: AuthService,
    protected dialog: DialogService,
    protected settings: SettingsService,
    protected window_watcher: WindowSizeWatcherService,
    private matdialog: MatDialog,
    protected column_handler: ColumnHandlerService,
    protected fragments: FragmentsComponent
  ) {}

  ngOnInit(): void {
    // Create the window watcher for mobile devices
    this.window_watcher.init(window.innerWidth);
    //console.log('hello', this.fragments.playground_enabled)
    // this.api.request_authors2();
    this.current_fragment = new Fragment({});
  }

  // ngAfterViewInit() {
  //   this.authors_subscription = this.api.new_authors_alert.subscribe(() => {
  //     console.log('authors', this.api.authors);
  //   });
  // }

  ngOnDestroy() {
    this.window_watcher.subscription$.unsubscribe();
  }

  test(item) {
    console.log('hi', item);
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
   * Function to handle the settings dialog. Will save changes via the oscc_settings object
   * @author Ycreak
   */
  public open_settings(): void {
    this.dialog.open_settings_dialog(this.settings.fragments).subscribe((result) => {
      if (result) {
        this.settings.fragments.dragging_disabled = result['dragging_disabled'];
        this.settings.fragments.fragment_order_gradient = result['fragment_order_gradient'];
        this.settings.fragments.auto_scroll_linked_fragments = result['auto_scroll_linked_fragments'];
      }
    });
  }

  /**
   * Function to handle the login dialog
   * @author Ycreak
   */
  public login(): void {
    const dialogRef = this.matdialog.open(LoginComponent, {});
  }
}
