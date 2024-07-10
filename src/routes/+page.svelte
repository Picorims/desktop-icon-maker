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
	import LinkToNewTab from '$lib/components/LinkToNewTab.svelte';
	import OptionEntry from '$lib/components/OptionEntry.svelte';
	import { config, Format, renderer } from '$lib/store';
	import { rawSVGtoDataURI } from '$lib/svg';

	let svgText = '';

	let svgRegExp = /^<svg.*>.*<\/svg>$/g;
	let forbiddenRegExp = /<script>|<iframe>|<object>|<embed>|<form>|<html>/g;
	function validSvg(svg: string) {
		svg = svg.trim();
		return new RegExp(svgRegExp).test(svg) && !new RegExp(forbiddenRegExp).test(svg);
	}

	let format = Format.PNG;

	async function exportIcon() {
		if (!$renderer) return;
		try {
			const blob = await $renderer.exportToFormat(format);
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = 'icon.' + format.split('/')[1];
			a.click();
		} catch (e) {
			console.error(e);
			alert('An error occurred while exporting the icon (see logs).');
		}
	}
</script>

<header>
	<h1>Desktop Icon Maker</h1>
</header>

<main>
	<p>This tool allows you to create custom icons to use in place of default directory icons.</p>
	<ul>
		<li>
			On <strong>Windows</strong>:
			<ul>
				<li>Export as .ico, or export as PNG and convert it to .ico.</li>
				<li>
					If you exported using .ico, open the file with GIMP and reexport it as .ico to fix the
					image encoding issues. (Otherwise the icon will look pixelated in the file explorer.)
				</li>
				<li>
					Place your icon in the directory you want to customize, or a subdirectory of this
					directory.
				</li>
				<li>
					Right click on the directory, click on "Properties", then "Customize", and "Change Icon".
					<strong>
						The icon cannot be relocated, or it will reset to the default directory icon!
					</strong>
					<details>
						<summary>To fix this (advanced!):</summary>
						<ul>
							<li><strong>Disclaimer: it may not work due to "EnableShellShortcutIconRemotePath", this this
								<LinkToNewTab href="https://answers.microsoft.com/en-us/windows/forum/windows_11-files/custom-folder-icons-on-networked-drives/528391e8-4dc8-41bc-8682-7f8f0314fa24?messageId=1f2f80dc-6a37-40ea-9eab-644445730ac2" >forum post</LinkToNewTab></strong>.
								Windows moment. The fallback is to <strong>still store the icon in a subdirectory, and manually fix the icon every time
									you relocate the directory.
								</strong>
							</li>
							<li>Place your icon in a subdirectory of the directory you want to customize.</li>
							<li>
								Open the desktop.ini file in the directory you want to customize. (System files
								should be visible in directory settings, a tutorial is available
								<LinkToNewTab
									href="https://answers.microsoft.com/en-us/windows/forum/all/cant-find-desktopini-file/6061b3bd-ee8c-4da9-bbe7-a26de8af38ab"
									>here</LinkToNewTab
								>.)
							</li>
							<li>
								Put a semi-colon (";") in front of IconResource to comment the line:
								<pre>;IconResource= ...</pre>
							</li>
							<li>
								Add the following lines (adapt the path to your icon):
								<pre>IconFile=..\subdirectory\icon.ico<br />IconIndex=0</pre>
								This is documented <LinkToNewTab
									href="https://learn.microsoft.com/en-us/windows/win32/shell/how-to-customize-folders-with-desktop-ini#create-a-desktopini-file"
									>here</LinkToNewTab
								>.
							</li>
							<li>Save the file, and press F5 to refresh the directory.</li>
						</ul>
					</details>
				</li>
				<li>To have</li>
			</ul>
		</li>
		<li>
			On <strong>MacOS</strong>, follow this Apple support tutorial:
			<a
				href="https://support.apple.com/en-gb/guide/mac-help/-mchlp2313/mac"
				target="_blank"
				rel="noopener noreferrer">tutorial</a
			>
		</li>
		<li>
			On <strong>Linux</strong>, right click on your directory, click on "Properties", and in
			"Basic" tab, click on the directory image.
		</li>
	</ul>
	<h2>Step 1 - Pick an icon</h2>
	<p>
		Go to an icon picker, such as the
		<LinkToNewTab href="https://lucide.dev/icons/">Lucide icon picker</LinkToNewTab>
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
	<IconCreator svgText={validSvg(svgText) ? svgText.trim() : ''} imgFormat={format} />

	<h2>Step 3 - Export in the desired format</h2>
	<OptionEntry title="Format" noBorder>
		<select slot="content" bind:value={format}>
			<option value={Format.PNG}>.png</option>
			<option value={Format.JPG}>.jpg/.jpeg</option>
			<option value={Format.ICO}>.ico (Windows)</option>
		</select>
	</OptionEntry>
	{#if format === Format.ICO && $config.size !== 256}
		<p><strong>It is recommended to use a size of 256 for .ico files.</strong></p>
	{/if}
	<button class="g-accent" on:click={exportIcon}>Export</button>
</main>

<footer>
	<p>MIT License - Copyright (c) 2024 Charly Schmidt alias Picorims (picorims.contact@gmail.com)</p>
	<p><LinkToNewTab href="http://github.com/picorims/desktop-icon-maker">GitHub</LinkToNewTab></p>
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
