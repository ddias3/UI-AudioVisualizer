import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VisualizersService {

    public eq(options: Object, circlesConfig: Array<any>, wavesConfig: Object) {
        return new VisualizerEQ(options, circlesConfig, wavesConfig);
    }

    public comp() {
        return new VisualizerComp({});
    }

    public noise() {
        return new VisualizerNoiseGate({});
    }

    public identity() {
        return new VisualizerIdentity({});
    }
}