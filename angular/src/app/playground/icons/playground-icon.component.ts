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
  | { kind: 'mat'; value: string };

const png = (path: string): IconStrategy => ({ kind: 'png', value: path });
const mat_icon = (name: string): IconStrategy => ({ kind: 'mat', value: name });

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
    menu: mat_icon('menu'),
    hamburger: png(byte_dance('9069135_hamburger_button_icon.png')),
    'author-search': png(byte_dance('9069051_doc_search_icon.png')),
    note: png(byte_dance('9068939_notes_icon.png')),
    clear: png(byte_dance('9069117_clear_icon.png')),
    draw: png(byte_dance('9069780_write_icon.png')),
    undo: png(byte_dance('9069465_return_icon.png')),
    redo: png(byte_dance('9069840_go_on_icon.png')),
    save: png(byte_dance('9070374_hard_disk_one_icon.png')),
    load: png(byte_dance('9068981_folder_open_icon.png')),
    'delete-playground': png(byte_dance('9069053_folder_delete_icon.png')),
    share: png(byte_dance('9071373_people_plus_one_icon.png')),
    'create-session': png(byte_dance('9071373_people_plus_one_icon.png')),
    'join-session': png(byte_dance('9071420_people_download_icon.png')),
    help: mat_icon('question_mark'),
    'delete-object': mat_icon('backspace'),
    commentary: mat_icon('notes'),
  };

  protected get strategy(): IconStrategy | undefined {
    return PlaygroundIconComponent.icon_strategies[this.name];
  }
}
