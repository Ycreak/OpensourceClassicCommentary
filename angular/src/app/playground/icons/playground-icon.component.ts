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
  | { kind: 'tabler'; value: string };

const png = (path: string): IconStrategy => ({ kind: 'png', value: path });
const mat_icon = (name: string): IconStrategy => ({ kind: 'mat', value: name });
const tabler = (name: string): IconStrategy => ({ kind: 'tabler', value: name });

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
    menu: tabler('menu-2'),
    hamburger: tabler('menu-2'),
    'author-search': tabler('search'),
    note: tabler('message-circle'),
    clear: tabler('eraser'),
    draw: tabler('brush'),
    undo: tabler('arrow-back-up'),
    redo: tabler('arrow-forward-up'),
    save: tabler('device-floppy'),
    load: tabler('folder'),
    'delete-playground': tabler('folder-x'),
    share: tabler('share'),
    'create-session': tabler('user-plus'),
    'join-session': tabler('door-enter'),
    help: tabler('help'),
    'delete-object': tabler('backspace'),
    commentary: tabler('message-circle'),
  };

  protected get strategy(): IconStrategy | undefined {
    return PlaygroundIconComponent.icon_strategies[this.name];
  }
}
