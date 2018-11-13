import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VisualizerContainerComponent } from './visualizer-container/visualizer-container.component';
import { InfoContainerComponent } from './info-container/info-container.component';

@NgModule({
  declarations: [
    AppComponent,
    VisualizerContainerComponent,
    InfoContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
