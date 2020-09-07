// Library Imports
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DragDropModule} from '@angular/cdk/drag-drop';
// Component Imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FragmentsComponent } from './components/fragments/fragments.component';
import { DashboardComponent } from './components/fragments/dashboard/dashboard.component';
import { TextComponent } from './components/text/text.component';
// Class Imports
import {ShowAboutDialog} from './components/fragments/fragments.component';
// Material Imports
import {
  MatFormFieldModule,
  MatSelectModule,
  MatListModule,
  MatProgressBarModule,
  MatExpansionModule,
  MatTabsModule,
  MatDialogModule,
  MatMenuModule,
  MatInputModule,
  MatButtonModule,
} from '@angular/material';

// Routes to take. Disallows Path Traversal.
const appRoutes: Routes = [
  {path: '', component: FragmentsComponent},
  {path: 'fragments', component: FragmentsComponent},
  {path: 'text', component: TextComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: '**', redirectTo: ''}
]

@NgModule({
  declarations: [
    AppComponent,
    FragmentsComponent,
    TextComponent,
    DashboardComponent,
    ShowAboutDialog,
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),

    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,

    DragDropModule,
  ],
  exports: [   
  ],
  entryComponents: [ShowAboutDialog],
  providers: [FragmentsComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
