import { Component } from '@angular/core';
import { Input } from '@angular/core';

import { SettingsService } from '@oscc/services/settings.service';

import { Testimonium } from '@oscc/models/Testimonium';

@Component({
  selector: 'app-testimonia',
  templateUrl: './testimonia.component.html',
  styleUrls: ['./testimonia.component.scss'],
})
export class TestimoniaComponent {
  @Input() testimonium: Testimonium;

  constructor(protected settings: SettingsService) {}
}
