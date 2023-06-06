import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-bibliography',
  templateUrl: './bibliography.component.html',
  styleUrls: ['./bibliography.component.scss'],
})
export class BibliographyComponent implements OnInit {
  // This component get fragment_form from dashboard so that it can extract linked_bib_entries from it.
  @Input() fragment_form: FormGroup;

  retrieved_bibliography_authors: object;
  retrieved_author_bibliography: object;

  bibliography_form = new FormGroup({
    _id: new FormControl(''),
    bib_entry_type: new FormControl('book'), // Book is default on page load
    author: new FormControl(''),
    title: new FormControl(''),
    year: new FormControl(''),
    series: new FormControl(''),
    number: new FormControl(''),
    location: new FormControl(''),
    edition: new FormControl(''),
    journal: new FormControl(''),
    volume: new FormControl(''),
    pages: new FormControl(''),
  });

  // Bibliography author selection
  bibliography_author_selection_form = new FormControl();
  bibliography_author_selection_form_options: string[] = [];
  bibliography_author_selection_form_filtered_options: Observable<string[]>;
  bibliography_form_selected_type = new FormControl(0);
  bib_entry_selected = false;

  constructor(protected auth_service: AuthService, protected api: ApiService, protected dialog: DialogService) {}

  /**
   * On Init, we just load the list of authors. From here, selection is started
   */
  ngOnInit(): void {
    // this.RequestAuthors()
    this.request_bibliography_authors();

    this.bibliography_author_selection_form_filtered_options =
      this.bibliography_author_selection_form.valueChanges.pipe(
        startWith(''),
        map((value) => this.filter_autocomplete_options(value))
      );
  }

