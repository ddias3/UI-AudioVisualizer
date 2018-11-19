import { Component, HostListener, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as THREE from 'three';

// this is code from three.js that for some reason is inaccessible through the module import
function mergeBufferAttributes( attributes ) {

    var TypedArray;
    var itemSize;
    var normalized;
    var arrayLength = 0;

    for ( var i = 0; i < attributes.length; ++ i ) {

        var attribute = attributes[ i ];

        if ( attribute.isInterleavedBufferAttribute ) return null;

        if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
        if ( TypedArray !== attribute.array.constructor ) return null;

        if ( itemSize === undefined ) itemSize = attribute.itemSize;
        if ( itemSize !== attribute.itemSize ) return null;

        if ( normalized === undefined ) normalized = attribute.normalized;
        if ( normalized !== attribute.normalized ) return null;

        arrayLength += attribute.array.length;

    }

    var array = new TypedArray( arrayLength );
    var offset = 0;

    for ( var i = 0; i < attributes.length; ++ i ) {

        array.set( attributes[ i ].array, offset );

        offset += attributes[ i ].array.length;

    }

    return new THREE.BufferAttribute( array, itemSize, normalized );
}

@Component({
    selector: 'visualizer-container',
    templateUrl: './visualizer-container.component.html',
    styleUrls: ['./visualizer-container.component.css']
})
export class VisualizerContainerComponent implements AfterViewInit {

    innerWidth: any;
    innerHeight: any;

    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    public scene: THREE.Scene;

    public controls: THREE.OrbitControls;

    private testVisualizerCb: Function;

    @ViewChild("visualizers")
    canvasRef: ElementRef;

    constructor() {
        this.render = this.render.bind(this);
    }

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private createScene() {
        this.scene = new THREE.Scene();

        var geometry = new THREE.BoxGeometry(0.4, 1, 3);
        var texture = new THREE.TextureLoader().load("../../assets/beam0.png");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 4);
        texture.format = THREE.RGBAFormat;

        // https://stackoverflow.com/questions/17486614/three-js-png-texture-alpha-renders-as-white-instead-as-transparent
        var material = new THREE.MeshLambertMaterial({
            map : texture,
            transparent : true,
            opacity : 1.0,
            color : 0x00FF00
        });
        var cube = new THREE.Mesh(geometry, material);

        // this.scene.add(cube);
        this.scene.add(new THREE.AxesHelper(5));
        // this.scene.add(this.createCircle(1.0, 0.05, 32));
        this.createEQVisualizer();
    }

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
            this.scene.add(cube);
        });

        return setHeights;
    }

    private createEQVisualizer() {
        const waveFunc = x => Math.sin(x * Math.PI);
        const waveFuncNeg = x => - 4*x + 4*x*x; // 1 - (2*x - 1) * (2*x - 1)
        const CIRCLES = [
            {
                radius : 3.6,
                thickness : 0.08
            },
            {
                radius : 2.6,
                thickness : 0.065
            },
            {
                radius : 1.8,
                thickness : 0.045
            },
            {
                radius : 1.25,
                thickness : 0.04
            },
            {
                radius : 0.8,
                thickness : 0.04
            },
            {
                radius : 0.42,
                thickness : 0.04
            }
        ];
        const WAVES = {
            freq : [
                {
                    step : 6.0 * Math.PI / 12 + 0.2,
                    wave : waveFunc,
                    amplitude : 0.72,
                    startAngle : null,
                    radius : 3.6,
                    arcLength : 6.6 * Math.PI / 12,
                    displayThickness : 0.08,
                    resolution : 32
                },
                {
                    step : 2.8 * Math.PI / 12 - 0.04,
                    wave : waveFuncNeg,
                    amplitude : 0.56,
                    startAngle : null,
                    radius : 3.6,
                    arcLength : 2.8 * Math.PI / 12,
                    displayThickness : 0.07,
                    resolution : 32
                },
                {
                    step : 4.1 * Math.PI / 12 - 0.12,
                    wave : waveFunc,
                    amplitude : 0.48,
                    startAngle : null,
                    radius : 2.6,
                    arcLength : 4.1 * Math.PI / 12,
                    displayThickness : 0.06,
                    resolution : 32
                },
                {
                    step : 2.5 * Math.PI / 12,
                    wave : waveFuncNeg,
                    amplitude : 0.42,
                    startAngle : null,
                    radius : 2.6,
                    arcLength : 2.5 * Math.PI / 12,
                    displayThickness : 0.05,
                    resolution : 32
                },
                {
                    step : 2.8 * Math.PI / 12,
                    wave : waveFunc,
                    amplitude : 0.45,
                    startAngle : null,
                    radius : 1.8,
                    arcLength : 2.8 * Math.PI / 12,
                    displayThickness : 0.04,
                    resolution : 24
                },
                {
                    step : 1.5 * Math.PI / 12,
                    wave : waveFuncNeg,
                    amplitude : 0.32,
                    startAngle : null,
                    radius : 1.8,
                    arcLength : 1.5 * Math.PI / 12,
                    displayThickness : 0.04,
                    resolution : 24
                },
                {
                    step : 1.2 * Math.PI / 12,
                    wave : waveFunc,
                    amplitude : 0.3,
                    startAngle : null,
                    radius : 1.25,
                    arcLength : 1.2 * Math.PI / 12,
                    displayThickness : 0.04,
                    resolution : 16
                },
                {
                    step : 0.85 * Math.PI / 12,
                    wave : waveFuncNeg,
                    amplitude : 0.27,
                    startAngle : null,
                    radius : 1.25,
                    arcLength : 0.8 * Math.PI / 12,
                    displayThickness : 0.04,
                    resolution : 12
                },
                {
                    step : 0.7 * Math.PI / 12,
                    wave : waveFunc,
                    amplitude : 0.22,
                    startAngle : null,
                    radius : 0.8,
                    arcLength : 0.62 * Math.PI / 12,
                    displayThickness : 0.05,
                    resolution : 10
                },
                {
                    step : 0.65 * Math.PI / 12,
                    wave : waveFuncNeg,
                    amplitude : 0.2,
                    startAngle : null,
                    radius : 0.8,
                    arcLength : 0.54 * Math.PI / 12,
                    displayThickness : 0.05,
                    resolution : 8
                },
                {
                    step : 0.6 * Math.PI / 12,
                    wave : waveFunc,
                    amplitude : 0.19,
                    startAngle : null,
                    radius : 0.42,
                    arcLength : 0.48 * Math.PI / 12,
                    displayThickness : 0.06,
                    resolution : 6
                },
                {
                    step : 0.8 * Math.PI / 12,
                    wave : waveFuncNeg,
                    amplitude : 0.12,
                    startAngle : null,
                    radius : 0.42,
                    arcLength : 0.45 * Math.PI / 12,
                    displayThickness : 0.06,
                    resolution : 4
                }
            ]
        };

        var circles: Array<THREE.Mesh> = [
            this.createCircle(CIRCLES[0].radius, CIRCLES[0].thickness, 256),
            this.createCircle(CIRCLES[1].radius, CIRCLES[1].thickness, 128),
            this.createCircle(CIRCLES[2].radius, CIRCLES[2].thickness, 128),
            this.createCircle(CIRCLES[3].radius, CIRCLES[3].thickness, 64),
            this.createCircle(CIRCLES[4].radius, CIRCLES[4].thickness, 64),
            this.createCircle(CIRCLES[5].radius, CIRCLES[5].thickness, 32)
        ];

        circles.forEach(circle => { this.scene.add(circle); });

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

        WAVES.freq.forEach(freq => {
            range(freq.step)
                .map(startAngle => this.createWave(freq.wave, freq.amplitude, startAngle, freq.radius, freq.arcLength, freq.displayThickness, freq.resolution))
                .forEach(wave => this.scene.add(wave));
        });

        //(waveFunc: Function, amplitude: number, startAngle: number, radius: number, arcLength: number, displayThickness: number = 0.02, resolution: number = 32): THREE.Mesh

        // var lowestFreq = range(6.0 * Math.PI / 12 + 0.2);
        // lowestFreq = lowestFreq.map(startAngle => this.createWave(waveFunc, 0.72, startAngle, 3.6, 6.6 * Math.PI / 12, 0.08, 32));
        // lowestFreq.forEach(x => this.scene.add(x));

        // var secondLowestFreq = range(2.8 * Math.PI / 12 - 0.04);
        // secondLowestFreq = secondLowestFreq.map(startAngle => this.createWave(waveFuncNeg, 0.56, startAngle, 3.6, 2.8 * Math.PI / 12, 0.07, 32));
        // secondLowestFreq.forEach(x => this.scene.add(x));

        // var thirdLowestFreq = range(4.1 * Math.PI / 12 - 0.12);
        // thirdLowestFreq = thirdLowestFreq.map(startAngle => this.createWave(waveFunc, 0.48, startAngle, 2.6, 4.1 * Math.PI / 12, 0.06, 32));
        // thirdLowestFreq.forEach(x => this.scene.add(x));

        // var fourthLowestFreq = range(2.5 * Math.PI / 12);
        // fourthLowestFreq = fourthLowestFreq.map(startAngle => this.createWave(waveFuncNeg, 0.42, startAngle, 2.6, 2.5 * Math.PI / 12, 0.05, 32));
        // fourthLowestFreq.forEach(x => this.scene.add(x));

        // var fifthLowestFreq = range(2.8 * Math.PI / 12);
        // fifthLowestFreq = fifthLowestFreq.map(startAngle => this.createWave(waveFunc, 0.45, startAngle, 1.8, 2.8 * Math.PI / 12, 0.04, 24));
        // fifthLowestFreq.forEach(x => this.scene.add(x));

        // var sixthLowestFreq = range(1.5 * Math.PI / 12);
        // sixthLowestFreq = sixthLowestFreq.map(startAngle => this.createWave(waveFuncNeg, 0.32, startAngle, 1.8, 1.5 * Math.PI / 12, 0.04, 24));
        // sixthLowestFreq.forEach(x => this.scene.add(x));

        // var seventhLowestFreq = range(1.2 * Math.PI / 12);
        // seventhLowestFreq = seventhLowestFreq.map(startAngle => this.createWave(waveFunc, 0.3, startAngle, 1.25, 1.2 * Math.PI / 12, 0.04, 16));
        // seventhLowestFreq.forEach(x => this.scene.add(x));

        // var eighthLowestFreq = range(0.85 * Math.PI / 12);
        // eighthLowestFreq = eighthLowestFreq.map(startAngle => this.createWave(waveFuncNeg, 0.27, startAngle, 1.25, 0.8 * Math.PI / 12, 0.04, 12));
        // eighthLowestFreq.forEach(x => this.scene.add(x));

        // var ninethLowestFreq = range(0.7 * Math.PI / 12);
        // ninethLowestFreq = ninethLowestFreq.map(startAngle => this.createWave(waveFunc, 0.22, startAngle, 0.8, 0.62 * Math.PI / 12, 0.05, 10));
        // ninethLowestFreq.forEach(x => this.scene.add(x));

        // var tenthLowestFreq = range(0.65 * Math.PI / 12);
        // tenthLowestFreq = tenthLowestFreq.map(startAngle => this.createWave(waveFuncNeg, 0.2, startAngle, 0.8, 0.54 * Math.PI / 12, 0.05, 8));
        // tenthLowestFreq.forEach(x => this.scene.add(x));

        // var eleventhLowestFreq = range(0.6 * Math.PI / 12);
        // eleventhLowestFreq = eleventhLowestFreq.map(startAngle => this.createWave(waveFunc, 0.19, startAngle, 0.42, 0.48 * Math.PI / 12, 0.06, 6));
        // eleventhLowestFreq.forEach(x => this.scene.add(x));

        // var twelthLowestFreq = range(0.8 * Math.PI / 12);
        // twelthLowestFreq = twelthLowestFreq.map(startAngle => this.createWave(waveFuncNeg, 0.12, startAngle, 0.42, 0.45 * Math.PI / 12, 0.06, 4));
        // twelthLowestFreq.forEach(x => this.scene.add(x));
    }

    private createWave(waveFunc: Function, amplitude: number, startAngle: number, radius: number, arcLength: number, displayThickness: number = 0.02, resolution: number = 32): THREE.Mesh {
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

        geometry.addAttribute("position", mergeBufferAttributes(verticesAttributes));

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

    private createCircle(size: number, thickness: number, resolution: number): THREE.Mesh {
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

        var verticesAttribute = mergeBufferAttributes(verticesAttributes);
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

    private createLight() {
        var light = new THREE.PointLight(0xFFFFFF, 1, 1000);
        light.position.set(0, 10, -10);
        this.scene.add(light);

        var light = new THREE.PointLight(0xFFFFFF, 1, 1000);
        light.position.set(0, 0, 10);
        this.scene.add(light);

        var light = new THREE.AmbientLight(0x404040);
        this.scene.add( light );
    }

    private createCamera() {
        let aspectRatio = this.getAspectRatio();
        this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);

        this.camera.position.set(-3, 1, 8);
        this.camera.lookAt(0, 0, 0);
    }

    private getAspectRatio(): number {
        let height = this.canvas.clientHeight;
        if (height === 0)
            return 0;
        return this.canvas.clientWidth / this.canvas.clientHeight;
    }

    private startRendering() {
        let canvas = this.canvas;
        let context = canvas.getContext("webgl2");
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            context: context,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // this.renderer.setClearColor(0xFFFFFF, 1);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.autoClear = true;

        let component: VisualizerContainerComponent = this;
        (function render() {
            console.log("The Actual Render Call");
            component.render();
        }());
    }

    public render() {
            // The render call is what redraws the 3D scene
        this.renderer.render(this.scene, this.camera);
    }

    @HostListener("window:resize", ["$event"])
    onResize(event) {
        // this.innerWidth = window.innerWidth;
        // this.innerHeight = window.innerHeight;
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        console.log("onResize: " + this.canvas.clientWidth + ", " + this.canvas.clientHeight);

        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.render();
    }

    public onMouseDown(event: MouseEvent) {
        console.log("onMouseDown");

        function playAudio() {
            let audio = new Audio();
            audio.src = "../../assets/ChaseMusic_mixAndMaster.mp3";
            audio.load();
            audio.play();
        }
        // playAudio();

        // this.testVisualizerCb([6, 5, 4, 3, 2, 1,
        //                        6, 5, 4, 3, 2, 1,
        //                        6, 5, 4, 3].map(x => Math.random() * x));

        var component = this;

        function testVisualizer() {
            let audio = new Audio("../../assets/ChaseMusic_mixAndMaster.mp3");
            audio.load();

            var audioContext = new AudioContext();
            var mediaElementSrc = audioContext.createMediaElementSource(audio);
            var analyser = audioContext.createAnalyser();

            mediaElementSrc.connect(analyser);
            analyser.connect(audioContext.destination);

            analyser.fftSize = 1024;

            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);

            console.log(bufferLength);

            audio.play();

            function updateVisualizer() {
                analyser.getByteFrequencyData(dataArray);

                var stepSize = bufferLength / 16;
                var heights = [];

                for (var n = 0; n < bufferLength; n += stepSize) {
                    var value = dataArray[n];
                    if (value <= 0.5)
                        value = 0.5
                    heights.push((value - 0.5) / (10 - 0.5) + 0.5);
                }

                component.testVisualizerCb(heights);
                component.render();

                requestAnimationFrame(updateVisualizer);
            }

            updateVisualizer();
        }

        testVisualizer();
    }

    ngAfterViewInit() {
        this.createScene();
        this.createLight();
        this.createCamera();
        this.startRendering();

        // this.innerWidth = window.innerWidth;
        // this.innerHeight = window.innerHeight;
    }

    // temp = function onChange() {
    //     var audio: HTMLAudioElement = new Audio("../../assets/ChaseMusic_mixAndMaster.mp3");
    //     audio.src = "../../assets/ChaseMusic_mixAndMaster.mp3"; //URL.createObjectURL("../../assets/ChaseMusic_mixAndMaster.mp3");
    //     audio.load();
    //     audio.play();
    //     var context = new AudioContext();
    //     var src = context.createMediaElementSource(audio);
    //     var analyser = context.createAnalyser();

    //     var canvas = document.getElementById("canvas");
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;
    //     var ctx = canvas.getContext("2d");

    //     src.connect(analyser);
    //     analyser.connect(context.destination);

    //     analyser.fftSize = 256;

    //     var bufferLength = analyser.frequencyBinCount;
    //     console.log(bufferLength);

    //     var dataArray = new Uint8Array(bufferLength);

    //     var WIDTH = canvas.width;
    //     var HEIGHT = canvas.height;

    //     var barWidth = (WIDTH / bufferLength) * 2.5;
    //     var barHeight;
    //     var x = 0;

    //     function renderFrame() {
    //       requestAnimationFrame(renderFrame);

    //       x = 0;

    //       analyser.getByteFrequencyData(dataArray);

    //       ctx.fillStyle = "#000";
    //       ctx.fillRect(0, 0, WIDTH, HEIGHT);

    //       for (var i = 0; i < bufferLength; i++) {
    //         barHeight = dataArray[i];
            
    //         var r = barHeight + (25 * (i/bufferLength));
    //         var g = 250 * (i/bufferLength);
    //         var b = 50;

    //         ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    //         ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

    //         x += barWidth + 1;
    //       }
    //     }

    //     audio.play();
    //     renderFrame();
    // }
}
