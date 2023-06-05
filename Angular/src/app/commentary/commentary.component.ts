import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ApiService } from '@oscc/api.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { DialogService } from '@oscc/services/dialog.service';

// Service imports
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss'],
})
export class CommentaryComponent implements OnInit, OnChanges {
  @Input() current_fragment: Fragment;

  protected fragment_clicked = false;

  constructor(protected utility: UtilityService, protected api: ApiService, protected dialog: DialogService) {}

  ngOnInit(): void {
    this.current_fragment = new Fragment({});
  }

  ngOnChanges(changes: SimpleChanges) {
    // If the input fragment changes, we will note that a fragment has been clicked
    if (changes.current_fragment.currentValue.author != '') {
      this.fragment_clicked = true;
    }
  }
}
