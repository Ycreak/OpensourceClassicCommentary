import { Component, Input } from '@angular/core';
import { Metrical_analysis_field } from '@oscc/models/commentary/Metrical_analysis';

@Component({
  selector: 'app-metrical-analysis-field',
  templateUrl: './metrical-analysis-field.component.html',
  styleUrls: ['./metrical-analysis-field.component.scss'],
})
export class MetricalAnalysisFieldComponent {
  @Input() metrical_analysis: Metrical_analysis_field;
}
