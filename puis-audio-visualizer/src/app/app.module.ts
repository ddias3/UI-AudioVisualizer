import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VisualizerContainerComponent } from './visualizer-container/visualizer-container.component';
import { InfoContainerComponent } from './info-container/info-container.component';
import { AudioContainerComponent } from './audio-container/audio-container.component';
import { VisualizerFactory } from './visualizers/visualizer-factory.service';
import { VisualizersService } from './visualizers/visualizers.service';
import { InfoEquilizerComponent } from './info-equilizer/info-equilizer.component';
import { InfoNoiseGateComponent } from './info-noise-gate/info-noise-gate.component';
import { InfoCompressionComponent } from './info-compression/info-compression.component';

@NgModule({
  declarations: [
    AppComponent,
    VisualizerContainerComponent,
    InfoContainerComponent,
    AudioContainerComponent,
    InfoEquilizerComponent,
    InfoNoiseGateComponent,
    InfoCompressionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    VisualizerFactory,
    VisualizersService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
