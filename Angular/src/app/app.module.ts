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
import { FragmentsComponent } from './fragments/fragments.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { SafeHtmlPipe } from './pipes/safeHtml.pipe';
// import { SafeHtmlPipe } from './fragments/fragments.component';

import { ConfirmationDialogComponent } from './services/dialog.service';
import { WYSIWYGDialogComponent } from './services/dialog.service';
import { SettingsDialogComponent } from './services/dialog.service';
import { BibliographyComponent } from './dashboard/bibliography/bibliography.component';
import { CustomDialogComponent } from './services/dialog.service';

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

// Allows communication with firebase
import { ScansionComponent } from './scansion/scansion.component';
import { PlaygroundComponent } from './playground/playground.component';
import { CommentaryComponent } from './commentary/commentary.component';
import { OverviewComponent } from './overview/overview.component';
import { IntroductionsComponent } from './dashboard/introductions/introductions.component';
import { ExpandableTextComponent } from './other_components/expandable-text/expandable-text.component';
import { DocumentFilterComponent } from './dialogs/document-filter/document-filter.component';
import { UsersComponent } from './dashboard/users/users.component';
import { TestimoniaComponent } from './fragments/testimonia/testimonia.component';
import { FragmentComponent } from './fragments/fragment/fragment.component';

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
    FragmentsComponent,
    SafeHtmlPipe,
    DashboardComponent,
    LoginComponent,
    ScansionComponent,
    ConfirmationDialogComponent,
    WYSIWYGDialogComponent,
    SettingsDialogComponent,
    CustomDialogComponent,
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

    // AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: FragmentsComponent,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
export class PipesModule {}
