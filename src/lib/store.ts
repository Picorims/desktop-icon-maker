/*
The MIT License (MIT)

Copyright (c) 2024 Charly Schmidt alias Picorims<picorims.contact@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the “Software”), to deal in the Software without restriction
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { writable } from "svelte/store";
import type { Renderer } from "./canvas";

export interface Config {
	readonly version: 1;
	svgText: string;
	imgFormat: Format;
	size: number;
	backgroundColor: string;
	strokeColor: string;
	opacity: number;
	padding: number;
	radius: number;
	radiusType: RadiusType;
}

export enum RadiusType {
	ROUNDED = 'rounded',
	BEZIER = 'bezier'
}

export const icoSizes = [16, 20, 24, 32, 40, 48, 64, 128, 256];

export	enum Format {
    PNG = 'image/png',
    JPG = 'image/jpeg',
    ICO = 'image/x-icon',
}


export const config = writable<Config>({
    version: 1,
    svgText: "",
    imgFormat: Format.PNG,
    size: 256,
    backgroundColor: "#222222",
    strokeColor: "#eeeeee",
    opacity: 1,
    padding: 0,
    radius: 32,
    radiusType: RadiusType.ROUNDED,
});

export const renderer = writable<Renderer | null>(null);