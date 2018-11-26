import { Component, OnInit } from '@angular/core';

import { MainService } from "../app-service/app-service.service";

@Component({
    selector: 'info-noise-gate',
    templateUrl: './info-noise-gate.component.html',
    styleUrls: ['./info-noise-gate.component.css']
})
export class InfoNoiseGateComponent implements OnInit {

    private noiseThreshold: number = 0.0;

    constructor(mainService: MainService) {
        mainService.registerEvent("setNoiseThreshold", newValue => {
            this.noiseThreshold = newValue;
        });
    }

    ngOnInit() {
    }

}
