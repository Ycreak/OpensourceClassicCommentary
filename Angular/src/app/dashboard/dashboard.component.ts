import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';

// To allow the use of forms
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  authorsJSON; // JSON that contains all available Authors and their data.
  editorsJSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON; // JSON that contains all available Bibliography data given a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments;
  F_Commentary;
  F_AppCrit;
  F_Translation;
  F_Context;
  F_Differences;
  F_ReferencerID;
  F_Reconstruction;
  F_Content;
  F_FragmentLine;

  currentAuthor: number;
  currentBook: number;
  currentEditor: number;
  currentFragment: number;
  currentLine: number;

  selectedEditorArray = [];
  fragmentNumberList = [];
  lineNumberList = [];

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    ) { }

  ngOnInit(): void {
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
  }

  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  public CreateEditorArray(editor: number, array){
    // console.log('CreateEditorArray', editor)
    // Filter the given array on the given editor.
    let tempArray = array.filter(x => x.editor == editor);
    // Sort the lines numerically.
    tempArray.sort(this.utility.SortArrayNumerically);
    // Merge the different lines into their corresponding fragments
    return this.utility.MergeLinesIntoFragment(tempArray);
    // return tempArray;
  }

  public GetFragmentNumbers(editor: number, array){
    // Initialise list
    let list = [];
    // Push all fragment numbers to a list
    for(let key in array){      
      list.push(array[key].fragmentName);
    } 
    // Only take the unique values from this list
    list = this.utility.uniq(list);
    // Sort list numerically
    return list.sort(this.utility.SortNumeric);    
  }

  public GetLineNumbers(fragment: string, array){
    // Filter on fragment number
    array = array.filter(x => x.fragmentName === fragment);
    // Initialise list
    let list = [];
    // Push all fragment numbers to a list
    for(let key in array){      
      for(let line in array[key].content){
        list.push(array[key].content[line].lineName);
      }
    } 
    // Sort list numerically
    console.log('list', list);

    return list.sort(this.utility.SortNumeric);    
  }

  public GetFragmentLine(line: number, fragment: string, array){
    // Filter on the given fragment number and the given lineNumber
    array = array.filter(x => x.fragmentName === fragment);
    array = array[0].content // Only one entry can exist, so pick that one.
    array = array.filter(x => x.lineName === line);
    // Return the found content to be shown on screen
    return array[0].fragmentContent;
  }

  // REQUEST FUNCTIONS
  public RequestBooks(author: number){
    this.api.GetBooks(author).subscribe(
      data => {
        this.booksJSON = data;
        console.log(data);
      }
    );      
  }

  public RequestEditors(book: number){
    this.api.GetEditors(book).subscribe(
      data => {
        // Set the editorsJSON to contain the retrieved data.
        this.editorsJSON = data;
      }
    );
  }

  public RequestFragments(book: number){
    this.api.GetFragments(book).subscribe(
      data => {
        this.F_Fragments = data;
        // this.mainEditorArray = this.CreateEditorArray(1, this.F_Fragments);
      }
    );  
  }

}
