import { CurrentImage } from "./scripts/CurrentImage.js";
import { ConfigForm } from "./scripts/ConfigForm.js";

function downloadCanvasContents() {
  var canvas = document.querySelector('canvas');
  var dataUrl = canvas.toDataURL("image/png");
  var link = document.createElement('a');
  const fileName = document.querySelector("#file-input").value.split('\\').at(-1);
  link.download = fileName;
  link.href = dataUrl.replace("image/png", "image/octet-stream");
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
    document.querySelector('#grid-visibility').addEventListener('click', function() {
        const method = this.checked ? 'add' : 'remove';
        document.querySelector('body').classList[method]('show-grid');
    });
}

if (window.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}
