/* -- PRELOADER ----------------------------------------------
 *
 *	Preloader images are declared in the index.
 *
 *	Webpack wp-payload-plugin then inlines these images in the index,
 *	which alleviates the delay of requesting preloader images at runtime.
 *
 *	Note:
 *
 *	`window.assets` is declared in the index.html
 *
 */
export const prepare = inlineImageIds => {
	console.log('Preloader.prepare()')
	console.log(inlineImageIds)
	window.assets.preloadedImages = inlineImageIds.map(inlineImageId => {
		return createImgElement(inlineImageId)
	})
	return window.assets.preloadedImages
}

const createImgElement = inlineImageId => {
	const img = new Image()
	img.onload = () => {
		// make available to ImageManager
		const id = pdata.source.split('/')
		img.id = id[id.length - 1].split('.')[0]
	}
	// ** note: InlineSrc is introduced by the webpack "inline" entry bundle
	const dataURI = window.InlineSrc.get(inlineImageId)
	img.src = URL.createObjectURL(uriToBlob(dataURI))
	return img
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
