import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'info-container-root',
  templateUrl: './info-container.component.html',
  styleUrls: ['./info-container.component.css']
})
export class InfoContainerComponent implements OnInit {

    test: string = "TEST 2";

    constructor() { }

    ngOnInit() {
    }
}
