/* -- PRELOADER ----------------------------------------------
 *
 *	Note:
 *
 *	`assets` is `window.assets`, declared in the index.html
 *
 */
let preloader
let borderWidth
//
export function prepare() {
	console.log('Preloader.prepare()')
	borderWidth = assets.preloader.borderWidth || 0
	preloader = document.getElementById('preloader')
	preloader.style.display = 'none'
	return load()
}

// as preloader loads & plays, payload should begin loading as soon as polite-reqs allow (see polite.js)
let completeResolve
let completeReject
export var isComplete = new Promise((resolve, reject) => {
	completeResolve = resolve
	completeReject = reject
})
function resolveIsComplete() {
	console.log('Preloader.isComplete()')
	completeResolve()
}

function load() {
	assets.preloadedImages = []
	// begin loading the images
	let promises = []
	assets.preloader.images.forEach(pdata => {
		promises.push(loaderPreloaderImage(pdata))
	})
	Promise.all(promises)
		.then(() => {
			applyContainerStyle()
			// do final isComplete resolve once startDelay is passed
			if (assets.preloader.startDelay > 0) {
				setTimeout(() => {
					resolveIsComplete()
				}, assets.preloader.startDelay * 1000)
			} else {
				resolveIsComplete()
			}
		})
		.catch(err => {
			completeReject(err)
		})
	return Promise.resolve()
}

function loaderPreloaderImage(pdata) {
	function _uriToBlob(dataURI) {
		// convert base64 to raw binary data held in a string
		// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
		const byteString = window.atob(dataURI.split(',')[1]);
		// separate out the mime component
		const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
		// write the bytes of the string to an ArrayBuffer
		const ab = Uint8Array.from(byteString, ch => ch.charCodeAt(0)).buffer;
		// write the ArrayBuffer to a blob, and you're done
		return new Blob([ab], { type: mimeString });
	}
	function _loadImage(addToLibrary) {
		var img = new Image()
		img.onload = function (event) {
			if (addToLibrary) {
				const id = pdata.source.split('/')
				img.id = id[id.length - 1].split('.')[0]
				assets.preloadedImages.push(img)
			} else {
				applyImageStyle(img, pdata)
				preloader.appendChild(img)
			}
		}
		// ** note: InlineSrc is introduced by the webpack "inline" entry bundle
		const dataURI = window.InlineSrc.get('images/' + pdata.source)
		img.src = URL.createObjectURL(_uriToBlob(dataURI))
	}

	return new Promise((resolve, reject) => {
		Promise.all([])
			.then(() => {
				console.log('\tLoading preloader image for preloader application')
				_loadImage()
			})
			.then(() => {
				console.log('\tLoading preloader image for ImageManager application')
				_loadImage(true)
			})
			.then(() => {
				resolve()
			})
			.catch(err => {
				reject(err)
			})
	})
}

function applyContainerStyle() {
	let styleCss = 'width: ' + adParams.preloaderWidth + 'px; height: ' + adParams.preloaderHeight + 'px; '
	if (adParams.responsive) styleCss = 'width: 100%; height: 100%; '

	preloader.style.cssText =
		'display: block; overflow: hidden; position: absolute; ' +
		'top:' +
		adParams.preloaderY +
		'px; left:' +
		adParams.preloaderX +
		'px; ' +
		(assets.preloader.gradient ? 'background-image: ' + assets.preloader.gradient + '; ' : '') +
		styleCss +
		'border-color: ' +
		(assets.preloader.borderColor || assets.preloader.backgroundColor) +
		'; border-width: ' +
		borderWidth +
		'px; background-color: ' +
		assets.preloader.backgroundColor +
		'; '
}

function applyImageStyle(img, pdata) {
	if (!pdata.offset) pdata.offset = { x: 0, y: 0 }
	img.width *= pdata.scale || 1
	img.height *= pdata.scale || 1
	const left = Math.round((adParams.preloaderWidth - img.width) / 2 + (pdata.offset.x || 0) - borderWidth)
	const top = Math.round((adParams.preloaderHeight - img.height) / 2 + (pdata.offset.y || 0) - borderWidth)
	img.style.cssText = 'position: absolute; left: ' + left + 'px; top: ' + top + 'px;'
}
