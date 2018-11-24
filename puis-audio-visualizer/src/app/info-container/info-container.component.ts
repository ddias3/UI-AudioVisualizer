import { Component, OnInit } from '@angular/core';

import { MainService } from "../app-service/app-service.service";

@Component({
    selector: 'info-container-root',
    templateUrl: './info-container.component.html',
    styleUrls: ['./info-container.component.css']
})
export class InfoContainerComponent implements OnInit {

    public display: string = "multi";

    constructor(mainService: MainService) {
        mainService.registerEvent("setDisplay", displayValue => {
            this.display = displayValue;
        });
    }

    ngOnInit() {
    }
}
