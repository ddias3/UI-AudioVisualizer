import * as THREE from "three";
import * as util from "./util";

export default class VisualizerNoiseGate {
    private circle: THREE.Mesh;
    private audioCircle: THREE.Mesh;

    constructor(options: Object) {
        function createCircle(size: number, thickness: number, resolution: number): THREE.Mesh {
            if (resolution < 3)
                resolution = 3;

            var phi: number = 2 * Math.PI / resolution;

            function createBasicShape(size: number, phi: number): Float32Array {
                return new Float32Array([
                    1.0, 0.0, 0.0,
                    1.0 + (thickness / size), 0.0, 0.0,
                    Math.cos(phi) * (1.0 + (thickness / size)), Math.sin(phi) * (1.0 + (thickness / size)), 0.0,

                    1.0, 0.0, 0.0,
                    Math.cos(phi) * (1.0 + (thickness / size)), Math.sin(phi) * (1.0 + (thickness / size)), 0.0,
                    Math.cos(phi), Math.sin(phi), 0.0
                ]);
            }

            var geometry = new THREE.BufferGeometry();

            var rotationMatrix = new THREE.Matrix4();
            var verticesAttributes = {
                orig : [],
                fullSize : []
            };

            for (var n = 0; n < resolution; ++n) {
                rotationMatrix.makeRotationZ(n * phi).scale(new THREE.Vector3(size, size, 1.0));

                var verticesAttributeLocal = new THREE.BufferAttribute(createBasicShape(phi, size), 3);
                rotationMatrix.applyToBufferAttribute(verticesAttributeLocal);

                verticesAttributes.orig.push(verticesAttributeLocal);
            }

            var verticesAttribute = THREE["BufferGeometryUtils"].mergeBufferAttributes(verticesAttributes);
            geometry.addAttribute("position", verticesAttribute);

            var material = new THREE.MeshLambertMaterial({
                transparent : true,
                opacity : 0.8,
                color : 0x00FF00,
                side : THREE.FrontSide
            });

            geometry.computeFaceNormals();
            geometry.computeVertexNormals();

            return new THREE.Mesh(geometry, material);
        }

        this.circle = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color : 0x00A0FF }));
        this.audioCircle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2, 0.5), new THREE.MeshBasicMaterial({ color : 0x0000FF }));
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.circle);
        scene.add(this.audioCircle);
    }

    public removeFromScene(scene: THREE.Scene): void {
        scene.remove(this.circle);
        scene.remove(this.audioCircle);
        this.circle.geometry.dispose();
        this.audioCircle.geometry.dispose();
    }

    public setPosition(position: THREE.Vector3) {
        this.circle.position.set(position.x, position.y, position.z);
        this.audioCircle.position.set(position.x, position.y, position.z);
    }
}