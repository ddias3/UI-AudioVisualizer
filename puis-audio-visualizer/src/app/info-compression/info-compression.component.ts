import { Component, OnInit } from '@angular/core';

import { MainService } from "../app-service/app-service.service";

@Component({
    selector: 'info-compression',
    templateUrl: './info-compression.component.html',
    styleUrls: ['./info-compression.component.css']
})
export class InfoCompressionComponent implements OnInit {

    private compressionThreshold: number = 1.0;
    private ratio: number = 0.0;

    constructor(mainService: MainService) {
        mainService.registerEvent("setCompThreshold", newValue => {
            this.compressionThreshold = newValue;
        });
        mainService.registerEvent("setCompRatio", newValue => {
            this.ratio = newValue;
        });
    }

    ngOnInit() {
    }

}
