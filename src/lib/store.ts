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

export	enum Format {
    PNG = 'image/png',
    JPG = 'image/jpeg'
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
    radius: 16,
    radiusType: RadiusType.ROUNDED,
});
