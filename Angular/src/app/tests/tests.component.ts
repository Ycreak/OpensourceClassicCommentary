import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';
import { DialogService } from '../services/dialog.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';

import { Fragment_column } from '../models/Fragment_column';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.scss']
})
export class TestsComponent implements OnInit {

  unit_tests = {
    get_authors : false,
    get_titles : false,
    get_editors : false,
    get_fragments : false,
    get_fragment_content : false,
    get_specific_fragment : false,
    get_fragment_names : false,
    create_fragment : false,
    revise_fragment : false,
    delete_fragment : false,
  }

  constructor(
    public api: ApiService,
    public utility: UtilityService,
		public auth_service: AuthService,
    public dialog: DialogService,
  ) { }

  ngOnInit(): void {
  }

  public run_tests(): void {
    this.test_get_authors();
    this.test_get_titles();
    this.test_get_editors();
    this.test_get_fragments();
    this.test_get_fragment_content();
    this.test_get_specific_fragment();
    this.test_get_fragment_names();
    this.test_create_revise_delete_fragment();
  }

  public test_get_authors(): void{
    // Get authors check
    this.api.get_authors().subscribe({
      next: (authors) => {
        if ( authors.some(el => el.name === 'Ennius') ) {
          this.unit_tests.get_authors = true;
        }
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }
  // Get titles check
  public test_get_titles(): void {
    this.api.get_titles('Ennius').subscribe({
      next: (titles) => {
        if ( titles.some(el => el['name'] === 'Thyestes') ) {
          this.unit_tests.get_titles = true;
        }
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }
  // Get editors check
  public test_get_editors(): void {
    this.api.get_editors('Ennius', 'Thyestes').subscribe({
      next: (editors) => {
        if ( editors.some(el => el['name'] === 'TRF') ) {
          this.unit_tests.get_editors = true;
        }
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }
  // Get fragments check
  public test_get_fragments(): void {
    let api_data = this.utility.create_empty_fragment();
    api_data.author = 'Ennius'; api_data.title = 'Thyestes'; api_data.editor = 'TRF';
    
    this.api.get_fragments(api_data).subscribe({
      next: (fragments) => {
        if ( fragments.some(el => el['fragment_name'] === '132') ) {
          this.unit_tests.get_fragments = true;
        }
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }  
  // Get fragments check
  public test_get_fragment_content(): void {
    let temp_fragment = this.utility.create_empty_fragment();
    temp_fragment.fragment_id = 'e25dcbacaec84aecb0b1707d496cc740';
    
    this.api.get_fragment_content(temp_fragment).subscribe({
      next: (fragment_content) => {

        if (fragment_content['translation'] == 'but a sound strikes my ears with the beat of feet' ){
          this.unit_tests.get_fragment_content = true;
        }
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }  
  // Get specific fragment check
  public test_get_specific_fragment(): void {
    let api_data = this.utility.create_empty_fragment();
    api_data.author = 'Ennius'; api_data.title = 'Thyestes'; api_data.editor = 'TRF';
    api_data.fragment_name = '138'
  
    this.api.get_specific_fragment(api_data).subscribe({
      next: (fragment_content) => {
        if (fragment_content['translation'] == 'but a sound strikes my ears with the beat of feet' ){
          this.unit_tests.get_specific_fragment = true;
        }
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }  
  // Get fragment names check
  public test_get_fragment_names(): void {
    let api_data = this.utility.create_empty_fragment();
    api_data.author = 'Ennius'; api_data.title = 'Thyestes'; api_data.editor = 'TRF';
  
    this.api.get_fragment_names(api_data).subscribe({
      next: (fragment_names) => {
        console.log(fragment_names)
        if ( fragment_names.includes("132") ) {
          this.unit_tests.get_fragment_names = true;
        }
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }    
  // Create fragment check. (this might be the worst function i have ever written)
  public test_create_revise_delete_fragment(): void {
    let api_data = this.utility.create_empty_fragment();
    api_data.author = 'Ennius'; api_data.title = 'Thyestes'; api_data.editor = 'TRF';
    api_data.fragment_name = '999'; api_data.status = 'certum'
  
    this.api.create_fragment(api_data).subscribe({
      next: (result) => {
        // If we are succesfull, we are also testing the revise
        this.unit_tests.create_fragment = true;
        
        this.api.get_specific_fragment(api_data).subscribe({
          next: (fragment) => {
            api_data.fragment_id = fragment['fragment_id']
            api_data.status = 'incertum'
            
            this.api.revise_fragment(api_data).subscribe({
              next: (result) => {
                this.unit_tests.revise_fragment = true;   
                // Now, we also want to delete the fragment
                this.api.get_specific_fragment(api_data).subscribe({
                  next: (fragment) => {
                    this.api.delete_fragment(fragment).subscribe({
                      next: (result) => {
                        this.unit_tests.delete_fragment = true;
                      },
                      error: (err) => {
                        this.utility.handle_error_message(err);
                      }  
                    });
                  },
                  error: (err) => {
                    this.utility.handle_error_message(err);
                  }  
                });                  
              },
              error: (err) => {
                this.utility.handle_error_message(err);
              }  
            });
          },
          error: (err) => {
            this.utility.handle_error_message(err);
          }  
        });
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }  
} 
