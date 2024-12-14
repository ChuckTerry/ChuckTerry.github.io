export class CurrentImage {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.image = new Image();
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            this.image.onload = () => {
                this.canvas.width = this.image.width;
                this.canvas.height = this.image.height;
                this.context.drawImage(this.image, 0, 0);
                this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            };
            this.image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    applyThreshold(config) {
        const { aboveColor, aboveTransparent, belowColor, belowTransparent, bias, blueThreshold, greenThreshold, includeBlue, includeGreen, includeRed, redThreshold } = config;
        if (this.imageData?.data === undefined) {
            return;
        }
        const imageData = new ImageData(new Uint8ClampedArray(this.imageData.data), this.image.width, this.image.height);
        const data = imageData.data;
        const redWeight = includeRed ? config.redWeight : 0;
        const greenWeight = includeGreen ? config.greenWeight : 0;
        const blueWeight = includeBlue ? config.blueWeight : 0;
        const totalWeight = (redWeight + greenWeight + blueWeight) || 1;
        const redPower = includeRed ? redWeight / totalWeight : 0;
        const greenPower = includeGreen ? greenWeight / totalWeight : 0;
        const bluePower = includeBlue ? blueWeight / totalWeight : 0;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            const rValue = Number(r > redThreshold);
            const gValue = Number(g > greenThreshold);
            const bValue = Number(b > blueThreshold);
            const value = Number((rValue * redPower + gValue * greenPower + bValue * bluePower) > bias);
            if (aboveTransparent && value) {
                data[i + 3] = 0;
            } else if (belowTransparent && !value) {
                data[i + 3] = 0;
            } else {
                const color = value ? aboveColor : belowColor;
                data[i] = color[0];
                data[i + 1] = color[1];
                data[i + 2] = color[2];
            }
        }
        this.context.putImageData(imageData, 0, 0);
    }
}
