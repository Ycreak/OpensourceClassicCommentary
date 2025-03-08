import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { SpringService } from './services/spring.service';
import { Taxon } from './models/Taxon';
import { NgFor, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TreeComponent } from './components/tree/tree.component';
import { TraitsComponent } from './traits/traits.component';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-linnaeus',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatCardModule,
    CommonModule,
    TreeComponent,
    TraitsComponent,
    NgIf,
    NgFor,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './linnaeus.component.html',
  styleUrl: './linnaeus.component.scss',
})
export class LinnaeusComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);

  search_form = new FormGroup({
    search_id: new FormControl('139265'),
    search_name: new FormControl('helianthus'),
  });

  protected current_taxon: Taxon;
  protected found_taxa = [];
  protected searching_taxa: boolean;
  protected cover_photo: string = '';
  constructor(private spring: SpringService) {}

  ngOnInit(): void {
    this.current_taxon = new Taxon();
    this.fetch_taxon(this.search_form.value.search_id);
  }

  protected request_children(linnaeus_id: string): void {
    this.spring.get_taxon(linnaeus_id, 'children').subscribe({
      next: (data) => {
        if (data.length) {
          this.current_taxon.parentage = data;
        } else {
          this._snackBar.open('Has no further children');
        }
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });
  }

  /**
   * Fetches a list of taxa from the server given the search string
   */
  protected fetch_taxa_on_trait(trait_id: string): void {
    this.searching_taxa = true;
    this.found_taxa = [];
    this.spring.get_taxa_on_trait(trait_id).subscribe({
      next: (data) => {
        const uniqueList = data.filter((value, index, self) => {
          return (
            index ===
            self.findIndex((t) => t.nsr_id === value.nsr_id && t.taxon_name === value.taxon_name && t.id === value.id)
          );
        });
        this.found_taxa = uniqueList;
        this.found_taxa.forEach((taxon: any) => {
          taxon.media = 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png';
          this.add_media_to_taxon(taxon.id);
        });
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });
  }
  /**
   * Fetches a list of taxa from the server given the search string
   */
  protected fetch_taxa(name: string): void {
    this.searching_taxa = true;
    this.found_taxa = [];
    this.spring.get_taxa(name).subscribe({
      next: (data) => {
        const uniqueList = data.filter((value, index, self) => {
          return (
            index ===
            self.findIndex((t) => t.nsr_id === value.nsr_id && t.taxon_name === value.taxon_name && t.id === value.id)
          );
        });
        this.found_taxa = uniqueList;
        this.found_taxa.forEach((taxon: any) => {
          taxon.media = 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png';
          this.add_media_to_taxon(taxon.id);
        });
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });
  }

  private add_media_to_taxon(id: string): void {
    this.spring.get_taxon(id, 'media').subscribe({
      next: (data) => {
        const media_items = [...new Set(data.map((item) => `https://images.naturalis.nl/original/${item.file_name}`))];
        const chosen_picture = media_items.length
          ? media_items[~~(Math.random() * media_items.length)]
          : 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png';

        // Now add the picture to the taxa list
        this.found_taxa.forEach((taxon) => {
          if (taxon.id === id) {
            taxon.media = chosen_picture; // Add the 'color' property with value 'yellow'
          }
        });
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });
  }

  protected fetch_taxon(linnaeus_id: string): void {
    this.searching_taxa = false;
    this.found_taxa = [];
    this.current_taxon = new Taxon();

    this.spring.get_taxon(linnaeus_id, 'metadata').subscribe({
      next: (data) => {
        this.current_taxon.names = [...new Set(data.map((item) => item.name))];
        this.current_taxon.id = String([...new Set(data.map((item) => item.id))][0]);
        this.current_taxon.nsr_id = String([...new Set(data.map((item) => item.nsrId))][0]);
        // Fetch the traits
        this.spring.get_taxon(this.current_taxon.nsr_id, 'traits').subscribe({
          next: (data) => {
            // Remove nsr_id and taxon, then group by traitsGroup
            const groupedData = data.reduce((acc, item) => {
              const { nsr_id, taxon, ...rest } = item; // Destructure and omit nsr_id and taxon

              // Group by traitsGroup
              if (!acc[item.traitsGroup]) {
                acc[item.traitsGroup] = [];
              }
              acc[item.traitsGroup].push(rest);

              return acc;
            }, {});

            // Now structure the data as {title, content} and sort by 'trait' within content
            const result = Object.keys(groupedData).map((group) => ({
              title: group,
              content: groupedData[group].sort((a, b) => a.trait.localeCompare(b.trait)), // Sort by 'trait'
            }));
            this.current_taxon.traits = result;
          },
          error: (error) => {
            console.error('Error fetching metadata:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });

    this.spring.get_taxon(linnaeus_id, 'page').subscribe({
      next: (data) => {
        // sort data on the title name
        (data = data.sort((a, b) => a.title.localeCompare(b.title))), // Sort by 'trait'
          (this.current_taxon.pages = data);
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });

    this.spring.get_taxon(linnaeus_id, 'literature').subscribe({
      next: (data) => {
        data.forEach((entry: any) => {
          this.current_taxon.literature.push(entry.label);
        });
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });

    this.spring.get_taxon(linnaeus_id, 'media').subscribe({
      next: (data) => {
        this.current_taxon.media = [
          ...new Set(data.map((item) => `https://images.naturalis.nl/original/${item.file_name}`)),
        ];
        this.cover_photo = this.current_taxon.media.length
          ? this.current_taxon.media[~~(Math.random() * this.current_taxon.media.length)]
          : 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png';
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });

    this.spring.get_taxon(linnaeus_id, 'presence').subscribe({
      next: (data) => {
        if (data.length) {
          this.current_taxon.presence = 'presence' in data ? data['presence'] : '';
          this.current_taxon.habitat = 'habitat' in data ? data['habitat'] : '';
        }
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });

    this.spring.get_taxon(linnaeus_id, 'parents').subscribe({
      next: (data) => {
        if (data.length) {
          this.current_taxon.parentage = data;
        }
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      },
    });
  }
}
