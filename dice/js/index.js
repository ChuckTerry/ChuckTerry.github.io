import { InstanceController } from './InstanceController.js';
import { DieVariant } from './DieVariant.js';
import './globals.js';

/**
 * Initialization Logic
 */
function init() {
  if (document.readyState !== 'complete') return window.addEventListener('load', init);

  globalThis.instanceController = new InstanceController();
  globalThis.dieVariantObject = new DieVariant(globalThis.instanceController);

}

init();
