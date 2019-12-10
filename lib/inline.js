import { setTicker } from 'ad-load'

import { loadImg, loadFont } from './load.js'

export function loadAssets() {
	if (window.InlineSrc && InlineSrc.assets) {
		console.log('Inline.loadAssets()')
		// filter out any preloader images
		const inlineAssets = InlineSrc.assets.filter(asset => !asset.preloader)
		const assetProcessPromises = inlineAssets.map(asset => {
			const isImageAsset = asset.src.indexOf('image') >= 0
			const processor = isImageAsset ? loadImg : loadFont
			return processor(asset)
		})
		return Promise.all(assetProcessPromises).then(results => {
			// should return only Images containing base64 image assets
			return results.filter(result => result)
		})
	}
	return Promise.resolve()
}
