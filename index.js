import * as scope from './lib/scope.js'
import * as polite from './lib/polite.js'
import * as preloader from './lib/preloader.js'
import * as payloader from './lib/payloader.js'

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
		const preloaders = await preloader.loadPreloaders(window.assets)
		// allow index custom preloader routines to resolve
		preloaderComplete = window.preparePreloader(preloaders) || Promise.resolve()

		// finish polite timeout (some networks require delay before asset load)
		await polite.resolveDelay()

		// load build payloads: fonts, scripts, images, binaries
		const assets = await payloader.loadAssets(window.assets)

		// preload complete
		await preloaderComplete

		// launch polite
		window.onImpression({ ...assets, preloaders })
	} catch (err) {
		console.error(err)
		window.useBackup()
	}
}
begin()
