import * as THREE from "three";
import * as util from "./util";

export default class VisualizerIdentity {
    private root: THREE.Group;
    private bars: Array<THREE.Mesh>;
    private frame: THREE.Mesh;

    private testPlane: THREE.Mesh;

    constructor(options: Object) {
        // createTestVisualizer_old() {
        //         var cubes: Array<THREE.Mesh> = [];

        //         function setHeights(heights: Array<number>): void {
        //             if (heights.length !== cubes.length)
        //                 throw new Error("invalid number of heights to set visualizer");

        //             for (var n = 0; n < cubes.length; ++n) {
        //                 cubes[n].scale.set(1, heights[n], 1);
        //             }
        //         }

        //         var material = new THREE.MeshLambertMaterial({ color: 0x12F34F });

        //         for (var n = 0; n < 16; ++n) {
        //             var geometry = new THREE.BoxGeometry(0.25, 0.1, 0.5);
        //             var cube = new THREE.Mesh(geometry, material);
        //             cube.position.set(0.5 * (n - 8), 0, 0);
        //             cubes.push(cube);
        //         }

        //         cubes.forEach(cube => {
        //             // this.scene.add(cube);
        //         });

        //         return setHeights;
        //     }
        // }

        this.root = new THREE.Group();

        this.bars = [];

        var material = new THREE.MeshBasicMaterial({
            color : 0xA0A0A0,
            opacity : 0.4,
            transparent : true,
            side : THREE.FrontSide,
            morphTargets : true
        });

        for (var n = 0; n < 32; ++n) {
            var geometryMin = new THREE.PlaneGeometry(0.22, 0.05);
            var geometryMax = new THREE.PlaneGeometry(0.22, 4);

            geometryMin.morphTargets.push({
                name     : "max",
                vertices : geometryMax.vertices.map(v => v.clone())
            });

            var plane = new THREE.Mesh(geometryMin, material);
            plane.translateX(-3.9 + (n / 4));
            plane.translateY(-2 + 0.05);

            this.root.add(plane);
            this.bars.push(plane);
        }

        var testPlane = new THREE.PlaneGeometry(0.25, 4);
        var testVertices = [];
        for (var v = 0; v < testPlane.vertices.length; ++v) {
            testVertices.push(testPlane.vertices[v].clone());
            testVertices[v].x = 1;
            testVertices[v].y = 1;
            testVertices[v].z = 0;
        }

        testPlane.morphTargets.push({
            name : "test",
            vertices : testVertices
        });

        this.testPlane = new THREE.Mesh(testPlane, material);


                // var testPlane = new THREE.PlaneGeometry(0.25, 4);
        var testPlane = new THREE.BufferGeometry();
        testPlane.addAttribute("position", new THREE.BufferAttribute(
            new Float32Array([
                -0.125, -2, 0,
                0.125, -2, 0,
                0.125, 2, 0,

                -0.125, -2, 0,
                0.125, 2, 0,
                -0.125, 2, 0
            ]), 3));

        testPlane.morphAttributes.position = [
            new THREE.BufferAttribute(new Float32Array([
                -1, -1, 0,
                1, -1, 0,
                1, 1, 0,

                -1, -1, 0,
                1, 1, 0,
                -1, 1, 0
            ]), 3)
        ];

        this.testPlane = new THREE.Mesh(testPlane, material);
    }

    public addToScene(scene: THREE.Scene): void {
        // scene.add(this.root);
        scene.add(this.testPlane);
    }

    public removeFromScene(scene: THREE.Scene): void {
        scene.remove(this.frame);
        this.frame.geometry.dispose();
        this.bars.forEach(bar => {
            scene.remove(bar);
            bar.geometry.dispose();
        });
        scene.remove(this.root);
    }

    public setPosition(position: THREE.Vector3) {
        this.root.position.set(position.x, position.y, position.z);
    }

    public testMorph(value: number) {
        this.testPlane.morphTargetInfluences[0] = value;
    }

    public morphBars(normalizedFreqValues: Array<number>) {
        if (normalizedFreqValues.length !== this.bars.length)
            throw new Error("Incompatible number of wave frequency values " + normalizedFreqValues.length);

        for (var n = 0; n < this.bars.length; ++n) {
            this.bars[n].morphTargetInfluences[0] = normalizedFreqValues[n];
        }
    }
}