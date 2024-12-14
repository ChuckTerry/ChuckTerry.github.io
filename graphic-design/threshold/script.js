import { CurrentImage } from "./scripts/CurrentImage.js";
import { ConfigForm } from "./scripts/ConfigForm.js";

function init() {
    new ConfigForm(new CurrentImage());
}

if (window.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}
