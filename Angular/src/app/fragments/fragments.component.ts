import { Component, OnInit } from '@angular/core';

import {LoginComponent} from '../login/login.component'
import {TextComponent} from '../text/text.component'

import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
// Allows for drag and drop items in HTML
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnd} from '@angular/cdk/drag-drop';
// Library used for interacting with the page
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {Inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

// To allow dialog windows within the current window
import { TemplateRef, ViewChild } from '@angular/core';
// Imports of different components to be shown within a dialog within the page

// For Firebase communication
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-fragments',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.scss']
})
export class FragmentsComponent implements OnInit {

  @ViewChild('CallBibliography') CallBibliography: TemplateRef<any>;
  @ViewChild('CallBookSelect') CallBookSelect: TemplateRef<any>;
  @ViewChild('CallAbout') CallAbout: TemplateRef<any>;

  // Variables to split the bibliography in different sections.
  bibBooks : JSON;
  bibArticles: JSON;
  bibWebsites: JSON;
  bibInCollection : JSON; //TODO: this one should be added.
  // Toggle switches
  columnOneToggle: boolean = false;
  columnTwoToggle: boolean = false; // Boolean to toggle between 2 and 3 column mode.
  columnThreeToggle: boolean = false;
  Playground: boolean = false;
  Multiplayer: boolean = true;
  
  spinner: boolean = true; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.
  // FIXME: proper data types
  authorsJSON; // JSON that contains all available Authors and their data.
  editorsJSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON; // JSON that contains all available Bibliography data given a specific book.
  T_Text;
  T_TextCommentary
  
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments;
  F_Commentary;
  F_Apparatus;
  F_Translation;
  F_Context;
  F_Differences;
  F_ReferencerID;
  F_Reconstruction;
  // Variables with currentAuthor, Book and Editor. Mostly placeholder data.
  currentAuthor : number = 4;
  currentBook : number = 6;
  currentEditor : number = 1;
  currentFragment : string = '';
  currentAuthorName : string = "Ennius";
  currentBookName : string = "Thyestes";
  currentEditorName : string = "TRF";
  // This array contains all the information from a specific book. Functions can use this data.
  selectedEditorArray = [];
  mainEditorArray = [];
  // Work in progress
  playgroundArray = [];
  playgroundArray2 = [];
  fragmentNumberList2;

