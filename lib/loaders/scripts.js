export const loadScript = async path => {
	console.log(` -> ${path}`)
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.charset = 'utf-8'
		script.onload = resolve
		script.onerror = reject
		script.src = path
		document.getElementsByTagName('head')[0].appendChild(script)
	})
}
