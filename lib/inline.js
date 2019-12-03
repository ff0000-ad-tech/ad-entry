import { setTicker } from 'ad-load'

export function loadAssets() {
	if (window.InlineSrc && InlineSrc.assets) {
		console.log('Inline.loadAssets()')
		// filter out any preloader images
		const inlineAssets = InlineSrc.assets.filter(asset => !asset.preloader)
		const assetProcessPromises = inlineAssets.map(asset => {
			const isImageAsset = asset.src.indexOf('image') >= 0
			const processor = isImageAsset ? processBase64Img : processBase64Font
			return processor(asset)
		})
		return Promise.all(assetProcessPromises).then(results => {
			// should return only Images containing base64 image assets
			return results.filter(result => result)
		})
	}
	return Promise.resolve()
}

// TODO: keep in ad-load but extract functionality within that module?
function processBase64Font(asset) {
	let format = 'truetype'
	if (asset.src.match(/woff/)) {
		format = 'woff'
	}
	const assembledFontRule = "@font-face { font-family: '" + asset.path + "'; src: url(" + asset.src + ") format('" + format + "'); }"

	let getSheet = document.getElementById('RED_fontStyleSheet')
	if (getSheet) {
		getSheet.innerHTML += assembledFontRule
	} else {
		let styleScript = document.createElement('style')
		styleScript.type = 'text/css'
		styleScript.media = 'screen'
		styleScript.id = 'RED_fontStyleSheet'
		styleScript.appendChild(document.createTextNode(assembledFontRule))
		document.getElementsByTagName('head')[0].appendChild(styleScript)
	}

	return new Promise((resolve, reject) => {
		setTicker({
			content: ' !"\\#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~',
			css:
				'position:absolute; top:-1000px; font-size:100px; font-family:san-serif; font-variant:normal; font-style:normal; font-weight:normal; letter-spacing:0; white-space:nowrap;',
			font: asset.path,
			handleTickerComplete: resolve,
			handleFail: reject
		})
	})
}

function processBase64Img(asset) {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.id = asset.path
		img.onload = () => {
			resolve(img)
		}
		img.onfail = reject
		img.src = asset.src
	})
}
