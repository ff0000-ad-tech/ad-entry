export const generateAsset = path => {
	const basename = path
		.split('/')
		.pop()
		.replace(/\..+$/, '')
	return {
		id: basename,
		src: path
	}
}
