/**
 * This service serves as an interface and abstraction for components when retrieving different document types.
 * The components can simply provide this interface with a document type and a filter and the interface will take
 * care of the data retrieval.
 * @author Ycreak
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@src/environments/environment';

// Service imports
import { FragmentsApiService } from './fragments.service';
import { TestimoniaApiService } from './testimonia.service';

@Injectable({
  providedIn: 'root',
})
export class ApiInterfaceService {
  constructor(
    private fragments_api: FragmentsApiService,
    private testimonia_api: TestimoniaApiService
  ) {}

  /**
   * Retrieve documents from the server given the document type and filter
   * @param type (string)
   * @param filter (object) on which to filter documents
   * @return documents (document[])
   * @author Ycreak
   */
  public get_documents(document_type: string, filter: any): Observable<any> {
    return new Observable((observer) => {
      switch (document_type) {
        case environment.fragments:
          this.fragments_api.request_documents(filter).subscribe((fragments: any) => {
            observer.next(fragments);
            observer.complete();
          });
          break;
        case environment.testimonia:
          this.testimonia_api.request_documents(filter).subscribe((testimonia: any) => {
            observer.next(testimonia);
            observer.complete();
          });
          break;
        default:
          console.error('Unknown document type', document_type);
      }
    });
  }
}
