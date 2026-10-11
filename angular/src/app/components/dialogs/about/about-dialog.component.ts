/**
 * This component shows the about page
 */
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './about-dialog.component.html',
  styleUrl: '../dialogs.scss',
})
export class AboutDialogComponent {}
