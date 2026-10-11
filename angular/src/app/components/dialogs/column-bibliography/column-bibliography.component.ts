import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SafeHtmlPipe } from '@oscc/pipes/safeHtml.pipe';

/**
 * Class to show the bibliography of a column.
 */
@Component({
  selector: 'app-column-bibliography',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, SafeHtmlPipe],
  templateUrl: './column-bibliography.component.html',
  styleUrls: ['../dialogs.scss'],
})
export class ColumnBibliographyComponent {
  constructor(
    public dialogRef: MatDialogRef<ColumnBibliographyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
