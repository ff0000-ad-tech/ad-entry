export function prepare() {
	prepareAdParams()
	prepareOnError()
}

function prepareAdParams() {
	console.log('Scope.prepareAdParams()')
	adParams.adSize = adParams.adWidth + 'x' + adParams.adHeight
}

function prepareOnError() {
	console.log('Scope.prepareOnError()')
	if (adParams.failoverOnError) {
		window.onerror = handleError
	}
}

function handleError(message, source, lineno, colno, error) {
	console.log('Scope.handleError() - JAVASCRIPT ERROR!')
	window.useBackup()
	global.console.error(error) // global prevents minification from removing this console log
	return true
}
