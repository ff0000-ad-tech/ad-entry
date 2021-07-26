import { loadFont } from './loaders/fonts.js'
import { loadScript } from './loaders/scripts.js'
import { loadImage } from './loaders/images.js'
import { loadFba } from './loaders/binaries.js'
// import { loadInline } from './loaders/inline.js'

/* -- PAYLOADER ----------------------------------------------
 *
 *
 */
export const loadAssets = async () => {
	console.log('Payloader.loadAssets()')
	// load assets
	try {
		const res = await Promise.all([
			loadFonts(window.assets.fonts),
			loadScripts(window.assets.scripts),
			loadImages(window.assets.images),
			loadBinaries(window.assets.binaries)
			/* , const inlines = loadInline() */
		])
		console.log(res)
		// return image type assets for build ImageManager, see @ff0000-ad-tech/ad-assets
		return { fonts: res[0], scripts: res[1], images: res[2], binaries: res[3] }
	} catch (err) {
		console.warn(`Unable to load assets`)
		throw err
	}
}

const loadFonts = async reqs => {
	return await Promise.all(reqs.map(async req => await loadFont(req)))
}
const loadScripts = async reqs => {
	return await Promise.all(reqs.map(async req => await loadScript(req)))
}
const loadImages = async reqs => {
	return await Promise.all(reqs.map(async req => await loadImage(req)))
}
const loadBinaries = async reqs => {
	return await Promise.all(reqs.map(async req => await loadFba(req)))
}
