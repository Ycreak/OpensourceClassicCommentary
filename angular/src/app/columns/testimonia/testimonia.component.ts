import { Component } from '@angular/core';
import { Input } from '@angular/core';

import { SettingsService } from '@oscc/services/settings.service';

import { Testimonium } from '@oscc/models/Testimonium';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-testimonia',
  templateUrl: './testimonia.component.html',
  styleUrls: ['./testimonia.component.scss'],
  standalone: true,
  imports: [NgIf],
})
export class TestimoniaComponent {
  @Input() testimonium: Testimonium;

  constructor(protected settings: SettingsService) {}
}
