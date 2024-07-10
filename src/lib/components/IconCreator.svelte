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
	import { config, Format, RadiusType, renderer, type Config } from '$lib/store';
	import { Renderer } from '$lib/canvas';

	export let svgText: string = '';
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
			console.log('import config');
			const file = input.files?.[0];
			if (!file) return;
			const text = await file.text();
			const data = JSON.parse(text);
			config.set(data);
		});
		input.click();
	}

	function exportConfig() {
		console.log('export config');
		const data = JSON.stringify($config);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'config.json';
		a.click();
	}
	

	$: if ($config.size < 8) $config.size = 8;
	$: if ($config.padding < 0) $config.padding = 0;
	$: if ($config.padding > $config.size / 2 - 8) $config.padding = $config.size / 2 - 8;
	$: if ($config.radius < 0) $config.radius = 0;
	$: if ($config.radius > $config.size / 2) $config.radius = $config.size / 2;
	$: {
		if (canvas && backgroundCanvas && !$renderer) {
			$renderer = new Renderer({
				canvas: canvas,
				backgroundCanvas: backgroundCanvas,
				config: $config,
			});
		}
	}

	$: $config.svgText = svgText;
	$: $config.imgFormat = imgFormat;
	$: $config && $renderer?.setConfig($config);
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
		<button on:click={() => $renderer?.forceRefresh()} class="g-margin">Force refresh</button>
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
