(()=>{
  const ERR = console.error;
  const LOG = console.log;
  const PRINT = (logType, message) => {
    const element = document.createElement('p')
    element.innerText = `[${logType}]  ${message}`;
    if (logType === 'ERR') {
      element.style.color = 'E21120';
    }
    document.body.append(element)
  };

  console.error = (...args) => {
    ERR(...args);
    PRINT('ERR', ...args);
  }
  
  console.log = (...args) => {
    LOG(...args);
    PRINT('LOG', ...args);
  }
})();

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

  if (document.querySelector('#canvas-preset').selectedOptions[0].value === 'whiteboard') {
    functionQueue.push([setupWhiteboard, []]);
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

function deg2rad(degrees) {
  return degrees * Math.PI / 180;
}


function addWhiteboardToolbar() {
  const toolbar = document.createElement('div');
  toolbar.classList.add('toolbar');

  const colorPicker = document.createElement('input');
  colorPicker.type = 'color';
  colorPicker.classList.add('whiteboard-color-picker');
  value = '#0000FF';
  toolbar.append(colorPicker);

  const brushSizeSlider = document.createElement('input');
  brushSizeSlider.type = 'range';
  brushSizeSlider.classList.add('whiteboard-size-slider');
  brushSizeSlider.min = 1;
  brushSizeSlider.max = 100;
  brushSizeSlider.value = 14;
  toolbar.append(brushSizeSlider);

  const brushSizeValue = document.createElement('span');
  brushSizeValue.classList.add('readable-size');
  brushSizeValue.classList.add('whiteboard-size-value');
  brushSizeValue.innerText = brushSizeSlider.value;
  toolbar.append(brushSizeValue);

  const clearButton = document.createElement('button');
  clearButton.classList.add('whiteboard-button-clear');
  clearButton.innerText = 'Clear';
  toolbar.append(clearButton);

  brushSizeSlider.addEventListener('input', () => brushSizeValue.innerText = brushSizeSlider.value);
  document.body.insertBefore(toolbar, canvas);

}


function setupWhiteboard() {
  addWhiteboardToolbar();
  const width = canvas.width;
  const height = canvas.height = window.innerHeight - 60;

  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  const colorPicker = document.querySelector('.whiteboard-color-picker');
  const sizePicker = document.querySelector('.whiteboard-size-slider');
  const clearBtn = document.querySelector('.whiteboard-button-clear');

  let cursorX;
  let cursorY;
  let pressed = false;

  document.addEventListener('mousemove', ({x, y}) => {
    cursorX = x;
    cursorY = y;
  });

  canvas.addEventListener('mousedown', () => pressed = true);
  canvas.addEventListener('mouseup', () => pressed = false);

  clearBtn.addEventListener('click', () => {
    context.fillStyle = '#000000';
    context.fillRect(0, 0, width, height);
  });

  function draw() {
    if (pressed) {
      context.fillStyle = colorPicker.value;
      context.beginPath();
      context.arc(cursorX, cursorY - 60, sizePicker.value, deg2rad(0), deg2rad(360), false);
      context.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
}
