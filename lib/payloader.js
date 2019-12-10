import { fbaDataToBlobs } from 'ad-global'

import { loadJs, loadFba } from './load.js'

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

var fbaImages
function loadDependencies() {
	console.log('Payloader.loadDependencies()')
	return new Promise((resolve, reject) => {
		Promise.all([loadJs(), loadFba()])
			.then(() => {
				resolve(fbaImages)
			})
			.catch(err => {
				reject(err)
			})
	})
}
