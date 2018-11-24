import { Component, HostListener, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as THREE from 'three';

import { VisualizersService } from "../visualizers/visualizers.service";

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

    @ViewChild("visualizers")
    canvasRef: ElementRef;

    private visualizersService: VisualizersService;

    private currentView = "multi";
    private views = {
        multi : {
            userActiveVisualizer : undefined,
            camera : {
                location : new THREE.Vector3(-6.0, 1.5, 10.15),
                lookAt : new THREE.Vector3(-1.361, -0.244, 0),
                fov : 45
            }
        },
        single : {
            userActiveVisualizer : undefined,
            camera : {
                location : new THREE.Vector3(0, 100, 17),
                lookAt : new THREE.Vector3(0, 100, 0),
                fov : 30
            }
        }
    };

    private userActiveVisualizer;

    private pathCurve: THREE.CubicBezierCurve3;

    private scrollVisualizers: number = 0.5;
    private spacingFunc = function () {
        const point0 = new THREE.Vector2(-1.0, 0.0);
        const point1 = new THREE.Vector2(0.4, 0.15);
        const point2 = new THREE.Vector2(0.6, 0.85);
        const point3 = new THREE.Vector2(2.0, 1.0);
        return x => {
            if (x < point1.x)
                return (point1.y - point0.y) / (point1.x - point0.x) * (x - point0.x) + point0.y;
            else if (x < point2.x)
                return (point2.y - point1.y) / (point2.x - point1.x) * (x - point1.x) + point1.y;
            else
                return (point3.y - point2.y) / (point3.x - point2.x) * (x - point1.x) + point2.y;
        };
    }();

    private placeVisualizers() {
        var visualizers = this.visualizersService.visualizers;
        var splineT = [];
        for (var n = 0; n < visualizers.length; ++n)
            splineT.push(n / visualizers.length);

        var actualSplineT = [];
        for (var n = 0; n < visualizers.length; ++n)
            actualSplineT.push(this.spacingFunc((n / visualizers.length) + 2 * this.scrollVisualizers - 0.5));

        for (var n = 0; n < visualizers.length; ++n)
            visualizers[n].setPosition(this.pathCurve.getPoint(actualSplineT[n]));

        if (this.currentView === "single")
            this.userActiveVisualizer.setPosition(this.views[this.currentView].camera.lookAt);        
    }

    constructor(visualizersService: VisualizersService) {
        this.visualizersService = visualizersService;
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

        // var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.pathCurve.getPoints(64)), new THREE.LineBasicMaterial({ color : 0xFFFFFF }));

        this.scene = new THREE.Scene();
        // this.scene.add(new THREE.AxesHelper(8));
        // this.scene.add(line);

        this.userActiveVisualizer = this.visualizersService.createVisualizer("identity", this.scene);
    }

    private createLight() {
        var lights = [
            new THREE.PointLight(0xFFFFFF, 1, 1000),
            new THREE.PointLight(0xFFFFFF, 1, 1000),
            new THREE.AmbientLight(0x404040)
        ];
        
        lights[0].position.set(0, 10, -12);
        lights[1].position.set(0, 0, 10);

        lights.forEach(light => {
            this.scene.add(light);
        });
    }

    private createCamera() {
        let aspectRatio = this.getAspectRatio();
        this.camera = new THREE.PerspectiveCamera(100, aspectRatio, 0.01, 1000);
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
        this.renderer.setClearColor(0x080808, 1);
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

    public setView(viewId) {
        this.camera.fov = this.views[viewId].camera.fov;
        this.camera.updateProjectionMatrix();

        this.camera.position.set(this.views[viewId].camera.location.x, this.views[viewId].camera.location.y, this.views[viewId].camera.location.z);
        this.camera.lookAt(this.views[viewId].camera.lookAt);

        this.views[viewId].userActiveVisualizer = this.userActiveVisualizer;
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
            case "1":
                this.userActiveVisualizer = this.visualizersService.createVisualizer("identity", this.scene);
                break;
            case "2":
                this.userActiveVisualizer = this.visualizersService.createVisualizer("eq", this.scene);
                break;
            case "3":
                this.userActiveVisualizer = this.visualizersService.createVisualizer("noise", this.scene);
                break;
            case "4":
                this.userActiveVisualizer = this.visualizersService.createVisualizer("comp", this.scene);
                break;

            case "[":
                this.currentView = "multi";
                this.setView(this.currentView);
                break;
            case "]":
                this.currentView = "single";
                this.setView(this.currentView);
                break;

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
                this.scrollDelta = 0.004;
                break;
            case "m":
                this.scrollDelta = -0.004;
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

            // function updateVisualizer() {
            //     rotation += 0.004;
            //     analyser.getByteFrequencyData(dataArray);

            //     var stepSize = Math.floor(analyser.frequencyBinCount / (component.AUDIO_NORMALIZATION.length + 4));
            //     var freqValues = [];

            //     for (var n = 0; n < component.AUDIO_NORMALIZATION.length; ++n) {
            //     // for (var n = analyser.frequencyBinCount - stepSize; n >= 0; n -= stepSize) {
            //         var binIndex = n * stepSize;
            //         var value = dataArray[binIndex];
            //         freqValues.push(value / component.AUDIO_NORMALIZATION[n]);
            //     }

            //     component.testVisualizer0.rotate(0.004);
            //     component.testVisualizer0.morphWaves(freqValues);
            //     // component.testVisualizer.setPosition(component.pathCurve.getPoint(-0.5 * component.waveFunc(rotation * 0.5) + 0.5));

            //     freqValues = [];
            //     for (var n = 0; n < 32; ++n) {
            //         var binIndex = Math.floor(n * analyser.frequencyBinCount / 42);
            //         var value = dataArray[binIndex];
            //         freqValues.push(value / 250);
            //     }

            //     component.testVisualizerIdentities.forEach(visualizer => {
            //         visualizer.morphBars(freqValues);
            //     });

            //     component.render();

            //     requestAnimationFrame(updateVisualizer);
            // }

            // updateVisualizer();
        }

        function testCameraControls() {

            const WORLD_PITCH_AXIS = new THREE.Vector3(1, 0, 0);
            const WORLD_YAW_AXIS   = new THREE.Vector3(0, 1, 0);

            function updateScene() {
                rotation += 0.004;

                var freqValues = [];
                for (var n = 0; n < 256; ++n)
                    freqValues.push(Math.random());

                component.visualizersService.updateVisualizers(Math.random(), freqValues);

                component.scrollVisualizers += component.scrollDelta;
                component.scrollVisualizers = component.scrollVisualizers <= 0.0 ? 0.0 : component.scrollVisualizers >= 1.0 ? 1.0 : component.scrollVisualizers;
                component.placeVisualizers();

                component.camera.translateX(component.cameraMoveDelta.x);
                component.camera.translateY(component.cameraMoveDelta.y);
                component.camera.translateZ(component.cameraMoveDelta.z);

                component.camera.rotateOnWorldAxis(WORLD_YAW_AXIS, component.cameraLookDelta.y);
                component.camera.rotateOnAxis(WORLD_PITCH_AXIS, component.cameraLookDelta.x);

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

        this.setView("multi");
        this.placeVisualizers();

        this.startRendering();
    }
}
