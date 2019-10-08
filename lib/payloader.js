import Loader from "ad-load";

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

function loadJs() {
  return new Promise((resolve, reject) => {
    new Loader(window.adParams.dependencies, {
      name: "jsLoader",
      scope: global,
      onFail: reject,
      onComplete: () => {
        // check if it is on window until it is added to the build sources
        window.jsBundleLoadComplete && jsBundleLoadComplete();
        resolve();
      }
    }).load();
  });
}

function loadFba() {
  return new Promise((resolve, reject) => {
    if (window.assets.payload.binary.length) {
      new Loader(window.adParams.adPath + window.assets.payload.binary[0], {
        name: "fbaLoader",
        scope: global,
        fileType: "fba",
        onFail: reject,
        onComplete: function(event) {
          new Loader(event, {
            name: "fbaContentLoader",
            scope: global,
            onFail: reject,
            onComplete: function(event) {
              fbaContent = event;
              resolve();
            }
          }).load();
        }
      }).load();
    } else {
      resolve();
    }
  });
}
