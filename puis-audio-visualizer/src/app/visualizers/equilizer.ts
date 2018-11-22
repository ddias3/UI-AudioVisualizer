import * as THREE from "three";
import * as util from "./util";

export default class VisualizerEQ {
    private circlesConfig: Array<any>;
    private wavesConfig: Object;

    private circles: Array<THREE.Mesh>;
    private waves: Array<THREE.Mesh>;

    constructor(options: Object, circlesConfig: Array<any>, wavesConfig: Object) {
        this.circlesConfig = circlesConfig;
        this.wavesConfig = wavesConfig;

        this.circles = circlesConfig.map(config => util.createCircle(config.radius, config.thickness, config.resolution));

        //                 var mesh = util.createWave(freq.wave, arg1:freqValues[index] * freq.amplitude, startAngle + (arg0:rotation * freq.rotationMultiplier), freq.radius, freq.arcLength, freq.displayThickness, freq.resolution);
        //    ...
        // createAllWaves(0.0, [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0.5]);

        this.waves = [];
        wavesConfig["freq"].forEach(freq => {
            var freqWavesArray = util.range(freq.step).map(startAngle => {
                return util.createWave(freq.wave, freq.amplitude, startAngle, freq.radius, freq.arcLength, freq.displayThickness, freq.resolution);
            });
            this.waves.push(freqWavesArray);
        });

        this.waves.forEach(level => {
            level.forEach(wave => {
                wave.morphTargetInfluences[1] = 0.5 / 2.1;
            });
        });
    }

    public addToScene(scene: THREE.Scene): void {
        for (var n = 0; n < this.circles.length; ++n)
            scene.add(this.circles[n]);
        for (var n = 0; n < this.waves.length; ++n)
            for (var m = 0; m < this.waves[n].length; ++m)
                scene.add(this.waves[n][m]);
    }

    public removeFromScene(scene: THREE.Scene): void {
        for (var n = 0; n < this.circles.length; ++n) {
            scene.remove(this.circles[n]);
            this.circles[n].geometry.dispose();
        }
        for (var n = 0; n < this.waves.length; ++n) {
            for (var m = 0; m < this.waves[n].length; ++m) {
                scene.remove(this.waves[n][m]);
                this.waves[n][m].geometry.dispose();
            }
        }
    }

    public rotate(value) {
        for (var n = 0; n < this.wavesConfig["freq"].length; ++n)
            for (var m = 0; m < this.waves[n].length; ++m)
                this.waves[n][m].rotateZ(value * this.wavesConfig["freq"][n].rotationMultiplier);
    }

    public morphWaves(normalizedFreqValues: Array<number>) {
        if (normalizedFreqValues.length !== this.waves.length)
            throw new Error("Incompatible number of wave frequency values " + normalizedFreqValues.length);

        for (var n = 0; n < this.waves.length; ++n) {
            for (var m = 0; m < this.waves[n].length; ++m) {
                this.waves[n][m].morphTargetInfluences[0] = normalizedFreqValues[n];
            }
        }
    }

    public setPosition(position: THREE.Vector3) {
        for (var n = 0; n < this.circles.length; ++n)
            this.circles[n].position.set(position.x, position.y, position.z);
        for (var n = 0; n < this.waves.length; ++n)
            for (var m = 0; m < this.waves[n].length; ++m)
                this.waves[n][m].position.set(position.x, position.y, position.z);
    }
}