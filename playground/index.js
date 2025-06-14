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

function cssReset(doReset) {
    if (doReset === false) return false;
    const style = document.createElement('style');
    style.innerText = `html, body, applet, object, iframe, canvas, embed, video { margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; vertical-align: baseline; } body { line-height: 1; }`;
    document.head.append(style);
    return true;
}

function deg2rad(degrees) {
    return degrees * Math.PI / 180;
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

function initializePlayground() {
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
        document.addEventListener('keydown', (event) => console.debug(`${event.key}  down    %o`, event));
        document.addEventListener('keyup', (event) => console.debug(`${event.key}  up    %o`, event));
    }
    if (logLevel === 'press' || logLevel === 'verbose') {
        document.addEventListener('keypress', (event) => console.debug(`${event.key} [press]    %o`, event));
    }
    if (logLevel === 'consolidated') {
        document.addEventListener('keypress', (event) => {
            const keyCombo = [];
            if (event.ctrlKey) keyCombo.push('Ctrl ⎈');
            if (event.altKey) keyCombo.push('Alt ⎇');
            if (event.shiftKey) keyCombo.push('Shift ⇧');
            if (event.metaKey) keyCombo.push('Meta ⊞');
            keyCombo.push(event.key);
            console.debug(keyCombo.join(' + '));
        });
    }
    return true;
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

    document.addEventListener('mousemove', ({ x, y }) => {
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

(() => {
    const nativeError = console.error;
    const nativeLog = console.log;
    const nativeWarn = console.warn;
    const nativeDebug = console.debug;
    const nativeInfo = console.info;

    const consoleToHTML = (logType, message) => {
        const element = document.createElement('p');
        element.classList.add('console-output', logType);
        const string = JSON.stringify(message).slice(1).slice(0, -1);
        const replaced = string.replace('\t', '\u00A0\u00A0\u00A0\u00A0').replace(' ', '\u00A0').split(' %o').join('');
        element.innerText = `${logType}> ${replaced}`;

        if (logType === 'error') {
            element.style.color = '#E21120';
            element.style.fontWeight = 'bold';
        } else if (logType === 'warn') {
            element.style.backgroundColor = '#EED202';
            element.style.fontWeight = 'bold';
        }

        element.style.borderBottom = '1px solid #020202';
        element.style.borderTop = '1px solid #020202';
        document.body.append(element);
    };

    console.error = (...args) => {
        nativeError(...args);
        consoleToHTML('error', ...args);
    };

    console.log = (...args) => {
        nativeLog(...args);
        consoleToHTML('log', ...args);
    };

    console.warn = (...args) => {
        nativeWarn(...args);
        consoleToHTML('warn', ...args);
    };

    console.debug = (...args) => {
        nativeDebug(...args);
        consoleToHTML('debug', ...args);
    };

    console.info = (...args) => {
        nativeInfo(...args);
        consoleToHTML('info', ...args);
    };

    const buttonInitializePlayground = document.querySelector('#initialize-playground');
    buttonInitializePlayground.addEventListener('click', (buttonInitializePlayground) => initializePlayground(buttonInitializePlayground));
    document.querySelector('#console-cls').addEventListener('click', () => {
        const consoleOutputs = document.querySelectorAll('p.console-output');
        const messageCount = consoleOutputs.length;
        for (let index = 0; index < messageCount; index++) {
            consoleOutputs[index].remove();
        }
        console.log('HTML console output cleared.');
    });
})();
