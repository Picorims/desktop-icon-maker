<script lang="ts">
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
	import { rawSVGtoDataURI } from '$lib/svg';
	import OptionEntry from './OptionEntry.svelte';
	import { config, Format, RadiusType, type Config } from '$lib/store';

	export let svgText: string = '';
	export let onRefresh: (blob: Blob) => void;
	export let imgFormat: Format = Format.PNG;

	const defaultSizes = [16, 24, 32, 48, 64, 96, 128, 256, 512];
	let canvas: HTMLCanvasElement;
	let backgroundCanvas: HTMLCanvasElement;
	let lastSvgText = '';
	let lastImg: HTMLImageElement | null = null;

	function importConfig() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.addEventListener('change', async () => {
			console.log("import config");
			const file = input.files?.[0];
			if (!file) return;
			const text = await file.text();
			const data = JSON.parse(text);
			config.set(data);
		});
		input.click();
	}

	function exportConfig() {
		console.log("export config");
		const data = JSON.stringify($config);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = "config.json";
		a.click();
	}

	function refreshBackground() {
		console.log('refresh background');
		if (!backgroundCanvas) return;
		const ctx = backgroundCanvas.getContext('2d');
		if (!ctx) return;
		const size = $config.size;

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
	function roundedRectBezier(ctx: CanvasRenderingContext2D, size: number, radius: number) {
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

	let drawing = false;
	function refresh(config: Config) {
		if (drawing) {
			console.log('already drawing');
			return;
		}
		console.log('refresh');
		if (svgText === '') return;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		drawing = true;
		// reset
		ctx.clearRect(0, 0, config.size, config.size);

		// icon background
		ctx.fillStyle = config.backgroundColor;
		ctx.globalAlpha = config.opacity;
		if (config.radiusType === RadiusType.ROUNDED && !ctx.roundRect) {
			alert(
				'It looks like your browser does not support the roundRect method. Bezier will be used instead.'
			);
			$config.radiusType = RadiusType.BEZIER;
		}
		if (config.radiusType === RadiusType.ROUNDED) {
			ctx.beginPath();
			ctx.roundRect(0, 0, config.size, config.size, config.radius);
			ctx.fill();
			console.log('r');
		} else if (config.radiusType === RadiusType.BEZIER) {
			console.log('b');
			roundedRectBezier(ctx, config.size, config.radius);
		}
		ctx.fill();

		const configCopy = { ...config };

		const drawImg = () => {
			const img = lastImg;
			const imgSize = configCopy.size - 2 * configCopy.padding;
			if (!img) {
				console.warn('no img to draw');
				drawing = false;
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
				drawing = false;
				return;
			}
			tmpCtx.drawImage(img, 0, 0, imgSize, imgSize);
			tmpCtx.globalCompositeOperation = 'source-in';
			tmpCtx.fillStyle = configCopy.strokeColor;
			tmpCtx.fillRect(0, 0, imgSize, imgSize);

			ctx.drawImage(
				tmpCanvas,
				configCopy.padding,
				configCopy.padding,
				imgSize,
				imgSize
			);
			ctx.restore();
			const blob = canvas.toBlob((blob) => {
				if (blob) onRefresh(blob);
			}, imgFormat);
			drawing = false;
		};

		// icon
		if (svgText === lastSvgText) {
			drawImg();
			return;
		} else {
			const parser = new DOMParser();
			const svg = parser.parseFromString(svgText, 'image/svg+xml').querySelector('svg');
			if (!svg) return;
			svg.setAttribute('stroke', "#000000");
			const uri = rawSVGtoDataURI(svg.outerHTML);
			const img = new Image(config.size, config.size);
			img.src = uri;
			lastImg = img;
			lastSvgText = svgText;
			img.addEventListener('load', drawImg);
		}
	}

	$: if ($config.size < 8) $config.size = 8;
	$: if ($config.padding < 0) $config.padding = 0;
	$: if ($config.padding > $config.size / 2 - 8) $config.padding = $config.size / 2 - 8;
	$: if ($config.radius < 0) $config.radius = 0;
	$: if ($config.radius > $config.size / 2) $config.radius = $config.size / 2;
	$: {
		if (canvas) {
			canvas.width = $config.size;
			canvas.height = $config.size;
			refresh($config);
		}
	}
	$: {
		if (backgroundCanvas) {
			backgroundCanvas.width = $config.size;
			backgroundCanvas.height = $config.size;
			refreshBackground();
		}
	}

	$: $config.svgText = svgText;
	$: $config.imgFormat = imgFormat;
	$: $config && refresh($config);
</script>

<div class="container">
	<fieldset>
		<legend>Configuration</legend>
		<OptionEntry title="Import">
			<span slot="content">
				<button on:click={importConfig}>Import</button>
			</span>
		</OptionEntry>
		<OptionEntry title="Export">
			<span slot="content">
				<button on:click={exportConfig}>Export</button>
			</span>
		</OptionEntry>

		<OptionEntry title="Size">
			<input slot="content" type="number" min="8" bind:value={$config.size} />
			<div slot="additional" class="button-list">
				{#each defaultSizes as defaultSize}
					<button on:click={() => ($config.size = defaultSize)}>{defaultSize}</button>
				{/each}
			</div>
		</OptionEntry>

		<OptionEntry title="Background color">
			<input slot="content" type="color" bind:value={$config.backgroundColor} />
			<span slot="suffix">{$config.backgroundColor}</span>
		</OptionEntry>

		<OptionEntry title="Icon stroke color">
			<input slot="content" type="color" bind:value={$config.strokeColor} />
			<span slot="suffix">{$config.strokeColor}</span>
		</OptionEntry>

		<OptionEntry title="Opacity">
			<input slot="content" type="range" min="0" max="1" step="0.01" bind:value={$config.opacity} />
			<span slot="suffix">{$config.opacity}</span>
		</OptionEntry>

		<OptionEntry title="Padding">
			<input slot="content" type="number" min="0" bind:value={$config.padding} />
		</OptionEntry>

		<OptionEntry title="Radius">
			<input slot="content" type="number" min="0" bind:value={$config.radius} />
		</OptionEntry>

		<OptionEntry title="Radius type">
			<select slot="content" bind:value={$config.radiusType}>
				<option value={RadiusType.BEZIER}>Bezier</option>
				<option value={RadiusType.ROUNDED}>Rounded</option>
			</select>
		</OptionEntry>
		<button on:click={() => refresh($config)} class="g-margin">Force refresh</button>
	</fieldset>
	<div class="canvases" style={`width: ${$config.size}px; height: ${$config.size}px`}>
		<canvas class="main-canvas" bind:this={canvas}></canvas>
		<canvas class="background-canvas" bind:this={backgroundCanvas}></canvas>
	</div>
</div>

<style>
	.container {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
	}
	.container > * {
		flex: 0 0 auto;
	}
	@media screen and (min-width: 640px) {
		fieldset {
			max-width: 80%;
		}
	}

	div.canvases {
		position: relative;
		margin: 1rem auto;
		border: 1px solid var(--background-500);
		box-sizing: content-box;
	}

	canvas {
		display: block;
		position: absolute;
		top: 0;
		left: 0;
	}
	canvas.background-canvas {
		z-index: 0;
	}
	canvas.main-canvas {
		z-index: 1;
	}
	.button-list {
		display: inline-flex;
		max-width: 360px;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.button-list > button {
		flex: 1 1 auto;
		margin: 0;
	}
</style>
