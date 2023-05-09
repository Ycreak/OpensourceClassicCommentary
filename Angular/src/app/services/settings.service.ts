/**
 * The settings service provides the possibility to save settings systemwide.
 * For example, settings saved in the fragments component will be saved when entering
 * the dashboard.
 */

import { Injectable} from '@angular/core';


export interface FragmentsSettings {
  dragging_disabled: boolean;
  fragment_order_gradient: boolean;
  auto_scroll_linked_fragments: boolean;
  show_headers: boolean;
  show_line_names: boolean;
  commentary_size: number;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  fragments: FragmentsSettings = {
    dragging_disabled: false,
    fragment_order_gradient: false,
    auto_scroll_linked_fragments: false,
    show_headers: true,
    show_line_names: true,
    commentary_size: 40,
  };

  //constructor() {}
}
