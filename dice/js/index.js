import { InstanceController } from './InstanceController.js';
import './globals.js';

/**
 * Initialization Logic
 */
function init() {
  if (document.readyState !== 'complete') return window.addEventListener('load', init);

  const urlParameters = new URLSearchParams(window.location.search);
  if (urlParameters.has('style')) {
    const variant = urlParameters.get('style').toUpperCase();
    if (variant === 'RED') {
      dieVariantObject.contour = (x) => `rgb(${x}, ${x - 166}, ${x - 149})`;
      dieVariantObject.valueDotColor = '#FFFEFE';
      dieVariantObject.bodyFill = 'rgb(208, 45, 47)';
    } else if (variant === 'BLACK') {
      dieVariantObject.contour = (x) => `rgb(${x}, ${x - 3}, ${x - 7})`;
      dieVariantObject.valueDotColor = '#000000';
      dieVariantObject.bodyFill = '#FFFFFF';
    }
  }

  if (Object.keys(dieVariantObject).length === 0) {
    dieVariantObject.contour = (x) => `rgb(${x - 150}, ${x - 16}, ${x + 16})`;
    dieVariantObject.valueDotColor = '#DDEEFF';
    dieVariantObject.bodyFill = 'rgb(46, 184, 208)';
  }
  
  globalThis.instanceController = new InstanceController();
}

init();
