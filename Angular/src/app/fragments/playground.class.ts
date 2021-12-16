import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
  export class Playground {
    constructor(){}
  
    // Playground variables
    playground_array = [];
    playgroundArray2 = [];
    fragmentNumberList2 = [];
    fragmentNumberList = [];
    addedArray = []; // just trying something
  
    noteArray = [];
    add_fragment_array = [];

    public add_fragment_to_array(array, fragment_name, fragments){

      for(let fragment in fragments){
        if(fragments[fragment].fragment_name == fragment_name){
          array.push(fragments[fragment])
        }
      }
      return array
    }
  }
