import { Component, HostListener, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as THREE from 'three';

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

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x0000FF });
        var cube = new THREE.Mesh(geometry, material);

        this.scene.add(cube);
    }

    private createLight() {
        var light = new THREE.PointLight(0xFFFFFF, 1, 1000);
        light.position.set(0, 0, 100);
        this.scene.add(light);

        light = new THREE.PointLight(0xFFFFFF, 1, 1000);
        light.position.set(0, 0, 100);
        this.scene.add(light);
    }

    private createCamera() {
        let aspectRatio = this.getAspectRatio();
        this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);

        this.camera.position.x = 1;
        this.camera.position.y = 1;
        this.camera.position.z = 5;
    }

    private getAspectRatio(): number {
        let height = this.canvas.clientHeight;
        if (height === 0)
            return 0;
        return this.canvas.clientWidth / this.canvas.clientHeight;
    }

    private startRendering() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0xFFFFFF, 1);
        this.renderer.autoClear = true;

        let component: VisualizerContainerComponent = this;
        (function render() {
            component.render();
        }());
    }

    public render() {
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
    }

    ngAfterViewInit() {
        this.createScene();
        this.createLight();
        this.createCamera();
        this.startRendering();

        // this.innerWidth = window.innerWidth;
        // this.innerHeight = window.innerHeight;
    }
}
