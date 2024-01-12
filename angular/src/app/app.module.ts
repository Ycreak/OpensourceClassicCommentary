//      ___           ___           ___           ___
//     /  /\         /  /\         /  /\         /  /\
//    /  /::\       /  /:/_       /  /:/        /  /:/
//   /  /:/\:\     /  /:/ /\     /  /:/        /  /:/
//  /  /:/  \:\   /  /:/ /::\   /  /:/  ___   /  /:/  ___
// /__/:/ \__\:\ /__/:/ /:/\:\ /__/:/  /  /\ /__/:/  /  /\
// \  \:\ /  /:/ \  \:\/:/~/:/ \  \:\ /  /:/ \  \:\ /  /:/
//  \  \:\  /:/   \  \::/ /:/   \  \:\  /:/   \  \:\  /:/
//   \  \:\/:/     \__\/ /:/     \  \:\/:/     \  \:\/:/
//    \  \::/        /__/:/       \  \::/       \  \::/
//     \__\/         \__\/         \__\/         \__\/
//  _   _       _     _
// | \ | | ___ | | __| | ___ _ __
// |  \| |/ _ \| |/ _` |/ _ \ '_ \
// | |\  | (_) | | (_| |  __/ | | |
// |_| \_|\___/|_|\__,_|\___|_| |_|
//
//  ____
// | __ )  ___  _ __ ___
// |  _ \ / _ \| '__/ __|
// | |_) | (_) | |  \__ \
// |____/ \___/|_|  |___/

// Library Imports
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxSimpleTextEditorModule } from 'ngx-simple-text-editor';
//import { environment } from '../environments/environment';

// Component Imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColumnsComponent } from './columns/columns.component';
import { ColumnComponent } from './columns/column/column.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { SafeHtmlPipe } from './pipes/safeHtml.pipe';

import { ConfirmationDialogComponent } from './services/dialog.service';
import { WYSIWYGDialogComponent } from './services/dialog.service';
import { SettingsDialogComponent } from './services/dialog.service';
import { BibliographyComponent } from './dashboard/bibliography/bibliography.component';
import { CustomDialogComponent } from './services/dialog.service';
import { ColumnBibliographyComponent } from './services/dialog.service';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './api.service';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
// Allows copying to clipboard
import { ClipboardModule } from '@angular/cdk/clipboard';
import { QuillModule } from 'ngx-quill';

// Websockets
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

// Allows communication with firebase
import { ScansionComponent } from './scansion/scansion.component';
import { PlaygroundComponent } from './playground/playground.component';
import { CommentaryComponent } from './commentary/commentary.component';
import { OverviewComponent } from './overview/overview.component';
import { IntroductionsComponent } from './dashboard/introductions-dashboard/introductions.component';
import { ExpandableTextComponent } from './other_components/expandable-text/expandable-text.component';
import { DocumentFilterComponent } from './dialogs/document-filter/document-filter.component';
import { UsersComponent } from './dashboard/users/users.component';
import { TestimoniaComponent } from './columns/testimonia/testimonia.component';
import { FragmentComponent } from './columns/fragment/fragment.component';
import { OnCopyDirective } from './directives/on-copy.directive';
import { TestimoniaDashboardComponent } from './dashboard/testimonia-dashboard/testimonia-dashboard.component';
import { TranslationComponent } from './commentary/translation/translation.component';
import { GeneralCommentaryFieldComponent } from './commentary/general-commentary-field/general-commentary-field.component';
import { FragmentsDashboardComponent } from './dashboard/fragments-dashboard/fragments-dashboard.component';
import { LoadPlaygroundComponent } from './playground/load-playground/load-playground.component';
import { SavePlaygroundComponent } from './playground/save-playground/save-playground.component';
import { DeletePlaygroundComponent } from './playground/delete-playground/delete-playground.component';
import { SharePlaygroundComponent } from './playground/share-playground/share-playground.component';
import { JoinPlaygroundComponent } from './playground/join-playground/join-playground.component';

// Routes to take. Disallows Path Traversal.
const appRoutes: Routes = [
  { path: '', component: OverviewComponent },
  { path: 'fragments', component: OverviewComponent },
  { path: 'bib', component: BibliographyComponent },
  { path: 'playground', component: PlaygroundComponent },
  // {path: 'text', component: TextComponent},
  { path: 'scansion', component: ScansionComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [
    AppComponent,
    ColumnsComponent,
    ColumnComponent,
    SafeHtmlPipe,
    DashboardComponent,
    LoginComponent,
    ScansionComponent,
    ConfirmationDialogComponent,
    WYSIWYGDialogComponent,
    SettingsDialogComponent,
    CustomDialogComponent,
    ColumnBibliographyComponent,
    PlaygroundComponent,
    CommentaryComponent,
    OverviewComponent,
    IntroductionsComponent,
    BibliographyComponent,
    ExpandableTextComponent,
    DocumentFilterComponent,
    UsersComponent,
    TestimoniaComponent,
    FragmentComponent,
    OnCopyDirective,
    TestimoniaDashboardComponent,
    TranslationComponent,
    GeneralCommentaryFieldComponent,
    FragmentsDashboardComponent,
    LoadPlaygroundComponent,
    SavePlaygroundComponent,
    DeletePlaygroundComponent,
    SharePlaygroundComponent,
    JoinPlaygroundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, {}),
    QuillModule.forRoot(), // rich text editor
    NgxSimpleTextEditorModule,

    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    // All needed Material modules
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSortModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatRadioModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTableModule, // Not currently used
    MatGridListModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatSliderModule,
    // To allow the drag and drop
    DragDropModule,
    ClipboardModule,
    // MatKeyboardModule,
    SocketIoModule.forRoot(config),

    // AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    SafeHtmlPipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: ColumnsComponent,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
export class PipesModule {}
