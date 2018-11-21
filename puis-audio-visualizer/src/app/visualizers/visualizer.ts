import { Injectable } from '@angular/core';
import * as THREE from "three";

import * as util from "./util";
import VisualizerEQ from "./equilizer";
import VisualizerComp from "./compression";

// this is code from three.js that for some reason is inaccessible through the module import
THREE.BufferGeometryUtils = {
    mergeBufferAttributes : function mergeBufferAttributes( attributes ) {

        var TypedArray;
        var itemSize;
        var normalized;
        var arrayLength = 0;

        for ( var i = 0; i < attributes.length; ++ i ) {

            var attribute = attributes[ i ];

            if ( attribute.isInterleavedBufferAttribute ) return null;

            if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
            if ( TypedArray !== attribute.array.constructor ) return null;

            if ( itemSize === undefined ) itemSize = attribute.itemSize;
            if ( itemSize !== attribute.itemSize ) return null;

            if ( normalized === undefined ) normalized = attribute.normalized;
            if ( normalized !== attribute.normalized ) return null;

            arrayLength += attribute.array.length;

        }

        var array = new TypedArray( arrayLength );
        var offset = 0;

        for ( var i = 0; i < attributes.length; ++ i ) {

            array.set( attributes[ i ].array, offset );

            offset += attributes[ i ].array.length;

        }

        return new THREE.BufferAttribute( array, itemSize, normalized );
    }
};

@Injectable({
    providedIn: 'root'
})
export class VisualizerFactory {

    public eq(options: Object, circlesConfig: Array<any>, wavesConfig: Object) {
        return new VisualizerEQ(options, circlesConfig, wavesConfig);
    }

    public comp() {
        return new VisualizerComp({}, {});
    }
}