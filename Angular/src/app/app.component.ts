import { Component, OnInit } from '@angular/core';

import { ApiService } from '@oscc/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'OpenSourceClassicCommentary';

  constructor(
    protected api: ApiService,
  ) {}


  ngOnInit() {
    // All things needed at startup by the OSCC are listed here
    this.api.get_bibliography().subscribe((bib) => {
      console.debug('Bibliography retrieved', bib)
    });
  }
}
