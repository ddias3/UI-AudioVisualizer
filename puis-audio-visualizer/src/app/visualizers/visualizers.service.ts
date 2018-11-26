import { Injectable } from '@angular/core';
import * as THREE from "three";

import { VisualizerFactory } from "./visualizer-factory.service";
import { MainService } from "../app-service/app-service.service";

const waveFunc = x => Math.sin(x * Math.PI);
const waveFuncNeg = x => - 4*x + 4*x*x; // 1 - (2*x - 1) * (2*x - 1)
const CIRCLES = [
    {
        radius : 3.6,
        thickness : 0.08,
        resolution : 256
    },
    {
        radius : 2.6,
        thickness : 0.065,
        resolution : 128
    },
    {
        radius : 1.8,
        thickness : 0.045,
        resolution : 128
    },
    {
        radius : 1.25,
        thickness : 0.04,
        resolution : 64
    },
    {
        radius : 0.8,
        thickness : 0.04,
        resolution : 64
    },
    {
        radius : 0.42,
        thickness : 0.045,
        resolution : 32
    }
];
const WAVES = {
    freq : [
        {
            step : 6.0 * Math.PI / 12 + 0.2,
            wave : waveFunc,
            amplitude : 1.0,
            // amplitude : 0.72,
            startAngle : null,
            radius : 3.6,
            arcLength : 6.6 * Math.PI / 12,
            displayThickness : 0.08,
            resolution : 64,
            rotationMultiplier : 1.0
        },
        {
            step : 2.8 * Math.PI / 12 - 0.04,
            wave : waveFuncNeg,
            amplitude : 0.84,
            // amplitude : 0.56,
            startAngle : null,
            radius : 3.6,
            arcLength : 2.8 * Math.PI / 12,
            displayThickness : 0.07,
            resolution : 32,
            rotationMultiplier : -1.1
        },
        {
            step : 4.1 * Math.PI / 12 - 0.12,
            wave : waveFunc,
            amplitude : 0.76,
            // amplitude : 0.48,
            startAngle : null,
            radius : 2.6,
            arcLength : 4.1 * Math.PI / 12,
            displayThickness : 0.06,
            resolution : 24,
            rotationMultiplier : 1.25
        },
        {
            step : 2.5 * Math.PI / 12,
            wave : waveFuncNeg,
            amplitude : 0.70,
            // amplitude : 0.42,
            startAngle : null,
            radius : 2.6,
            arcLength : 2.5 * Math.PI / 12,
            displayThickness : 0.05,
            resolution : 24,
            rotationMultiplier : -1.55
        },
        {
            step : 2.8 * Math.PI / 12,
            wave : waveFunc,
            amplitude : 0.73,
            // amplitude : 0.45,
            startAngle : null,
            radius : 1.8,
            arcLength : 2.8 * Math.PI / 12,
            displayThickness : 0.04,
            resolution : 16,
            rotationMultiplier : 1.9
        },
        {
            step : 1.5 * Math.PI / 12,
            wave : waveFuncNeg,
            amplitude : 0.60,
            // amplitude : 0.32,
            startAngle : null,
            radius : 1.8,
            arcLength : 1.5 * Math.PI / 12,
            displayThickness : 0.04,
            resolution : 12,
            rotationMultiplier : -2.3
        },
        {
            step : 1.2 * Math.PI / 12,
            wave : waveFunc,
            amplitude : 0.58,
            // amplitude : 0.3,
            startAngle : null,
            radius : 1.25,
            arcLength : 1.2 * Math.PI / 12,
            displayThickness : 0.04,
            resolution : 10,
            rotationMultiplier : 2.75
        },
        {
            step : 0.85 * Math.PI / 12,
            wave : waveFuncNeg,
            amplitude : 0.55,
            // amplitude : 0.27,
            startAngle : null,
            radius : 1.25,
            arcLength : 0.8 * Math.PI / 12,
            displayThickness : 0.04,
            resolution : 12,
            rotationMultiplier : -3.15
        },
        {
            step : 0.7 * Math.PI / 12,
            wave : waveFunc,
            amplitude : 0.50,
            // amplitude : 0.22,
            startAngle : null,
            radius : 0.8,
            arcLength : 0.62 * Math.PI / 12,
            displayThickness : 0.05,
            resolution : 8,
            rotationMultiplier : 3.6
        },
        {
            step : 0.65 * Math.PI / 12,
            wave : waveFuncNeg,
            amplitude : 0.48,
            // amplitude : 0.2,
            startAngle : null,
            radius : 0.8,
            arcLength : 0.54 * Math.PI / 12,
            displayThickness : 0.05,
            resolution : 4,
            rotationMultiplier : -4.0
        },
        {
            step : 0.6 * Math.PI / 12,
            wave : waveFunc,
            amplitude : 0.47,
            // amplitude : 0.19,
            startAngle : null,
            radius : 0.42,
            arcLength : 0.48 * Math.PI / 12,
            displayThickness : 0.06,
            resolution : 4,
            rotationMultiplier : 4.5
        },
        {
            step : 0.8 * Math.PI / 12,
            wave : waveFuncNeg,
            amplitude : 0.60,
            // amplitude : 0.12,
            startAngle : null,
            radius : 0.42,
            arcLength : 0.45 * Math.PI / 12,
            displayThickness : 0.06,
            resolution : 3,
            rotationMultiplier : -5.0
        }
    ]
};
const AUDIO_NORMALIZATION = [
        // Low Freq
    250, 189, 180, 180,

        // Mid Freq
    170, 165, 166, 163,

        // High Freq
    155, 165, 180, 190
];

