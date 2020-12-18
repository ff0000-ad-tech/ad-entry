import * as environment from './environment.js'

export function prepare() {
	prepareAdParams()
	prepareQueryParams()
	checkForAdTagParams()
	prepareEnvironment()
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

function prepareEnvironment() {
	console.log('Scope.prepareEnvironment()')
	environment.prepare(window.adParams.environmentId)
}

function prepareOnError() {
	console.log('Scope.prepareOnError()')
	if (adParams.failoverOnError) {
		window.onerror = handleError
	}
}

function handleError() {
	console.log('Scope.handleError() - JAVASCRIPT ERROR!')
	window.onerror = () => {
		// after the first error, disable the event listening
	}
	window.useBackup()
}
