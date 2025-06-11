import { Component, ContentChild, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ViewModeDirective } from './view-mode.directive';
import { EditModeDirective } from './edit-mode.directive';
import { fromEvent, Subject } from 'rxjs';
import { filter, take, switchMapTo } from 'rxjs/operators';

@Component({
  selector: 'app-editable-column-name',
  template: ` <ng-container *ngTemplateOutlet="currentView"></ng-container> `,
})
export class EditableColumnNameComponent implements OnInit, OnDestroy {
  @ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl: EditModeDirective;
  @Output() update = new EventEmitter();

  editMode = new Subject();

  editMode$ = this.editMode.asObservable();

  mode: 'view' | 'edit' = 'view';

  viewModeSubscription;
  editModeSubscription;

  constructor(private host: ElementRef) {}

  ngOnInit() {
    this.editModeHandler();
  }

  public toViewMode() {
    this.update.next(true);
    this.mode = 'view';
  }

  public toEditMode(): void {
    console.log('test');
    this.mode = 'edit';
    // this.editMode.next(true);
  }

  private get element() {
    return this.host.nativeElement;
  }

  private editModeHandler() {
    const clickOutside$ = fromEvent(document, 'click').pipe(
      filter(({ target }) => this.element.contains(target) === false),
      take(1)
    );

    this.editModeSubscription = this.editMode$.pipe(switchMapTo(clickOutside$)).subscribe(() => this.toViewMode());
  }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }

  ngOnDestroy() {
    this.viewModeSubscription.unsubscribe();
    this.editModeSubscription.unsubscribe();
  }
}
