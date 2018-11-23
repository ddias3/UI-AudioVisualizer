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