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

// Component Imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FragmentsComponent } from './fragments/fragments.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { SafeHtmlPipe } from './pipes/safeHtml.pipe';
// import { SafeHtmlPipe } from './fragments/fragments.component';

import { ConfirmationDialog } from './services/dialog.service';
// import { Multiplayer } from './fragments/fragments.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './api.service';

// Material Imports
import {MatFormFieldModule} from '@angular/material/form-field'; 
import {MatSelectModule} from '@angular/material/select'; 
import {MatListModule} from '@angular/material/list'; 
import {MatProgressBarModule} from '@angular/material/progress-bar'; 
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';  
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSlideToggleModule} from '@angular/material/slide-toggle'; 
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';  
import {MatIconModule} from '@angular/material/icon'; 
import {MatTooltipModule} from '@angular/material/tooltip'; 
import {MatTableModule} from '@angular/material/table'; 
import {MatGridListModule} from '@angular/material/grid-list'; 
// Allows copying to clipboard
import {ClipboardModule} from '@angular/cdk/clipboard';
import { TextComponent } from './text/text.component'; 
// Allows a virtual keyboard
import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule } from 'angular-onscreen-material-keyboard';
// Allows communication with firebase
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { ScansionComponent } from './scansion/scansion.component';

// Virtual Keyboard Layout
const customLayouts: IKeyboardLayouts = {
  ...keyboardLayouts,
  'OSCCLayout': {
    'name': 'OSCCLayout',
    'keys': [
      [
        ['<b>', '</b>'],
        ['<i>', '</i>'],
        ['<p>', '</p>'],
        ['<sub>', '</sub>'],
        ['<sup>', '</sup>'],
        ['<span>', '</span>'],      
      ],
      [
        ['⟨', '⟨'],
        ['⟩', '⟩'],
        ['†', '†'],
        [' ×', ' ×'],
        [' -', ' -'],
        [' ⏑', ' ⏑'],
        [' ⏓', ' ⏒'],
        [' ⏕', ' ⏔'],  
      ]
    ],
    'lang': ['OSCC']
  }
};

// Routes to take. Disallows Path Traversal.
const appRoutes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'fragments', component: FragmentsComponent},
  {path: 'text', component: TextComponent},
  {path: 'scansion', component: ScansionComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: ''}
]

@NgModule({
  declarations: [
    AppComponent,
    FragmentsComponent,
    SafeHtmlPipe,
    DashboardComponent,
    ConfirmationDialog,
    LoginComponent,
    TextComponent,
    ScansionComponent,
    // Multiplayer,
    // DialogContentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),

    // Multiplayer,

    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    // All needed Material modules
    MatButtonModule,
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
    // To allow the drag and drop
    DragDropModule,
    ClipboardModule,
    MatKeyboardModule,

    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
      
    },
    { 
      provide: MAT_KEYBOARD_LAYOUTS, 
      useValue: customLayouts 
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export class PipesModule { }