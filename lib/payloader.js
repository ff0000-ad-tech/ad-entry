import { loadFont } from './loaders/fonts.js'
import { loadScript } from './loaders/scripts.js'
import { loadImage } from './loaders/images.js'
import { loadFba } from './loaders/binaries.js'
import { generateAsset } from './loaders/utils.js'

/* -- PAYLOADER ----------------------------------------------
 *
 *
 */
export const loadAssets = async assets => {
	console.log('Payloader.loadAssets()')
	// load assets
	const res = await Promise.all([
		loadFonts(assets.fonts),
		loadScripts(assets.scripts),
		loadImages(assets.images),
		loadBinaries(assets.binaries)
	])
	// image assets are needed for build's ImageManager, see @ff0000-ad-tech/ad-assets
	return { images: res[2], binaries: res[3] }
}

const loadFonts = async reqs => {
	return await Promise.all(
		reqs.map(async req => {
			const asset = generateAsset(req)
			return await loadFont(asset)
		})
	)
}
const loadScripts = async reqs => {
	return await Promise.all(reqs.map(async req => await loadScript(req)))
}
const loadImages = async reqs => {
	return await Promise.all(
		reqs.map(async req => {
			const asset = generateAsset(req)
			return await loadImage(asset)
		})
	)
}
const loadBinaries = async reqs => {
	return await reqs.reduce(async (acc, req) => {
		acc = await acc
		const fbaAssets = await loadFba(req)
		acc = [...acc, ...fbaAssets]
		return acc
	}, Promise.resolve([]))
}
