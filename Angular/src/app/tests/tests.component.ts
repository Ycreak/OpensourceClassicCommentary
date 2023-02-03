import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';
import { DialogService } from '../services/dialog.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';

import { Column } from '../models/Column';
import { Fragment } from '../models/Fragment';

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
    this.test_get_fragment_names();
    this.test_create_revise_delete_fragment();
  }

  public test_get_authors(): void{
    // Get authors check
    this.api.get_authors({}).subscribe({
      next: (authors) => {
        if ( authors.some(el => el === 'Ennius') ) {
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
    let api_data = new Fragment({});
    api_data.author = 'Ennius'

    this.api.get_titles(api_data).subscribe({
      next: (titles) => {
        if ( titles.some(el => el === 'Thyestes') ) {
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

    this.api.get_editors({
      author:'Ennius', 
      title:'Thyestes', 
    }).subscribe({
      next: (editors) => {
        if ( editors.some(el => el === 'TRF') ) {
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

    this.api.get_fragments({
      author:'Ennius', 
      title:'Thyestes', 
      editor: 'TRF'
    }).subscribe({
      next: (fragments) => {
        if ( fragments.some(el => el['name'] === '132') ) {
          this.unit_tests.get_fragments = true;
        }
      },
      error: (err) => {
        this.utility.handle_error_message(err);
      }  
    });
  }  
  // Get fragment names check
  public test_get_fragment_names(): void {
    this.api.get_fragment_names({
      author:'Ennius', 
      title:'Thyestes', 
      editor: 'TRF'
    }).subscribe({
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
  // Create fragment check.
  public test_create_revise_delete_fragment(): void {
    let fragment = new Fragment({
      author:'Ennius', 
      title:'Thyestes', 
      editor: 'TRF',
      name: '999',
      status: 'Certum'
    }) 
    
    this.api.create_fragment(fragment).subscribe({
      next: (result) => {
        // If we are succesfull, we are also testing the revise
        this.unit_tests.create_fragment = true;
                    
        fragment.status = 'Incertum'
      
        this.api.get_fragments(fragment).subscribe({
          next: (result) => {
            let fragment = this.api.convert_fragment_json_to_typescript(result)[0]
            this.api.revise_fragment(fragment).subscribe({
              next: (result) => {
                this.unit_tests.revise_fragment = true;   
                // Now, we also want to delete the fragment
                this.api.delete_fragment(fragment).subscribe({
                  next: (result) => {
                    this.unit_tests.delete_fragment = true;
                  },
                });
              },
            });    
          }
        })
      },
      // error: (err) => {
      //   this.utility.handle_error_message(err);
      // }  
    })  
  }
} 
