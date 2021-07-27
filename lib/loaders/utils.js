export const generateAsset = path => {
	const basename = path
		.split('/')
		.pop()
		.replace(/\..+$/, '')
	return {
		path: basename,
		src: path
	}
}
