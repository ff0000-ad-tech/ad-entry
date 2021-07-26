import { generateAsset } from './utils.js'

export const loadImage = async path => {
	console.log(` -> ${path}`)
	const asset = generateAsset(path)
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.id = asset.id
		img.onload = () => {
			resolve(img)
		}
		img.onfail = reject
		img.src = asset.src
	})
}
