import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [
    MatIconModule,
    MatSlideToggleModule,
    MatSliderModule,
    FormsModule,
    MatTooltipModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './settings-dialog.component.html',
  styleUrl: '../dialogs.scss',
})
export class SettingsDialogComponent {
  @ViewChild('dragtooltip_icon') dragtooltip_icon: MatTooltip;

  protected tooltips = {
    dragging_disabled: 'Disallows moving fragments by dragging them',
    fragment_order_gradient:
      'Enables a color gradient that shows the original order of the fragments, from a lighter to a darker color',
    show_headers: 'Show fragment headers that include data about the fragment',
    show_line_names: 'Show the name or number of each line of each fragment',
    auto_scroll_linked_fragments: 'Automatically scrolls linked fragments into view if possible',
  };

  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  protected toggle_tooltip(tooltip: any) {
    if (tooltip.disabled) {
      tooltip.disabled = false;
      tooltip.show();
    } else {
      tooltip.disabled = true;
      tooltip.hide();
    }
  }

  protected disable_tooltip(tooltip: any) {
    tooltip.disabled = true;
    tooltip.hide();
  }
}
