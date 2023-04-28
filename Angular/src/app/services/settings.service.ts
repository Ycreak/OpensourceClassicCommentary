/**
 * The settings service provides the possibility to save settings systemwide.
 * For example, settings saved in the fragments component will be saved when entering
 * the dashboard.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  fragments = {
    dragging_disabled: false,
    fragment_order_gradient: false,
    auto_scroll_linked_fragments: false,
    show_headers: true,
    show_line_names: true,
    commentary_size: 40,
  };

  //constructor() {}
}
