import { Component } from '@angular/core';
import { Input } from '@angular/core';

import { SettingsService } from '@oscc/services/settings.service';

import { Context } from '@oscc/types/Context';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss'],
  standalone: true,
  imports: [],
})
export class ContextComponent {
  @Input() context: Context;

  constructor(protected settings: SettingsService) {}
}
