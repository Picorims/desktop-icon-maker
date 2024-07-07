<script lang="ts">
	import { rawSVGtoDataURI } from "$lib/svg";
	import { text } from "@sveltejs/kit";
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
    import chroma from "chroma-js";
	import { draw } from "svelte/transition";

	export let svgText: string = "";
    const defaultSizes = [16, 24, 32, 48, 64, 96, 128, 256, 512];
	let size = 64;
    let canvas: HTMLCanvasElement;
    let backgroundColor = "#000000";
    let strokeColor = "#ffffff";
    let opacity = 1;
    let cachedImg: HTMLImageElement | null = null;

    function refresh() {
        console.log("refresh");
        if (svgText === "") return;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // reset
        ctx.clearRect(0, 0, size, size);
        // background grid
        const gridSize = 8;
        for (let i = 0; i < size; i += gridSize) {
            for (let j = 0; j < size; j += gridSize) {
                ctx.fillStyle = ((i/gridSize + j/gridSize)%2 === 0)? "#666" : "#aaa";
                ctx.fillRect(i, j, 8, 8);
            }
        }

        // icon background
        ctx.fillStyle = backgroundColor;
        ctx.globalAlpha = opacity;
        ctx.rect(0, 0, size, size);
        ctx.fill();

        // icon
        const parser = new DOMParser();
        const svg = parser.parseFromString(svgText, "image/svg+xml").querySelector("svg");
        if (!svg) return;
        svg.setAttribute("stroke", strokeColor);
        const uri = rawSVGtoDataURI(svg.outerHTML);
        const img = new Image(size, size);
        img.src = uri;

        const drawImg = () => {
            ctx.save();
            ctx.fillStyle = "transparent";
            ctx.globalAlpha = 1;
            ctx.drawImage(img, 0, 0, size, size);
            ctx.restore();
        }

        if (cachedImg) cachedImg.removeEventListener("load", drawImg);
        cachedImg = img;
        img.addEventListener("load", drawImg);
    }

    $: {
        if (canvas) {
            canvas.width = size;
            canvas.height = size;
            refresh();
        }
    }
    $: svgText && refresh();
</script>

<div class="container">
    <fieldset>
        <legend>Configuration</legend>
        <div>
            <label>
                Size:
                <input type="number" bind:value={size} on:input={refresh}>
            </label>
            <div class="button-list">
                {#each defaultSizes as defaultSize}
                    <button on:click={() => size = defaultSize}>{defaultSize}</button>
                {/each}
            </div>
        </div>
        <div>
            <label>
                Background color:
                <input type="color" bind:value={backgroundColor} on:input={refresh}>
                <span>{backgroundColor}</span>
            </label>
        </div>
        <div>
            <label>
                Icon stroke color:
                <input type="color" bind:value={strokeColor} on:input={refresh}>
                <span>{strokeColor}</span>
            </label>
        </div>
        <div>
            <label>
                Opacity:
                <input type="range" min="0" max="1" step="0.01" bind:value={opacity} on:input={refresh}>
                <span>{opacity}</span>
            </label>
        </div>
        <button on:click={refresh} class="g-margin">Force refresh</button>
    </fieldset>
    <canvas bind:this={canvas}></canvas>
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
	canvas {
        display: block;
		margin: 1rem auto;
        border: 1px solid var(--background-500);
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
