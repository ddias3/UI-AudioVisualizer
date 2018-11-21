import * as THREE from "three";
import * as util from "./util";

export default class VisualizerCompression {
    constructor(options: Object, circle) {
        var circles: Array<THREE.Mesh> = [
            util.createCircle(circle.radius, circle.thickness, 256),
            // this.createCircle(this.CIRCLES[1].radius, this.CIRCLES[1].thickness, 128),
            // this.createCircle(this.CIRCLES[2].radius, this.CIRCLES[2].thickness, 128),
            // this.createCircle(this.CIRCLES[3].radius, this.CIRCLES[3].thickness, 64),
            // this.createCircle(this.CIRCLES[4].radius, this.CIRCLES[4].thickness, 64),
            // this.createCircle(this.CIRCLES[5].radius, this.CIRCLES[5].thickness, 32)
        ];

        function range(step) {
            var returnArray = [];
            var numIterations = 2 * Math.PI / step;
            var remainder = numIterations - Math.floor(numIterations);
            if (remainder < 0.4) {
                numIterations = Math.floor(numIterations);
                var actualStep: number = step + remainder * step / numIterations;
            }
            else {
                numIterations = Math.floor(numIterations) + 1;
                var actualStep: number = step - (1 - remainder) * step / numIterations;
            }
            for (var n = 0; n < numIterations; ++n)
                returnArray.push(n * actualStep);
            return returnArray;
        }

        var component = this;
        var waves = [];

        function createAllWaves(rotation, freqValues) {
            [].forEach((freq, index) => {
                var freqWavesArray = [];
                waves.push(freqWavesArray);
                range(freq.step)
                    .map(startAngle => {
                        var mesh = util.createWave(freq.wave, freqValues[index] * freq.amplitude, startAngle + (rotation * freq.rotationMultiplier), freq.radius, freq.arcLength, freq.displayThickness, freq.resolution);
                        freqWavesArray.push(mesh);
                        return mesh;
                    });
            });
        }
        createAllWaves(0.0, [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0.5]);
    }
}