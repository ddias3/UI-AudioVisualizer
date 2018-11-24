import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'info-container-root',
    templateUrl: './info-container.component.html',
    styleUrls: ['./info-container.component.css']
})
export class InfoContainerComponent implements OnInit {

    public display: string = "multi";

    constructor() { }

    ngOnInit() {
    }
}
