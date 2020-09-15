import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

// Allows for drag and drop items in HTML
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
// Library used for interacting with the page
import {MatDialog} from '@angular/material/dialog';
// To allow dialog windows within the current window
import { TemplateRef, ViewChild } from '@angular/core';
// Imports of different components to be shown within a dialog within the page

@Component({
  selector: 'app-fragments',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.scss']
})
export class FragmentsComponent implements OnInit {

  @ViewChild('callBibliography') callBibliography: TemplateRef<any>;
  @ViewChild('callBookSelect') callBookSelect: TemplateRef<any>;
  @ViewChild('callAbout') callAbout: TemplateRef<any>;

  // Variables to split the bibliography in different sections.
  bibBooks : JSON;
  bibArticles: JSON;
  bibWebsites: JSON;
  bibInCollection : JSON; //TODO: this one should be added.
  // Toggle switches
  ColumnsToggle: boolean = true; // Boolean to toggle between 2 and 3 column mode.
  // Need to rethink this
  selectedEditor = <any>{}; // EHm?
 
  authorsJSON = JSON; // JSON that contains all available Authors and their data.
  editorsJSON : JSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON : JSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON : JSON; // JSON that contains all available Bibliography data given a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments : JSON;
  F_Commentary : JSON;
  F_AppCrit : JSON;
  F_Translation : JSON;
  F_Context : JSON;
  F_ContextField : String;
  F_Content : JSON;
  F_Differences : JSON;
  F_ReferencerID : JSON;
  F_Reconstruction : JSON;
  // This variable holds the link between the commentaries and the selected fragment
  ReferencerID : string = '0';
  // Variables with currentAuthor, Book and Editor. Placeholder data.
  currentAuthor : Number = 4;
  currentBook : string = '6';
  currentEditor : string = '1';
  currentFragment : Number;
  currentAuthorName : String = "Ennius";
  currentBookName : string = "Thyestes";
  // This array contains all the information from a specific book. Functions can use this data.
  FragmentsArray = [];
  selectedEditorArray = [];
  mainEditorArray = [];

  spinner: boolean = true; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.

  temp;
  temp2; 

  constructor(
    private api: ApiService,
    public dialog: MatDialog, 
    ) { }

  ngOnInit(): void {
    // this.api.GetReferencerID(134, 1, 6).subscribe(data => console.log(data));
    // this.api.GetFragments(6).subscribe(data => console.log(data));
    // this.api.GetAuthors().subscribe(data => console.log(data));
    // this.api.GetEditors(6).subscribe(data => console.log(data));
    // this.api.GetBibliography('The Sublime in Antiquity').subscribe(data => console.log(data));
    // this.api.GetCommentary(3).subscribe(data => console.log(data));
    // this.api.GetDifferences(7).subscribe(data => console.log(data));
    // this.api.GetContext(49).subscribe(data => console.log(data));
    // this.api.GetTranslation(9).subscribe(data => console.log(data));
    // this.api.GetAppCrit(8).subscribe(data => console.log(data));
    // this.api.GetReconstruction(5).subscribe(data => console.log(data));
    // this.api.GetBooks(7).subscribe(data => console.log(data));

    // POST/DELETE/EDIT METHODS
    // this.api.CreateAuthor(new Author(55, 'Job Zwaag')).subscribe();
    // this.api.DeleteAuthor('Job Zwaag').subscribe();
    // this.api.CreateBook(new Book(77, 69, 'Zwarte piet is racistisch')).subscribe();
    // this.api.DeleteBook('Zwarte piet is racistisch').subscribe();
    // this.api.CreateEditor(new Editor(8, 6, 'The best editor', 1)).subscribe();
    // this.api.DeleteEditor('The best editor').subscribe();
    // this.api.SetMainEditorFlag(7, false).subscribe();
    // this.api.CreateFragment(new Fragment(222, 200, 'Best frag', '400-401', 81, 'Classical nonsense', 1, 'ok')).subscribe();
    // this.api.DeleteFragment('8', 6, 5).subscribe();
    // this.api.CreateContext(new Context(88, 3, 'Ugh', 'Some content')).subscribe();
    // this.api.SetPublishFlag(1, 6, 134, false).subscribe();    
    
    // this.api.GetAuthors().subscribe(res => this.temp = res);

    // res => dataSource = res
    // Request a list of authors to select a different text
    // this.api.GetAuthors().subscribe(this.authorsJSON => console.log(this.authorsJSON));
    
    // let temp;
    // this.api.GetAuthors().subscribe(data => this.authorsJSON);
    // console.log('temp', this.authorsJSON)

    // console.log('1',this.temp[0]);
    // console.log('2',temp[0]);
    
    // this.authorsJSON = await this.server.requestAuthors(this.currentBook);
    // // Retrieves everything surrounding the text. TODO. Needs fixing
    // this.requestSelectedText(['6','Thyestes']);
    
    this.api.GetAuthors().subscribe(data => this.temp2 = data);
    // res => dataSource = res
    // this.api.GetAuthors().subscribe(data => this.saveData(data));
    // When init is done, turn off the loading bar (spinner)
    this.spinner = false;    
  }

  public saveData(data){
    console.log('saveData', data)
    this.authorsJSON = data;
  }

  public test(){
    // console.log(this.authorsJSON)
    console.log('temp', this.temp2.data)
  }

     ////////////////////////////
    // HTML RELATED FUNCTIONS //
   ////////////////////////////
  // Allows a fragment to be moved and dropped to create a custom ordering
  // moveAndDrop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.main.selectedEditorArray, event.previousIndex, event.currentIndex);
  // }
  // Opens dialog for the bibliography
  public openBibliography() {
    let dialogRef = this.dialog.open(this.callBibliography); 
  }
  // Opens dialog to select a new book
  public openBookSelect() {
    let dialogRef = this.dialog.open(this.callBookSelect); 
  }
  // Opens dialog for the about information
  public openAbout() {
    const dialogRef = this.dialog.open(ShowAboutDialog);
  }
  // Opens dialog for the dashboard
  // public openDashboard() {
  //   const dialogRef = this.dialog.open(DashboardComponent);
  // }

}

// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: './dialogs/about-dialog.html',
})
export class ShowAboutDialog {}