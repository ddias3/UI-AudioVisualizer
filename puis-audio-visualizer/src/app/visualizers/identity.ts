import * as THREE from "three";
import * as util from "./util";

export default class VisualizerIdentity {
    private root: THREE.Group;
    private bars: Array<THREE.Mesh>;
    private frame: THREE.Mesh;

    private testPlane: THREE.Mesh;

    constructor(options: Object) {
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

            geometryMin.applyMatrix(new THREE.Matrix4().makeTranslation(-3.9 + (n / 4), -2 + 0.05, 0));
            geometryMax.applyMatrix(new THREE.Matrix4().makeTranslation(-3.9 + (n / 4), 0, 0));

            geometryMax.morphTargets.push({
                name     : "min",
                vertices : geometryMin.vertices
            });

            var plane = new THREE.Mesh(geometryMax, material);
            plane.morphTargetInfluences[0] = 1.0;

            this.root.add(plane);
            this.bars.push(plane);
        }

        var frameGeometry = new THREE.BufferGeometry();
        frameGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array([
                -4.2, 2.1, 0,   // 0
                4.2, 2.1, 0,    // 1
                -4.15, 2.05, 0, // 2
                4.15, 2.05, 0,  // 3
                -4.15, -2.05, 0,// 4
                4.15, -2.05, 0, // 5
                -4.2, -2.1, 0,  // 6
                4.2, -2.1, 0    // 7
            ]), 3));

        frameGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array([
                2, 1, 0, // Top Quad
                // 1, 2, 3,

                6, 2, 0, // Left Quad
                6, 4, 2,

                // 1, 3, 7, // Right Quad
                // 3, 5, 7,

                6, 5, 4, // Bottom Quad
                // 5, 6, 7
            ]), 1));
        this.frame = new THREE.Mesh(frameGeometry, new THREE.MeshBasicMaterial({ color : 0xA0A0A0, transparent : true, opacity : 0.55 }));
        this.root.add(this.frame);
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.root);
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

    public morphBars(normalizedFreqValues: Array<number>) {
        if (normalizedFreqValues.length !== this.bars.length)
            throw new Error("Incompatible number of wave frequency values " + normalizedFreqValues.length);

        for (var n = 0; n < this.bars.length; ++n) {
            this.bars[n].morphTargetInfluences[0] = 1 - normalizedFreqValues[n];
        }
    }
}