import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { AuthGuard } from './app/auth/auth.guard';
import { OverviewComponent } from './app/overview/overview.component';
import { provideRouter, Routes } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpErrorInterceptor } from './app/api.service';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';

const appRoutes: Routes = [
  { path: '', component: OverviewComponent },
  //{ path: 'scansion', component: ScansionComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];
const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(SocketIoModule.forRoot(config)),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(appRoutes),
    provideAnimations(),
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
  ],
}).catch((err) => console.error(err));
