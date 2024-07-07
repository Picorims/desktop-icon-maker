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

    let svgText = "";

    function rawSVGtoDataURI(svg: string) {
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        return URL.createObjectURL(svgBlob);
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
    <img src={rawSVGtoDataURI(svgText)} alt="icon preview" class="icon-preview">
</main>

<footer>
    <p>MIT License - Copyright (c) 2024 Charly Schmidt alias Picorims (picorims.contact@gmail.com)</p>
</footer>

<style>
    header, footer {
        text-align: center;
        padding: 1rem;
        background-color: var(--background-100);
    }

    main {
        padding: 2rem;
    }

    h2 {
        margin-top: 1.5rem;
        margin-bottom: 1rem;
    }

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