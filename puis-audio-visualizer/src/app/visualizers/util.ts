import * as THREE from "three";

function createWave(waveFunc: Function, amplitude: number, startAngle: number, radius: number, arcLength: number, displayThickness: number = 0.02, resolution: number = 32): THREE.Mesh {
    const phi0 = 0;
    const phi1 = arcLength / resolution;
    function createQuad(waveFuncVal0: number, waveFuncVal1: number) {
        const BL = {
            x : Math.cos(phi0) * (1.0 + (amplitude / radius) * waveFunc(waveFuncVal0)),
            y : Math.sin(phi0) * (0.0 + (amplitude / radius) * waveFunc(waveFuncVal0))
        };
        const BR = {
            x : Math.cos(phi0) * (1.0 + (amplitude / radius) * waveFunc(waveFuncVal0) + (displayThickness / radius)),
            y : Math.sin(phi0) * (0.0 + (amplitude / radius) * waveFunc(waveFuncVal0))
        };
        const TL = {
            x : Math.cos(phi1) * (1.0 + (amplitude / radius) * waveFunc(waveFuncVal1)),
            y : Math.sin(phi1) * (1.0 + (amplitude / radius) * waveFunc(waveFuncVal1))
        };
        const TR = {
            x : Math.cos(phi1) * (1.0 + (amplitude / radius) * waveFunc(waveFuncVal1) + (displayThickness / radius)),
            y : Math.sin(phi1) * (1.0 + (amplitude / radius) * waveFunc(waveFuncVal1) + (displayThickness / radius))
        };
        return new Float32Array([
            BL.x, BL.y, -0.01,
            BR.x, BR.y, -0.01,
            TR.x, TR.y, -0.01,

            BL.x, BR.y, -0.01,
            TR.x, TR.y, -0.01,
            TL.x, TL.y, -0.01
        ]);
    }

    var geometry = new THREE.BufferGeometry();
    var rotationMatrix = new THREE.Matrix4();

    var verticesAttributes = [];

    for (var n = 0; n < resolution; ++n) {
        rotationMatrix.makeRotationZ(n * phi1 + startAngle).scale(new THREE.Vector3(radius, radius, 1.0));
        var verticesAttributeLocal = new THREE.BufferAttribute(createQuad(n / resolution, (n + 1) / resolution), 3);

        rotationMatrix.applyToBufferAttribute(verticesAttributeLocal);

        verticesAttributes.push(verticesAttributeLocal);
    }

    geometry.addAttribute("position", THREE.BufferGeometryUtils.mergeBufferAttributes(verticesAttributes));

    var material = new THREE.MeshBasicMaterial({
        transparent : true,
        opacity : 0.8,
        color : 0x009000,
        side : THREE.FrontSide
    });

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, material);
}

function createCircle(size: number, thickness: number, resolution: number): THREE.Mesh {
    if (resolution < 3)
        resolution = 3;

    var phi: number = 2 * Math.PI / resolution;

    function createBasicShape(phi: number): Float32Array {
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

    // mesh.geometry.applyMatrix( new THREE.Matrix4().setTranslation( -10,-22,-30 ) );

    var rotationMatrix = new THREE.Matrix4();
    var verticesAttributes = [];

    for (var n = 0; n < resolution; ++n) {
        rotationMatrix.makeRotationZ(n * phi).scale(new THREE.Vector3(size, size, 1.0));

        var verticesAttributeLocal = new THREE.BufferAttribute(createBasicShape(phi), 3);
        rotationMatrix.applyToBufferAttribute(verticesAttributeLocal);

        verticesAttributes.push(verticesAttributeLocal);
    }

    var verticesAttribute = THREE.BufferGeometryUtils.mergeBufferAttributes(verticesAttributes);
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

export {
    createWave,
    createCircle,
    range
};