import { Component } from '@angular/core';
import { Input } from '@angular/core';

import { SettingsService } from '@oscc/services/settings.service';

import { Context } from '@oscc/models/Context';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss'],
})
export class ContextComponent {
  @Input() context: Context;

  constructor(protected settings: SettingsService) {}
}
