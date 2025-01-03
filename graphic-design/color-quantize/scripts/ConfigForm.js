export class ConfigForm {
    constructor(currentImage) {
        this.form = document.getElementById('config-form');
        this.currentImage = currentImage;
        this.userSettingsStack = [];
        this.redoSettingsStack = [];
        document.getElementById('file-input').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.currentImage.loadImage(file);
            }
        });
        this.palette = document.querySelector('#color-palette');
        this.addColorToPallete('#000000');
        this.addColorToPallete('#FFFFFF');
        document.getElementById('palette-add').addEventListener('click', () => {
            this.addColorToPallete('#000000');
        });
        document.getElementById('palette-remove').addEventListener('click', () => {
            const modal =  document.getElementById('color-modal');
            const modalColorDivs = modal.querySelectorAll('.color-modal-div');
            const divCount = modalColorDivs.length;
            for (let index = 0; index < divCount; index++) {
                modalColorDivs[index].remove();
            }
            modal.classList.remove('hidden');
            const palette = this.getPalleteElements().map((input) => input.value);
            const paletteLength = palette.length;
            for (let index = 0; index < paletteLength; index++) {
                const color = palette[index];
                const colorDiv = document.createElement('div');
                colorDiv.classList.add('color-modal-div');
                colorDiv.style.backgroundColor = color;
                colorDiv.addEventListener('click', () => {
                    this.removeColorFromPallete(color);
                    document.getElementById('color-modal').classList.add('hidden');
                    this.applyEffects();
                });
                modal.appendChild(colorDiv);
            }
        });
        const undoButton = document.getElementById('undo-button');
        undoButton.addEventListener('click', () => { this.undo() });
        const redoButton = document.getElementById('redo-button');
        redoButton.addEventListener('click', () => { this.redo() });
    }

    addColorToPallete(color) {
        const newInput = document.createElement('input');
        newInput.type = 'color';
        newInput.value = color;
        newInput.addEventListener('input', () => {
            this.applyEffects();
        });
        this.palette.appendChild(newInput);
    }

    removeColorFromPallete(color) {
        const palette = this.getPalleteElements();
        const paletteLength = palette.length;
        for(let index = 0; index < paletteLength; index++) {
            const input = palette[index];
            if (input.value === color) {
                input.remove();
                break;
            }
        }
        const modalPalette = [...document.querySelectorAll('.color-modal-div')];
        const modalPaletteLength = modalPalette.length;
        for(let index = 0; index < modalPaletteLength; index++) {
            const div = modalPalette[index];
            if (div.style.backgroundColor === color) {
                div.remove();
                break;
            }
        }
    }

    getPallete() {
        const inputArray = Array.from(this.palette.querySelectorAll('input'));
        const colorArray = inputArray.map((input) => this.hexToRgb(input.value));
        return colorArray;
    }

    getPalleteElements() {
        return Array.from(this.palette.querySelectorAll('input'));
    }

    hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    rgbArrayToHex(rgb) {
        return '#' + rgb.map((value) => value.toString(16).padStart(2, '0')).join('');
    }

    applyEffects() {
        const config = this.getPallete();
        this.userSettingsStack.push(config);
        this.redoSettingsStack = [];
        this.currentImage.applyEffect(config);
    }

    setConfig(config) {
        const elements = this.getPalleteElements();
        const elementsLength = elements.length;
        for (let index = 0; index < elementsLength; index++) {
            elements[index].remove();
        }
        const configLength = config.length;
        for (let index = 0; index < configLength; index++) {
            this.addColorToPallete(this.rgbArrayToHex(config[index]));
        }
    }

    undo() {
        if (this.userSettingsStack.length > 1) {
            this.currentImage.undo();
            const currentConfig = this.userSettingsStack.pop();
            this.redoSettingsStack.push(currentConfig);
            const previousConfig = this.userSettingsStack[this.userSettingsStack.length - 1];
            this.setConfig(previousConfig);
        }
    }

    redo() {
        if (this.redoSettingsStack.length > 0) {
            this.currentImage.redo();
            const redoConfig = this.redoSettingsStack.pop();
            this.userSettingsStack.push(redoConfig);
            this.setConfig(redoConfig);
        }
    }
}
