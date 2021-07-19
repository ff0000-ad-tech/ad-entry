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
const begin = async () => {
	try {
		await polite.prepare(window.adParams.politeLoadAfter)
		// prepare vendor onload (Network.js)
		await window.prepareIndex()
		// prepare scope
		scope.prepare()
		// misc index control
		await window.prepareAdParamsMisc()
		// prepare network
		await window.prepareNetworkExit()

		// prepare preloader
		const images = preloader.prepare(window.assets.preloader)
		// allow index custom preloader routines to resolve
		preloaderComplete = window.preparePreloader(images) || Promise.resolve()

		// finish polite timeout (some networks require delay before asset load)
		await polite.resolveDelay()

		// preload fonts and images
		const binaryImages = await payloader.execute()
		// include preloader for build
		const inlineImages = await inline.loadAssets()

		// preload complete
		await preloaderComplete

		// launch polite
		window.onImpression([...binaryImages, ...inlineImages])
	} catch (err) {
		console.error(err)
		window.useBackup()
	}
}
begin()
