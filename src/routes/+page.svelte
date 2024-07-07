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

	import IconCreator from "$lib/components/IconCreator.svelte";
	import { rawSVGtoDataURI } from "$lib/svg";

    let svgText = "";

    let svgRegExp = /^<svg.*>.*<\/svg>$/g;
    let forbiddenRegExp = /<script>|<iframe>|<object>|<embed>|<form>|<html>/g;
    function validSvg(svg: string) {
        svg = svg.trim();
        return new RegExp(svgRegExp).test(svg) && !new RegExp(forbiddenRegExp).test(svg);
    }
</script>

<header>
    <h1>Desktop Icon Maker</h1>
</header>

<main>
    <h2>Step1 - Pick an icon</h2>
    <p>
        Go to an icon picker, such as the
        <a href="https://lucide.dev/icons/">Lucide icon picker</a>
        and choose an icon. Once you found your favorite one, export it as SVG.
    </p>
    <textarea bind:value={svgText}></textarea>
    {#if svgText && validSvg(svgText)}
        <img src={rawSVGtoDataURI(svgText)} alt="icon preview" class="icon-preview">
    {:else}
        {#if svgText}
            <p class="feedback">Invalid SVG.</p>
        {:else}
            <p class="feedback">Enter an SVG above.</p>
        {/if}
    {/if}
    <h2>Step2 - Create the icon</h2>
    <p>Customize the appearance below:</p>
    <IconCreator svgText={validSvg(svgText)? svgText.trim() : ""} />
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