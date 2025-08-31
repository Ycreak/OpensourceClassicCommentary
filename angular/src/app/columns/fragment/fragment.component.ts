import { Component } from '@angular/core';
import { Input } from '@angular/core';

import { SettingsService } from '@oscc/services/settings.service';

import { Fragment } from '@oscc/models/Fragment';

import { SafeHtmlPipe } from '@oscc/pipes/safeHtml.pipe';

@Component({
  standalone: true,
  imports: [SafeHtmlPipe],
  selector: 'app-fragment',
  templateUrl: './fragment.component.html',
  styleUrls: ['./fragment.component.scss'],
})
export class FragmentComponent {
  @Input() fragment: Fragment;
  @Input() translated: boolean;

  constructor(protected settings: SettingsService) {}
}
