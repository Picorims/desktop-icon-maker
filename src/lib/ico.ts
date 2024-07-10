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

import { icoSizes } from './store';

/**
 *
 * @param blob
 * @param initialSize
 * @see https://stackoverflow.com/a/65678517
 * @see https://stackoverflow.com/questions/63558462/how-to-parse-image-to-ico-format-in-javascript-client-side
 */
export async function toICOBlob(blob: Blob): Promise<Blob> {
	const sizes = icoSizes;
    // const sizes = [256];
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	const images: Uint8Array[] = [];
	const bitmap = await createImageBitmap(blob);
	for (const size of sizes) {
		canvas.width = size;
		canvas.height = size;
		ctx.clearRect(0, 0, size, size);
		ctx.beginPath();
		ctx.drawImage(bitmap, 0, 0, size, size);
		images.push(await toArrayBuffer(canvas));
	}

	const icoData = pngToIco(images);
	const outBlob = new Blob([new Uint8Array(icoData)], { type: 'image/x-icon' });
	return outBlob;
}

async function toArrayBuffer(canvas: HTMLCanvasElement): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(function (blob) {
            if (!blob) {
                reject(new Error('Could not get blob'));
            } else {
                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    if (!reader.result) {
                        reject(new Error('Could not read result'));
                    } else {
                        resolve(new Uint8Array(reader.result as ArrayBuffer));
                    }
                });
                reader.readAsArrayBuffer(blob);
            }
		}, 'image/png');
	});
}

/**
 * @see https://stackoverflow.com/a/65678517
 * @see https://en.wikipedia.org/wiki/ICO_(file_format)
 *
 * (tweaked by `Picorims` (typescript typing)
 *
 * (made by `@vanowm`)
 *
 * (inspired by `@id01`: https://stackoverflow.com/a/63700962)
 *
 * @license CC-BY-SA-4.0
 */
function pngToIco(images: Uint8Array[]) {
	const icoHead = [
		//.ico header
		// Reserved. Must always be 0 (2 bytes)
		0,
		0,
		// Specifies image type: 1 for icon (.ICO) image, 2 for cursor (.CUR) image. Other values are invalid. (2 bytes)
		1,
		0,
		images.length & 255,
		(images.length >> 8) & 255 // Specifies number of images in the file. (2 bytes)
	];
	let icoBody: number[] = [],
		pngBody: number[] = [];

	for (let i = 0, num, pngHead, pngData, offset = 0; i < images.length; i++) {
		pngData = Array.from(images[i]);
		pngHead = [
			//image directory (16 bytes)
			0, // Width 0-255, should be 0 if 256 pixels (1 byte)
			0, // Height 0-255, should be 0 if 256 pixels (1 byte)
			0, // Color count, should be 0 if more than 256 colors (1 byte)
			0, // Reserved, should be 0 (1 byte)
			// Color planes when in .ICO format, should be 0 or 1, or the X hotspot when in .CUR format (2 bytes)
			1,
			0,
			// Bits per pixel when in .ICO format, or the Y hotspot when in .CUR format (2 bytes)
			32,
			0
		];
		num = pngData.length;
		for (let i = 0; i < 4; i++) pngHead[pngHead.length] = (num >> (8 * i)) & 255; // Size of the bitmap data in bytes (4 bytes)

		num = icoHead.length + (pngHead.length + 4) * images.length + offset;
		for (let i = 0; i < 4; i++) pngHead[pngHead.length] = (num >> (8 * i)) & 255; // Offset in the file (4 bytes)

		offset += pngData.length;
		icoBody = icoBody.concat(pngHead); // combine image directory
		pngBody = pngBody.concat(pngData); // combine actual image data
	}
	return icoHead.concat(icoBody, pngBody);
}
