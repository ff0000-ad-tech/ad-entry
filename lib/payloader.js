import { loadScripts, loadFonts, loadImages } from './load.js'

/* -- PAYLOADER ----------------------------------------------
 *
 *
 */
export const execute = async () => {
	console.log('Payloader.execute()')
	concatDependencies()
	return await loadDependencies()
}
function concatDependencies() {
	window.adParams.dependencies = [...window.assets.external, ...window.assets.payload.text]
}

const loadDependencies = async () => {
	console.log('Payloader.loadDependencies()')
	const results = await Promise.all([loadScripts(), loadFonts(), loadImages()])
	// return results of loadImages()
	return results[2]
}
