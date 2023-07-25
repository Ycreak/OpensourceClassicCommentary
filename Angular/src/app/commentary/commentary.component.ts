import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ApiService } from '@oscc/api.service';
import { IntroductionsComponent } from '@oscc/dashboard/introductions/introductions.component';
import { FragmentsComponent } from '@oscc/fragments/fragments.component';

// Model imports
import { Commentary } from '@oscc/models/Commentary';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';

// Service imports
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss'],
  providers: [IntroductionsComponent, FragmentsComponent],
})
export class CommentaryComponent implements OnChanges {
  @Input() commentary: Commentary;
  @Input() fragments_translated: boolean;

  protected fragment_clicked = false;
  protected translation_orig_text_expanded = false;

  constructor(
    protected utility: UtilityService,
    protected api: ApiService,
    protected dialog: DialogService,
    protected settings: SettingsService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.commentary) {
      this.commentary.add_html();
      this.commentary.convert_bib_entries(this.api.zotero);
    }
  }

  /**
   * Function to toggle the expansion state of the fragment translation/original text sections
   * The expansion state is stored as a variable in this component so that it persists between
   * DOM changes.
   * @author CptVickers
   */
  protected toggle_translation_orig_text_expanded(): void {
    this.translation_orig_text_expanded = !this.translation_orig_text_expanded;
  }
}
