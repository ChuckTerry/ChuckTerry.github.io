export class CurrentImage {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.image = new Image();
        this.imageDataStack = [];
        this.redoStack = [];
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            this.image.onload = () => {
                this.canvas.width = this.image.width;
                this.canvas.height = this.image.height;
                this.context.drawImage(this.image, 0, 0);
                this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                this.imageDataStack.push(this.imageData);
                this.redoStack = [];
            };
            this.image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    applyEffect(config) {
        if (this.imageData?.data === undefined) {
            return;
        }
        const imageData = new ImageData(new Uint8ClampedArray(this.imageData.data), this.image.width, this.image.height);
        const data = imageData.data;
        const length = data.length;
        const paletteLength = config.length;
        for (let imageDataIndex = 0; imageDataIndex < length; imageDataIndex += 4) {
            const red = data[imageDataIndex];
            const green = data[imageDataIndex + 1];
            const blue = data[imageDataIndex + 2];
            let minimumDistance = Infinity;
            let color = [0, 0, 0]; 
            for (let paletteIndex = 0; paletteIndex < paletteLength; paletteIndex++) {
                const [r, g, b] = config[paletteIndex];
                const distance = Math.sqrt((red - r) ** 2 + (green - g) ** 2 + (blue - b) ** 2);
                if (paletteIndex === 0 || distance < minimumDistance) {
                    minimumDistance = distance;
                    color = [r, g, b];
                }
            }
            data[imageDataIndex] = color[0];
            data[imageDataIndex + 1] = color[1];
            data[imageDataIndex + 2] = color[2];
        }
        this.imageDataStack.push(imageData);
        this.redoStack = [];
        this.context.putImageData(imageData, 0, 0);
    }

    undo() {
        if (this.imageDataStack.length > 1) {
            const currentImageData = this.imageDataStack.pop();
            this.redoStack.push(currentImageData);
            const previousImageData = this.imageDataStack[this.imageDataStack.length - 1];
            this.context.putImageData(previousImageData, 0, 0);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const redoImageData = this.redoStack.pop();
            this.imageDataStack.push(redoImageData);
            this.context.putImageData(redoImageData, 0, 0);
        }
    }
}
