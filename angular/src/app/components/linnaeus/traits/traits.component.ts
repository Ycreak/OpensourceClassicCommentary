import { Component } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { SpringService } from '../services/spring.service';
import { NgFor, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-traits',
  standalone: true,
  imports: [NgIf, NgFor, MatExpansionModule, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  templateUrl: './traits.component.html',
  styleUrl: './traits.component.scss',
})
export class TraitsComponent {
  @Output() request_taxa = new EventEmitter<string>();

  protected traitgroups = [];
  protected traits = [];
  protected traitvalues = [];
  protected taxa = [];

  constructor(private spring: SpringService) {
    this.fetch_traitgroups();
  }

  protected fetch_taxa(trait_value_id: string): void {
    this.traitvalues = [];
    this.spring.get_taxa_on_trait(trait_value_id).subscribe({
      next: (data) => {
        this.taxa = data;
      },
      error: (error) => {
        console.error('Error fetching traitgroups:', error);
      },
    });
  }
  protected fetch_trait_values(trait_id: string): void {
    this.traitvalues = [];
    this.spring.get_trait_values(trait_id).subscribe({
      next: (data) => {
        console.log('trait values', data);
        this.traitvalues = data;
      },
      error: (error) => {
        console.error('Error fetching traitgroups:', error);
      },
    });
  }

  protected fetch_traits(traitgroup_id: string): void {
    this.traits = [];
    this.spring.get_traits(traitgroup_id).subscribe({
      next: (data) => {
        console.log('traits', data);
        this.traits = data;
      },
      error: (error) => {
        console.error('Error fetching traitgroups:', error);
      },
    });
  }

  protected fetch_traitgroups(): void {
    this.traitgroups = [];
    this.spring.get_traitgroups().subscribe({
      next: (data) => {
        console.log('tg', data);
        this.traitgroups = data;
      },
      error: (error) => {
        console.error('Error fetching traitgroups:', error);
      },
    });
  }
}
