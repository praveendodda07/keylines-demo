import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  KlComponent,
  KlComponents,
  KlComponentsService,
} from '../angular-keylines';
import { ComboComponent } from './combo/combo.component';
import { ShipmentsGraphComponent } from './shipments-graph/shipments-graph.component';

@NgModule({
  declarations: [AppComponent, KlComponents, KlComponent, ComboComponent, ShipmentsGraphComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [KlComponentsService],
  bootstrap: [AppComponent],
})
export class AppModule {}
