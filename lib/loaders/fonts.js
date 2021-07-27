export const loadFont = async asset => {
	console.log(` loadFont -> ${asset.src}`)
	let fontLoadPromise
	if (document.fonts && window.FontFace && !_hasSafari10Bug()) {
		const font = new FontFace(asset.path, `url(${asset.src})`)
		await font.load()
		document.fonts.add(font)
		fontLoadPromise = Promise.resolve()
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
