import { Injectable } from '@angular/core';

import { VisualizerIdentity } from '../visualizers/identity';
import { VisualizerCompression } from '../visualizers/compression';
import { VisualizerEQ } from '../visualizers/equilizer';
import { VisualizerNoiseGate } from '../visualizers/noiseGate';

function processStringFunc(visualizer) {
    if (visualizer instanceof VisualizerEQ)
        return "eq";
    else if (visualizer instanceof VisualizerNoiseGate)
        return "noise";
    else if (visualizer instanceof VisualizerCompression)
        return "comp";
    else if (visualizer instanceof VisualizerIdentity)
        return "identity";
}

@Injectable({
    providedIn: 'root'
})
export class MainService {

    private callbacks = {};
    private view: string = "multi";

    private activeSignalProcess = undefined;

    constructor() {
        var serv = this;
        this.registerEvent("onViewChange", function (newView) {
            serv.view = newView;
            if (newView === "multi")
                serv.trigger("setDisplay", ["multi"]);
            else
                serv.trigger("setDisplay", [processStringFunc(serv.activeSignalProcess)]);
        });

        this.registerEvent("onActiveChange", function (newActive) {
            serv.activeSignalProcess = newActive;
        });
    }

    public registerEvent(eventName: string, callback) {
        if (this.callbacks[eventName])
            this.callbacks[eventName].push(callback);
        else
            this.callbacks[eventName] = [ callback ];
    }

    public trigger(eventName: string, args: any[]) {
        if (this.callbacks[eventName]) {
            for (var n = 0; n < this.callbacks[eventName].length; ++n) {
                this.callbacks[eventName][n](...args);
            }
        }
    }

    public getData(dataId: string) {
        switch (dataId) {
            case "view":
                return this.view;
            case "active":
                return this.activeSignalProcess;
        }
    }
}