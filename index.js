import "ad-polyfills";
import * as scope from "./lib/scope.js";
import * as polite from "./lib/polite.js";
import * as preloader from "./lib/preloader.js";
import * as payloader from "./lib/payloader.js";

/*
 * 	NOTE:
 *
 *	This class expects window-scoped methods to exist
 *
 */

polite
  .prepare(window.adParams.politeLoadAfter)

  // prepare vendor onload (Network.js)
  .then(() => window.prepareIndex())

  // prepare scope
  .then(() => scope.prepare())

  // misc index control
  .then(() => window.prepareAdParamsMisc())

  // prepare network
  .then(() => window.prepareNetworkExit())

  // prepare preloader
  .then(() => preloader.prepare())
  .then(() => window.preparePreloadMisc())

  // finish polite timeout
  .then(() => polite.resolveDelay())

  // prepare payload
  .then(() => payloader.execute())

  // launch polite
  .then(fbaContent => {
    preloader.isComplete.then(() => window.onImpression(fbaContent));
  })

  .catch(err => {
    console.error(err);
    window.failAd();
  });
