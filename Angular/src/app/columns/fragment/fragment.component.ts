import { Component } from '@angular/core';
import { Input } from '@angular/core';

import { SettingsService } from '@oscc/services/settings.service';

import { Fragment } from '@oscc/models/Fragment';

@Component({
  selector: 'app-fragment',
  templateUrl: './fragment.component.html',
  styleUrls: ['./fragment.component.scss'],
})
export class FragmentComponent {
  @Input() fragment: Fragment;

  constructor(protected settings: SettingsService) {}
}
