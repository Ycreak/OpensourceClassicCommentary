import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FiltersPanelComponent } from '@ludev/components/filters-panel/filters-panel';
import { HeaderComponent } from '@ludev/components/header/header';
import { ResultsPanelComponent } from '@ludev/components/results-panel/results-panel';
import { TextInputPanelComponent } from '@ludev/components/text-input-panel/text-input-panel';

@Component({
  selector: 'app-ludev',
  imports: [HeaderComponent, TextInputPanelComponent, FiltersPanelComponent, ResultsPanelComponent],
  templateUrl: './ludev.component.html',
  styleUrl: './ludev.component.scss',
})
export class LudevComponent {
  @ViewChild('layout', { static: true }) layoutRef!: ElementRef<HTMLElement>;

  leftWidth: number | null = null;
  private isResizing = false;

  private readonly handleWidth = 6;
  private readonly minLeft = 520;
  private readonly minRight = 520;

  get gridTemplateColumns(): string | null {
    if (this.leftWidth === null) {
      return null;
    }

    return `${this.leftWidth}px ${this.handleWidth}px minmax(${this.minRight}px, 1fr)`;
  }

  startResize(event: MouseEvent): void {
    event.preventDefault();

    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) {
      return;
    }

    const rect = this.layoutRef.nativeElement.getBoundingClientRect();
    const next = event.clientX - rect.left;
    const maxLeft = rect.width - this.handleWidth - this.minRight;

    this.leftWidth = Math.max(this.minLeft, Math.min(maxLeft, next));
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (!this.isResizing) {
      return;
    }

    this.isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.leftWidth === null) {
      return;
    }

    const rect = this.layoutRef.nativeElement.getBoundingClientRect();
    const maxLeft = rect.width - this.handleWidth - this.minRight;

    this.leftWidth = Math.max(this.minLeft, Math.min(maxLeft, this.leftWidth));
  }
}
