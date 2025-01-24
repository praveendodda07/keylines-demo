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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Comp1Component } from './comp1/comp1.component';
import { Comp2Component } from './comp2/comp2.component';
import { ChartService } from './services/chart.service';
import { Proto1Component } from './proto-1/proto-1.component';

@NgModule({
  declarations: [
    AppComponent,
    KlComponents,
    KlComponent,
    ComboComponent,
    ShipmentsGraphComponent,
    Comp1Component,
    Comp2Component,
    Proto1Component,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [KlComponentsService, ChartService],
  bootstrap: [AppComponent],
})
export class AppModule {}
