import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// NOTA BENE: Routes are now in main.ts!
const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
