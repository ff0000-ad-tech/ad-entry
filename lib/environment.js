/* -- ENVIRONMENT --------------------------------------------
 *
 *
 */
export function prepare(environmentId) {
	console.log('Environment.prepare()', environmentId)
	var environment = getDeployProfile(environmentId)
	adParams.environmentId = environment.id
	// run-path + subpaths
	adParams.runPath = matchProtocolTo(environment.runPath) // must be defined in environment
	// ad-path and subpaths
	adParams.adPath = adParams.runPath + environment.adPath // must be defined in environment
}
