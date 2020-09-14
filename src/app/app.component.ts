import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { Author } from './models/Author';
import { Book } from './models/Book';
import { Editor } from './models/Editor';
import { Fragment } from './models/Fragment';
import { Context } from './models/Context';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'OpenSourceClassicCommentary';

  constructor(private api: ApiService) {

  }
  ngOnInit(): void {
    /*
      Here the basic usage of the api methods (the data logging is just for testing)
    */

    // GET METHODS
    // this.api.GetReferencerID(134, 1, 6).subscribe(data => console.log(data));
    // this.api.GetFragments(6).subscribe(data => console.log(data));
    // this.api.GetAuthors().subscribe(data => console.log(data));
    // this.api.GetEditors(6).subscribe(data => console.log(data));
    // this.api.GetBibliography('The Sublime in Antiquity').subscribe(data => console.log(data));
    // this.api.GetCommentary(3).subscribe(data => console.log(data));
    // this.api.GetDifferences(7).subscribe(data => console.log(data));
    // this.api.GetContext(49).subscribe(data => console.log(data));
    // this.api.GetTranslation(9).subscribe(data => console.log(data));
    // this.api.GetAppCrit(8).subscribe(data => console.log(data));
    // this.api.GetReconstruction(5).subscribe(data => console.log(data));
    // this.api.GetBooks(7).subscribe(data => console.log(data));

    // POST/DELETE/EDIT METHODS
    // this.api.CreateAuthor(new Author(55, 'Job Zwaag')).subscribe();
    // this.api.DeleteAuthor('Job Zwaag').subscribe();
    // this.api.CreateBook(new Book(77, 69, 'Zwarte piet is racistisch')).subscribe();
    // this.api.DeleteBook('Zwarte piet is racistisch').subscribe();
    // this.api.CreateEditor(new Editor(8, 6, 'The best editor', 1)).subscribe();
    // this.api.DeleteEditor('The best editor').subscribe();
    // this.api.SetMainEditorFlag(7, false).subscribe();
    // this.api.CreateFragment(new Fragment(222, 200, 'Best frag', '400-401', 81, 'Classical nonsense', 1, 'ok')).subscribe();
    // this.api.DeleteFragment('8', 6, 5).subscribe();
    // this.api.CreateContext(new Context(88, 3, 'Ugh', 'Some content')).subscribe();
    // this.api.SetPublishFlag(1, 6, 134, false).subscribe();
  }
}
