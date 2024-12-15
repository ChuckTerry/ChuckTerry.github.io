import { CurrentImage } from "./scripts/CurrentImage.js";
import { ConfigForm } from "./scripts/ConfigForm.js";

function downloadCanvasContents() {
  var canvas = document.querySelector('canvas');
  var dataUrl = canvas.toDataURL("image/png");
  var link = document.createElement('a');
  const fileName = document.querySelector("#file-input").value.split('\\').at(-1);
  link.download = fileName;
  link.href = dataUrl.replace("image/png", "image/octet-stream");
  console.log(link);
  link.click();
}

function init() {
    new ConfigForm(new CurrentImage());
    window.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            event.stopImmediatePropagation();
	    	downloadCanvasContents();
        }
	    return false;
    });
}

if (window.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}