  /**
   * Filters the list of authors based on the user's search input
   * @param value user input
   * @return bibliography authors that match the user's input
   * @author Ycreak CptVickers
   */
  private filter_autocomplete_options(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.bibliography_author_selection_form_options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  /**
   * When changing the entry type for bibliographies, this function makes sure the type
   * is communicated with the bibliography form.
   * @author Ycreak, CptVickers
   * @param tab_change_event angular event that gives the bibliography type to be changed to.
   */
  public on_bibliography_tab_change(tab_change_event: MatTabChangeEvent): void {
    this.bibliography_form.patchValue({ bib_entry_type: tab_change_event.tab.textLabel.toLowerCase() });
  }

  /**
   * When a bibliography entry is selected by the user, put all relevant data in the fields for easy
   * revision.
   * @param bib_entry with data for the selected entry
   * @author Ycreak, CptVickers
   */
  public handle_bib_entry_selection(bib_entry) {
    console.log(bib_entry.bib_entry_type);
    // Jump automatically to the correct tab. FIXME: this works buggy
    if (bib_entry.bib_entry_type == 'book') this.bibliography_form_selected_type.setValue(0);
    if (bib_entry.bib_entry_type == 'article') this.bibliography_form_selected_type.setValue(1);

    this.bibliography_form.patchValue({ _id: bib_entry._id });
    this.bibliography_form.patchValue({ author: bib_entry.author });
    this.bibliography_form.patchValue({ title: bib_entry.title });
    this.bibliography_form.patchValue({ year: bib_entry.year });
    this.bibliography_form.patchValue({ series: bib_entry.series });
    this.bibliography_form.patchValue({ number: bib_entry.number });
    this.bibliography_form.patchValue({ location: bib_entry.location });
    this.bibliography_form.patchValue({ edition: bib_entry.edition });
    this.bibliography_form.patchValue({ journal: bib_entry.journal });
    this.bibliography_form.patchValue({ volume: bib_entry.volume });
    this.bibliography_form.patchValue({ pages: bib_entry.pages });
  }

  /**
   * Converts JSON into a angular list
   * @param authors_json json object from the server
   * @returns angular list with bibliography author names
   * @authors Ycreak
   */
  public push_bibliography_authors_in_list(authors_json) {
    const author_list: string[] = [];

    for (const author in authors_json) {
      author_list.push(authors_json[author].name);
    }
    return author_list;
  }

  /**
   * Requests a list of authors from the bibliography database. Puts it in bibliography_author_selection_form_options for
   * use in the autocomplete module
   * @author Ycreak
   */
  public request_bibliography_authors() {
    // this.api.get_bibliography_authors().subscribe({
    //   next: (data) => {
    //     this.bibliography_author_selection_form_options = this.push_bibliography_authors_in_list(data); //TODO: this need to be handled with a model
    //   },
    //   error: (err) => this.api.handle_error_message(err),
    // });
  }

  public request_bibliography_from_author(author) {
    // this.api.get_bibliography_from_author(author).subscribe((data) => {
    //   this.retrieved_author_bibliography = data;
    // });
  }

  /**
   * This function request bibliography entries given its id. It then updates the fields
   * corresponding to this id for the Fragment Bibliography tab to use. TODO: Find a way to share this with dashboard.
   * @param id identifier of the bibliography document
   * @author Ycreak, CptVickers
   */
  public request_bibliography_from_id(id) {
    // this.api.get_bibliography_from_id(id).subscribe((data) => {
    //   const temp = data; // simple object to access Python JSON (TODO: needs to be Angular model)
    //   const linked_bib_entries = this.fragment_form.get('linked_bib_entries') as FormArray;
    //   // Find the entry with our id
    //   const index = linked_bib_entries.value.findIndex((x) => x.bib_id === id);
    //   // Add the data retrieved to the corresponding fields
    //   linked_bib_entries.at(index).get('author').setValue(temp.author);
    //   linked_bib_entries.at(index).get('title').setValue(temp.title);
    //   linked_bib_entries.at(index).get('year').setValue(temp.year);
    // });
  }

  public request_revise_bibliography_entry(bibliography) {
    // const item_string = bibliography.author + ', ' + bibliography.title;
    // this.dialog
    //   .open_confirmation_dialog('Are you sure you want to REVISE this bibliography entry?', item_string)
    //   .subscribe((result) => {
    //     if (result) {
    //       this.api.revise_bibliography_entry(bibliography).subscribe({
    //         next: (res) => {
    //           this.api.handle_error_message(res), this.request_bibliography_authors(); // After a succesful response, retrieve the authors again.
    //         },
    //         error: (err) => this.api.handle_error_message(err),
    //       });
    //     }
    //   });
    // this.bibliography_form.reset();
  }

  public request_create_bibliography_entry(bibliography) {
    // const item_string = bibliography.author + ', ' + bibliography.title;
    // this.dialog
    //   .open_confirmation_dialog('Are you sure you want to CREATE this bibliography entry?', item_string)
    //   .subscribe((result) => {
    //     if (result) {
    //       this.api.create_bibliography_entry(bibliography).subscribe({
    //         next: (res) => {
    //           this.api.handle_error_message(res), this.request_bibliography_authors(); // After a succesful response, retrieve the authors again.
    //         },
    //         error: (err) => this.api.handle_error_message(err),
    //       });
    //     }
    //   });
    // this.bibliography_form.reset();
  }

  public request_delete_bibliography_entry(bibliography) {
    // const item_string = bibliography.author + ', ' + bibliography.title;
    // this.dialog
    //   .open_confirmation_dialog('Are you sure you want to DELETE this bibliography entry?', item_string)
    //   .subscribe((result) => {
    //     if (result) {
    //       this.api.delete_bibliography_entry({ _id: bibliography._id }).subscribe({
    //         next: (res) => {
    //           this.api.handle_error_message(res), this.request_bibliography_authors(); // After a succesful response, retrieve the authors again.
    //         },
    //         error: (err) => this.api.handle_error_message(err),
    //       });
    //     }
    //   });
    // this.bibliography_form.reset();
    // this.bib_entry_selected = false;
  }
}
