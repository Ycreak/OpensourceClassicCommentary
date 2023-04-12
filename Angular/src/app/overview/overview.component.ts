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

// import { ColumnHandlerService } from './services/column-handler.service';
// import { PlaygroundHandlerService } from './services/playground-handler.service';
// import { FragmentUtilitiesService } from './services/fragment-utilities.service';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  private authors_subscription: any;
  // public hero = 'hello';


  constructor(
    protected api: ApiService,
    // protected utility: UtilityService,
    protected auth_service: AuthService,
    // protected dialog: DialogService,
    // protected settings: SettingsService,
    protected window_watcher: WindowSizeWatcherService,
    // private matdialog: MatDialog,
    // protected column_handler: ColumnHandlerService,
    // protected playground_handler: PlaygroundHandlerService,
    // protected fragment_utilities: FragmentUtilitiesService
    protected fragments: FragmentsComponent
  ) { }

  ngOnInit(): void {
    console.log('hello', this.fragments.playground_enabled)
    // this.api.request_authors2();
  }

  // ngAfterViewInit() {
  //   this.authors_subscription = this.api.new_authors_alert.subscribe(() => {
  //     console.log('authors', this.api.authors);
  //   });
  // }

  // ngOnDestroy() {
  //   this.window_watcher.subscription$.unsubscribe();
  //   this.authors_subscription.unsubscribe();
  // }

}
