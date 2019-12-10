import { fbaDataToBlobs } from 'ad-global'

export function loadJs() {
	const jsLoadPromises = window.adParams.dependencies.map(dep => {
		const jsLoadPromise = new Promise((resolve, reject) => {
			const script = document.createElement('script')
			script.type = 'text/javascript'
			script.charset = 'utf-8'
			script.onload = resolve
			script.onerror = reject
			script.src = dep
			document.getElementsByTagName('head')[0].appendChild(script)
		})
		return jsLoadPromise
	})

	return Promise.all(jsLoadPromises)
}

export function loadFba() {
	if (window.assets.payload.binary.length) {
		return new Promise((resolve, reject) => {
			const fbaPath = window.adParams.adPath + window.assets.payload.binary[0]
			const req = new XMLHttpRequest()
			req.onreadystatechange = function(target) {
				if (req.readyState === 4) {
					if (req.status == 200) {
						resolve(req.response)
					} else {
						reject({ target })
					}
				}
			}
			req.open('GET', fbaPath, true)
			req.responseType = 'arraybuffer'
			req.send()
		}).then(dataRaw => {
			const blobAssets = fbaDataToBlobs(dataRaw)
			const assetLoadPromises = blobAssets.map(blobAsset => {
				const isFont = /(ttf|woff)/.test(blobAsset.fileType)
				const assetLoader = isFont ? loadFont : loadImg
				return assetLoader(blobAsset)
			})
			return (
				Promise.all(assetLoadPromises)
					// filter only truthy Promise results
					.then(loadResults => {
						return loadResults.filter(Boolean)
					})
			)
		})
	} else {
		return Promise.resolve()
	}
}

export function loadFont(asset) {
	let fontLoadPromise
	if (document.fonts && window.FontFace && !_hasSafari10Bug()) {
		const font = new FontFace(asset.path, `url(${asset.src})`)
		fontLoadPromise = font
			.load()
			.then(font => {
				document.fonts.add(font)
			})
			.catch(err => {
				console.error(`Font (${asset.src}) failed to load`)
				throw err
			})
	} else {
		let format = 'truetype'
		if (asset.fileType.match(/woff/)) {
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

		fontLoadPromise = new Promise((resolve, reject) => {
			const font = asset.path
			const content = ' !"\\#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~'
			const css =
				'position:absolute; top:-1000px; font-size:100px; font-family:san-serif; font-variant:normal; font-style:normal; font-weight:normal; letter-spacing:0; white-space:nowrap;'
			const fontLoadChecker = document.createElement('div')
			fontLoadChecker.innerHTML = content
			fontLoadChecker.style.cssText = css

			document.body.appendChild(fontLoadChecker)
			const initWidth = fontLoadChecker.offsetWidth
			fontLoadChecker.style.fontFamily = font

			const timeout = setTimeout(() => {
				clearInterval(interval)
				reject(new Error(`Font (${asset.src}) failed to load`))
			}, 5000)

			const interval = setInterval(() => {
				if (fontLoadChecker.offsetWidth !== initWidth) {
					clearTimeout(timeout)
					clearInterval(interval)
					resolve()
				}
			}, 10)
		})
	}

	return fontLoadPromise
}

/**
 * Safari 10 check borrowed from FontFaceObserver
 * Certain versions of Safari 10 don't have reliable native font loading
 * For reference: https://github.com/bramstein/fontfaceobserver/blob/20e40d09331510957d238f55790c83670de40af1/src/observer.js#L98-L126
 */
function _hasSafari10Bug() {
	var match = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent)
	return match && parseInt(match[1], 10) < 603
}

export function loadImg(asset) {
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
