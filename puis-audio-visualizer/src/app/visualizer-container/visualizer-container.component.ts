import { Component, HostListener, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as THREE from 'three';
import * as Hammer from "hammerjs";

import { VisualizersService } from "../visualizers/visualizers.service";
import { MainService } from "../app-service/app-service.service";

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

    private mainService: MainService;
    private visualizersService: VisualizersService;

    private hammerInstance: Hammer;

    private views = {
        multi : {
            userActiveVisualizer : undefined,
            camera : {
                location : new THREE.Vector3(-6.0, 1.5, 10.15),
                lookAt : new THREE.Vector3(-1.361, -0.244, 0),
                fov : 55
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

    private newVisualizersButtons = [];

    private pathCurve: THREE.CubicBezierCurve3;

    private scrollVisualizers: number = 0.5;
    private spacingFunc = function () {
        const point0 = new THREE.Vector2(-1.5, 0.0);
        const point1 = new THREE.Vector2(-0.5, 0.1);
        const point2 = new THREE.Vector2(0.5, 0.9);
        const point3 = new THREE.Vector2(1.5, 1.0);
        return x => {
            if (x < point1.x)
                return (point1.y - point0.y) / (point1.x - point0.x) * (x - point0.x) + point0.y;
            else if (x < point2.x)
                return (point2.y - point1.y) / (point2.x - point1.x) * (x - point1.x) + point1.y;
            else
                return (point3.y - point2.y) / (point3.x - point2.x) * (x - point2.x) + point2.y;
        };
    }();

    private placeVisualizers() {
        var visualizers = this.visualizersService.visualizers;
        var actualSplineT;

        if (visualizers.length > 3) {
            var splineT = [];
            for (var n = 0; n < visualizers.length; ++n)
                splineT.push(n);

            var windowMoveDistance = splineT.length - 3;
            var windowLocation = this.scrollVisualizers * windowMoveDistance;

            actualSplineT = [];
            for (var n = 0; n < visualizers.length; ++n)
                actualSplineT.push(this.spacingFunc(0.5 * (splineT[n] - windowLocation - 1)));
        }
        else if (visualizers.length > 2) {
            actualSplineT = [ this.spacingFunc(-0.5), this.spacingFunc(0.0), this.spacingFunc(0.5) ];
        }
        else {
            actualSplineT = [ this.spacingFunc(0.0), this.spacingFunc(100) ];
        }

        for (var n = 0; n < visualizers.length; ++n) {
            visualizers[n].setPosition(this.pathCurve.getPoint(actualSplineT[n]));
            // if (visualizers[n].rotate)
            //     visualizers[n].rotate(rotation);
        }

        if (this.currentDraggingVisualizer)
            this.currentDraggingVisualizer.setPosition(this.currentDraggedLocation);

        if (this.mainService.getView() === "single" && this.mainService.getActive())
            this.mainService.getActive().setPosition(this.views[this.mainService.getView()].camera.lookAt);
    }

    constructor(mainService: MainService, visualizersService: VisualizersService) {
        this.visualizersService = visualizersService;
        this.render = this.render.bind(this);

        var comp = this;
        this.mainService = mainService;
        this.mainService.registerEvent("onViewChange", function (newView) {
            comp.currentDraggingVisualizer = undefined;
            comp.scrollDelta = 0.0;
            comp.currentDraggingNewVisualizer = false;
            comp.currentDraggingLeftButton = false;
            comp.setView(newView);
            comp.placeVisualizers();
        });

        comp.mainService.registerEvent("buttonsLoaded", function (elementEqBox, elementNoiseBox, elementCompBox) {
            comp.newVisualizersButtons.push(elementEqBox);
            comp.newVisualizersButtons.push(elementNoiseBox);
            comp.newVisualizersButtons.push(elementCompBox);
        });
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

        this.visualizersService.createVisualizer("identity", this.scene);
        this.mainService.trigger("onActiveChange", [this.visualizersService.createVisualizer("identity", this.scene)]);
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
        (function renderLoop() {
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

        this.views[viewId].userActiveVisualizer = this.mainService.getActive();
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

    private currentDraggingVisualizer = undefined;
    private currentDraggedLocation = new THREE.Vector3();
    private currentDraggingNewVisualizer = false;
    private currentDraggingLeftButton = false;
    private multiViewDrag(event) {
        if (!this.currentDraggingLeftButton && event.center.x > this.newVisualizersButtons[0].right) {
            this.currentDraggingLeftButton = true;
        }
        else if (event.center.x < 30 && this.currentDraggingLeftButton) {
            this.visualizersService.removeVisualizer(this.currentDraggingVisualizer, this.scene);
            this.currentDraggingVisualizer = undefined;
            this.mainService.trigger("setActive", [this.currentDraggingVisualizer]);
        }
        else if (event.center.y < 20 && this.currentDraggingVisualizer) {
            this.mainService.trigger("setActive", [this.currentDraggingVisualizer]);
            this.mainService.trigger("onViewChange", ["single"]);
        }
        else {
            var nearPlane = new THREE.Vector3(
                2 * event.center.x / this.canvas.clientWidth - 1,
                -(2 * event.center.y / this.canvas.clientHeight - 1),
                -1
            ).unproject(this.camera);
            var farPlane = new THREE.Vector3(
                2 * event.center.x / this.canvas.clientWidth - 1,
                -(2 * event.center.y / this.canvas.clientHeight - 1),
                1
            ).unproject(this.camera);

            if (!this.currentDraggingNewVisualizer)
                this.scrollDelta = 0.08 * (-event.deltaX / 300) / this.visualizersService.visualizers.length;

            // var testGeometry = new THREE.Geometry();
            // testGeometry.vertices.push(nearPlane, farPlane);
            // this.scene.add(new THREE.Line(testGeometry, new THREE.LineBasicMaterial({ color : 0xFFFFFF })));

            var inverseMatrix = new THREE.Matrix4();
            var ray = new THREE.Ray();

            var movementPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0));
            var rotationMatrix = new THREE.Matrix4().makeRotationZ(-Math.PI / 6); //.makeRotationZ(Math.PI / 4);
            var rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 6, Math.PI / 4, 0, "ZYX")); //.makeRotationZ(Math.PI / 4);
            movementPlane.applyMatrix4(rotationMatrix);
            movementPlane.intersectLine(new THREE.Line3(nearPlane, farPlane), this.currentDraggedLocation);
        }
    }

    private checkDraggingFromButtons(event) {
        var newVisualizer = undefined;
        for (var n = 0; n < this.newVisualizersButtons.length; ++n) {
            var currentButtonRect = this.newVisualizersButtons[n];
            if (event.center.x > currentButtonRect.x && event.center.x < currentButtonRect.right
                && event.center.y > currentButtonRect.y && event.center.y < currentButtonRect.bottom) {
                switch (n) {
                    case 0:
                        newVisualizer = this.visualizersService.createVisualizer("eq", this.scene);
                        break;
                    case 1:
                        newVisualizer = this.visualizersService.createVisualizer("noise", this.scene);
                        break;
                    case 2:
                        newVisualizer = this.visualizersService.createVisualizer("comp", this.scene);
                        break;
                }
                this.visualizersService.placeOrder(newVisualizer, -2);
                this.mainService.trigger("onActiveChange", [newVisualizer]);
            }
        }
        return newVisualizer;
    }

    private setupTouchControls() {
        var comp = this;
        comp.hammerInstance = new Hammer(document.body);
        comp.hammerInstance.get("rotate").set({ enable : true });
        // comp.hammerInstance.get("pinch").set({ enable : true, threshold : 0 });
        comp.hammerInstance.add(new Hammer.Pan({ direction : Hammer.DIRECTION_ALL, threshold : 0 }));
        comp.hammerInstance.add(new Hammer.Swipe({ direction : Hammer.DIRECTION_HORIZONTAL }));
        // comp.hammerInstance.get("swipe").recognizeWith(comp.hammerInstance.get("pan"));

        // comp.hammerInstance.on("swipeleft", function back(event) {
        //     console.log("swipeleft");
        //     switch (comp.mainService.getView()) {
        //         case "single":
        //             if (event.distance > 0.7 * comp.canvas.clientWidth) {
        //                 comp.mainService.trigger("back", []);
        //             }
        //             break;
        //     }
        // });

        comp.hammerInstance.on("panend", function clickAndDrag(event) {
            switch (comp.mainService.getView()) {
                case "multi":
                    comp.currentDraggingVisualizer = undefined;
                    comp.scrollDelta = 0.0;
                    comp.currentDraggingNewVisualizer = false;
                    comp.currentDraggingLeftButton = false;
                    break;
                case "single":
                    if (event.distance > 0.75 * comp.canvas.clientWidth) {
                        comp.mainService.trigger("back", []);
                    }
                    else {
                        comp.mainService.trigger("panend", [event]);
                    }
                    break;
            }
        });

        comp.hammerInstance.on("panstart", function clickAndDrag(event) {
            console.log("[ event started at (" + event.center.x + ", " + event.center.y + ")]");
            console.log("(" + event.deltaX + ", " + event.deltaY + ")");
            switch (comp.mainService.getView()) {
                case "multi":
                    if (comp.currentDraggingVisualizer === undefined) {
                        var newVisualizer = undefined;
                        if ((newVisualizer = comp.checkDraggingFromButtons(event)) !== undefined) {
                            comp.currentDraggingVisualizer = newVisualizer;
                            comp.currentDraggingNewVisualizer = true;
                        }
                        else {
                            let visualizers = comp.visualizersService.visualizers;
                            let inverseMatrix = new THREE.Matrix4();
                            let ray = new THREE.Ray();
                            let raycaster = new THREE.Raycaster();

                            raycaster.setFromCamera(new THREE.Vector2(2 * event.center.x / comp.canvas.clientWidth - 1, -(2 * event.center.y / comp.canvas.clientHeight - 1)), comp.camera);

                            for (let n = visualizers.length - 1; n >= 0; --n) {
                                inverseMatrix.getInverse(visualizers[n].getMatrixWorld());
                                ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

                                if (ray.intersectsBox(visualizers[n].getBoundingBox()) === true) {
                                    comp.currentDraggingVisualizer = visualizers[n];
                                    break;
                                }
                            }
                        }
                    }
                    break;
                case "single":
                    comp.mainService.trigger("panstart", [event]);
                    break;
            }
        });

        comp.hammerInstance.on("panmove", function clickAndDrag(event) {
            switch (comp.mainService.getView()) {
                case "multi":
                    comp.multiViewDrag(event);
                    break;
                case "single":
                    comp.mainService.trigger("pan", [event]);
                    break;
            }
        });

        comp.hammerInstance.on("rotate", function twoFingerRotate(event) {
            switch (comp.mainService.getView()) {
                case "single":
                    comp.mainService.trigger("rotate", [event]);
                    break;
            }
        });

        // comp.hammerInstance.on("pinch", function twoFingerZoom(event) {
        //     switch (comp.mainService.getView()) {
        //         case "single":
        //             comp.mainService.trigger("pinch", [event]);
        //             break;
        //     }
        // });
    }

    private setupVisualizerControls() {
        var comp = this;
        comp.mainService.registerEvent("rotate", event => {
            switch (comp.mainService.getActiveType()) {
                case "comp":
                    var visComp = comp.mainService.getActive();
                    visComp.deltaCompression(undefined, event.angle / 10000); // THIS IS SO JANKY!
                    comp.mainService.trigger("setCompRatio", [visComp._ratio]);
                    break;
            }
        });

        comp.mainService.registerEvent("pan", event => {
            switch (comp.mainService.getActiveType()) {
                case "noise":
                    var visComp = comp.mainService.getActive();
                    visComp.deltaNoise(-event.deltaY / 5000);
                    comp.mainService.trigger("setNoiseThreshold", [visComp._threshold]);
                    break;
                case "comp":
                    var visComp = comp.mainService.getActive();
                    visComp.deltaCompression(-event.deltaY / 5000);
                    comp.mainService.trigger("setCompThreshold", [visComp._threshold]);
                    break;
            }
        });

        // case "eq":
        //     var visEq = comp.mainService.getActive();
        //     var frequency = event.distance * ((0.8 * comp.canvas.clientHeight) / 24);
        //     var frequencyIndex = Math.floor(1 - frequency / 12);
        //     var newValues = [event.distance];
        //     for (var n = 0; n < 11; ++n)
        //         if (n === frequencyIndex)
        //             newValues.push(event.angle / 10000);
        //         else
        //             newValues.push(undefined);
        //     comp.mainService.trigger("setEqFilters", [visEq._filters]);
        //     break;

        var filterCutOffStart = undefined;
        var screenCenter;
        function createRotationMatrix(radian) {
            var rotationMatrix = new THREE.Matrix3();
            rotationMatrix.set(Math.cos(radian), -Math.sin(radian), 0,     Math.sin(radian), Math.cos(radian), 0,    0, 0, 1);
            return rotationMatrix;
        }
        const frequencyScreenMapping = [0.05, 0.1, 0.15, 0.2,
                                        0.3, 0.36, 0.42, 0.52,
                                        0.65, 0.78, 0.86, 0.95];
        comp.mainService.registerEvent("panstart", event => {
            if (comp.mainService.getActiveType() === "eq") {
                console.log("EQ performing panstart");
                screenCenter = {
                    x : comp.canvas.clientWidth / 2,
                    y : comp.canvas.clientHeight / 2
                };
                filterCutOffStart = event.center;
            }
        });
        comp.mainService.registerEvent("panend", event => {
            if (comp.mainService.getActiveType() === "eq" && filterCutOffStart) {
                var path = {
                    start : new THREE.Vector2((filterCutOffStart.x - screenCenter.x) / comp.canvas.clientHeight,
                                              -(filterCutOffStart.y - screenCenter.y) / comp.canvas.clientHeight),
                    end : new THREE.Vector2((event.center.x - screenCenter.x) / comp.canvas.clientHeight,
                                            -(event.center.y - screenCenter.y) / comp.canvas.clientHeight),
                };
                filterCutOffStart = undefined;

                var absoluteDistances = frequencyScreenMapping.map(y => y / 2);

                console.log(path.start.angle());
                var rotationMatrix = createRotationMatrix(2 * Math.PI - path.start.angle());
                // if (path.start.x < 0)
                //     if (path.start.y < 0)
                //         rotationMatrix = createRotationMatrix(Math.PI);
                //     else
                //         rotationMatrix = createRotationMatrix(3 * Math.PI / 2);
                // else
                //     if (path.start.y < 0)
                //         rotationMatrix = createRotationMatrix(Math.PI / 2);
                //     else
                //         rotationMatrix = createRotationMatrix(0);

                path.start.applyMatrix3(rotationMatrix);
                path.end.applyMatrix3(rotationMatrix);

                if (path.end.x < 0 && path.end.y < 0)
                    path.end.set(0, 0);

                // var slope = (path.end.y - path.start.y) / (path.end.x - path.start.x);
                // if (slope > -1) {
                //     console.log("// panned outward, slope : " + slope);
                // }
                // else {
                //     console.log("// panned inward, slope : " + slope);
                // }

                var visEq = comp.mainService.getActive();
                var newValues = [];

                if (path.start.length() < path.end.length()) {
                    console.log("// panned outward");
                    for (var n = absoluteDistances.length - 1; n >= 0; --n) {
                        if (absoluteDistances[n] > path.start.length() && absoluteDistances[n] < path.end.length())
                            newValues.push(2.0);
                        else
                            newValues.push(undefined);
                    }
                }
                else {
                    console.log("// panned inward");
                    for (var n = absoluteDistances.length - 1; n >= 0; --n) {
                        if (absoluteDistances[n] > path.end.length() && absoluteDistances[n] < path.start.length())
                            newValues.push(-2.0);
                        else
                            newValues.push(undefined);
                    }
                }

                visEq.deltaFilter(newValues);
                comp.mainService.trigger("setEqFilters", [visEq._filters]);

                console.log(path);
            }
        });
    }

    private cameraMoveDelta: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    private cameraLookDelta: THREE.Vectoe3 = new THREE.Vector3(0, 0, 0);
    private scrollDelta: number = 0.0;

    // @HostListener("document:keydown", ["$event"])
    // public onKeyDown(event: KeyboardEvent) {
    //     console.log("Key Down: " + event.key);
    //     var newActiveVisualizer = undefined;

    //     switch (event.key) {
    //         // case "1":
    //         //     newActiveVisualizer = this.visualizersService.createVisualizer("identity", this.scene);
    //         //     this.visualizersService.placeOrder(newActiveVisualizer, -2);
    //         //     this.mainService.trigger("onActiveChange", [newActiveVisualizer]);
    //         //     break;
    //         case "2":
    //             newActiveVisualizer = this.visualizersService.createVisualizer("eq", this.scene);
    //             this.visualizersService.placeOrder(newActiveVisualizer, -2);
    //             this.mainService.trigger("onActiveChange", [newActiveVisualizer]);
    //             break;
    //         case "3":
    //             newActiveVisualizer = this.visualizersService.createVisualizer("noise", this.scene);
    //             this.visualizersService.placeOrder(newActiveVisualizer, -2);
    //             this.mainService.trigger("onActiveChange", [newActiveVisualizer]);
    //             break;
    //         case "4":
    //             newActiveVisualizer = this.visualizersService.createVisualizer("comp", this.scene);
    //             this.visualizersService.placeOrder(newActiveVisualizer, -2);
    //             this.mainService.trigger("onActiveChange", [newActiveVisualizer]);
    //             break;

    //         case "[":
    //             this.mainService.trigger("onViewChange", ["multi"]);
    //             break;
    //         case "]":
    //             this.mainService.trigger("onViewChange", ["single"]);
    //             break;

    //         case "w":
    //             this.cameraMoveDelta.z = -0.08;
    //             break;
    //         case "a":
    //             this.cameraMoveDelta.x = -0.02;
    //             break;
    //         case "s":
    //             this.cameraMoveDelta.z = 0.08;
    //             break;
    //         case "d":
    //             this.cameraMoveDelta.x = 0.02;
    //             break;
    //         case "q":
    //             this.cameraMoveDelta.y = 0.02;
    //             break;
    //         case "e":
    //             this.cameraMoveDelta.y = -0.02;
    //             break;

    //         case "ArrowUp":
    //                 // Pitch
    //             this.cameraLookDelta.x = 0.01;
    //             break;
    //         case "ArrowLeft":
    //                 // Yaw
    //             this.cameraLookDelta.y = 0.01;
    //             break;
    //         case "ArrowDown":
    //             this.cameraLookDelta.x = -0.01;
    //             break;
    //         case "ArrowRight":
    //             this.cameraLookDelta.y = -0.01;
    //             break;

    //         case "n":
    //             if (this.visualizersService.visualizers.length > 2)
    //                 this.scrollDelta = 0.08 / this.visualizersService.visualizers.length;
    //             break;
    //         case "m":
    //             if (this.visualizersService.visualizers.length > 2)
    //                 this.scrollDelta = -0.08 / this.visualizersService.visualizers.length;
    //             break;
    //     }
    // }

    // @HostListener("document:keyup", ["$event"])
    // public onKeyUp(event: KeyboardEvent) {
    //     console.log("Key Up: " + event.key);

    //     switch (event.key) {
    //         case "w":
    //             this.cameraMoveDelta.z = 0.0;
    //             break;
    //         case "a":
    //             this.cameraMoveDelta.x = 0.0;
    //             break;
    //         case "s":
    //             this.cameraMoveDelta.z = 0.0;
    //             break;
    //         case "d":
    //             this.cameraMoveDelta.x = 0.0;
    //             break;
    //         case "q":
    //             this.cameraMoveDelta.y = 0.0;
    //             break;
    //         case "e":
    //             this.cameraMoveDelta.y = 0.0;
    //             break;

    //         case "ArrowUp":
    //                 // Pitch
    //             this.cameraLookDelta.x = 0.0;
    //             break;
    //         case "ArrowLeft":
    //                 // Yaw
    //             this.cameraLookDelta.y = 0.0;
    //             break;
    //         case "ArrowDown":
    //             this.cameraLookDelta.x = 0.0;
    //             break;
    //         case "ArrowRight":
    //             this.cameraLookDelta.y = 0.0;
    //             break;

    //         case "n":
    //             this.scrollDelta = 0.0;
    //             break;
    //         case "m":
    //             this.scrollDelta = 0.0;
    //             break;
    //     }
    // }

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
        // testCameraControls();
    }

    ngAfterViewInit() {
        this.createScene();
        this.createLight();
        this.createCamera();

        this.setView(this.mainService.getView());
        this.placeVisualizers();

        this.setupTouchControls();
        this.setupVisualizerControls();

        this.startRendering();

        var rotation = 0;
        var component = this;

        function animationLoop() {

            const WORLD_PITCH_AXIS = new THREE.Vector3(1, 0, 0);
            const WORLD_YAW_AXIS   = new THREE.Vector3(0, 1, 0);

            function updateScene() {
                rotation += 0.00001;

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

        animationLoop();
    }
}
