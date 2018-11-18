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

        this.scene.add(cube);
        this.scene.add(new THREE.AxesHelper(5));
        this.scene.add(this.createCircle(1, 16));
        this.scene.add(this.createLightning());

        this.testVisualizerCb = this.createTestVisualizer();

        this.testVisualizerCb([6, 5, 4, 3, 2, 1,
                               6, 5, 4, 3, 2, 1,
                               0.5, 0.05, 0.005, 0.0005]);
    }

    private createTestVisualizer() {
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

    private createCircle(size: number, resolution: number): void {
        if (resolution < 3)
            resolution = 3;

        var phi: number = 2 * Math.PI / resolution;

        function createBasicShape(phi: number): Float32Array {
            return new Float32Array([
                1.0, 0.0, 0.0,
                1.05, 0.0, 0.0,
                Math.cos(phi) * 1.05, Math.sin(phi) * 1.05, 0.0,

                1.0, 0.0, 0.0,
                Math.cos(phi) * 1.05, Math.sin(phi) * 1.05, 0.0,
                Math.cos(phi), Math.sin(phi), 0.0
            ]);
        }

        var geometry = new THREE.BufferGeometry();

        // mesh.geometry.applyMatrix( new THREE.Matrix4().setTranslation( -10,-22,-30 ) );

        var rotationMatrix = new THREE.Matrix4();
        var verticesAttributes = [];

        for (var n = 0; n < resolution; ++n) {
            rotationMatrix.makeRotationZ(n * phi);

            var verticesAttributeLocal = new THREE.BufferAttribute(createBasicShape(phi), 3);
            rotationMatrix.applyToBufferAttribute(verticesAttributeLocal);

            verticesAttributes.push(verticesAttributeLocal);
        }

        var verticesAttribute = mergeBufferAttributes(verticesAttributes);
        geometry.addAttribute("position", verticesAttribute);

        var material = new THREE.MeshLambertMaterial({
            color: 0x00FF00,
            side: THREE.DoubleSide
        });

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        return new THREE.Mesh(geometry, material);
    }

    private createLightning() {
        // I was going to implement the code brought forth by this StackOverflow post, but I've already wasted 4 hours
        //   and have nothing to show for it, so I'm scrapping a texture on the flailing parts completely.
        // https://stackoverflow.com/questions/20661941/how-to-map-texture-on-a-custom-non-square-quad-in-three-js
        const resolution = 16;

        const phi: number = 2 * Math.PI / resolution;

        function createBasicShape(phi: number, distance0: number, distance1: number): Object {
            const TR = {
                x : Math.cos(phi) * 1.09 * distance1,
                y : Math.sin(phi) * 1.09 * distance1
            };
            const TL = {
                x : Math.cos(phi) * distance0,
                y : Math.sin(phi) * distance0
            };
            const BR = {
                x : 1.09 * distance1,
                y : 0.0
            };
            const BL = {
                x : distance0,
                y : 0.0
            };

            var valueBuffer = new Float32Array([
                BL.x, BL.y, 0.0, //distance0, 0.0, 0.0,
                BR.x, BR.y, 0.0, //1.09 * distance1, 0.0, 0.0,
                TR.x, TR.y, 0.0, //Math.cos(phi) * 1.09 * distance1, Math.sin(phi) * 1.09 * distance1, 0.0,

                BL.x, BL.y, 0.0, //distance0, 0.0, 0.0,
                TR.x, TR.y, 0.0, //Math.cos(phi) * 1.09 * distance1, Math.sin(phi) * 1.09 * distance1, 0.0,
                TL.x, TL.y, 0.0, //Math.cos(phi) * distance0, Math.sin(phi) * distance0, 0.0
            ]);
            var topWidth = Math.sqrt(Math.pow(TR.x - TL.x, 2) + Math.pow(TR.y - TL.y, 2));
            var bottomWidth = Math.sqrt(Math.pow(BR.x - BL.x, 2) + Math.pow(BR.y - BL.y, 2));
            var ratio = topWidth / bottomWidth;

            var UVs = [
                new THREE.Vector2(0, ratio),
                new THREE.Vector2(0, 0),
                new THREE.Vector2(1.0, 0),
                new THREE.Vector2(ratio, ratio)
            ];

            return {
                "valueBuffer" : valueBuffer,
                "topWidth" : topWidth,
                "bottomWidth" : bottomWidth,
                "ratio" : ratio
            };
        }

        var geometry = new THREE.BufferGeometry();

        var distances = Array.apply(null, Array(resolution)).map(() => 1.5);

        var rotationMatrix = new THREE.Matrix4();
        var verticesAttributes = [];

        for (var n = 0; n < resolution; ++n) {
            rotationMatrix.makeRotationZ(n * phi);

            var verticesAttributeLocal = new THREE.BufferAttribute(createBasicShape(phi, distances[n], distances[(n + 1) % resolution])["valueBuffer"], 3);
            rotationMatrix.applyToBufferAttribute(verticesAttributeLocal);

            verticesAttributes.push(verticesAttributeLocal);
        }

        var verticesAttribute = mergeBufferAttributes(verticesAttributes);
        geometry.addAttribute("position", verticesAttribute);

        var texture = new THREE.TextureLoader().load("../../assets/beam0.png", undefined, undefined, function (error) { console.error(error); });

        // https://stackoverflow.com/questions/17486614/three-js-png-texture-alpha-renders-as-white-instead-as-transparent
        var material = new THREE.MeshBasicMaterial({
            color : 0x00FF00,
            side : THREE.FrontSide,
            map : texture,
            opacity : 1.0,
            transparent : true
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

        this.camera.position.set(-1, 1, 5);
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
        this.renderer.setClearColor(0xFFFFFF, 1);
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
