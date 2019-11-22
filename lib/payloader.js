/* -- PAYLOADER ----------------------------------------------
 *
 *
 */
export function execute() {
	console.log('Payloader.execute()')
	concatDependencies()
	return loadDependencies()
}
function concatDependencies() {
	window.adParams.dependencies = [].concat(window.externalIncludes).concat(window.adParams.adPath + window.assets.payload.text)
}

var fbaContent
function loadDependencies() {
	console.log('Payloader.loadDependencies()')
	return new Promise((resolve, reject) => {
		Promise.all([loadJs(), loadFba()])
			.then(() => {
				resolve(fbaContent)
			})
			.catch(err => {
				reject(err)
			})
	})
}

function loadJs() {
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

function loadFba() {
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
			const blobAssets = fbaDataToBlobURLs(dataRaw)
			const assetLoadPromises = blobAssets.map(blobAsset => {
				const isFont = /(ttf|woff)/.test(blobAsset.fileType)
				const assetLoader = isFont ? loadFont : loadImg
				return assetLoader(blobAsset)
			})
			return (
				Promise.all(assetLoadPromises)
					// filter only truthy Promise results
					.then(loadResults => {
						const fbaImages = loadResults.filter(Boolean)

						fbaContent = {
							getAllContentRaw: () => fbaImages
						}
					})
			)
		})
	} else {
		return Promise.resolve()
	}
}

function fbaDataToBlobURLs(dataRaw) {
	// console.log("_addFbaSubLoads()", loader)

	// Conversion between uint8s and uint32s.
	let uint8 = new Uint8Array(4)
	let uint32 = new Uint32Array(uint8.buffer)

	// start after = signature(8 bytes) + IHDR(25 bytes) + fbAc(16 bytes total, but only 11: size,type,content-1 )
	let idx = 44

	const chunkTotal = new Uint8Array(dataRaw, idx, 1)[0]
	//console.log( 'number of images as chunks:', chunkTotal )

	// skip over rest of fbAc chunk: count value byte + CRC 4 bytes
	idx += 5

	const blobs = []
	for (let i = 0; i < chunkTotal; i++) {
		// size, type, content, crc
		// get the size of next chunk as on UintArray
		let sizeOfChunk = new Uint8Array(dataRaw, idx, 4)

		// Read the length of the current chunk, which is stored as a Uint32.
		// this one has to be a loop, as values get assigned to uint8, that changes buffer of uint32
		// also, the values must be set reversed, henced the count down loop
		let up = 4
		for (var k = 0; k < 4; k++) {
			//console.log( k, up, sizeOfChunk[k] )
			uint8[--up] = sizeOfChunk[k]
		}

		// all chunk data NOT including the type
		let length = uint32[0]

		idx += 7

		// Get the chunk type in ASCII, only last character really matters
		let type = String.fromCharCode.apply(String, new Uint8Array(dataRaw, idx++, 1))

		// console.log('\ttype:', type, '\tlength:', length)
		let fileNameLengthArray = new Uint8Array(dataRaw, idx + 3, 1)
		let fileNameLength = fileNameLengthArray[0] || 0 // default to zero incase array fails? maybe unnecessary

		let nameBuffer = new Uint8Array(dataRaw, idx + 4, fileNameLength)
		let fileName = String.fromCharCode.apply(String, nameBuffer)

		// first add to the file name length 4 bytes: file name length byte count
		fileNameLength += 4

		// offset the array start and length by the file name length
		let chunkData = new Uint8Array(dataRaw, idx + fileNameLength, length - fileNameLength)
		// NOTE: ArrayBuffer.slice() does not exist in IE10, so have to do it manually inline
		//var chunkData = new Uint8Array(chunk.buffer.slice(4))

		// skip over the content AND skip over the CRC value by incrementing by 4 bytes
		idx += length + 4

		let fileNameSplit = fileName.split('.')
		const assetName = fileNameSplit[0]
		const fileType = fileNameSplit[1]
		//var blobFileType = '';// 'application/octet-stream';
		let blobFileType
		if (type === 'f') {
			blobFileType = 'application/' + (fileNameSplit[1] === 'ttf' ? 'x-font-ttf' : `font-${fileNameSplit[1]}`)
		} else {
			blobFileType = 'image/' + (fileNameSplit[1] == 'svg' ? 'svg+xml' : fileNameSplit[1])
		}
		let blob = new Blob([chunkData], { type: blobFileType })
		let url = URL.createObjectURL(blob)
		// url will be ~ blob:32c3c7af-ef04-414f-a073-685602fe8a28
		blobs.push({ path: assetName, src: url, fileType })
	}
	return blobs
}

function loadFont(asset) {
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

	return new Promise((resolve, reject) => {
		const font = asset.path
		const content = ' !"\\#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~'
		const css =
			'position:absolute; top:-1000px; font-size:100px; font-family:san-serif; font-variant:normal; font-style:normal; font-weight:normal; letter-spacing:0; white-space:nowrap;'
		const fontLoadChecker = document.createElement('div')
		fontLoadChecker.innerHTML = content
		fontLoadChecker.style.cssText = css
		fontLoadChecker.style.fontFamily = font

		document.body.appendChild(fontLoadChecker)
		const initWidth = fontLoadChecker.offsetWidth

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

function loadImg(asset) {
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
