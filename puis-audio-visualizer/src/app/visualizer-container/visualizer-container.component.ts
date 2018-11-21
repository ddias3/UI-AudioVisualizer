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

    private pathCurve: THREE.CubicBezierCurve;

    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    public scene: THREE.Scene;

    private testVisualizer;

    private visualizerFactory: VisualizerFactory;

    @ViewChild("visualizers")
    canvasRef: ElementRef;

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
                resolution : 32,
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
                rotationMultiplier : 1.1
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
                rotationMultiplier : 1.55
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
                rotationMultiplier : 2.3
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
                rotationMultiplier : 3.15
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
                rotationMultiplier : 4.0
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
                rotationMultiplier : 5.0
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

    constructor(visualizerFactory: VisualizerFactory) {
        this.visualizerFactory = visualizerFactory;
        this.render = this.render.bind(this);
    }

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private createScene() {
        var pathCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(-3, -2, -16),
            new THREE.Vector3(0, 0.75, -10),
            new THREE.Vector3(0, 0.75, 10),
            new THREE.Vector3(2, -2, 10),
        );

        var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathCurve.getPoints(64)), new THREE.LineBasicMaterial({ color : 0xFFFFFF }));

        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AxesHelper(8));
        this.scene.add(line);

        this.testVisualizer = this.visualizerFactory.eq({}, this.CIRCLES, this.WAVES);
        this.testVisualizer.addToScene(this.scene);
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

        var rotation = 0.0;
        var component = this;

        function updateVisualizer() {
            rotation += 0.004;
            component.testVisualizer.rotate(0.004);

            component.render();
            requestAnimationFrame(updateVisualizer);
        }

        updateVisualizer();

        // playAudio();

        // this.testVisualizerCb([6, 5, 4, 3, 2, 1,
        //                        6, 5, 4, 3, 2, 1,
        //                        6, 5, 4, 3].map(x => Math.random() * x));

        // var component = this;

        // function testEQVisualizer() {
        //     // let audio = new Audio("../../assets/FastVer01_stems_Bass.wav");
        //     let audio = new Audio("../../assets/ChaseMusic_mixAndMaster.mp3");
        //     // let audio = new Audio("../../assets/01-White-Noise-10min.mp3");
        //     audio.load();

        //     var audioContext = new AudioContext();
        //     var mediaElementSrc = audioContext.createMediaElementSource(audio);
        //     var analyser = audioContext.createAnalyser();

        //     mediaElementSrc.connect(analyser);
        //     analyser.connect(audioContext.destination);

        //     analyser.fftSize = 512;

        //     var dataArray = new Uint8Array(analyser.frequencyBinCount);

        //     console.log(analyser.frequencyBinCount);

        //     audio.play();

        //     var rotation = 0.0;

        //     function updateVisualizer() {
        //         rotation += 0.004;
        //         analyser.getByteFrequencyData(dataArray);

        //         var stepSize = Math.floor(analyser.frequencyBinCount / (component.AUDIO_NORMALIZATION.length + 4));
        //         var freqValues = [];

        //         for (var n = 0; n < component.AUDIO_NORMALIZATION.length; ++n) {
        //         // for (var n = analyser.frequencyBinCount - stepSize; n >= 0; n -= stepSize) {
        //             var binIndex = n * stepSize;
        //             var value = dataArray[binIndex];
        //             freqValues.push(value / component.AUDIO_NORMALIZATION[n]);
        //         }

        //         console.log(freqValues);

        //         component.testVisualizerCb(rotation, freqValues);
        //         component.render();

        //         requestAnimationFrame(updateVisualizer);
        //     }

        //     updateVisualizer();
        // }

        // testEQVisualizer();
    }

    ngAfterViewInit() {
        this.createScene();
        this.createLight();
        this.createCamera();
        this.startRendering();
    }
}
