import { writable } from "svelte/store";

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
