import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { MainService } from "../app-service/app-service.service";

@Component({
    selector: 'audio-container',
    templateUrl: './audio-container.component.html',
    styleUrls: ['./audio-container.component.css']
})
export class AudioContainerComponent implements OnInit {

    @ViewChild("audioPlayer")
    audioPlayerRef: ElementRef;

    constructor(mainService: MainService) {
        // TODO
    }

    ngOnInit() {
        console.log(this.audioPlayerRef);
    }
}
