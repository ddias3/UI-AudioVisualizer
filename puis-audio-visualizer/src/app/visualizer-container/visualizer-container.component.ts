import { Component, HostListener, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as THREE from 'three';

import { VisualizerFactory } from "../visualizers/visualizer";

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

    private visualizers: Array<any> = [];

    private testVisualizer0;
    private testVisualizerIdentities = [];

    private visualizerFactory: VisualizerFactory;

    @ViewChild("visualizers")
    canvasRef: ElementRef;

    private pathCurve: THREE.CubicBezierCurve3;

    private waveFunc = x => Math.sin(x * Math.PI);
    private waveFuncNeg = x => - 4*x + 4*x*x; // 1 - (2*x - 1) * (2*x - 1)
    private CIRCLES = [
        {
            radius : 3.6,
            thickness : 0.08,
            resolution : 256
        },
        {
            radius : 2.6,
            thickness : 0.065,
            resolution : 128
        },
        {
            radius : 1.8,
            thickness : 0.045,
            resolution : 128
        },
        {
            radius : 1.25,
            thickness : 0.04,
            resolution : 64
        },
        {
            radius : 0.8,
            thickness : 0.04,
            resolution : 64
        },
        {
            radius : 0.42,
            thickness : 0.045,
            resolution : 32
        }
    ];
    private WAVES = {
        freq : [
            {
                step : 6.0 * Math.PI / 12 + 0.2,
                wave : this.waveFunc,
                amplitude : 1.0,
                // amplitude : 0.72,
                startAngle : null,
                radius : 3.6,
                arcLength : 6.6 * Math.PI / 12,
                displayThickness : 0.08,
                resolution : 64,
                rotationMultiplier : 1.0
            },
            {
                step : 2.8 * Math.PI / 12 - 0.04,
                wave : this.waveFuncNeg,
                amplitude : 0.84,
                // amplitude : 0.56,
                startAngle : null,
                radius : 3.6,
                arcLength : 2.8 * Math.PI / 12,
                displayThickness : 0.07,
                resolution : 32,
                rotationMultiplier : -1.1
            },
            {
                step : 4.1 * Math.PI / 12 - 0.12,
                wave : this.waveFunc,
                amplitude : 0.76,
                // amplitude : 0.48,
                startAngle : null,
                radius : 2.6,
                arcLength : 4.1 * Math.PI / 12,
                displayThickness : 0.06,
                resolution : 24,
                rotationMultiplier : 1.25
            },
            {
                step : 2.5 * Math.PI / 12,
                wave : this.waveFuncNeg,
                amplitude : 0.70,
                // amplitude : 0.42,
                startAngle : null,
                radius : 2.6,
                arcLength : 2.5 * Math.PI / 12,
                displayThickness : 0.05,
                resolution : 24,
                rotationMultiplier : -1.55
            },
            {
                step : 2.8 * Math.PI / 12,
                wave : this.waveFunc,
                amplitude : 0.73,
                // amplitude : 0.45,
                startAngle : null,
                radius : 1.8,
                arcLength : 2.8 * Math.PI / 12,
                displayThickness : 0.04,
                resolution : 16,
                rotationMultiplier : 1.9
            },
            {
                step : 1.5 * Math.PI / 12,
                wave : this.waveFuncNeg,
                amplitude : 0.60,
                // amplitude : 0.32,
                startAngle : null,
                radius : 1.8,
                arcLength : 1.5 * Math.PI / 12,
                displayThickness : 0.04,
                resolution : 12,
                rotationMultiplier : -2.3
            },
            {
                step : 1.2 * Math.PI / 12,
                wave : this.waveFunc,
                amplitude : 0.58,
                // amplitude : 0.3,
                startAngle : null,
                radius : 1.25,
                arcLength : 1.2 * Math.PI / 12,
                displayThickness : 0.04,
                resolution : 10,
                rotationMultiplier : 2.75
            },
            {
                step : 0.85 * Math.PI / 12,
                wave : this.waveFuncNeg,
                amplitude : 0.55,
                // amplitude : 0.27,
                startAngle : null,
                radius : 1.25,
                arcLength : 0.8 * Math.PI / 12,
                displayThickness : 0.04,
                resolution : 12,
                rotationMultiplier : -3.15
            },
            {
                step : 0.7 * Math.PI / 12,
                wave : this.waveFunc,
                amplitude : 0.50,
                // amplitude : 0.22,
                startAngle : null,
                radius : 0.8,
                arcLength : 0.62 * Math.PI / 12,
                displayThickness : 0.05,
                resolution : 8,
                rotationMultiplier : 3.6
            },
            {
                step : 0.65 * Math.PI / 12,
                wave : this.waveFuncNeg,
                amplitude : 0.48,
                // amplitude : 0.2,
                startAngle : null,
                radius : 0.8,
                arcLength : 0.54 * Math.PI / 12,
                displayThickness : 0.05,
                resolution : 4,
                rotationMultiplier : -4.0
            },
            {
                step : 0.6 * Math.PI / 12,
                wave : this.waveFunc,
                amplitude : 0.47,
                // amplitude : 0.19,
                startAngle : null,
                radius : 0.42,
                arcLength : 0.48 * Math.PI / 12,
                displayThickness : 0.06,
                resolution : 4,
                rotationMultiplier : 4.5
            },
            {
                step : 0.8 * Math.PI / 12,
                wave : this.waveFuncNeg,
                amplitude : 0.60,
                // amplitude : 0.12,
                startAngle : null,
                radius : 0.42,
                arcLength : 0.45 * Math.PI / 12,
                displayThickness : 0.06,
                resolution : 3,
                rotationMultiplier : -5.0
            }
        ]
    };
    private AUDIO_NORMALIZATION = [
            // Low Freq
        250, 189, 180, 180,

            // Mid Freq
        170, 165, 166, 163,

            // High Freq
        155, 165, 180, 190
    ];

    private scrollVisualizers: number = 0.5;
    // private spacingCurve: THREE.CatmullRomCurve3 = new THREE.CatmullRomCurve3([
    //     new THREE.Vector3(-1.0, 0.0,   0),
    //     new THREE.Vector3(-0.8, 0.0,   0),
    //     new THREE.Vector3(-0.25, 0.08, 0),
    //     new THREE.Vector3(0.0, 0.8,    0),
    //     new THREE.Vector3(0.25, 0.08,  0),
    //     new THREE.Vector3(0.8, 0.0,    0),
    //     new THREE.Vector3(1.0, 0.0,    0),
    // ]);
    private spacingCurve: THREE.CatmullRomCurve3 = new THREE.CatmullRomCurve3([
        // new THREE.Vector3(-1.0, 0.0,   0),
        // new THREE.Vector3(-0.8, 0.0,   0),
        // new THREE.Vector3(-0.2, 0.08,  0),
        // new THREE.Vector3(0.2, 0.92,   0),
        // new THREE.Vector3(0.8, 1.0,    0),
        // new THREE.Vector3(1.0, 1.0,    0),

            // desired values are between 13/64 and 51/64
        new THREE.Vector3(-1.0, 0.0,   0),
        new THREE.Vector3(0.0, 0.0,   0),
        // new THREE.Vector3(0.1, 0.001,   0),
        new THREE.Vector3(0.42, 0.08,  0),
        new THREE.Vector3(0.58, 0.92,   0),
        // new THREE.Vector3(0.9, 1.0,    0),
        new THREE.Vector3(1.0, 1.0,    0),
        new THREE.Vector3(2.0, 1.0,    0),
    ]);
    private placeVisualizers() {
        var splineT = [];
        for (var n = 0; n < this.visualizers.length; ++n)
            splineT.push(n / this.visualizers.length);

        var actualSplineT = [];
        for (var n = 0; n < this.visualizers.length; ++n)
            actualSplineT.push(this.spacingCurve.getPoint(0.59375 * (n / this.visualizers.length) + 0.203125).y);

        for (var n = 0; n < this.visualizers.length; ++n)
            this.visualizers[n].setPosition(this.pathCurve.getPoint(actualSplineT[n]));

        this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.spacingCurve.getPoints(64)), new THREE.LineBasicMaterial({ color : 0xFFA0A0 })));
    }

    constructor(visualizerFactory: VisualizerFactory) {
        this.visualizerFactory = visualizerFactory;
        this.render = this.render.bind(this);
    }

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private createScene() {
        this.pathCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(-7, 0, -16),
            new THREE.Vector3(-1, 0.75, -10),
            new THREE.Vector3(-1, 0, 4),
            new THREE.Vector3(5, -3, 5),
        );

        var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.pathCurve.getPoints(64)), new THREE.LineBasicMaterial({ color : 0xFFFFFF }));

        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AxesHelper(8));
        this.scene.add(line);

        this.testVisualizer0 = this.visualizerFactory.eq({}, this.CIRCLES, this.WAVES);
        this.testVisualizer0.addToScene(this.scene);
        // this.testVisualizer0.setPosition(new THREE.Vector3(0, 0, 0));
        // this.testVisualizer0.setPosition(this.pathCurve.getPoint(0.5));

        this.testVisualizerIdentities = [
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity(),
            this.visualizerFactory.identity()
        ];
        this.testVisualizerIdentities.forEach(visualizer => {
            visualizer.addToScene(this.scene);
            // visualizer.setPosition(this.pathCurve.getPoint(Math.random()));
        });

        for (var n = 0; n < this.testVisualizerIdentities.length; ++n) {
            if (n == 7)
                this.visualizers.push(this.testVisualizer0);
            this.visualizers.push(this.testVisualizerIdentities[n]);
        }

        this.placeVisualizers();
    }

    private createLight() {
        var lights = [
            new THREE.PointLight(0xFFFFFF, 1, 1000),
            new THREE.PointLight(0xFFFFFF, 1, 1000),
            new THREE.AmbientLight(0x404040)
        ];
        
        lights[0].position.set(0, 10, -10);
        lights[1].position.set(0, 0, 10);

        lights.forEach(light => {
            this.scene.add(light);
        });
    }

    private createCamera() {
        let aspectRatio = this.getAspectRatio();
        this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.01, 1000);

        this.camera.position.set(-6.0, 1.5, 10.15);
        // this.camera.lookAt(this.pathCurve.getPoint(0.5));
        this.camera.lookAt(-1.361, -0.244, 0);
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
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        console.log("onResize: " + this.canvas.clientWidth + ", " + this.canvas.clientHeight);

        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.render();
    }

    private cameraMoveDelta: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    private cameraLookDelta: THREE.Vectoe3 = new THREE.Vector3(0, 0, 0);
    private scrollDelta: number = 0.0;

    @HostListener("document:keydown", ["$event"])
    public onKeyDown(event: KeyboardEvent) {
        console.log("Key Down: " + event.key);

        switch (event.key) {
            case "w":
                this.cameraMoveDelta.z = -0.08;
                break;
            case "a":
                this.cameraMoveDelta.x = -0.02;
                break;
            case "s":
                this.cameraMoveDelta.z = 0.08;
                break;
            case "d":
                this.cameraMoveDelta.x = 0.02;
                break;
            case "q":
                this.cameraMoveDelta.y = 0.02;
                break;
            case "e":
                this.cameraMoveDelta.y = -0.02;
                break;

            case "ArrowUp":
                    // Pitch
                this.cameraLookDelta.x = 0.01;
                break;
            case "ArrowLeft":
                    // Yaw
                this.cameraLookDelta.y = 0.01;
                break;
            case "ArrowDown":
                this.cameraLookDelta.x = -0.01;
                break;
            case "ArrowRight":
                this.cameraLookDelta.y = -0.01;
                break;

            case "n":
                this.scrollDelta = 0.001;
                break;
            case "m":
                this.scrollDelta = -0.001;
                break;
        }
    }

    @HostListener("document:keyup", ["$event"])
    public onKeyUp(event: KeyboardEvent) {
        console.log("Key Up: " + event.key);

        switch (event.key) {
            case "w":
                this.cameraMoveDelta.z = 0.0;
                break;
            case "a":
                this.cameraMoveDelta.x = 0.0;
                break;
            case "s":
                this.cameraMoveDelta.z = 0.0;
                break;
            case "d":
                this.cameraMoveDelta.x = 0.0;
                break;
            case "q":
                this.cameraMoveDelta.y = 0.0;
                break;
            case "e":
                this.cameraMoveDelta.y = 0.0;
                break;

            case "ArrowUp":
                    // Pitch
                this.cameraLookDelta.x = 0.0;
                break;
            case "ArrowLeft":
                    // Yaw
                this.cameraLookDelta.y = 0.0;
                break;
            case "ArrowDown":
                this.cameraLookDelta.x = 0.0;
                break;
            case "ArrowRight":
                this.cameraLookDelta.y = 0.0;
                break;

            case "n":
                this.scrollDelta = 0.0;
                break;
            case "m":
                this.scrollDelta = 0.0;
                break;
        }
    }

    public onMouseDown(event: MouseEvent) {
        console.log("onMouseDown");

        function playAudio() {
            let audio = new Audio();
            audio.src = "../../assets/ChaseMusic_mixAndMaster.mp3";
            audio.load();
            audio.play();
        }

        var rotation = 0.0;
        var component = this;

        // function updateVisualizer() {
        //     rotation += 0.004;
        //     component.testVisualizer.rotate(0.004);
        //     component.testVisualizer.morphWaves((new Array(12)).fill(Math.abs(component.waveFunc(rotation)), 0, 12));
        //     component.render();
        //     requestAnimationFrame(updateVisualizer);
        // }

        // updateVisualizer();

        // playAudio();

        // this.testVisualizerCb([6, 5, 4, 3, 2, 1,
        //                        6, 5, 4, 3, 2, 1,
        //                        6, 5, 4, 3].map(x => Math.random() * x));

        function testEQVisualizer() {
            // let audio = new Audio("../../assets/FastVer01_stems_Bass.wav");
            let audio = new Audio("../../assets/ChaseMusic_mixAndMaster.mp3");
            // let audio = new Audio("../../assets/01-White-Noise-10min.mp3");
            audio.load();

            var audioContext = new AudioContext();
            var mediaElementSrc = audioContext.createMediaElementSource(audio);
            var analyser = audioContext.createAnalyser();

            mediaElementSrc.connect(analyser);
            analyser.connect(audioContext.destination);

            analyser.fftSize = 512;

            var dataArray = new Uint8Array(analyser.frequencyBinCount);

            console.log(analyser.frequencyBinCount);

            audio.play();

            var rotation = 0.0;

            function updateVisualizer() {
                rotation += 0.004;
                analyser.getByteFrequencyData(dataArray);

                var stepSize = Math.floor(analyser.frequencyBinCount / (component.AUDIO_NORMALIZATION.length + 4));
                var freqValues = [];

                for (var n = 0; n < component.AUDIO_NORMALIZATION.length; ++n) {
                // for (var n = analyser.frequencyBinCount - stepSize; n >= 0; n -= stepSize) {
                    var binIndex = n * stepSize;
                    var value = dataArray[binIndex];
                    freqValues.push(value / component.AUDIO_NORMALIZATION[n]);
                }

                component.testVisualizer0.rotate(0.004);
                component.testVisualizer0.morphWaves(freqValues);
                // component.testVisualizer.setPosition(component.pathCurve.getPoint(-0.5 * component.waveFunc(rotation * 0.5) + 0.5));

                freqValues = [];
                for (var n = 0; n < 32; ++n) {
                    var binIndex = Math.floor(n * analyser.frequencyBinCount / 42);
                    var value = dataArray[binIndex];
                    freqValues.push(value / 250);
                }

                component.testVisualizerIdentities.forEach(visualizer => {
                    visualizer.morphBars(freqValues);
                });

                component.render();

                requestAnimationFrame(updateVisualizer);
            }

            updateVisualizer();
        }

        function testCameraControls() {

            const WORLD_PITCH_AXIS = new THREE.Vector3(1, 0, 0);
            const WORLD_YAW_AXIS   = new THREE.Vector3(0, 1, 0);

            function updateScene() {
                rotation += 0.004;

                var freqValues = [];
                for (var n = 0; n < 12; ++n)
                    freqValues.push(Math.random());

                component.testVisualizer0.rotate(0.004);
                component.testVisualizer0.morphWaves(freqValues);

                freqValues = [];
                for (var n = 0; n < 32; ++n) {
                    freqValues.push(Math.random());
                }

                component.testVisualizerIdentities.forEach(visualizer => {
                    visualizer.morphBars(freqValues);
                });

                component.scrollVisualizers += component.scrollDelta;
                component.scrollVisualizers = component.scrollVisualizers <= 0.0 ? 0.0 : component.scrollVisualizers >= 1.0 ? 1.0 : component.scrollVisualizers;

                // console.log(component.cameraMoveDelta);
                    // This math is wrong.
                // var cameraMove: THREE.Vector3 = component.cameraMoveDelta.clone().applyMatrix4(component.camera.matrix);
                // component.camera.add(cameraMove);

                component.camera.translateX(component.cameraMoveDelta.x);
                component.camera.translateY(component.cameraMoveDelta.y);
                component.camera.translateZ(component.cameraMoveDelta.z);

                component.camera.rotateOnWorldAxis(WORLD_YAW_AXIS, component.cameraLookDelta.y);
                component.camera.rotateOnAxis(WORLD_PITCH_AXIS, component.cameraLookDelta.x);

                // console.log(component.camera.getWorldPosition(new THREE.Vector3(0, 0, 0)));
                // console.log(component.camera.getWorldDirection(new THREE.Vector3(0, 0, 0)));

                component.render();

                requestAnimationFrame(updateScene);
            }

            updateScene();
        }

        // testEQVisualizer();
        testCameraControls();
    }

    ngAfterViewInit() {
        this.createScene();
        this.createLight();
        this.createCamera();
        this.startRendering();
    }
}
