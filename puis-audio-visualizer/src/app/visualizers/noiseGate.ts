import * as THREE from "three";
import * as util from "./util";

export class VisualizerNoiseGate {
    private gateCircle: THREE.Mesh;
    private audioCircle: THREE.Mesh;

    constructor(options: Object) {
        function createGateCircle(material: THREE.Material, maxSize: number, minSize: number, maxThickness: number, minThickness: number, resolution: number): THREE.Mesh {
            if (resolution < 3)
                resolution = 3;

            var phi: number = 2 * Math.PI / resolution;

            function createQuad(size: number, thickness: number, phi: number): Float32Array {
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
                maxSize : [],
                minSize : []
            };

            for (var n = 0; n < resolution; ++n) {
                var verticesAttributeLocal = {
                    maxSize : new THREE.BufferAttribute(createQuad(maxSize, maxThickness, phi), 3),
                    minSize : new THREE.BufferAttribute(createQuad(minSize, minThickness, phi), 3)
                }
                rotationMatrix.makeRotationZ(n * phi).scale(new THREE.Vector3(maxSize, maxSize, 1.0));
                rotationMatrix.applyToBufferAttribute(verticesAttributeLocal.maxSize);

                rotationMatrix.makeRotationZ(n * phi).scale(new THREE.Vector3(minSize, minSize, 1.0));
                rotationMatrix.applyToBufferAttribute(verticesAttributeLocal.minSize);

                verticesAttributes.maxSize.push(verticesAttributeLocal.maxSize);
                verticesAttributes.minSize.push(verticesAttributeLocal.minSize);
            }

            geometry.addAttribute("position", THREE.BufferGeometryUtils.mergeBufferAttributes(verticesAttributes.minSize));
            geometry.morphAttributes.position = [
                THREE.BufferGeometryUtils.mergeBufferAttributes(verticesAttributes.maxSize)
            ];

            geometry.computeFaceNormals();
            geometry.computeVertexNormals();

            return new THREE.Mesh(geometry, material);
        }

        this.gateCircle = createGateCircle(new THREE.MeshBasicMaterial({
                transparent : true,
                opacity : 0.8,
                color : 0x00A0FF,
                side : THREE.FrontSide,
                morphTargets : true
            }), 3.6, 0.25, 0.05, 0.05, 128);

        this.audioCircle = createGateCircle(new THREE.MeshBasicMaterial({
                transparent : true,
                opacity : 0.3,
                color : 0x00A0FF,
                side : THREE.FrontSide,
                morphTargets : true
            }), 0.1, 0.1, 3.5, 0.05, 128);
    }

    public morphGate(cutOffVolume: number) {
        this.gateCircle.morphTargetInfluences[0] = cutOffVolume;
    }

    public morphAmplitude(amplitude: number) {
        this.audioCircle.morphTargetInfluences[0] = amplitude;
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.gateCircle);
        scene.add(this.audioCircle);
    }

    public removeFromScene(scene: THREE.Scene): void {
        scene.remove(this.gateCircle);
        scene.remove(this.audioCircle);
        this.gateCircle.geometry.dispose();
        this.audioCircle.geometry.dispose();
    }

    public setPosition(position: THREE.Vector3) {
        this.gateCircle.position.set(position.x, position.y, position.z);
        this.audioCircle.position.set(position.x, position.y, position.z);
    }
}