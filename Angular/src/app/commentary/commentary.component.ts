import { Component, Input, OnInit } from '@angular/core';

// Model imports
import { Fragment } from '@oscc/models/Fragment';

// Service imports
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss']
})
export class CommentaryComponent implements OnInit {

  @Input() current_fragment!: Fragment;

  constructor(    
    protected utility: UtilityService,
    ){ }

  ngOnInit(): void {
    console.log(this.current_fragment)
  }

  test(){
    console.log(this.current_fragment)
  }

}
