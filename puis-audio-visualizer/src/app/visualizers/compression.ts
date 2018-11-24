import * as THREE from "three";
import * as util from "./util";

export class VisualizerCompression {
    private thresholdCircle: THREE.Mesh;
    private audioCircle: THREE.Mesh;

    constructor(options: Object) {
        function createAudioCircle(material: THREE.Material, maxSize: number, minSize: number, maxThickness: number, minThickness: number, resolution: number): THREE.Mesh {
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

        function createThresholdCircle(material: THREE.Material, maxSize: number, minSize: number, maxThickness: number, minThickness: number, resolution: number): THREE.Mesh {
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
                maxSizeMaxThickness : [],
                minSizeMaxThickness : [],
                maxSizeMinThickness : [],
                minSizeMinThickness : []
            };

            for (var n = 0; n < resolution; ++n) {
                var verticesAttributeLocal = {
                    maxSizeMaxThickness : new THREE.BufferAttribute(createQuad(maxSize, maxThickness, phi), 3),
                    minSizeMaxThickness : new THREE.BufferAttribute(createQuad(minSize, maxThickness, phi), 3),
                    maxSizeMinThickness : new THREE.BufferAttribute(createQuad(maxSize, minThickness, phi), 3),
                    minSizeMinThickness : new THREE.BufferAttribute(createQuad(minSize, minThickness, phi), 3)
                }
                rotationMatrix.makeRotationZ(n * phi).scale(new THREE.Vector3(maxSize, maxSize, 1.0));
                rotationMatrix.applyToBufferAttribute(verticesAttributeLocal.maxSizeMaxThickness);
                rotationMatrix.applyToBufferAttribute(verticesAttributeLocal.maxSizeMinThickness);

                rotationMatrix.makeRotationZ(n * phi).scale(new THREE.Vector3(minSize, minSize, 1.0));
                rotationMatrix.applyToBufferAttribute(verticesAttributeLocal.minSizeMaxThickness);
                rotationMatrix.applyToBufferAttribute(verticesAttributeLocal.minSizeMinThickness);

                verticesAttributes.maxSizeMaxThickness.push(verticesAttributeLocal.maxSizeMaxThickness);
                verticesAttributes.maxSizeMinThickness.push(verticesAttributeLocal.maxSizeMinThickness);
                verticesAttributes.minSizeMaxThickness.push(verticesAttributeLocal.minSizeMaxThickness);
                verticesAttributes.minSizeMinThickness.push(verticesAttributeLocal.minSizeMinThickness);
            }

            geometry.addAttribute("position", THREE.BufferGeometryUtils.mergeBufferAttributes(verticesAttributes.minSizeMinThickness));
            geometry.morphAttributes.position = [
                THREE.BufferGeometryUtils.mergeBufferAttributes(verticesAttributes.minSizeMaxThickness),
                THREE.BufferGeometryUtils.mergeBufferAttributes(verticesAttributes.maxSizeMinThickness),
                THREE.BufferGeometryUtils.mergeBufferAttributes(verticesAttributes.maxSizeMaxThickness)
            ];

            geometry.computeFaceNormals();
            geometry.computeVertexNormals();

            return new THREE.Mesh(geometry, material);
        }

        this.thresholdCircle = createThresholdCircle(new THREE.MeshBasicMaterial({
                transparent : true,
                opacity : 0.5,
                color : 0xFFFF00,
                side : THREE.FrontSide,
                morphTargets : true
            }), 3.2, 0.25, 1.5, 0.05, 128);

        this.audioCircle = createAudioCircle(new THREE.MeshBasicMaterial({
                transparent : true,
                opacity : 0.3,
                color : 0xA0A000,
                side : THREE.FrontSide,
                morphTargets : true
            }), 0.1, 0.1, 3.5, 0.05, 128);

        this.thresholdCircle.morphTargetInfluences[0] = 1.0; // thickness, i.e. ratio
        this.thresholdCircle.morphTargetInfluences[1] = 1.0; // size, i.e. threshold
        this.thresholdCircle.morphTargetInfluences[2] = 0.0; // thickness and size, i.e. it's the first 2 together
    }

    public morphCompression(threshold: number, ratio: number) {
        this.thresholdCircle.morphTargetInfluences[0] = ratio;
        this.thresholdCircle.morphTargetInfluences[1] = threshold;
    }

    public morphAmplitude(amplitude: number) {
        this.audioCircle.morphTargetInfluences[0] = amplitude;
    }

    public addToScene(scene: THREE.Scene): void {
        scene.add(this.thresholdCircle);
        scene.add(this.audioCircle);
    }

    public removeFromScene(scene: THREE.Scene): void {
        scene.remove(this.thresholdCircle);
        scene.remove(this.audioCircle);
        this.thresholdCircle.geometry.dispose();
        this.audioCircle.geometry.dispose();
    }

    public setPosition(position: THREE.Vector3) {
        this.thresholdCircle.position.set(position.x, position.y, position.z);
        this.audioCircle.position.set(position.x, position.y, position.z);
    }
}