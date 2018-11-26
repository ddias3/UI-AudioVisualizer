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
    else
        return undefined;
}

@Injectable({
    providedIn: 'root'
})
export class MainService {

    private callbacks = {};
    private view: string = "multi";

    private activeSignalProcess = undefined;

    constructor() {
        var self = this;
        self.registerEvent("onViewChange", function (newView) {
            self.view = newView;
            if (newView === "multi")
                self.trigger("setDisplay", ["multi"]);
            else
                self.trigger("setDisplay", [processStringFunc(self.activeSignalProcess)]);
        });

        self.registerEvent("onActiveChange", function (newActive) {
            self.activeSignalProcess = newActive;
        });

        self.registerEvent("back", function () {
            self.trigger("onViewChange", ["multi"]);
        });

        self.registerEvent("pinch", function (event) {
            self.trigger("setThreshold", [event, self.activeSignalProcess]);
        });

        self.registerEvent("rotate", function (event) {
            if (self.getActiveType() === "eq")
                self.trigger("setFilter", [event, self.activeSignalProcess]);
            else if (self.getActiveType() === "comp")
                self.trigger("setRatio", [event, self.activeSignalProcess]);
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

    public getActive() {
        return this.activeSignalProcess;
    }

    public getActiveType() {
        return processStringFunc(this.activeSignalProcess);
    }

    public getView(): string {
        return this.view;
    }
}