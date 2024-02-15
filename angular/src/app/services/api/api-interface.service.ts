/**
 * This service serves as an interface and abstraction for components when retrieving different document types.
 * The components can simply provide this interface with a document type and a filter and the interface will take
 * care of the data retrieval.
 * @author Ycreak
 */

import { Injectable } from '@angular/core';
import {ApiService} from '@oscc/api.service';
import { Observable } from 'rxjs';

// Service imports
import {FragmentsApiService} from './fragments.service';
import {TestimoniaApiService} from './testimonia.service';

import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiInterfaceService {

  constructor(
    private api: ApiService,
    private fragments_api: FragmentsApiService,
    private testimonia_api: TestimoniaApiService,
  ) { }

  /**
   * Retrieve documents from the server given the document type and filter
   * @param type (string)
   * @param filter (object) on which to filter documents
   * @return documents (document[])
   * @author Ycreak
   */
  public get_documents(document_type: string, filter: any): Observable<any> {
    console.log(document_type, filter)
    return new Observable((observer) => {
      switch(document_type) {
        //case environment.fragment:
          //break;
        case environment.testimonia:
          this.testimonia_api.request(filter).subscribe((testimonia: any) => {
            console.log(testimonia)
            observer.next(testimonia);
            observer.complete();
          })
          //break;
        default:
          console.error('Unknown document type')
      } 
    })
  }
}
