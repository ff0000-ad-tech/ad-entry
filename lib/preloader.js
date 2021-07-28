import { loadImage } from './loaders/images.js'
import { generateAsset } from './loaders/utils.js'

/* -- PRELOADER ----------------------------------------------
 *
 *	Preloader images are declared in the index on `window.assets`.
 *
 *	wp-plugin-index creates imports for each preloader asset
 *	in @size/.inline-imports.js, which is a Webpack entry.
 *
 *  The output bundle that is generated is then injected into the index,
 * 	which includes preloader images as base64 assets.
 *
 *	Here we create image elements from the assets.
 *
 */
export const loadPreloaders = async assets => {
	console.log('Preloader.loadPreloaders()')
	return await Promise.all(
		assets.preloaders.map(async path => {
			const asset = generateAsset(path)
			return await loadPreloader(asset)
		})
	)
}

const loadPreloader = async asset => {
	console.log(` loadPreloader -> ${asset.src}`)
	// change asset.src from path to base64 data
	const dataURI = window.InlineSrc.get(asset.src)
	asset.src = URL.createObjectURL(uriToBlob(dataURI))
	// create an img element
	return await loadImage(asset)
}

const uriToBlob = dataURI => {
	// convert base64 to raw binary data held in a string
	// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
	const byteString = window.atob(dataURI.split(',')[1])
	// separate out the mime component
	const mimeString = dataURI
		.split(',')[0]
		.split(':')[1]
		.split(';')[0]
	// write the bytes of the string to an ArrayBuffer
	const ab = Uint8Array.from(byteString, ch => ch.charCodeAt(0)).buffer
	// write the ArrayBuffer to a blob, and you're done
	return new Blob([ab], { type: mimeString })
}
