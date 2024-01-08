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

  constructor(
    private localstorage: LocalStorageService,
    protected dialog: DialogService
  ) {}

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
    // Load all the fragments settings
    let loadedsetting: any;

    // Attempt to load the setting from memory
    loadedsetting = this.localstorage.getData('auto_scroll_linked_fragments');
    // Assign the loaded setting only if it isn't null and meets the criteria. Otherwise: load defaults.
    this.fragments.auto_scroll_linked_fragments = ['true', 'false'].includes(loadedsetting)
      ? loadedsetting == 'true'
      : false; // Default value

    loadedsetting = this.localstorage.getData('commentary_size');
    this.fragments.commentary_size = loadedsetting > 20 && loadedsetting < 80 ? (loadedsetting as number) : 40; // Default value

    loadedsetting = this.localstorage.getData('dragging_disabled');
    this.fragments.dragging_disabled = ['true', 'false'].includes(loadedsetting) ? loadedsetting == 'true' : false; // Default value

    loadedsetting = this.localstorage.getData('fragment_order_gradient');
    this.fragments.fragment_order_gradient = ['true', 'false'].includes(loadedsetting)
      ? loadedsetting == 'true'
      : false; // Default value

    loadedsetting = this.localstorage.getData('show_headers');
    this.fragments.show_headers = ['true', 'false'].includes(loadedsetting) ? loadedsetting == 'true' : true; // Default value

    loadedsetting = this.localstorage.getData('show_line_names');
    this.fragments.show_line_names = ['true', 'false'].includes(loadedsetting) ? loadedsetting == 'true' : true; // Default value

    // Load all the settings for other components here once they exist
  }

  /**
   * Function used to load the user's previously used settings from local storage using the LocalStorageService service
   * @author Sajvanwijk
   */
  private save_settings(): void {
    // Save all the fragments settings
    this.localstorage.saveData('auto_scroll_linked_fragments', String(this.fragments['auto_scroll_linked_fragments']));
    this.localstorage.saveData('commentary_size', String(this.fragments['commentary_size']));
    this.localstorage.saveData('dragging_disabled', String(this.fragments['dragging_disabled']));
    this.localstorage.saveData('fragment_order_gradient', String(this.fragments['fragment_order_gradient']));
    this.localstorage.saveData('show_headers', String(this.fragments['show_headers']));
    this.localstorage.saveData('show_line_names', String(this.fragments['show_line_names']));

    // Save all the settings for other components here once they exist
  }
}
