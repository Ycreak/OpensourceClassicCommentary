import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

//   __  __       _ _   _       _                       
//  |  \/  |     | | | (_)     | |                      
//  | \  / |_   _| | |_ _ _ __ | | __ _ _   _  ___ _ __ 
//  | |\/| | | | | | __| | '_ \| |/ _` | | | |/ _ \ '__|
//  | |  | | |_| | | |_| | |_) | | (_| | |_| |  __/ |   
//  |_|  |_|\__,_|_|\__|_| .__/|_|\__,_|\__, |\___|_|   
//                       | |             __/ |          
//                       |_|            |___/           
@Injectable({
    providedIn: 'root'
  })
  // @Component({
  //   template: ''
  // })
  export class Multiplayer{
    constructor(
        private firestore: AngularFirestore,
      ){
        console.log("Constructor called"); //FIXME: why is this not called upon class creation?
      }
  
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
    firestore_session;
    // Session code. Will be changed when restoring or creating a session.
    // Is simply a document in the OSCC Firebase database. Also shown in HTML.
    sessionCode : string = 'uOm36WurKEgypunFkvgW'; // Default document.
    // Boolean to allow showing of fragment data
    showFragmentname : boolean = true;
    // showNotebook : boolean = true;
    // showRecycleBin : boolean = true;
    // showSuggestions : boolean = true;
  
    // suggestionSpinner : boolean = false;
   
    ngOnInit(): void { //FIXME: why is this not called upon class creation?
      // Firestore implementation
      this.InitiateFirestore(this.sessionCode, this.tableName);
      console.log('hello')
     
    }
   
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
      this.firestore_session = this.firestore.collection(table).valueChanges()
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
      this.firestore_session.unsubscribe();
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
      this.firestore_session.unsubscribe();    
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
      this.firestore_session.unsubscribe();      
      // Show Snackbar with information. FIXME: it is underneath the keyboard xD
      // this.OpenSnackbar('Please create a new session before doing anything.') TODO:
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
  
    // TODO: need to be able to call confirmation dialogs from anywhere
    // public RequestDeleteSession(session: string){
    //   this.OpenConfirmationDialog('Are you sure you want to DELETE this session?', session).subscribe(result => {
    //     if(result){
    //       this.DeleteFirebaseSession(session, this.tableName);
    //     }
    //   });
    // }
  
    // public async CreateSuggestionsMovedFragment(fragment){
    //   // this.spinner = true; TODO:
  
    //   console.log('communicating with server')
    //   let words = '';
    //   let result = [];
    //   let content = [];
    //   console.log(fragment);
      
    //   // Retrieve all the words in a fragment and put them into one single string
    //   for(const line in fragment.content){
    //     console.log('line', fragment.content[line].lineContent)
    //     words += fragment.content[line].lineContent + ' '
    //   } 
  
    //   console.log(words)
    //   // Send the words to the server for analysis. It will return the stemms of
    //   // the nouns and verbs in the sent string.
    //   let temp = await this.api.GetInterestingWords(words);
    //   // For every returned stem, check if it occurs in the fragments list which is
    //   // currently loaded in memory. If it occurs, create a new fragment and put the
    //   // subsequent fragment array in list6Array, which will occur in the suggestions list.
    //   for(const item in temp){
    //     // Check the fragment list
    //     for(const object in this.F_Fragments){
    //       // If a match is found, create a fragment
    //       if(this.F_Fragments[object].lineContent.indexOf(temp[item]) != -1){
    //         // Retrieve the editor name using its key.
    //         let editorName = this.utility.FilterObjOnKey(this.editorsJSON, 'id', this.F_Fragments[object].editor)
  
    //         console.log(this.F_Fragments[object].fragmentName, this.F_Fragments[object].editor, this.F_Fragments[object].book)
    //         // Push the content to the content array
    //         content.push({lineComplete: this.F_Fragments[object].lineContent})
    //         // Push the rest of the necessary data to the array
    //         result.push({fragmentName: this.F_Fragments[object].fragmentName, content: content,
    //           author: this.currentAuthorName, text: this.currentBookName, editor: editorName[0].name, note: false, reason: temp[item]})
    //         content = [];
    //       }
    //     }
    //   }
    //   // This should be done using a return, but as the function is async, it is solved temporary like this.
    //   this.list6Array = result;
  
    //   this.spinner = false;
  
    //   console.log(result)
  
    // }
  
    /**
     * Function to allow dragging elements between multiple containers. Code is
     * from Angular Material, CdkDrag.
     * @param event the movement on HTML. Contains all data necessary for moving.
     */
    MultipleColumnsDrag(event: CdkDragDrop<string[]>) {   
      console.log(event.previousContainer.id)
      // Retrieve Suggestions for the fragment that was just moved inside the suggestion box
      // if(event.container.id == "cdk-drop-list-2"){
      //   this.CreateSuggestionsMovedFragment(event.previousContainer.data[event.previousIndex])   
      // } 
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
  }