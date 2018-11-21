import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

@Component({
    selector: 'audio-container',
    templateUrl: './audio-container.component.html',
    styleUrls: ['./audio-container.component.css']
})
export class AudioContainerComponent implements OnInit {

    @ViewChild("audioPlayer")
    audioPlayerRef: ElementRef;

    constructor() { }

    ngOnInit() {
        console.log(this.audioPlayerRef);
    }
}
