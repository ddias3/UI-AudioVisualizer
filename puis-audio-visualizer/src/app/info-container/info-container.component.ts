import { Component, AfterViewInit, ViewChild } from '@angular/core';

import { MainService } from "../app-service/app-service.service";

@Component({
    selector: 'info-container-root',
    templateUrl: './info-container.component.html',
    styleUrls: ['./info-container.component.css']
})
export class InfoContainerComponent implements AfterViewInit {

    public display: string = "multi";

    @ViewChild("equilizer_drag")
    private dragElementRef_eq;

    @ViewChild("noise_gate_drag")
    private dragElementRef_noise;

    @ViewChild("compression_drag")
    private dragElementRef_comp;

    private mainService: MainService;

    constructor(mainService: MainService) {
        this.mainService = mainService;

        mainService.registerEvent("setDisplay", displayValue => {
            this.display = displayValue;
        });
    }

    ngAfterViewInit() {
        this.mainService.trigger("buttonsLoaded", [
            this.dragElementRef_eq.nativeElement.getBoundingClientRect(),
            this.dragElementRef_noise.nativeElement.getBoundingClientRect(),
            this.dragElementRef_comp.nativeElement.getBoundingClientRect(),
        ]);
    }
}
