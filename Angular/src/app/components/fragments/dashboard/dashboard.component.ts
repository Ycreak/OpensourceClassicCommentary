import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {MatDialog} from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

import { MainComponent } from '../fragments.component';
import { ServerCommunicator } from '../fragments.component';

@Component({
  selector: 'app-interface',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  main = new MainComponent(this.httpClient);
  server = new ServerCommunicator(this.httpClient);

  // List with all the fragments numbers. Used to select a specific fragment for a specific editor.
  fragmentNumberList : Array<Number>;
  lineNumberList : Array<Number>;
  // Array with the fragments of the mainEditor (left column) and of the secondary editor (right column)
  selectedEditorArray = []; // This one is different from the fragments.ts one!
  // Items for the forms.
  items;
  contentForm;
  bibForm;
  // Values that are inputted by the user. Should be sanitized.
  inputAuthor: String = '';
  inputBook: String = '';
  inputEditor: String = '';

  inputFragNum: String = ''; 
  inputLineNum: String = '';
  inputFragContent: String = '';
  inputFragStatus: String = '';

  inputAppCrit: String = '';
  inputDifferences: String = '';
  inputCommentary: String = '';
  inputTranslation: String = '';
  inputReconstruction: String = '';

  inputContextAuthor: String = ''; 
  inputContext: String = '';

  // FORM FIELD DATA, VERY IMPORTANT
  selectedAuthorData: Array<String> = [''];
  selectedBookData: Array<String> = [''];
  selectedEditorData: Array<String> = [''];
  selectedFragmentData: Array<String> = [''];
  selectedLineData: Array<String> = [''];

  constructor(
    private httpClient: HttpClient, 
    public dialog: MatDialog, 
    private formBuilder: FormBuilder,
    ) { 
      // Form to revise the commentary of a fragment.
      this.contentForm = this.formBuilder.group({
        iF_Commentary: '', // Horrible naming, should be rethought.
        iF_Differences: '',
        iF_Context: '',
        iF_Translation: '',
        iF_AppCrit: '',
        iF_Reconstruction: '',
        iF_Content: '',
      });
      this.bibForm = this.formBuilder.group({
        bAuthor: '',
        bBook: '',
        bPlace: '',
        bYear: '',
        bArticle: '',
        bJournal: '',
        bVolume: '',
        bPages: '',
        bWebsite: '',
        bURL: '',
        bConsultDate: '',
      })
    }

  /* @function:     Loads initial interface: bibliography, editors and the fragments.
   * @author:       Bors & Ycreak
   */
  async ngOnInit() {   
    // Request a list of authors to select a different text
    this.main.authorsJSON = await this.server.fetchData(this.main.currentBook, 'getAuthors') as JSON;
    // When init is done, turn off the loading bar (spinner)
    this.main.spinner = false;
  }

  private async requestEditors(book: string){
    this.main.editorsJSON = await this.server.fetchData(book, 'getEditors') as JSON;
  }

  // Request Books by given Author (in the modal)
  private async requestBooks(selectedAuthor: string){
    this.main.booksJSON = await this.server.fetchData(selectedAuthor, 'getBooks') as JSON;
  }

  // Request Newly Selected Text
  private async requestSelectedText(book: string){
    // Get new fragments from the selected text.
    this.main.F_Fragments = await this.server.fetchData(book, 'getFragments') as JSON;
    this.main.bibJSON = await this.server.fetchData(this.main.currentBook, 'getBibliography') as JSON;
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    this.main.FragmentsArray = this.main.tagFragments(this.main.F_Fragments);
  }

  private retrieveFragmentData(fragment : Number){
    // This should be a check whether the current editor is also a main editor
    // If the current editor has no commentary, we should not retrieve it.
    console.log('selectedFragment', fragment)
    this.main.retrieveCommentaries(fragment)
  }

  // Retrieves the content of a fragment using the provided lineNumber of the current editor
  // Puts this value in F_Content
  private getFragmentLine(lineNum: Number){
    // Get the current editor and the selected fragment number
    let editor = this.selectedEditorData[0]
    let fragNum = this.selectedFragmentData
    // Create the corresponding selectedEditorArray
    let selectedEditorArray = this.opbouwenFragmentenEditor(editor, this.main.FragmentsArray);
    // Filter on the given fragment number and the given lineNumber
    selectedEditorArray = selectedEditorArray.filter(x => x.fragNumber === fragNum);
    selectedEditorArray = selectedEditorArray.filter(x => x.lineNumber === lineNum);
    // Return the found content to be shown on screen
    this.main.F_Content = selectedEditorArray[0].lineContent
  }

  // Returns a list of uniq numbers. Used for fragmentnumber lists.
  private uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
  }

  // Retrieves fragment numbers of a editor. Used for selecting a fragment.
  // Function needs rewriting. 
  private getFragNumbersSelectedEditor(editor: string){
    // Retrieve current editor
    this.main.currentEditor = editor;
    // Create the corresponding selectedEditorArray
    let selectedEditorArray = this.opbouwenFragmentenEditor(editor, this.main.FragmentsArray);
    // Initialise list
    this.fragmentNumberList = [];
    // Push all fragment numbers to a list
    for(let key in selectedEditorArray){      
      this.fragmentNumberList.push(selectedEditorArray[key].fragNumber);
    } 
    // Only take the unique values from this list
    this.fragmentNumberList = this.uniq(this.fragmentNumberList);
    // Sort list numerically
    this.fragmentNumberList.sort(this.main.sortArrayNumerically3);
  }

  // Retrieves fragment numbers of a editor. Function needs rewriting. 
  private getLineNumbersSelectedEditor(fragNum: String){
    let editor = this.selectedEditorData[0];
    let selectedEditorArray = this.opbouwenFragmentenEditor(editor, this.main.FragmentsArray);

    let array = selectedEditorArray.filter(x => x.fragNumber === fragNum);

    this.lineNumberList = [];
    for(let key in array){      
      this.lineNumberList.push(array[key].lineNumber);
    } 

    this.lineNumberList = this.uniq(this.lineNumberList);
    
    this.lineNumberList.sort(this.main.sortArrayNumerically3);
  }  

  private selectCorrespondingContext(author : Array<String>){
    console.log(author)
    this.main.F_ContextField = author[1];
    this.inputContextAuthor = author[0];
  }

  public async createAuthor(author : String){
    console.log(author);
    this.pushData('createAuthor') // TODO: Here needs a wait
    this.main.authorsJSON = await this.server.fetchData(this.main.currentBook, 'getAuthors') as JSON;
  }

  public async deleteAuthor(){
    console.log(this.selectedAuthorData[0]);
    this.pushData('deleteAuthor')
    this.main.authorsJSON = await this.server.fetchData(this.main.currentBook, 'getAuthors') as JSON;
  }

  public createBook(book : String){
    console.log(this.selectedAuthorData[0], book);
    this.pushData('createBook')
  }

  public deleteBook(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0]);
    this.pushData('deleteBook')
  }

  public createEditor(editor : String){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], editor);
    this.pushData('createEditor')
  }

  public deleteEditor(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0]);
    this.pushData('deleteEditor')
  }

  public setMainEditor(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0]);
    this.pushData('setMainEditor')
  }

  public deleteMainEditor(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0]);
    this.pushData('deleteMainEditor')
  }

  public createFragment(fragNum : String, lineNum : String, content : String, status: String){
    console.log(fragNum, lineNum, content, status);
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0]);
    this.pushData('createFragment')

  }
  
  public deleteFragment(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData);
    this.pushData('deleteFragment')
  }

  public uploadNewFragmentContent(input){    
    this.contentForm.reset();

    console.log('The entered data is as follows:', input);
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.inputContextAuthor);
    this.pushData('createFragCommentary')
  }

  public uploadRevisedFragmentContent(input){
    console.log('input', input.iF_AppCrit)

    this.inputAppCrit = input.iF_AppCrit;
    this.inputDifferences = input.iF_Differences;
    this.inputCommentary = input.iF_Commentary;
    this.inputTranslation = input.iF_Translation;
    this.inputReconstruction = input.iF_Reconstruction;

    this.pushData('reviseFragCommentary')

  }

  public uploadRevisedContext(input){
    this.inputContext = input.iF_Context;
    this.pushData('reviseFragContext')
  }

  public uploadRevisedFragment(input){
    this.inputFragContent = input.iF_Content;
    this.pushData('reviseFragContent')
  }

  public doBibForm(input){
    console.log('input', input)
  }

  // Function to add commentary to a fragment
  public async uploadCommentary(inputAppCrit: String, inputDifferences: String, inputCommentary: String, inputTranslation: String){
    console.log(inputAppCrit, inputDifferences, inputCommentary, inputTranslation)
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData[0]);
    this.pushData('createFragCommentary')  
  }

  public async uploadContext(inputContextAuthor: String, inputContext: String){
    console.log(inputContextAuthor, inputContext)
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData[0]);
    this.pushData('createContext')  

  }

  public publishFragment() {
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData[0]);
    this.pushData('publishFragment')
  }

  public unpublishFragment() {
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData[0]);
    this.pushData('unpublishFragment')
  }

  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  private opbouwenFragmentenEditor(selectedEditor: String, givenArray){
    // Filter the given array on the given editor.
    let array = givenArray.filter(x => x.editor == selectedEditor);
    array.sort(this.main.sortArrayNumerically3);

    return array;
  }

  public async test(){
    let temp = await this.checkPassword('luuk', 'nolden2');
    if(temp == '1'){
      console.log(temp, 'succesful!')
    }
    else{
      console.log(temp, 'nope!')
    }
  }

  public async checkPassword(username: string, password: string){
    const data = await this.httpClient.get(
      this.main.serverURL + 'testHash',{
        params: { // Why toString()? Url is already a string! :D
          username:     username.toString(), 
          password:     password.toString(), 
        }
      })
      .toPromise();
      return data;  
    }

