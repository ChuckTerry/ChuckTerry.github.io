const buttonInitializePlayground = document.querySelector('#initialize-playground');
const initListener = buttonInitializePlayground.addEventListener('click', initializePlayground);

function initializePlayground() {
  buttonInitializePlayground.removeEventListener('click', initListener);
  const functionQueue = [];
  if (document.querySelector('#css-reset').checked) {
    functionQueue.push([cssReset, [true]]);
  }
  const canvasTypeElement = document.querySelector("#canvas-type");
  if (canvasTypeElement.selectedIndex > 0) {
    const targetContext = canvasTypeElement.selectedOptions[0].value;
    functionQueue.push([initializeCanvas, [targetContext]]);
  }
  const keyboardLogElement = document.querySelector("#keyboard-event-logging");
  if (keyboardLogElement.selectedIndex > 0) {
    const logLevel = keyboardLogElement.selectedOptions[0].value;
    functionQueue.push([setupKeyboardEventLogging, [logLevel]]);
  }

  document.querySelector('#playground-controller').remove();
  const functionCount = functionQueue.length;
  for (let index = 0; index < functionCount; index++) {
    const [func, args] = functionQueue[index];
    func(...args);
  }
}

function setupKeyboardEventLogging(logLevel) {
  if (logLevel === 'none') return false;
  if (logLevel === 'updown' || logLevel === 'verbose') {
    document.addEventListener('keydown', (event) => console.debug(`${event.key}  [down]`));
    document.addEventListener('keyup', (event) => console.debug(`${event.key}  [up]`));
  }
  if (logLevel === 'press' || logLevel === 'verbose') {
    document.addEventListener('keypress', (event) => console.debug(event.key));
  }
  if (logLevel === 'consolidated') {
    document.addEventListener('keypress', (event) => {
      const keyCombo = [];
      if (event.ctrlKey) keyCombo.push('[Ctrl]');
      if (event.altKey) keyCombo.push('[Alt]');
      if (event.shiftKey) keyCombo.push('[Shift]');
      if (event.metaKey) keyCombo.push('[Meta]');
      keyCombo.push(event.key);
      console.debug(keyCombo.join(' + '));
    });
  }
  return true;
}

function cssReset(doReset) {
  if (doReset === false) return false;
  const style = document.createElement('style');
  style.innerText = `html, body, applet, object, iframe, canvas, embed, video { margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; vertical-align: baseline; } body { line-height: 1; }`;
  document.head.append(style);
  return true;
}

function initializeCanvas(targetContext, width = window.innerWidth, height = window.innerHeight) {
  const canvas = document.createElement('canvas');
  globalThis.canvas = canvas;
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);
  globalThis.context = canvas.getContext(targetContext);
  return canvas;
}
