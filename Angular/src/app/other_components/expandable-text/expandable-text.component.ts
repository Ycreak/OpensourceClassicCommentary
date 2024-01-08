import { Component, Input, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
//import { CommentaryComponent } from '../../commentary/commentary.component';

@Component({
  selector: 'app-expandable-text',
  templateUrl: './expandable-text.component.html',
  styleUrls: ['./expandable-text.component.scss'],
})
export class ExpandableTextComponent implements AfterViewInit {
  @Input() content: string; // HTML content
  @Input() isCollapsed?: boolean;
  @Input() collapsedHeightPx?: number; // Height when collapsed in em;

  protected enabled: boolean;
  protected maskDisabled = false;
  protected content_hideable: string;

  constructor(
    private elRef: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {
    this.enabled = true;
    this.isCollapsed = this.isCollapsed || true; // Set isCollapsed to true by default
    this.collapsedHeightPx = this.collapsedHeightPx || 200; // Element height is 200px by default when collapsed FIXME: Em would be nicer, but would also make the comparison in the ngAfterViewInit below a bit more difficult.
    // Send this variable to the css
    document.querySelector('body').style.setProperty('--collapsed-height', String(this.collapsedHeightPx + 'px'));
  }

  ngAfterViewInit() {
    // Check if the content has a hidden section
    // If so, hide this section, hide the gradient mask and set the component height to fit-content.
    if (this.content.includes('[hidden]')) {
      // Hide the to-be-hidden text to the hideable section
      this.content = this.content.replace('[/hidden]', ''); // Remove leftover tags
      let content_hideable_arr: string[];
      [this.content, ...content_hideable_arr] = this.content.split('[hidden]');
      this.content_hideable = content_hideable_arr.join();

      // Remove the gradient mask
      // This also sets the component height to fit-content
      this.maskDisabled = true;

      // Push the changes to the Angular change detector
      this.cdRef.detectChanges();
    } else {
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
  }

  /**
   * Function used by the toggle button to change between collapsed and expanded view.
   * @author CptVickers
   */
  protected toggle_collapsed() {
    // If the content contains a hidden section, unhide TODO:
    if (this.isCollapsed) {
      this.content = this.content.replace('<span hidden>', "<span name='unhidden'>");
    } else {
      this.content = this.content.replace("<span name='unhidden'>", '<span hidden>');
    }

    this.isCollapsed = !this.isCollapsed;

    // Push the changes to the Angular change detector
    this.cdRef.detectChanges();
  }

  /**
   * Function used by the toggle button to get a relevant label based on the element being expanded or collapsed
   * @author CptVickers
   */
  protected get get_toggle_button_text() {
    if (this.isCollapsed === true) {
      return 'Show more';
    } else {
      return 'Show less';
    }
  }
}
