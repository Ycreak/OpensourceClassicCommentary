/* Single icon seam for the playground.
 *
 * Every <img> and <mat-icon> in playground.component.html now goes through
 * <app-playground-icon name="..."> so swapping the icon set (e.g. Material
 * Symbols, Phosphor, Tabler) becomes a one-file edit to the lookup table
 * below instead of editing ~15 template lines.
 *
 * Phase 2: rewired to Material Symbols Outlined (variable icon font loaded
 * via Google Fonts in index.html). Each strategy now renders a
 * <span class="material-symbols-outlined">name</span>.
 */
import { Component, Input } from '@angular/core';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

type IconStrategy =
  | { kind: 'png'; value: string }
  | { kind: 'mat'; value: string }
  | { kind: 'msym'; value: string };

const material_symbol = (name: string): IconStrategy => ({ kind: 'msym', value: name });

@Component({
  selector: 'app-playground-icon',
  templateUrl: './playground-icon.component.html',
  styleUrls: ['./playground-icon.component.scss'],
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, MatIconModule],
})
export class PlaygroundIconComponent {
  @Input() name!: string;
  @Input() size = 24;

  /**
   * Logical-name -> rendering strategy. Add/swap entries here to change
   * the icon set globally. Keep keys kebab-case so HTML stays readable.
   */
  private static readonly icon_strategies: Readonly<Record<string, IconStrategy>> = {
    menu: material_symbol('menu'),
    hamburger: material_symbol('menu'),
    'author-search': material_symbol('manage_search'),
    note: material_symbol('chat_bubble_outline'), /* Ycreak: replace note by comment icon */
    clear: material_symbol('cleaning_services'),
    draw: material_symbol('draw'),
    undo: material_symbol('undo'), /* Ycreak: arrows should "really turn" — material's undo curls */
    redo: material_symbol('redo'),
    save: material_symbol('save'),
    load: material_symbol('folder_open'),
    'delete-playground': material_symbol('folder_delete'),
    share: material_symbol('share'),
    'create-session': material_symbol('group_add'), /* differentiated from share */
    'join-session': material_symbol('login'),
    help: material_symbol('help_outline'),
    'delete-object': material_symbol('backspace'),
    commentary: material_symbol('comment'), /* Ycreak: comment icon */
  };

  protected get strategy(): IconStrategy | undefined {
    return PlaygroundIconComponent.icon_strategies[this.name];
  }
}
