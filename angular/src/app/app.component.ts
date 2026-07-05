import { Component, OnInit } from '@angular/core';

import { ApiService } from '@oscc/services/api.service';
import { RouterOutlet } from '@angular/router';
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipDefaultOptions,
  MatTooltipModule,
} from '@angular/material/tooltip';

/** Custom options the configure the tooltip's default show/hide delays. */
export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 750,
  hideDelay: 750,
  touchendHideDelay: 750,
  // showDelay: 0,
  // hideDelay: 0,
  // touchendHideDelay: 0,
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults}],
})
export class AppComponent implements OnInit {
  title = 'OpenSourceClassicCommentary';

  constructor(protected api: ApiService) {}

  ngOnInit() {
    // All things needed at startup by the OSCC are listed here
    this.api.get_bibliography().subscribe((bib) => {
      console.debug('Bibliography retrieved', bib);
    });
  }
}
