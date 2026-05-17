import { NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as fabric from 'fabric';
import type { FabricObject, TPointerEvent, TPointerEventInfo } from 'fabric';

import { FragmentCommentaryService } from '@oscc/commentary/fragment-commentary.service';
import { UtilityService } from '@oscc/utility.service';
import { FabricService } from '../../services/fabric.service';
import { FabricEventBinder } from '../../services/fabric-event-binder';
import { DocumentObject, get_identifier, resolve_document_ancestor } from '../../services/document-object';
import { TeachingPlaygroundService } from '../teaching-playground.service';

@Component({
  selector: 'app-teaching-commentary-bridge',
  templateUrl: './teaching-commentary-bridge.component.html',
  styleUrls: ['./teaching-commentary-bridge.component.scss'],
  standalone: true,
  imports: [NgIf, NgStyle, MatButtonModule, MatIconModule],
})
export class TeachingCommentaryBridgeComponent implements OnInit, OnDestroy {
  @Output() commentary_requested = new EventEmitter<void>();

  protected button_visible = false;
  protected button_style: { left: string; top: string } = { left: '0px', top: '0px' };

  private readonly binder = new FabricEventBinder();
  private last_double_click_time = 0;
  private selected_document: DocumentObject | null = null;
  private destroyed = false;

  constructor(
    private fragment_commentary: FragmentCommentaryService,
    private fabric: FabricService,
    private ng_zone: NgZone,
    protected teaching: TeachingPlaygroundService,
    private utility: UtilityService
  ) {}

  ngOnInit(): void {
    this.set_event_handlers_when_canvas_is_ready();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.binder.destroy();
  }

  protected request_selected_commentary(): void {
    const selected_document: FabricObject | DocumentObject | undefined =
      this.selected_document ?? this.fabric.canvas.getActiveObjects()[0];
    this.request_commentary_for_canvas_object(selected_document);
  }

  private set_event_handlers_when_canvas_is_ready(): void {
    if (this.destroyed) return;
    if (!this.fabric.canvas?.upperCanvasEl) {
      window.setTimeout(() => this.set_event_handlers_when_canvas_is_ready(), 0);
      return;
    }

    this.set_event_handlers();
  }

  private set_event_handlers(): void {
    const canvas = this.fabric.canvas;
    this.binder.bind_native(canvas.upperCanvasEl, 'dblclick', (event: MouseEvent) =>
      this.handle_double_click({ e: event } as TPointerEventInfo<TPointerEvent>)
    );
    this.binder.bind(canvas, 'mouse:dblclick', (event: TPointerEventInfo<TPointerEvent>) => this.handle_double_click(event));
    this.binder.bind(canvas, 'selection:created', () => this.update_selected_document());
    this.binder.bind(canvas, 'selection:updated', () => this.update_selected_document());
    this.binder.bind(canvas, 'selection:cleared', () => {
      this.ng_zone.run(() => {
        this.selected_document = null;
        this.button_visible = false;
      });
    });
    this.binder.bind(canvas, 'object:moving', () => this.update_button_position());
    this.binder.bind(canvas, 'object:modified', () => this.update_button_position());
    this.binder.bind(canvas, 'after:render', () => this.update_button_position());
  }

  private handle_double_click(event: TPointerEventInfo<TPointerEvent>): void {
    if (!this.teaching.lesson_mode || !this.teaching.step_checked) return;

    const now = Date.now();
    if (now - this.last_double_click_time < 100) return;
    this.last_double_click_time = now;

    const target = this.get_double_click_target(event);
    if (!target) return;
    this.selected_document = target;
    this.request_commentary_for_canvas_object(target);
  }

  private update_selected_document(): void {
    this.ng_zone.run(() => {
      if (!this.teaching.lesson_mode || !this.teaching.step_checked) return;
      this.selected_document = resolve_document_ancestor(this.fabric.canvas.getActiveObjects()[0]);
      this.update_button_position();
    });
  }

  private update_button_position(): void {
    if (!this.teaching.lesson_mode || !this.teaching.step_checked || !this.selected_document) {
      this.button_visible = false;
      return;
    }

    const rect = this.selected_document.getBoundingRect();
    const viewport_transform = this.fabric.canvas.viewportTransform;
    const top_right = fabric.util.transformPoint(new fabric.Point(rect.left + rect.width, rect.top), viewport_transform);
    const canvas_width = this.fabric.canvas.width ?? window.innerWidth;

    this.button_style = {
      left: `${Math.min(Math.max(top_right.x - 16, 8), canvas_width - 56)}px`,
      top: `${Math.max(top_right.y - 44, 8)}px`,
    };
    this.button_visible = true;
  }

  private request_commentary_for_canvas_object(clicked_document: FabricObject | DocumentObject | undefined): void {
    const document_object = resolve_document_ancestor(clicked_document);
    if (!document_object) {
      this.utility.open_snackbar('Commentary not found.');
      return;
    }

    if (this.fabric.is_note(document_object)) {
      this.utility.open_snackbar('I am a note.');
      return;
    }

    const full_document = this.utility.filter_array(this.fabric.documents, get_identifier(document_object))[0];
    if (!full_document) {
      this.utility.open_snackbar('Commentary not found.');
      return;
    }

    this.fragment_commentary.open(full_document, { highlight: true });
    this.commentary_requested.emit();
    window.scroll(0, 0);
  }

  private get_double_click_target(event: TPointerEventInfo<TPointerEvent>): DocumentObject | null {
    const pointer_target = event?.e ? this.fabric.canvas.findTarget(event.e) : null;
    const candidates: (FabricObject | undefined | null)[] = [
      event?.target,
      (event as { currentTarget?: FabricObject })?.currentTarget,
      pointer_target,
      ...(event?.subTargets ?? []),
      ...(this.fabric.canvas.getActiveObjects() ?? []),
    ];

    for (const candidate of candidates) {
      const document_object = resolve_document_ancestor(candidate);
      if (document_object) return document_object;
    }

    return null;
  }
}
