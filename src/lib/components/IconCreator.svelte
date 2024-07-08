<script lang="ts">
	import { rawSVGtoDataURI } from '$lib/svg';
	import { text } from '@sveltejs/kit';
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
	import chroma from 'chroma-js';
	import { draw } from 'svelte/transition';
	import OptionEntry from './OptionEntry.svelte';

	export let svgText: string = '';
    export let onRefresh: (blob: Blob) => void;
    export let imgFormat: string = 'image/png';

	const defaultSizes = [16, 24, 32, 48, 64, 96, 128, 256, 512];
	let size = 256;
	let canvas: HTMLCanvasElement;
	let backgroundCanvas: HTMLCanvasElement;
	let backgroundColor = '#000000';
	let strokeColor = '#ffffff';
	let opacity = 1;
	let padding = 8;
	let radius = 8;
	enum RadiusType {
		ROUNDED = 'rounded',
		BEZIER = 'bezier'
	}
	let radiusType = RadiusType.ROUNDED;
	let cachedImg: HTMLImageElement | null = null;

	function refreshBackground() {
		console.log('refresh background');
		if (!backgroundCanvas) return;
		const ctx = backgroundCanvas.getContext('2d');
		if (!ctx) return;

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
	function roundedRectBezier(ctx: CanvasRenderingContext2D) {
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
	function refresh() {
        if (drawing) {
            console.log('already drawing');
            return;
        };
		console.log('refresh');
		if (svgText === '') return;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
        
        drawing = true;
		// reset
		ctx.clearRect(0, 0, size, size);

		// icon background
		ctx.fillStyle = backgroundColor;
		ctx.globalAlpha = opacity;
        if (radiusType === RadiusType.ROUNDED && !ctx.roundRect) {
            alert('It looks like your browser does not support the roundRect method. Bezier will be used instead.');
            radiusType = RadiusType.BEZIER;
        }
		if (radiusType === RadiusType.ROUNDED) {
            ctx.beginPath();
            ctx.roundRect(0, 0, size, size, radius);
            ctx.fill();
            console.log("r");
        } else if (radiusType === RadiusType.BEZIER) {
			console.log("b");
            roundedRectBezier(ctx);
		}
		ctx.fill();

		// icon
		const parser = new DOMParser();
		const svg = parser.parseFromString(svgText, 'image/svg+xml').querySelector('svg');
		if (!svg) return;
		svg.setAttribute('stroke', strokeColor);
		const uri = rawSVGtoDataURI(svg.outerHTML);
		const img = new Image(size, size);
		img.src = uri;

		const drawImg = () => {
            console.log('draw img');
			ctx.save();
			ctx.fillStyle = 'transparent';
			ctx.globalAlpha = 1;
			ctx.drawImage(img, padding, padding, size - 2 * padding, size - 2 * padding);
			ctx.restore();
            const blob = canvas.toBlob((blob) => {
                if (blob) onRefresh(blob);
            }, imgFormat);
            drawing = false;
		};

		// if (cachedImg) cachedImg.removeEventListener('load', drawImg);
		// cachedImg = img;
		img.addEventListener('load', drawImg);
	}

	$: if (size < 8) size = 8;
	$: if (padding < 0) padding = 0;
	$: if (padding > size / 2 - 8) padding = size / 2 - 8;
	$: if (radius < 0) radius = 0;
    $: if (radius > size / 2) radius = size / 2;
	$: {
		if (canvas) {
			canvas.width = size;
			canvas.height = size;
			refresh();
		}
	}
	$: {
		if (backgroundCanvas) {
			backgroundCanvas.width = size;
			backgroundCanvas.height = size;
			refreshBackground();
		}
	}
	$: svgText && refresh();
</script>

<div class="container">
	<fieldset>
		<legend>Configuration</legend>
		<OptionEntry>
			<span slot="title">Size:</span>
			<input slot="content" type="number" min="8" bind:value={size} on:input={refresh} />
			<div slot="additional" class="button-list">
				{#each defaultSizes as defaultSize}
					<button on:click={() => (size = defaultSize)}>{defaultSize}</button>
				{/each}
			</div>
		</OptionEntry>
		<OptionEntry>
			<span slot="title">Background color:</span>
			<input slot="content" type="color" bind:value={backgroundColor} on:input={refresh} />
			<span slot="suffix">{backgroundColor}</span>
		</OptionEntry>
		<OptionEntry>
			<span slot="title">Icon stroke color:</span>
			<input slot="content" type="color" bind:value={strokeColor} on:input={refresh} />
			<span slot="suffix">{strokeColor}</span>
		</OptionEntry>
		<OptionEntry>
			<span slot="title">Opacity:</span>
			<input slot="content" type="range" min="0" max="1" step="0.01" bind:value={opacity} on:input={refresh} />
			<span slot="suffix">{opacity}</span>
		</OptionEntry>
		<OptionEntry>
			<span slot="title">Padding:</span>
			<input slot="content" type="number" min="0" bind:value={padding} on:input={refresh} />
		</OptionEntry>
		<OptionEntry>
			<span slot="title">Radius:</span>
			<input slot="content" type="number" min="0" bind:value={radius} on:input={refresh} />
		</OptionEntry>
		<OptionEntry>
            <span slot="title">Radius type:</span>
            <select slot="content" bind:value={radiusType} on:change={refresh}>
                <option value={RadiusType.BEZIER}>Bezier</option>
                <option value={RadiusType.ROUNDED}>Rounded</option>
            </select>
        </OptionEntry>
		<button on:click={refresh} class="g-margin">Force refresh</button>
	</fieldset>
	<div class="canvases" style={`width: ${size}px; height: ${size}px`}>
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
	fieldset {
		max-width: 80%;
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
