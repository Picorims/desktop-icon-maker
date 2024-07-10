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

import { toICOBlob } from './ico';
import { Format, RadiusType, type Config } from './store';
import { rawSVGtoDataURI } from './svg';

/**
 * Handles all canvas related rendering.
 */
export class Renderer {
	private canvas: HTMLCanvasElement;
	private backgroundCanvas: HTMLCanvasElement;
	private config: Config;
	private drawing = false;
	private lastImg: HTMLImageElement | null = null;
	private lastSvgText = '';

	constructor(params: {
		canvas: HTMLCanvasElement;
		backgroundCanvas: HTMLCanvasElement;
		config: Config;
	}) {
		this.canvas = params.canvas;
		this.backgroundCanvas = params.backgroundCanvas;
		this.config = { ...params.config };
        this.setCanvasSize(this.config.size);
	}

    /**
     * Resize and refresh background.
     * @param size 
     */
	private setCanvasSize(size: number) {
		this.canvas.width = size;
		this.canvas.height = size;
		this.backgroundCanvas.width = size;
		this.backgroundCanvas.height = size;
		this.refreshBackground();
	}

    /**
     * Update the configuration, and render the icon.
     * @param config 
     */
	public setConfig(config: Config) {
        console.log("update config in renderer", config);
		const oldSize = this.config.size;
		this.config = { ...config };
		
        // refresh background ?
        if (this.config.size !== oldSize) {
            console.log(`update size from ${oldSize} to ${config.size}`);
			this.setCanvasSize(config.size);
		}
		
        this.refresh(this.config);
	}

	private refreshBackground() {
		console.log('refresh background');
		if (!this.backgroundCanvas) return;
		const ctx = this.backgroundCanvas.getContext('2d');
		if (!ctx) return;
		const size = this.config.size;

		// reset
		ctx.clearRect(0, 0, size, size);

		// background grid
		const gridSize = 8;
		for (let i = 0; i < size; i += gridSize) {
			for (let j = 0; j < size; j += gridSize) {
				ctx.fillStyle = (i / gridSize + j / gridSize) % 2 === 0 ? '#666' : '#aaa';
				ctx.fillRect(i, j, 8, 8);
			}
		}
	}

	/**
	 * Draws a path representing a rounded rect based on the current
	 * configured radius and size
	 * @param ctx
	 */
	private roundedRectBezier(ctx: CanvasRenderingContext2D, size: number, radius: number) {
		ctx.beginPath();
		ctx.moveTo(radius, 0);
		ctx.lineTo(size - radius, 0);
		ctx.bezierCurveTo(size, 0, size, 0, size, radius);
		ctx.lineTo(size, size - radius);
		ctx.bezierCurveTo(size, size, size, size, size - radius, size);
		ctx.lineTo(radius, size);
		ctx.bezierCurveTo(0, size, 0, size, 0, size - radius);
		ctx.lineTo(0, radius);
		ctx.bezierCurveTo(0, 0, 0, 0, radius, 0);
		ctx.closePath();
	}

	/**
	 * Forces a refresh of the icon
	 */
	public forceRefresh() {
		this.refresh(this.config);
	}

	/**
	 * Draws the icon according to the current configuration
	 * @param config
	 * @returns
	 */
	private refresh(config: Config) {
		// checks
		if (this.drawing) {
			console.log('already drawing');
			return;
		}
		console.log('refresh');
		if (config.svgText === '') return;
		if (!this.canvas) return;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;
		if (config.radiusType === RadiusType.ROUNDED && !ctx.roundRect) {
			alert(
				'It looks like your browser does not support the roundRect method. You can either use a different browser or change the radius type'
			);
			return;
		}

		// init
		this.drawing = true;
		ctx.clearRect(0, 0, config.size, config.size);

		// icon background
		ctx.fillStyle = config.backgroundColor;
		ctx.globalAlpha = config.opacity;
		if (config.radiusType === RadiusType.ROUNDED) {
			ctx.beginPath();
			ctx.roundRect(0, 0, config.size, config.size, config.radius);
			ctx.fill();
		} else if (config.radiusType === RadiusType.BEZIER) {
			this.roundedRectBezier(ctx, config.size, config.radius);
		}
		ctx.fill();

		const configCopy = { ...config };

		const drawImg = () => {
			const img = this.lastImg;
			const imgSize = configCopy.size - 2 * configCopy.padding;
			if (!img) {
				console.warn('no img to draw');
				this.drawing = false;
				return;
			}
			console.log('draw img');
			ctx.save();
			ctx.fillStyle = 'transparent';
			ctx.globalAlpha = 1;

			// apply color to icon
			const tmpCanvas = document.createElement('canvas');
			tmpCanvas.width = imgSize;
			tmpCanvas.height = imgSize;
			const tmpCtx = tmpCanvas.getContext('2d');
			if (!tmpCtx) {
				this.drawing = false;
				return;
			}
			tmpCtx.drawImage(img, 0, 0, imgSize, imgSize);
			tmpCtx.globalCompositeOperation = 'source-in';
			tmpCtx.fillStyle = configCopy.strokeColor;
			tmpCtx.fillRect(0, 0, imgSize, imgSize);

			ctx.drawImage(tmpCanvas, configCopy.padding, configCopy.padding, imgSize, imgSize);
			ctx.restore();

			this.drawing = false;
		};

		// icon
		if (config.svgText === this.lastSvgText) {
			drawImg();
			return;
		} else {
			const parser = new DOMParser();
			const svg = parser.parseFromString(config.svgText, 'image/svg+xml').querySelector('svg');
			if (!svg) return;
			svg.setAttribute('stroke', '#000000');
			const uri = rawSVGtoDataURI(svg.outerHTML);
			const img = new Image(config.size, config.size);
			img.src = uri;
			this.lastImg = img;
			this.lastSvgText = config.svgText;
			img.addEventListener('load', drawImg);
		}
	}

    /**
     * Promise wrapper around the canvas.toBlob method.
     * @param format 
     * @returns 
     */
    private async toBlob(format: Format): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => {
                if (!blob) reject('Could not export to blob as ' + format);
                resolve(blob!);
            }, format);
        });
    }

    /**
     * Export the canvas content to a specific format.
     * @param format 
     * @returns 
     */
	public async exportToFormat(format: Format): Promise<Blob> {
		if (format === Format.PNG || format === Format.JPG) {
			return await this.toBlob(format);
		} else if (format === Format.ICO) {
            const blob = await this.toBlob(Format.PNG);

            // convert to ico
			return await toICOBlob(blob);
		} else {
            throw new Error('Unsupported format ' + format);
        }
	}
}
