export function prepare() {
	prepareAdParams()
	prepareQueryParams()
	checkForAdTagParams()
	prepareOnError()
}

function prepareAdParams() {
	console.log('Scope.prepareAdParams()')
	adParams.adSize = adParams.adWidth + 'x' + adParams.adHeight
}

function prepareQueryParams() {
	console.log('Scope.prepareQueryParams()')
	queryParams = getQueryParams()
}

function checkForAdTagParams() {
	console.log('Scope.checkForAdTagParams()')
	for (var key in queryParams) {
		var value = queryParams[key].replace(/^\{/, '').replace(/\}$/, '')
		if (value != '') {
			console.log(' - applying to global.' + key + ': ' + value)
			window[key] = value
		}
	}
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
	if (e.reason) {
		console.error(e.reason.message)
	} else {
		console.error(e)
	}
	// after the first error, disable the event listening
	window.onerror = () => {} 
	window.removeEventListener('unhandledrejection', handleError)
	// failover
	window.useBackup()
	throw err
}
