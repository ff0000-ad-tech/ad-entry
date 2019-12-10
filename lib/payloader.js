import Loader from "ad-load";

import { loadJs, loadFba } from './load.js'

/* -- PAYLOADER ----------------------------------------------
 *
 *
 */
export function execute() {
  console.log("Payloader.execute()");
  concatDependencies();
  return loadDependencies();
}
function concatDependencies() {
  window.adParams.dependencies = []
    .concat(window.externalIncludes)
    .concat(window.adParams.adPath + window.assets.payload.text);
}

var fbaContent;
function loadDependencies() {
  console.log("Payloader.loadDependencies()");
  return new Promise((resolve, reject) => {
    Promise.all([loadJs(), loadFba()])
      .then(() => {
        resolve(fbaContent);
      })
      .catch(err => {
        reject(err);
      });
  });
}
