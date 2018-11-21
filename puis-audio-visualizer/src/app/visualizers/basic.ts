import * as THREE from "three";

export default class VisualizerBasic {

    constructor(options: Object) {

    }

        // this was old code that I would reuse if I want to later.
    private createTestVisualizer_old() {
        var cubes: Array<THREE.Mesh> = [];

        function setHeights(heights: Array<number>): void {
            if (heights.length !== cubes.length)
                throw new Error("invalid number of heights to set visualizer");

            for (var n = 0; n < cubes.length; ++n) {
                cubes[n].scale.set(1, heights[n], 1);
            }
        }

        var material = new THREE.MeshLambertMaterial({ color: 0x12F34F });

        for (var n = 0; n < 16; ++n) {
            var geometry = new THREE.BoxGeometry(0.25, 0.1, 0.5);
            var cube = new THREE.Mesh(geometry, material);
            cube.position.set(0.5 * (n - 8), 0, 0);
            cubes.push(cube);
        }

        cubes.forEach(cube => {
            // this.scene.add(cube);
        });

        return setHeights;
    }
}