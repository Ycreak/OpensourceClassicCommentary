/* Single icon seam for the playground.
 *
 * Every <img> and <mat-icon> in playground.component.html now goes through
 * <app-playground-icon name="..."> so swapping the icon set (e.g. Material
 * Symbols, Phosphor, Tabler) becomes a one-file edit to the lookup table
 * below instead of editing ~15 template lines.
 *
 * Phase 1: every strategy returns the current PNG path or mat-icon name,
 * so rendered pixels are byte-identical with the pre-refactor template.
 */
import { Component, Input } from '@angular/core';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

type IconStrategy =
  | { kind: 'png'; value: string }
  | { kind: 'mat'; value: string }
  | { kind: 'phosphor'; value: string };

const png = (path: string): IconStrategy => ({ kind: 'png', value: path });
const mat_icon = (name: string): IconStrategy => ({ kind: 'mat', value: name });
const phosphor = (name: string): IconStrategy => ({ kind: 'phosphor', value: name });

const byte_dance = (file: string): string =>
  `assets/icons/ByteDanceIconPark/${file}`;

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
    menu: phosphor('list'),
    hamburger: phosphor('list'),
    'author-search': phosphor('magnifying-glass-plus'),
    note: phosphor('chat-circle-text'),
    clear: phosphor('broom'),
    draw: phosphor('pencil-line'),
    undo: phosphor('arrow-counter-clockwise'),
    redo: phosphor('arrow-clockwise'),
    save: phosphor('floppy-disk'),
    load: phosphor('folder-simple-dashed'),
    'delete-playground': phosphor('trash'),
    share: phosphor('share-network'),
    'create-session': phosphor('users-three'),
    'join-session': phosphor('sign-in'),
    help: phosphor('question'),
    'delete-object': phosphor('backspace'),
    commentary: phosphor('chat-circle-text'),
  };

  protected get strategy(): IconStrategy | undefined {
    return PlaygroundIconComponent.icon_strategies[this.name];
  }
}