//      /////////////////////////
//     // DATA TO SERVER PART //
//    /////////////////////////
  /**
  * Fetches data from the server. Returns this data in a JSON Array.
  * Also takes care of the referencer table (server side).
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
 public async pushData(command: String){
  const data = await this.httpClient.get(
    this.main.serverURL + 'process',{
      params: { // Why toString()? Url is already a string! :D
        selectedAuthor:     this.selectedAuthorData[0].toString(), 
        selectedBook:       this.selectedBookData[0].toString(), 
        selectedEditor:     this.selectedEditorData[0].toString(), 
        selectedFragment:   this.selectedFragmentData.toString(),
        selectedLine:       this.selectedLineData.toString(),
        inputAuthor:        this.inputAuthor.toString(),
        inputBook:          this.inputBook.toString(),
        inputEditor:        this.inputEditor.toString(),
      
        inputFragNum:       this.inputFragNum.toString(),
        inputLineNum:       this.inputLineNum.toString(),
        inputFragContent:   this.inputFragContent.toString(),
        inputFragStatus:    this.inputFragStatus.toString(),
        
        inputAppCrit:       this.inputAppCrit.toString(),
        inputDifferences:   this.inputDifferences.toString(),
        inputCommentary:    this.inputCommentary.toString(),
        inputTranslation:   this.inputTranslation.toString(),
        inputReconstruction: this.inputReconstruction.toString(),
        
        ReferencerID:       this.main.ReferencerID.toString(),
        inputContextAuthor: this.inputContextAuthor.toString(),
        inputContext :      this.inputContext.toString(),
      
        command:                command.toString(),
      }
    })
    .toPromise();
    return data;  
  }
}
