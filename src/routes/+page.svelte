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

	import IconCreator from '$lib/components/IconCreator.svelte';
	import OptionEntry from '$lib/components/OptionEntry.svelte';
	import { rawSVGtoDataURI } from '$lib/svg';

	let svgText = '';

	let svgRegExp = /^<svg.*>.*<\/svg>$/g;
	let forbiddenRegExp = /<script>|<iframe>|<object>|<embed>|<form>|<html>/g;
	function validSvg(svg: string) {
		svg = svg.trim();
		return new RegExp(svgRegExp).test(svg) && !new RegExp(forbiddenRegExp).test(svg);
	}

	enum Format {
		PNG = 'image/png',
		JPG = 'image/jpeg'
	}
    let format = Format.PNG;
    let blob: Blob;

    function exportIcon() {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'icon.' + format.split('/')[1];
        a.click();
    }
</script>

<header>
	<h1>Desktop Icon Maker</h1>
</header>

<main>
    <p>
        This tool allows you to create custom icons to use
        in place of default directory icons.
    </p>
    <ul>
        <li>
            On <strong>Windows</strong>, right click on the directory,
            click on "Properties", then "Customize", and "Change Icon".
        </li>
        <li>
            On <strong>MacOS</strong>, follow this Apple support tutorial: <a href="https://support.apple.com/en-gb/guide/mac-help/-mchlp2313/mac" target="_blank" rel="noopener noreferrer">tutorial</a>
        </li>
        <li>On <strong>Linux</strong>, right click on your directory, click on "Properties", and in "Basic" tab, click on the directory image.</li>
    </ul>
	<h2>Step 1 - Pick an icon</h2>
	<p>
		Go to an icon picker, such as the
		<a href="https://lucide.dev/icons/">Lucide icon picker</a>
		and choose an icon. Once you found your favorite one,
        <strong>export it as SVG.</strong>
	</p>
	<textarea bind:value={svgText}></textarea>
	{#if svgText && validSvg(svgText)}
		<img src={rawSVGtoDataURI(svgText)} alt="icon preview" class="icon-preview" />
	{:else if svgText}
		<p class="feedback">Invalid SVG.</p>
	{:else}
		<p class="feedback">Enter an SVG above.</p>
	{/if}

	<h2>Step 2 - Create the icon</h2>
	<p>Customize the appearance below:</p>
	<IconCreator svgText={validSvg(svgText) ? svgText.trim() : ''} imgFormat={format} onRefresh={(b) => blob = b} />

	<h2>Step 3 - Export in the desired format</h2>
	<OptionEntry>
		<span slot="title">Format: </span>
		<select slot="content" bind:value={format}>
			<option value={Format.PNG}>.png</option>
			<option value={Format.JPG}>.jpg/.jpeg</option>
		</select>
	</OptionEntry>
    <button class="g-accent" on:click={exportIcon}>Export</button>
</main>

<footer>
	<p>MIT License - Copyright (c) 2024 Charly Schmidt alias Picorims (picorims.contact@gmail.com)</p>
</footer>

<style>
	textarea {
		width: 100%;
	}

	img.icon-preview {
		width: 128px;
		height: auto;
		background-color: var(--background-500);
		border-radius: 4px;
	}
</style>
