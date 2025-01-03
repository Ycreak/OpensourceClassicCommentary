import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Service imports
import { ApiService } from '@oscc/api.service';
import { BibliographyService } from '../bibliography.service';
import { UtilityService } from '@oscc/utility.service';
import { FabricService } from '@oscc/playground/services/fabric.service';
// Model imports
import { Playground_communicator } from '@oscc/models/api/Playground_communicator';

@Injectable({
  providedIn: 'root',
})
export class PlaygroundApiService extends ApiService {
  //public remove = 'fragment/delete';
  public endpoint_create = 'playground/create';
  public endpoint_revise = 'playground/update';
  public endpoint_retrieve = 'playground/get';
  //public index = 'fragment/get/index';

  constructor(fabric: FabricService, bib: BibliographyService, utility: UtilityService, http: HttpClient) {
    super(fabric, bib, utility, http);
  }

  /**
   * Creates the given playground on the server
   * @param playground (Playground)
   * @author Ycreak
   */
  public create(playground: Playground_communicator): Observable<any> {
    this.spinner_on();
    return new Observable((observer) => {
      this.post(this.FlaskURL, this.endpoint_create, playground, this.get_header).subscribe((data: any) => {
        this.spinner_off();
        observer.next(data);
        observer.complete();
      });
    });
  }

  /**
   * Retrieves playground from the given key
   * @param key (object)
   * @return playground (object)
   * @author Ycreak
   */
  public load(filter: object): Observable<any> {
    this.spinner_on();
    return new Observable((observer) => {
      this.post(this.FlaskURL, this.endpoint_retrieve, filter, this.get_header).subscribe((data: any) => {
        this.spinner_off();
        observer.next(data);
        observer.complete();
      });
    });
  }
  /**
   * Saves the given playground on the server
   * @param playground (json)
   * @author Ycreak
   */
  public save(playground: any): void {
    this.spinner_on();
    this.http
      .post<string[]>(this.FlaskURL + this.endpoint_revise, playground, {
        observe: 'response',
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (data) => {
          this.show_server_response(data);
          this.spinner_off();
        },
        error: (err) => this.show_server_response(err),
      });
  }

  /**
   * Deletes the given playground from the server
   * @param name (string)
   * @author Ycreak
   */
  public remove(playground: any): void {
    this.spinner_on();
    this.http
      .post<string[]>(this.FlaskURL + `playground/delete`, playground, {
        observe: 'response',
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (data) => {
          this.show_server_response(data);
          this.spinner_off();
        },
        error: (err) => this.show_server_response(err),
      });
  }
}
