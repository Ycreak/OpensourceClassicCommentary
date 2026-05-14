import { NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as fabric from 'fabric';

import { ColumnsService } from '@oscc/columns/columns.service';
import { CommentaryService } from '@oscc/commentary/commentary.service';
import { UtilityService } from '@oscc/utility.service';
import { FabricService } from '../../services/fabric.service';
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

  private double_click_handler: (event: any) => void;
  private native_double_click_handler: (event: MouseEvent) => void;
  private selection_created_handler: () => void;
  private selection_updated_handler: () => void;
  private selection_cleared_handler: () => void;
  private object_moving_handler: () => void;
  private object_modified_handler: () => void;
  private after_render_handler: () => void;
  private last_double_click_time = 0;
  private selected_document: any = null;
  private destroyed = false;
  private handlers_registered = false;

  constructor(
    private columns: ColumnsService,
    private commentary: CommentaryService,
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
    if (!this.handlers_registered) return;

    if (this.double_click_handler && this.fabric.canvas) {
      this.fabric.canvas.off('mouse:dblclick' as any, this.double_click_handler);
    }
    if (this.native_double_click_handler && this.fabric.canvas?.upperCanvasEl) {
      this.fabric.canvas.upperCanvasEl.removeEventListener('dblclick', this.native_double_click_handler);
    }
    if (this.selection_created_handler) {
      this.fabric.canvas?.off('selection:created' as any, this.selection_created_handler);
    }
    if (this.selection_updated_handler) {
      this.fabric.canvas?.off('selection:updated' as any, this.selection_updated_handler);
    }
    if (this.selection_cleared_handler) {
      this.fabric.canvas?.off('selection:cleared' as any, this.selection_cleared_handler);
    }
    if (this.object_moving_handler) {
      this.fabric.canvas?.off('object:moving' as any, this.object_moving_handler);
    }
    if (this.object_modified_handler) {
      this.fabric.canvas?.off('object:modified' as any, this.object_modified_handler);
    }
    if (this.after_render_handler) {
      this.fabric.canvas?.off('after:render' as any, this.after_render_handler);
    }
  }

  protected request_selected_commentary(): void {
    const selected_document = this.selected_document ?? this.fabric.canvas.getActiveObjects()[0];
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
    this.handlers_registered = true;
    this.double_click_handler = (event: any) => {
      this.handle_double_click(event);
    };
    this.native_double_click_handler = (event: MouseEvent) => {
      this.handle_double_click({ e: event });
    };
    this.selection_created_handler = () => this.update_selected_document();
    this.selection_updated_handler = () => this.update_selected_document();
    this.selection_cleared_handler = () => {
      this.ng_zone.run(() => {
        this.selected_document = null;
        this.button_visible = false;
      });
    };
    this.object_moving_handler = () => this.update_button_position();
    this.object_modified_handler = () => this.update_button_position();
    this.after_render_handler = () => this.update_button_position();

    this.fabric.canvas.upperCanvasEl.addEventListener('dblclick', this.native_double_click_handler);
    this.fabric.canvas.on('mouse:dblclick' as any, this.double_click_handler);
    this.fabric.canvas.on('selection:created' as any, this.selection_created_handler);
    this.fabric.canvas.on('selection:updated' as any, this.selection_updated_handler);
    this.fabric.canvas.on('selection:cleared' as any, this.selection_cleared_handler);
    this.fabric.canvas.on('object:moving' as any, this.object_moving_handler);
    this.fabric.canvas.on('object:modified' as any, this.object_modified_handler);
    this.fabric.canvas.on('after:render' as any, this.after_render_handler);
  }

  private handle_double_click(event: any): void {
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
      this.selected_document = this.resolve_document_canvas_object(this.fabric.canvas.getActiveObjects()[0]);
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

  private request_commentary_for_canvas_object(clicked_document: any): void {
    clicked_document = this.resolve_document_canvas_object(clicked_document);
    if (!clicked_document) {
      this.utility.open_snackbar('Commentary not found.');
      return;
    }

    if (this.fabric.is_note(clicked_document)) {
      this.utility.open_snackbar('I am a note.');
      return;
    }

    const full_document = this.utility.filter_array(this.fabric.documents, (clicked_document as any).identifier)[0];
    if (!full_document) {
      this.utility.open_snackbar('Commentary not found.');
      return;
    }

    const selected_column_document = this.columns.select_document(full_document);
    this.commentary.request(selected_column_document?.document ?? full_document, { highlight: true });
    this.commentary_requested.emit();
    window.scroll(0, 0);
  }

  private get_double_click_target(event: any): any {
    const pointer_target = event?.e ? this.fabric.canvas.findTarget(event.e) : null;
    const candidates = [
      event?.target,
      event?.currentTarget,
      pointer_target,
      ...(event?.subTargets ?? []),
      ...(this.fabric.canvas.getActiveObjects() ?? []),
    ];

    for (const candidate of candidates) {
      const document_object = this.resolve_document_canvas_object(candidate);
      if (document_object) return document_object;
    }

    return null;
  }

  private resolve_document_canvas_object(candidate: any): any {
    if (!candidate) return null;

    if (this.fabric.is_document(candidate)) {
      return candidate;
    }

    const child_objects = candidate.getObjects ? candidate.getObjects() : candidate._objects;
    if (child_objects?.length) {
      for (const child of child_objects) {
        const document_object = this.resolve_document_canvas_object(child);
        if (document_object) return document_object;
      }
    }

    if (candidate.group) {
      return this.resolve_document_canvas_object(candidate.group);
    }

    if (candidate.parent) {
      return this.resolve_document_canvas_object(candidate.parent);
    }

    return null;
  }
}
