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
		window.addEventListener('unhandledrejection', handleError)
	}
}

function handleError(e) {
	e.preventDefault()
	console.log('Scope.handleError() - JAVASCRIPT ERROR!')
	// note: global prevents minification from removing this console log
	if (e.cause) {
		global.console.error(e.cause)
	} else {
		global.console.error(e)
	}
	// after the first error, disable the event listening
	window.onerror = () => {}
	window.removeEventListener('unhandledrejection', handleError)
	// failover
	window.useBackup()
	return true
}
