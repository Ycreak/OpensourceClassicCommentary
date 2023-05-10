/**
 * The settings service provides the possibility to save settings systemwide.
 * For example, settings saved in the fragments component will be saved when entering
 * the dashboard.
 */

import { Injectable } from '@angular/core';
import { LocalStorageService } from '@oscc/services/local-storage.service';
import { DialogService } from '@oscc/services/dialog.service';

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

  constructor(private localstorage: LocalStorageService, protected dialog: DialogService) {}

  /**
   * Function to handle the settings dialog. Will save changes via the oscc_settings object
   * @author Ycreak
   */
  public open_settings(): void {
    this.dialog.open_settings_dialog(this.fragments).subscribe(() => {
      // Also save the settings in local storage
      this.save_settings();
    });
  }

  /**
   * Function used to load the user's previously used settings from local storage using the LocalStorageService service
   * @author Sajvanwijk
   */
  public load_settings(): void {
    // TODO: check if we have settings saved. If not, load the defaults

    // Load all the fragments settings
    this.fragments.auto_scroll_linked_fragments = this.localstorage.getData('auto_scroll_linked_fragments');
    this.fragments.commentary_size = this.localstorage.getData('commentary_size');
    this.fragments.dragging_disabled = this.localstorage.getData('dragging_disabled');
    this.fragments.fragment_order_gradient = this.localstorage.getData('fragment_order_gradient');
    this.fragments.show_headers = this.localstorage.getData('show_headers');
    this.fragments.show_line_names = this.localstorage.getData('show_line_names');
    // Load all the settings for other components here once they exist
  }

  /**
   * Function used to load the user's previously used settings from local storage using the LocalStorageService service
   * @author Sajvanwijk
   */
  public save_settings(): void {
    // Save all the fragments settings
    this.localstorage.saveData('auto_scroll_linked_fragments', this.fragments['auto_scroll_linked_fragment']);
    // TODO: find an elegant way to save booleans and numbers as strings, and load them from string to boolean/number again
    //this.localstorage.saveData('commentary_size', this.fragments['commentary_size']);
    //this.localstorage.saveData('dragging_disabled', this.fragments['dragging_disabled']);
    //this.localstorage.saveData('fragment_order_gradient', data['fragment_order_gradient']);
    //this.localstorage.saveData('show_headers', data['show_headers']);
    //this.localstorage.saveData('show_line_names', data['show_line_names']);

    // Save all the settings for other components here once they exist
  }
}
