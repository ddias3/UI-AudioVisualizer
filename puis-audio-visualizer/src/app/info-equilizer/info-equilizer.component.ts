import { Component, OnInit } from '@angular/core';

import { MainService } from "../app-service/app-service.service";

@Component({
    selector: 'info-equilizer',
    templateUrl: './info-equilizer.component.html',
    styleUrls: ['./info-equilizer.component.css']
})
export class InfoEquilizerComponent implements OnInit {

    private frequencyFilters: Array<any>;

    constructor(mainService: MainService) {
        mainService.registerEvent("setEqFilters", newValue => {
            newValue.forEach((filterValue, index) => {
                this.frequencyFilters[index].filterValue = filterValue;
            });
        });
        
        this.frequencyFilters = [{
            frequency : "40 Hz",
            filterValue : 1.0
        }, {
            frequency : "80 Hz",
            filterValue : 1.0
        }, {
            frequency : "160 Hz",
            filterValue : 1.0
        },{
            frequency : "320 Hz",
            filterValue : 1.0
        },

        {
            frequency : "560 Hz",
            filterValue : 1.0
        }, {
            frequency : "1000 Hz",
            filterValue : 1.0
        }, {
            frequency : "1600 Hz",
            filterValue : 1.0
        }, {
            frequency : "3200 Hz",
            filterValue : 1.0
        },

        {
            frequency : "6400 Hz",
            filterValue : 1.0
        }, {
            frequency : "10 kHz",
            filterValue : 1.0
        }, {
            frequency : "13.5 kHz",
            filterValue : 1.0
        }, {
            frequency : "17.5 kHz",
            filterValue : 1.0
        }];
    }

    ngOnInit() {
    }

}