  referencer : number = 0;
  note;
  noteArray = [];
  addedArray = []; // just trying something
  selectedEditor;
  selectedFragment;
  selectedLine : number;
  fragmentNumberList;
  
  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    private firestore: AngularFirestore,
    private dialog: MatDialog, 
    private _snackBar: MatSnackBar,
    ) { }

  ngOnInit(): void {
    // Request a list of authors to select a different text    
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
    // Retrieves everything surrounding the text. TODO. Needs fixing
    this.RequestEditors(this.currentBook);
    this.RequestFragments(this.currentBook);
    // When init is done, turn off the loading bar (spinner)
    this.spinner = false;  
    // Firestore implementation
    this.InitiateFirestore(this.sessionCode, this.tableName);   
  }

  // Opens dialog for the dashboard
  public OpenText() {
    const dialogRef = this.dialog.open(TextComponent);
  }

  public Login() {
    const dialogRef = this.dialog.open(LoginComponent);
  }

  public RequestEditors(book: number){
    this.api.GetEditors(book).subscribe(
      data => {
        // Set the editorsJSON to contain the retrieved data.
        this.editorsJSON = data;
        console.log('json', this.editorsJSON)
        // Select the fragments from the editor you want in the left column.
        this.mainEditorsJSON = this.utility.FilterArrayOnKey(data, 'mainEditor', 1);
        try {
          this.currentEditor = this.mainEditorsJSON[0].id //FIXME:
        }
        catch(e) {
          console.log(e);
        }
      }
    );
  }
 
  public RequestFragments(book: number){
    this.api.GetFragments(book).subscribe(
      data => {
        this.F_Fragments = data;
        this.mainEditorArray = this.CreateEditorArray({id:1}, this.F_Fragments);
        this.selectedEditorArray = this.CreateEditorArray({id:2}, this.F_Fragments); //FIXME: just a quick hack

      }
    );  
  }

  public RequestBooks(author: number){
    this.api.GetBooks(author).subscribe(
      data => {
        this.booksJSON = data;
        console.log(data);
      }
    );      
  }

  // Request Newly Selected Text, called on Init and after selecting new text.
  public RequestBibliography(book: number){  
    // Retrieve the bibliography corresponding to the text. FIXME: I need the entire bib for a book here, not just an entry
    // this.main.bibJSON = await this.server.requestBibliography(this.main.currentBook);
    // Process the retrieved bibliography to appear formatted in the dialog.
    // this.processBib(this.main.bibJSON);
  }

  public Test(thing){
    // console.log(this.authorsJSON)
    console.log('test', thing)
  }

  public PushToArray(note, array){
    array.push(note);
    // console.log(this.tempArray)
    // console.log('noteArray',this.noteArray);
    return array;
  }

  public PopArray(array){
    console.log('ar', array)
    array.pop();
    return array;
  }

  // Function used to set the current Author data given the selected Author array
  public SetCurrentAuthorData(data){
    this.currentAuthor = data.id
    this.currentAuthorName = data.name;
  }

  // Function used to set the current Book data given the selected Book array
  public SetCurrentBookData(data){
    this.currentBook = data.id;
    this.currentBookName = data.title;
  }

  // Function used to set the current Book data given the selected Book array
  public SetCurrentEditorData(data){
    this.currentEditor = data.id;
    this.currentEditorName = data.name;
  }

  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  private CreateEditorArray(editor, array){ 
    console.log('editor', this.currentEditorName)
    // console.log('CreateEditorArray', editor)
    // Filter the given array on the given editor.
    let tempArray = array.filter(x => x.editor == editor.id);
    // Sort the lines numerically.
    tempArray.sort(this.utility.SortArrayNumerically);
    // Merge the different lines into their corresponding fragments
    tempArray = this.utility.MergeLinesIntoFragment(tempArray);
    // Add extra information to every fragment
    for(let i in tempArray){
      tempArray[i].author = this.currentAuthorName;
      tempArray[i].editor = editor.name;
      tempArray[i].text = this.currentBookName;
    }
    console.log('Output', tempArray)
    // Return the fragment with all its fields
    return tempArray;
  }

  /**
  * Retrieves commentaries when a fragment is clicked.
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
 public RequestReferencerID(fragmentName: string, editor: number, book: number){
  console.log('You called! fragment, editor, book: ', fragmentName, editor, book)
  this.currentFragment = fragmentName;
  // Turn on the spinner.
  this.spinner = true;
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  this.api.GetReferencerID(fragmentName, editor, book).subscribe(
    data => {
      data.sort(this.utility.SortNumeric); //FIXME: this must support naming schemes like Warmington.
      let referencer = Math.min.apply(Math, data)
      this.RequestCommentaries(referencer); // The lowest ID is used as a referencer
      return referencer;
    });
 }

public RequestCommentaries(referencer: number){
  // Set commentary available
  this.noCommentary = false;
  // Retrieves Fragment Commentary    
  this.api.GetCommentary(referencer).subscribe(data => this.F_Commentary = data);
  // Retrieves Fragment Differences
  this.api.GetDifferences(referencer).subscribe(data => this.F_Differences = data);
  // Retrieves Fragment Context
  this.api.GetContext(referencer).subscribe(data => this.F_Context = data);
  // Retrieves Fragment Translation
  this.api.GetTranslation(referencer).subscribe(data => this.F_Translation = data);
  // Retrieves Fragment App. Crit.
  this.api.GetApparatus(referencer).subscribe(data => this.F_Apparatus = data);
  // Retrieves Fragment Reconstruction
  this.api.GetReconstruction(referencer).subscribe(data => this.F_Reconstruction = data);
  
  // TODO: check if F_Commentary is empty. If so, set the noCommentary flag to true.
  
  // Turn off spinner at the end
  this.spinner = false;
}

// Quickly stolen from Dashboard. Utility maybe?
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

//FIXME: this is horrible
public AddFragmentToArray(toAdd, array, fragment){
  console.log(array)
  let tempArray = array.filter(x => x.fragmentName == fragment);
  // console.log('fil', tempArray)
  toAdd = toAdd.concat(tempArray)
  // console.log('added',this.addedArray, this.selectedEditorArray)

  // console.log('add', toAdd)
  // console.log('ply', this.playgroundArray)

  return toAdd;
}



// _______        _   
// |__   __|      | |  
//    | | _____  _| |_ 
//    | |/ _ \ \/ / __|
//    | |  __/>  <| |_ 
//    |_|\___/_/\_\\__|
             
  public RequestText(book: number){
    this.api.GetText(book).subscribe(
      data => {
        this.T_Text = data;
      }
    );  
  }

  public RequestCommentary(lineNumber: number){
    this.selectedLine = lineNumber;
    
    this.api.GetTextCommentary(this.currentBook, lineNumber).subscribe(
      data => {
        this.F_Commentary = data;
      }
    );  
  }

  public IsWithinScope(commentaarScope : number){
    if (commentaarScope + 6 > this.selectedLine){
      return true;
    } else {
      return false;
    }
  }

  public CheckEmptyBlock(block : JSON){
    if(this.utility.IsEmpty(block)) {
      return true;
    } else {
      return false;
    }
  }

     ////////////////////////////
    // HTML RELATED FUNCTIONS //
   ////////////////////////////
  // Allows a fragment to be moved and dropped to create a custom ordering
  moveAndDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedEditorArray, event.previousIndex, event.currentIndex);
    console.log(this.selectedEditorArray)
  }
  // Opens dialog for the bibliography
  public OpenBibliography() {
    // let dialogRef = this.dialog.open(this.CallBibliography); 
    let dialogRef = this.dialog.open(ShowBibliographyDialog); 

  }
  // Opens dialog to select a new book
  public OpenBookSelect() {
    let dialogRef = this.dialog.open(this.CallBookSelect); 
  }
  // Opens dialog for the about information
  public OpenAbout() {
    const dialogRef = this.dialog.open(ShowAboutDialog);
  }
  // Opens dialog for the dashboard
  // public openDashboard() {
  //   const dialogRef = this.dialog.open(DashboardComponent);
  // }

//   __  __       _ _   _       _                       
//  |  \/  |     | | | (_)     | |                      
//  | \  / |_   _| | |_ _ _ __ | | __ _ _   _  ___ _ __ 
//  | |\/| | | | | | __| | '_ \| |/ _` | | | |/ _ \ '__|
//  | |  | | |_| | | |_| | |_) | | (_| | |_| |  __/ |   
//  |_|  |_|\__,_|_|\__|_| .__/|_|\__,_|\__, |\___|_|   
//                       | |             __/ |          
//                       |_|            |___/           
  // BUG REPORTS
  // When changing sessions, the old session lingers somewhere. Moving
  // fragments around will show the old session flashing in the synced column.

  // Array initialisations for the four used columns.
  list1Array = [];  // First Synced Column
  list2Array = [];  // Second Synced Column
  list3Array = [];  // Standard Edition Column
  list4Array = [];  // My Additions Column
  list5Array = [];  // Recycle Bin Column
  list6Array = [];
  // Table name in firestore
  tableName : string = 'fragments';
  // Variable that watches for change in the database. Can be subscribed to
  // and returns data in the 'data' field.
  multiplayer;
  // Session code. Will be changed when restoring or creating a session.
  // Is simply a document in the OSCC Firebase database. Also shown in HTML.
  sessionCode : string = 'uOm36WurKEgypunFkvgW'; // Default document.
  // Boolean to allow showing of fragment data
  showFragmentname : boolean = true;
  showNotebook : boolean = true;
  showRecycleBin : boolean = true;
  showSuggestions : boolean = true;

  suggestionSpinner : boolean = false;
  /**
   * Little test function to allow printing or doing things with buttons
   * @param thing template variable, could be used for anything.
   */
  public FirebaseTest(thing){
    console.log(thing)
  }
  /**
   * This function is called onInit and creates a watcher called Multiplayer. It
   * keeps watching for change in the database and on change, rebuilds the list arrays.
   * TODO: Create a more elegant solution
   * @param session stores the session key. Used to retrieve the correct document.
   * @output refreshes the two synced lists. 
   */
  public InitiateFirestore(session, table){   
    // Create watcher
    this.multiplayer = this.firestore.collection(table).valueChanges()
    .subscribe(data => {
      let tempArray = []; // Create temporary array filled with all data
      // Create link to firestore to retrieve data
      this.firestore
      .collection(table) 
      .get()
      .subscribe((ss) => { // Subscribe to all documents     
        ss.docs.forEach((doc) => {
          if(doc.id == session){ // Only select our session document
            tempArray.push(doc.data()); // Push that document into our array
            //FIXME: This function needs to be much simpler.
            this.list1Array = tempArray[0].fragments; // The first entry is the first column
            this.list2Array = tempArray[0].fragments2; // Second entry second column
          }
        });
      });
    });
  }
  /**
   * Creates a firebase session. In other words, creates a document in the
   * OSCC Firebase. Using the table parameter, it writes two arrays to the
   * document: one always empty, the other one not empty if a base edition is
   * selected. Checks if everything went okay. Returns error if not. If succes,
   * sets the current session code to the newly created session.
   * @param table name of the Firebase table used.
   */
  public CreateFirebaseSession(table){
    // Unsubscribe from the previous watcher. InitiateFirestore creates a new watcher.
    this.multiplayer.unsubscribe();
    // Empty synced lists
    this.list1Array = [];
    this.list2Array = [];    
    // Create a new document in the given table.
    this.firestore.collection(table).add({
      fragments: this.list3Array, // Either empty or filled with standard edition
      fragments2: [], // Always empty
    })
    .then(res => {
        // Set Session code to the newly created document
        this.sessionCode = res.id
        // Retrieve Data and put it in the column
        this.InitiateFirestore(this.sessionCode, this.tableName)
    })
    .catch(e => {
        console.log(e); //TODO: should be done using the snackbar
    })
  }
  /**
   * Simple function to restore a previously created session. It simply takes
   * a session code, sets the class session code and runs the InitiateFirestore
   * function again with this new session code.
   * @param session session code to be retrieved
   */
  public RestoreFirebaseSession(session){
    // Empty synced lists
    this.list1Array = [];
    this.list2Array = [];
    // Set the new session code
    this.sessionCode = session
    // Unsubscribe from the previous watcher. InitiateFirestore creates a new watcher.
    this.multiplayer.unsubscribe();    
    // Retrieve Data and put it in the column
    this.InitiateFirestore(session, this.tableName)
  }
  /**
   * Simple function to delete the given session. Takes a session code and
   * deletes the corresponding document on disk. On delete, all lists are emptied.
   * @param session session to be deleted
   */
  public DeleteFirebaseSession(session, table){
    // Empty synced lists
    this.list1Array = [];
    this.list2Array = [];
    // Delete the given entry
    this.firestore
    .collection(table)
    .doc(session)
    .delete();
    // Unsubscribe from the previous watcher.
    this.multiplayer.unsubscribe();      
    // Show Snackbar with information. FIXME: it is underneath the keyboard xD
    this.OpenSnackbar('Please create a new session before doing anything.')
  }
  /**
   * Function to create a custom fragment. Can also be used to create
   * little headers by leaving body or header empty.
   * @param body 
   * @param header 
   * @param array 
   * @return array in the correct format to be processed
   */
  public CreateOwnFragment(body, header, array, noteStatus){
    // Set a value if a field has been left empty. Otherwise Firebase will be mad.
    if (body == null){
      body = ' '
    }
    if (header == null){
      header == ' '
    }
    // Create a array for each content line. Here it only allows one.
    let contentArray = []
    // Push the array with one entry to a content array. This is only done like
    // this to allow easy processing with the CreateFragments function in Utilities.
    contentArray.push({
      lineName: header,
      lineContent: body,
      lineComplete: body, // This should have html formatting.
    })
    // Push the created data to the array and empty the used arrays.
    array.push({ fragmentName: header, content: contentArray, note: noteStatus})
    // Return this new array.
    return array
  }
  /**
   * Simple function to empty the recycle bin.
   */
  public EmptyRecylceBin(){
    // Empty the Recyle Bin List
    this.list5Array = [];
  }
  /**
   * This function is called whenever movement is detected in the synced
   * columns. This means the fragments are changed and have to be updated in
   * Firebase. It works by simply reuploading the two arrays to firebase.
   * A bit dirty, but it works well.
   */
  public SyncWithFirebase(session, table){
    // Push the data to the correct document
    this.firestore
      .collection(table)
      .doc('/' + session) // Pick the correct document to update
      // Upload the two arrays to their corresponding locations.
      .update({fragments: this.list1Array, fragments2: this.list2Array})
      // On succes, log. TODO: we could just leave this out.
      .then(() => {
        console.log('Sync complete');
      }) // On error, log error. TODO: this should be in a snackbar
      .catch(function(error) {
        // console.error('Error writing document: ', error);
        this.HandleErrorMessage(error)
      });   
  }

  public async CreateSuggestionsMovedFragment(fragment){
    this.spinner = true;

    console.log('communicating with server')
    let words = '';
    let result = [];
    let content = [];
    console.log(fragment);
    
    // Retrieve all the words in a fragment and put them into one single string
    for(const line in fragment.content){
      console.log('line', fragment.content[line].lineContent)
      words += fragment.content[line].lineContent + ' '
    } 

    console.log(words)
    // Send the words to the server for analysis. It will return the stemms of
    // the nouns and verbs in the sent string.
    let temp = await this.api.GetInterestingWords(words);
    // For every returned stem, check if it occurs in the fragments list which is
    // currently loaded in memory. If it occurs, create a new fragment and put the
    // subsequent fragment array in list6Array, which will occur in the suggestions list.
    for(const item in temp){
      // Check the fragment list
      for(const object in this.F_Fragments){
        // If a match is found, create a fragment
        if(this.F_Fragments[object].lineContent.indexOf(temp[item]) != -1){
          // Retrieve the editor name using its key.
          let editorName = this.utility.FilterObjOnKey(this.editorsJSON, 'id', this.F_Fragments[object].editor)

          console.log(this.F_Fragments[object].fragmentName, this.F_Fragments[object].editor, this.F_Fragments[object].book)
          // Push the content to the content array
          content.push({lineComplete: this.F_Fragments[object].lineContent})
          // Push the rest of the necessary data to the array
          result.push({fragmentName: this.F_Fragments[object].fragmentName, content: content,
            author: this.currentAuthorName, text: this.currentBookName, editor: editorName[0].name, note: false, reason: temp[item]})
          content = [];
        }
      }
    }
    // This should be done using a return, but as the function is async, it is solved temporary like this.
    this.list6Array = result;

    this.spinner = false;

    console.log(result)

  }

  /**
   * Function to allow dragging elements between multiple containers. Code is
   * from Angular Material, CdkDrag.
   * @param event the movement on HTML. Contains all data necessary for moving.
   */
  MultipleColumnsDrag(event: CdkDragDrop<string[]>) {   
    console.log(event.previousContainer.id)
    // Retrieve Suggestions for the fragment that was just moved inside the suggestion box
    if(event.container.id == "cdk-drop-list-2"){
      this.CreateSuggestionsMovedFragment(event.previousContainer.data[event.previousIndex])   
    } 
    // This part handles movement in the same containter
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // If something happens with the sync columns, update the firebase
      if(event.container.id == "cdk-drop-list-0" || event.container.id == "cdk-drop-list-1"){        // No parameters: just sync the two first columns.
        this.SyncWithFirebase(this.sessionCode, this.tableName);
      }
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      console.log('from', event.previousContainer.id)  
      console.log('to', event.container.id)  
      // If something is moved to the Recycle Bin, delete everything in it.
      if(event.container.id == "cdk-drop-list-3"){
        this.EmptyRecylceBin();
      }
      
      // If something happens with the sync columns, update the firebase. This is either
      // column 1 being to or from, or column 0 being to or from. Therefore 4 comparisons.
      if(event.container.id == "cdk-drop-list-0" || event.container.id == "cdk-drop-list-1"
          || event.previousContainer.id == "cdk-drop-list-0" || event.previousContainer.id == "cdk-drop-list-1"){
        // Sync the two first columns.
        this.SyncWithFirebase(this.sessionCode, this.tableName);
      }
    }
  }
  
  // PLAYGROUND IMPLEMENTATION. For now not used.
  // public OnDragEnded(event: CdkDragEnd): void {
  //   console.log(event.source.getFreeDragPosition()); // returns { x: 0, y: 0 }
  //   console.log(event.source.getRootElement());
  // }

  // public OnDragEnded(event) {
  //   console.log('Moved in pixels', event.source.getFreeDragPosition()); // returns { x: 0, y: 0 }
  //   let element = event.source.getRootElement();
  //   let boundingClientRect = element.getBoundingClientRect();
  //   let parentPosition = this.GetPosition(element);
  //   console.log('Absolute Position', 'x: ' + (boundingClientRect.x - parentPosition.left), 'y: ' + (boundingClientRect.y - parentPosition.top));        
  //   console.log(event.distance)

  //   console.log(event)
  // }
  
  // public GetPosition(el) {
  //   let x = 0;
  //   let y = 0;
  //   while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
  //     x += el.offsetLeft - el.scrollLeft;
  //     y += el.offsetTop - el.scrollTop;
  //     el = el.offsetParent;
  //   }
  //   return { top: y, left: x };
  // }

  /**
   * Opens Material popup window with the given message
   * FIXME: Should be in Utilities or something, as duplicate in Dashboard.
   * @param message information that is showed in the popup
   */
  public OpenSnackbar(message){
    this._snackBar.open(message, 'Close', {
      // duration: 5000,
    });
  }
  /**
   * Function to handle the error err. Calls Snackbar to show it on screen
   * @param err the generated error
   */
  HandleErrorMessage(err) {
    console.log(err)
    let output = ''
    //TODO: needs to be more sophisticated
    if(err.statusText == 'OK'){
      output = 'Operation succesful.' 
    }
    else{
      output = 'Something went wrong.'
    }
    output = String(err.status) + ': ' + output + ' ' + err.statusText;
    this.OpenSnackbar(output); //FIXME: Spaghetti.
  } 
  /**
   * Opens a confirmation dialog with the provided message
   * @param message shows text about what is happening
   * @param item the item that is about to change
   */
  public OpenConfirmationDialog(message, item): Observable<boolean>{
    const dialogRef = this.dialog.open(ConfirmationDialog2, {
      width: 'auto',
      data: {
        message: message,
        item: item,
      }
    });  
    return dialogRef.afterClosed(); // Returns observable.
  }

  public RequestDeleteSession(session: string){
    this.OpenConfirmationDialog('Are you sure you want to DELETE this session?', session).subscribe(result => {
      if(result){
        this.DeleteFirebaseSession(session, this.tableName);
      }
    });
  }

}



// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: './dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

@Component({
  selector: 'bibliography-dialog',
  templateUrl: './dialogs/bibliography-dialog.html',
})
export class ShowBibliographyDialog {}

/**
 * Class to show a confirmation dialog when needed. 
 * Shows whatever data is given
 */
@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.html',
})
export class ConfirmationDialog2 {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog2>,
    @Inject(MAT_DIALOG_DATA) public data) { }
  onNoClick(): void {
    this.dialogRef.close();
  }
}