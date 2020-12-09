import * as environment from './environment.js'

export function prepare() {
	prepareAdParams()
	// NOTE: `getQueryParams()` is missing from global scope, so these do nothing
	// prepareQueryParams()
	// checkForAdTagParams()
	prepareEnvironment()
	prepareOnError()
}

function prepareAdParams() {
	console.log('Scope.prepareAdParams()')
	adParams.adSize = adParams.adWidth + 'x' + adParams.adHeight
	adParams.failoverWidth = adParams.preloaderWidth = adParams.adWidth
	adParams.failoverHeight = adParams.preloaderHeight = adParams.adHeight
	adParams.failoverX = adParams.preloaderX = 0
	adParams.failoverY = adParams.preloaderY = 0
}

// function prepareQueryParams() {
// 	console.log('Scope.prepareQueryParams()')
// 	queryParams = getQueryParams()
// }

// function checkForAdTagParams() {
// 	console.log('Scope.checkForAdTagParams()')
// 	for (var key in queryParams) {
// 		var value = queryParams[key].replace(/^\{/, '').replace(/\}$/, '')
// 		if (value != '') {
// 			console.log(' - applying to global.' + key + ': ' + value)
// 			window[key] = value
// 		}
// 	}
// }

function prepareEnvironment() {
	console.log('Scope.prepareEnvironment()')
	environment.prepare(window.adParams.environmentId)
}

function prepareOnError() {
	console.log('Scope.prepareOnError()')
	if (adParams.failoverOnError) onerror = handleError
}

function handleError() {
	console.log('Scope.handleError() - JAVASCRIPT ERROR!')
	// ignore known errors. Currently only a DC analytic error happens when tapping on video player in iOS
	const surpressedErrorList = [
		"TypeError: b.some is not a function. (In 'b.some(function(b){return a.j.includes(b.identifier)})', 'b.some' is undefined)"
	]
	const error = arguments[0]
	if (surpressedErrorList.indexOf(error) > -1) {
		console.log('surpressing known error')
		return
	}
	onerror = function () { } // after the first error, disable the event listening
	window.failAd()
}
