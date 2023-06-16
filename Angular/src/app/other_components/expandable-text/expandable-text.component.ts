import { Component, Input, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
//import { CommentaryComponent } from '../../commentary/commentary.component';

@Component({
  selector: 'app-expandable-text',
  templateUrl: './expandable-text.component.html',
  styleUrls: ['./expandable-text.component.scss'],
})
export class ExpandableTextComponent implements AfterViewInit {
  @Input() content: any;
  @Input() isCollapsed?: boolean;
  @Input() collapsedHeightPx?: number; // Height when collapsed in em;

  protected enabled: boolean;

  constructor(private elRef: ElementRef, private cdRef: ChangeDetectorRef) {
    this.enabled = true;
    this.isCollapsed = this.isCollapsed || true; // Set isCollapsed to true by default
    this.collapsedHeightPx = 200; // Element height is 200px by default when collapsed FIXME: Em would be nicer, but would also make the comparison in the ngAfterViewInit below a bit more difficult.
    // Send this variable to the css
    document.querySelector('body').style.setProperty('--collapsed-height', String(this.collapsedHeightPx + 'px'));
  }

  ngAfterViewInit() {
    /** Check if the content is so small that it does not need to be collapsed */
    // Get current content height
    const contentHeight = this.elRef.nativeElement.offsetHeight;

    if (contentHeight < this.collapsedHeightPx) {
      // There is not enough content to warrant an expand content button. Let's hide it from view.
      this.enabled = false;
      // Also make sure the element isn't collapsed.
      this.isCollapsed = false;
      // Push the changes to the Angular change detector
      this.cdRef.detectChanges();
    }
  }

  /**
   * Function used by the toggle button to change between collapsed and expanded view.
   * @author CptVickers
   */
  protected ToggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Function used by the toggle button to get a relevant label based on the element being expanded or collapsed
   * @author CptVickers
   */
  protected get GetToggleButtonText() {
    if (this.isCollapsed === true) {
      return 'Show more';
    } else {
      return 'Show less';
    }
  }
}
