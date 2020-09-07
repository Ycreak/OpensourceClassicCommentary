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



import {MatFormFieldModule} from '@angular/material/form-field'; 
import {MatSelectModule} from '@angular/material/select'; 
import {MatListModule} from '@angular/material/list'; 
import {MatProgressBarModule} from '@angular/material/progress-bar'; 
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';  
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

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
