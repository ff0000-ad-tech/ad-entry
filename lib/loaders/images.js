export const loadImage = async asset => {
	console.log(` loadImage -> ${asset.src}`)
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
