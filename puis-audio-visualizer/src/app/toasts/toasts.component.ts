import { Component, OnInit } from '@angular/core';
import { Toast } from "../toast";
import { TOASTS } from "../mock-toasts";

@Component({
    selector: 'toasts-component',
    templateUrl: './toasts.component.html',
    styleUrls: ['./toasts.component.css']
})
export class ToastsComponent implements OnInit {

    toasts = TOASTS;

    selectedToast: Toast;
    onSelect(toast: Toast): void {
        this.selectedToast = toast;
    }

    constructor() { }

    ngOnInit() {
    }

}
