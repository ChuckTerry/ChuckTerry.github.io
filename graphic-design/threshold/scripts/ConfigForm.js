export class ConfigForm {
    constructor(currentImage) {
        this.form = document.getElementById('config-form');
        this.currentImage = currentImage;
        this.userSettingsStack = [];
        this.redoSettingsStack = [];
        this.fileInput = document.getElementById('file-input');
        this.fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.currentImage.loadImage(file);
            }
        });
        document.querySelectorAll('.transparency-check').forEach((element) => {
            element.addEventListener('click', () => {
              const name = element.id.split('-')[0];
              document.getElementById(`${name}-color`).disabled = element.checked;
              this.applyEffects();
          });
        });
        this.bias = document.getElementById('output-bias');
        this.belowColorPicker = document.getElementById('below-color');
        this.belowTransparent = document.getElementById('below-transparent');
        this.aboveColorPicker = document.getElementById('above-color');
        this.aboveTransparent = document.getElementById('above-transparent');
        this.redInclude = document.getElementById('red-include');
        this.redThreshold = document.getElementById('red-threshold');
        this.redWeight = document.getElementById('red-weight');
        this.greenInclude = document.getElementById('green-include');
        this.greenThreshold = document.getElementById('green-threshold');
        this.greenWeight = document.getElementById('green-weight');
        this.blueInclude = document.getElementById('blue-include');
        this.blueThreshold = document.getElementById('blue-threshold');
        this.blueWeight = document.getElementById('blue-weight');
        this.form.addEventListener('input', () => this.applyEffects());

        const undoButton = document.getElementById('undo-button');
        undoButton.addEventListener('click', () => {
            this.currentImage.undo();
            this.undo();
        });

        const redoButton = document.getElementById('redo-button');
        redoButton.addEventListener('click', () => {
            this.currentImage.redo();
            this.redo();
        });
    }

    getConfig() {
        return {
            includeRed: this.redInclude.checked,
            redThreshold: parseInt(this.redThreshold.value),
            redWeight: parseFloat(this.redWeight.value),
            includeGreen: this.greenInclude.checked,
            greenThreshold: parseInt(this.greenThreshold.value),
            greenWeight: parseFloat(this.greenWeight.value),
            includeBlue: this.blueInclude.checked,
            blueThreshold: parseInt(this.blueThreshold.value),
            blueWeight: parseFloat(this.blueWeight.value),
            belowColor: this.hexToRgb(this.belowColorPicker.value),
            belowTransparent: this.belowTransparent.checked,
            aboveColor: this.hexToRgb(this.aboveColorPicker.value),
            aboveTransparent: this.aboveTransparent.checked,
            bias: parseFloat(this.bias.value)
        };
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
        const config = this.getConfig();
        this.userSettingsStack.push(config);
        this.redoSettingsStack = [];
        this.currentImage.applyThreshold(config);
    }

    setConfig(config) {
        this.redInclude.checked = config.includeRed;
        this.redThreshold.value = config.redThreshold;
        this.redWeight.value = config.redWeight;
        this.greenInclude.checked = config.includeGreen;
        this.greenThreshold.value = config.greenThreshold;
        this.greenWeight.value = config.greenWeight;
        this.blueInclude.checked = config.includeBlue;
        this.blueThreshold.value = config.blueThreshold;
        this.blueWeight.value = config.blueWeight;
        this.belowColorPicker.value = this.rgbArrayToHex(config.belowColor);
        this.belowTransparent.checked = config.belowTransparent;
        this.aboveColorPicker.value = this.rgbArrayToHex(config.aboveColor);
        this.aboveTransparent.checked = config.aboveTransparent;
        this.bias.value = config.bias;
    }

    undo() {
        if (this.userSettingsStack.length > 1) {
            const currentConfig = this.userSettingsStack.pop();
            this.redoSettingsStack.push(currentConfig);
            const previousConfig = this.userSettingsStack[this.userSettingsStack.length - 1];
            this.setConfig(previousConfig);
        }
    }

    redo() {
        if (this.redoSettingsStack.length > 0) {
            const redoConfig = this.redoSettingsStack.pop();
            this.userSettingsStack.push(redoConfig);
            this.setConfig(redoConfig);
        }
    }
}
