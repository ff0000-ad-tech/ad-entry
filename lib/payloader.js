import Loader from "ad-load";

import { loadJs, loadFba } from './load.js'

/* -- PAYLOADER ----------------------------------------------
 *
 *
 */
export function execute() {
  console.log("Payloader.execute()");
  concatDependencies();
  return loadDependencies();
}
function concatDependencies() {
	window.adParams.dependencies = [...window.assets.external, ...window.assets.payload.text]
}

function loadDependencies() {
	console.log('Payloader.loadDependencies()')
	return new Promise((resolve, reject) => {
		const loadJsPromise = loadJs().then(() => {
			window.jsBundleLoadComplete && jsBundleLoadComplete()
		})
		const loadFbaPromise = loadFba()

		Promise.all([loadJsPromise, loadFbaPromise])
			.then(results => {
				// getting results of loadFba()
				const fbaImages = results[1]
				resolve(fbaImages)
			})
			.catch(err => {
				reject(err)
			})
	})
}