@Injectable({
    providedIn: 'root'
})
export class VisualizersService {

        // This should be a linked list, but I don't have one ready to go.
    private _visualizers = [];
    private _visualizerFactory: VisualizerFactory;

    private visualizerFactory: VisualizerFactory;
    private mainService: MainService;

    constructor(mainService: MainService, visualizerFactory: VisualizerFactory) {
        this._visualizerFactory = visualizerFactory;
        this.mainService = mainService;

        this.mainService.registerEvent("setFilter", function (event, visualizer) {
            console.log("Set Filter for current EQ with this event: " + event);
        });

        this.mainService.registerEvent("setRatio", function (event, visualizer) {
            console.log("Set Ratio for current Comp with this event: " + event);
        });

        this.mainService.registerEvent("setThreshold", function (event, visualizer) {
            console.log("Set Threshold for current Noise/Comp with this event: " + event);
        });
    }

    public get visualizers(): Array<any> {
        return this._visualizers;
    }

    private numberVisualizers(): number {
        return this._visualizers.length;
    }

    public createVisualizer(type: string, scene: THREE.Scene) {
        var newVisualizer;
        switch (type) {
            case "eq":
                this._visualizers.push(newVisualizer = this._visualizerFactory.eq(CIRCLES, WAVES));
                break;
            case "identity":
                this._visualizers.push(newVisualizer = this._visualizerFactory.identity());
                break;
            case "noise":
                this._visualizers.push(newVisualizer = this._visualizerFactory.noise());
                break;
            case "comp":
                this._visualizers.push(newVisualizer = this._visualizerFactory.comp());
                break;
        }
        newVisualizer.addToScene(scene);
        return newVisualizer;
    }

    public placeOrder(visualizer: any, newPlacement: number) {
        if (newPlacement < 0)
            newPlacement = this._visualizers.length + newPlacement;

        var oldIndex = 0;
        while (visualizer !== this._visualizers[oldIndex])
            ++oldIndex;

        this._visualizers.splice(newPlacement, 0, this._visualizers.splice(oldIndex, 1)[0]);
    }

    public updateVisualizers(amplitude: number, freqValues: number[]) {
        var normalizedFreqValues12 = [];
        for (var n = 0; n < 12; ++n)
            normalizedFreqValues12.push(freqValues[n * Math.floor(freqValues.length / 16)]);
        var freqValues32 = [];
        for (var n = 0; n < 32; ++n)
            freqValues32.push(freqValues[n * Math.floor(freqValues.length / 36)]);

        for (var n = 0; n < this._visualizers.length; ++n) {
            if (this._visualizers[n].morphAmplitude)
                this._visualizers[n].morphAmplitude(amplitude);
            if (this._visualizers[n].morphFreq12)
                this._visualizers[n].morphFreq12(normalizedFreqValues12);
            if (this._visualizers[n].morphFreq32)
                this._visualizers[n].morphFreq32(freqValues32);
        }
    }

    public removeVisualizer(visualizer, scene) {
        var index = -1;
        for (var n = 0; n < this._visualizers.length; ++n) {
            if (visualizer === this._visualizers[n]) {
                index = n;
                break;
            }
        }

        if (index > -1) {
            this._visualizers[index].removeFromScene(scene);
            this._visualizers.splice(index, 1);
        }
    }

    // public populateScene() {
    //     this.testVisualizer0 = this.visualizerFactory.eq({}, this.CIRCLES, this.WAVES);
    //     this.testVisualizer0.addToScene(this.scene);
    //     // this.testVisualizer0.setPosition(new THREE.Vector3(0, 0, 0));
    //     // this.testVisualizer0.setPosition(this.pathCurve.getPoint(0.5));

    //     this.testVisualizer1 = this.visualizerFactory.noise();
    //     this.testVisualizer1.addToScene(this.scene);

    //     this.testVisualizer2 = this.visualizerFactory.comp();
    //     this.testVisualizer2.addToScene(this.scene);

    //     this.testVisualizerIdentities = [
    //         // this.visualizerFactory.identity(),
    //         // this.visualizerFactory.identity(),
    //         // this.visualizerFactory.identity(),
    //         // this.visualizerFactory.identity(),
    //         // this.visualizerFactory.identity(),
    //         this.visualizerFactory.identity(),
    //         this.visualizerFactory.identity(),
    //         this.visualizerFactory.identity(),
    //         this.visualizerFactory.identity(),
    //         this.visualizerFactory.identity(),
    //         this.visualizerFactory.identity(),
    //         this.visualizerFactory.identity()
    //     ];
    //     this.testVisualizerIdentities.forEach(visualizer => {
    //         visualizer.addToScene(this.scene);
    //         // visualizer.setPosition(this.pathCurve.getPoint(Math.random()));
    //     });
    // }
}