/**
 * This service allows the size of windows to be watched. This is used to scale 
 * the interface for mobile devices or smaller screens in general.
 */

import { Injectable } from '@angular/core';
import { Observable, Subscription, fromEvent } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WindowSizeWatcherService {

  // Watcher for window resizing. Used to scale for mobile devices
  observable$: Observable<Event>
  subscription$: Subscription
  // Variable to keep track of the window width, used to scale the site for small displays
  size: number;

  constructor() { 
    // Create an observable to check for the changing of window size
    this.observable$ = fromEvent(window, 'resize')
    this.subscription$ = this.observable$.subscribe( evt => {
      // Find the window size. If it is too small, we will abbreviate the title to save space on the navbar
      this.size = this.retrieve_viewport_size();    
    })
  }

  /**
   * Simple function that retrieves the viewport size
   * @returns viewport size as integer
   * @author Ycreak
   */
  private retrieve_viewport_size(): number {
    try {
      return window.innerWidth
    } catch (e) {
      return 1100 // default-ish size
    }
  }
}
