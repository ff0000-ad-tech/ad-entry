import * as scope from './lib/scope.js'
import * as polite from './lib/polite.js'
import * as preloader from './lib/preloader.js'
import * as payloader from './lib/payloader.js'
import * as inline from './lib/inline.js'

/*
 * 	NOTE:
 *
 *	This class expects window-scoped methods to exist
 *
 */
// callback to allow control of when polite-load launches
let preloaderComplete

polite
	.prepare(window.adParams.politeLoadAfter)

	// prepare vendor onload (Network.js)
	.then(() => window.prepareIndex())

	// prepare scope
	.then(() => scope.prepare())

	// misc index control
	.then(() => window.prepareAdParamsMisc())

	// prepare network
	.then(() => window.prepareNetworkExit())

	// prepare preloader
	.then(() => {
		const images = preloader.prepare(window.assets.preloader)
		preloaderComplete = window.preparePreloader(images) || Promise.resolve()
	})

	// finish polite timeout
	.then(() => polite.resolveDelay())

	// prepare payload
	.then(() => payloader.execute())

	// load any inlined base64 assets
	.then(fbaImages => {
		return inline.loadAssets().then((base64Images = []) => {
			// get dataRaw from loaders
			return [...base64Images, ...fbaImages]
		})
	})

	// launch polite
	.then(binaryAssets => {
		preloaderComplete.then(() => window.onImpression(binaryAssets))
	})

	.catch(err => {
		console.error(err)
		window.useBackup()
	})
