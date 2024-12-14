export class ConfigForm {
    constructor(currentImage) {
        this.form = document.getElementById('config-form');
        this.currentImage = currentImage;
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

    applyEffects() {
        const config = this.getConfig();
        this.currentImage.applyThreshold(config);
    }
}
+
