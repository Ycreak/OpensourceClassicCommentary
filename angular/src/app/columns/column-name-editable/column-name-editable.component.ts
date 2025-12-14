import { Component, ContentChild, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ViewModeDirective } from './view-mode.directive';
import { EditModeDirective } from './edit-mode.directive';
import { fromEvent, Subject } from 'rxjs';
import { filter, take, switchMapTo } from 'rxjs/operators';
import { Column } from '@oscc/models/Column';

@Component({
  selector: 'app-editable-column-name',
  template: ` <ng-container [column]="column" *ngTemplateOutlet="currentView"></ng-container> `,
})
export class EditableColumnNameComponent implements OnInit, OnDestroy {
  @ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl: EditModeDirective;
  @Input() column: Column;
  @Output() update = new EventEmitter();

  editMode = new Subject();

  editMode$ = this.editMode.asObservable();

  mode: 'view' | 'edit' = 'view';

  viewModeSubscription;
  editModeSubscription;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.editModeHandler();
  }

  public toViewMode(confirmEdit: boolean) {
    if (confirmEdit) {
      this.update.emit(this.column);
    }
    this.mode = 'view';
  }

  public toEditMode(): void {
    this.mode = 'edit';
  }

  private get element() {
    return this.el.nativeElement;
  }

  private editModeHandler() {
    const clickOutside$ = fromEvent(document, 'click').pipe(
      filter(({ target }) => this.element.contains(target) === false),
      take(1)
    );

    //TODO replace this with a directive?
    this.editModeSubscription = this.editMode$.pipe(switchMapTo(clickOutside$)).subscribe(() => this.toViewMode(false));
  }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }

  ngOnDestroy() {
    this.viewModeSubscription.unsubscribe();
    this.editModeSubscription.unsubscribe();
  }
}
