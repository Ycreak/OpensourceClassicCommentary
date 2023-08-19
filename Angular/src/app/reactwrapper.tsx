import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
  } from "@angular/core";
  // import App from '@excalidraw/excalidraw/types/components/App';
  // import { MyReactComponent } from 'src/app/my-react-component/MyReactComponent';
    //   import * as React from "react";
    //   import * as ReactDOM from "react-dom";

  import React from 'react';
  import ReactDOM from 'react-dom';
  

  import App from "./ngexcalidraw";
    //import { Excalidraw } from "@excalidraw/excalidraw";
   //import { MyReactComponent } from './MyReactComponent';
  // import { App } from 'src/components';
  // import { excalidrawComp } from 'src/app/my-react-component/excalidrawComp';
  
  const containerElementName = "myReactComponentContainer";
  
  @Component({
    selector: "reactwrapper",
    template: `<span #${containerElementName}></span>`,
    encapsulation: ViewEncapsulation.None
  })
  export class MyComponentWrapperComponent
    implements OnChanges, OnDestroy, AfterViewInit {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;
  
    @Input() public counter = 10;
    @Output() public componentClick = new EventEmitter<void>();
  
    constructor() {
      this.handleDivClicked = this.handleDivClicked.bind(this);
    }
  
    public handleDivClicked() {
      if (this.componentClick) {
        this.componentClick.emit();
        this.render();
      }
    }
  
    ngOnChanges(changes: SimpleChanges): void {
      this.render();
    }
  
    ngAfterViewInit() {
      this.render();
    }
  
    ngOnDestroy() {
      ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
    }
  
    private render() {
      console.log(ReactDOM);
      ReactDOM.render(
        <div className={"i-am-classy"}>
            <App></App>
        </div>,
        this.containerRef.nativeElement
      );
    }
  }
//   <App></App>
