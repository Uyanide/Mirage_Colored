import Module from '../wasm/main.js';

export class Mirage_Colored {
    constructor(defaultArguments, innerCanvas, coverCanvas, outputCanvas, whiteCanvas, blackCanvas) {
        this._scale_i = defaultArguments.scale_i;
        this._scale_c = 1 - defaultArguments.scale_c;
        this._weight_i = defaultArguments.weight_i;

        this._innerCanvas = innerCanvas;
        this._coverCanvas = coverCanvas;
        this._outputCanvas = outputCanvas;
        this._whiteCanvas = whiteCanvas;
        this._blackCanvas = blackCanvas;

        this._is_colored = defaultArguments.is_colored;
        this._max_size = defaultArguments.max_size;

        this._wasmPromise = new Promise((resolve) => {
            Module().then((module) => {
                this._module = module;
                this._wasmInitialized = true;
                resolve();
            });
        });
    }

    updateInnerImg = async (img) => {
        if (!this._wasmInitialized) {
            await this._wasmPromise;
        }

        this._innerImg = img;
        if (this._max_size !== 0) {
            if (this._innerImg.width > this._innerImg.height) {
                this._width = this._max_size;
                this._height = Math.ceil(this._innerImg.height * this._max_size / this._innerImg.width);
            } else {
                this._height = this._max_size;
                this._width = Math.ceil(this._innerImg.width * this._max_size / this._innerImg.height);
            }
        } else {
            this._width = this._innerImg.width;
            this._height = this._innerImg.height;
        }

        this._innerCanvas.width = this._width;
        this._innerCanvas.height = this._height;
        const ctx = this._innerCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, this._width, this._height);
        this._innerImgData = ctx.getImageData(0, 0, this._width, this._height);
        if (this._innerPtr) {
            this._module._free(this._innerPtr);
        }
        this._length = this._innerImgData.data.length * this._innerImgData.data.BYTES_PER_ELEMENT;
        this._innerPtr = this._getBufferPtr(this._innerImgData);

        if (!this._is_colored) {
            this._convertGray(this._innerImgData);
        }

        if (this._coverImgData) {
            this.updateCoverImg(this._coverImg);
        }
    }

    updateCoverImg = async (img) => {
        if (!this._wasmInitialized) {
            await this._wasmPromise;
        }

        this._coverImg = img;

        if (this._innerImg) {
            const currRatio = img.width / img.height;
            const tarRatio = this._width / this._height;
            let startx, starty, newWidth, newHeight;
            if (currRatio < tarRatio) {
                startx = 0;
                starty = Math.ceil((this._height - this._width / currRatio) / 2);
                newWidth = this._width;
                newHeight = Math.ceil(this._width / currRatio);
            } else {
                startx = Math.ceil((this._width - this._height * currRatio) / 2);
                starty = 0;
                newWidth = Math.ceil(this._height * currRatio);
                newHeight = this._height;
            }
            this._coverCanvas.width = this._width;
            this._coverCanvas.height = this._height;
            const ctx = this._coverCanvas.getContext('2d');
            ctx.drawImage(img, startx, starty, newWidth, newHeight);
            this._coverImgData = ctx.getImageData(0, 0, this._width, this._height);
        } else {
            this._coverCanvas.width = img.width;
            this._coverCanvas.height = img.height;
            const ctx = this._coverCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            this._coverImgData = ctx.getImageData(0, 0, img.width, img.height);
        }
        if (this._coverPtr) {
            this._module._free(this._coverPtr);
        }
        this._coverPtr = this._getBufferPtr(this._coverImgData);

        if (!this._is_colored) {
            this._convertGray(this._coverImgData);
        }

        if (this._innerImgData) {
            this._process(0);
        }
    }

    _getBufferPtr = (imgData) => {
        const buffer = this._module._malloc(this._length);
        this._module.HEAPU8.set(imgData.data, buffer);
        return buffer;
    }

    swapImg = () => {
        if (!this._innerImg && !this._coverImg) {
            return;
        } else if (!this._innerImg) { // clone cover to inner
            this._clearCanvas(this._coverCanvas);
            this._coverImgData = null;
            this._module._free(this._coverPtr);
            this.updateInnerImg(this._coverImg);
            this._coverImg = null;
            return;
        } else if (!this._coverImg) { // clone inner to cover
            this._clearCanvas(this._innerCanvas);
            this._innerImgData = null;
            this._module._free(this._innerPtr);
            this.updateCoverImg(this._innerImg);
            this._innerImg = null;
            return;
        }
        const tmp = this._innerImg;
        this._innerImg = this._coverImg;
        this._coverImg = tmp;
        const tmpData = this._innerImgData;
        this._innerImgData = this._coverImgData;
        this._coverImgData = tmpData;
        const tmpPtr = this._innerPtr;
        this._innerPtr = this._coverPtr;
        this._coverPtr = tmpPtr;
        this._innerCanvas.getContext('2d').putImageData(this._innerImgData, 0, 0);
        this._coverCanvas.getContext('2d').putImageData(this._coverImgData, 0, 0);
        this._process();
    }

    _clearCanvas = (canvas) => {
        canvas.width = canvas.width;
    }

    _convertGray = (imgData) => {
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    updateColorMode = (is_colored) => {
        this._is_colored = is_colored;
        if (this._innerImgData) {
            this.updateInnerImg(this._innerImg);
        }
    }

    updateMaxSize = (max_size) => {
        this._max_size = max_size;
        if (this._innerImg) {
            this.updateInnerImg(this._innerImg);
        }
    }

    updateInnerScale = (scale_i) => {
        this._scale_i = scale_i;
        if (this._innerImgData && this._coverImgData) {
            this._process(1);
        }
    }

    updateCoverScale = (scale_c) => {
        this._scale_c = 1 - scale_c;
        if (this._innerImgData && this._coverImgData) {
            this._process(2);
        }
    }

    updateInnerWeight = (weight_i) => {
        this._weight_i = weight_i;
        if (this._innerImgData && this._coverImgData) {
            this._process(4);
        }
    }

    _process = async (mode) => {
        if (this._outputPtr) {
            this._module._free(this._outputPtr);
        }
        this._outputPtr = this._module._malloc(this._length);
        this._module._process(
            mode, this._innerImgData.data.length,
            this._is_colored ? 1 : 0, this._scale_i, this._scale_c, 0, this._weight_i,
            this._innerPtr, this._coverPtr, this._outputPtr
        );
        this._outputData = new Uint8ClampedArray(this._module.HEAPU8.buffer, this._outputPtr, this._innerImgData.data.length);
        this._showOutput();
    }

    _showOutput = () => {
        this._outputCanvas.width = this._width;
        this._outputCanvas.height = this._height;
        const ctx = this._outputCanvas.getContext('2d');
        ctx.putImageData(new ImageData(this._outputData, this._width, this._height), 0, 0);
        this._blackCanvas.width = this._width;
        this._blackCanvas.height = this._height;
        const ctx2 = this._blackCanvas.getContext('2d');
        ctx2.fillStyle = 'black';
        ctx2.fillRect(0, 0, this._width, this._height);
        ctx2.drawImage(this._outputCanvas, 0, 0);
        this._whiteCanvas.width = this._width;
        this._whiteCanvas.height = this._height;
        const ctx3 = this._whiteCanvas.getContext('2d');
        ctx3.fillStyle = 'white';
        ctx3.fillRect(0, 0, this._width, this._height);
        ctx3.drawImage(this._outputCanvas, 0, 0);
    }

    saveResult = () => {
        const link = document.createElement('a');
        link.download = `result_${new Date().getTime()}.png`;
        link.href = this._outputCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}