import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
//   @Component({
//     template: ''
//   })
  export class Playground {
    constructor(){}
  
    // Playground variables
    playgroundArray = [];
    playgroundArray2 = [];
    fragmentNumberList2 = [];
    fragmentNumberList = [];
    addedArray = []; // just trying something
  
    //FIXME: this is horrible
    public AddFragmentToArray(toAdd, array, fragment){
      console.log(array)
      let tempArray = array.filter(x => x.fragmentName == fragment);
      toAdd = toAdd.concat(tempArray)
  
      return toAdd;
    }
  
  }