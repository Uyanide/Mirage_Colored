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
    }

    updateInnerImg = async (img) => {
        this._innerDataCache = null;
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

        if (!this._is_colored) {
            this._convertGray(this._innerImgData);
        }

        if (this._coverImgData) {
            this.updateCoverImg(this._coverImg);
        }
    }

    updateCoverImg = (img) => {
        this._coverDataCache = null;
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

        if (!this._is_colored) {
            this._convertGray(this._coverImgData);
        }

        if (this._innerImgData) {
            this._process();
        }
    }

    swapImg = () => {
        if (!this._innerImg && !this._coverImg) {
            return;
        } else if (!this._innerImg) { // clone cover to inner
            this._clearCanvas(this._coverCanvas);
            this._coverImgData = null;
            this.updateInnerImg(this._coverImg);
            this._coverImg = null;
            return;
        } else if (!this._coverImg) { // clone inner to cover
            this._clearCanvas(this._innerCanvas);
            this._innerImgData = null;
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
        this._innerCanvas.getContext('2d').putImageData(this._innerImgData, 0, 0);
        this._coverCanvas.getContext('2d').putImageData(this._coverImgData, 0, 0);
        this._innerDataCache = null;
        this._coverDataCache = null;
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
        this._innerDataCache = null;
        this._process();
    }

    updateCoverScale = (scale_c) => {
        this._scale_c = 1 - scale_c;
        this._coverDataCache = null;
        this._process();
    }

    updateInnerWeight = (weight_i) => {
        this._weight_i = weight_i;
        this._process();
    }

    _process = () => {
        if (!this._innerImgData || !this._coverImgData) {
            return;
        }
        let flag = false;
        if (!this._innerDataCache) {
            const data = this._innerImgData.data;
            this._innerDataCache = new Uint8ClampedArray(data.length);
            for (let i = 0; i < data.length; i += 4) {
                this._innerDataCache[i] = Math.floor(data[i] * this._scale_i);
                this._innerDataCache[i + 1] = Math.floor(data[i + 1] * this._scale_i);
                this._innerDataCache[i + 2] = Math.floor(data[i + 2] * this._scale_i);
            }
            flag = true;
        }
        if (!this._coverDataCache) {
            const data = this._coverImgData.data;
            this._coverDataCache = new Uint8ClampedArray(data.length);
            for (let i = 0; i < data.length; i += 4) {
                this._coverDataCache[i] = Math.floor(255 - (255 - data[i]) * this._scale_c);
                this._coverDataCache[i + 1] = Math.floor(255 - (255 - data[i + 1]) * this._scale_c);
                this._coverDataCache[i + 2] = Math.floor(255 - (255 - data[i + 2]) * this._scale_c);
            }
            flag = true;
        }
        if (this._is_colored) {
            if (!this._alphaCache || flag) {
                this._alphaCache = new Float32Array(this._innerDataCache.length >> 2);
                for (let i = 0; i < this._innerDataCache.length; i += 4) {
                    const ir = this._innerDataCache[i];
                    const ig = this._innerDataCache[i + 1];
                    const ib = this._innerDataCache[i + 2];
                    const cr = this._coverDataCache[i];
                    const cg = this._coverDataCache[i + 1];
                    const cb = this._coverDataCache[i + 2];
                    const dr = ir - cr, dg = ig - cg, db = ib - cb;
                    this._alphaCache[i >> 2] = Math.min(Math.max((1 + (((2048 | (dr + ((ir + cr) << 1))) * dr - (db + ((ir + cr) << 1) - 3068) * db + (dg << 12)) / (1020 * (dr - db) + 2349060))), 0), 1);
                }
            }
            this._outputData = new Uint8ClampedArray(this._innerDataCache.length);
            for (let i = 0; i < this._innerDataCache.length; i += 4) {
                const a = this._alphaCache[i >> 2];
                const ai = 255 * a;
                this._outputData[i] = ((this._innerDataCache[i] - ai + 255 - this._coverDataCache[i]) * this._weight_i + ai - 255 + this._coverDataCache[i]) / a;
                this._outputData[i + 1] = ((this._innerDataCache[i + 1] - ai + 255 - this._coverDataCache[i + 1]) * this._weight_i + ai - 255 + this._coverDataCache[i + 1]) / a;
                this._outputData[i + 2] = ((this._innerDataCache[i + 2] - ai + 255 - this._coverDataCache[i + 2]) * this._weight_i + ai - 255 + this._coverDataCache[i + 2]) / a;
                this._outputData[i + 3] = a * 255;
            }
        } else {
            this._outputData = new Uint8ClampedArray(this._innerDataCache.length);
            for (let i = 0; i < this._innerDataCache.length; i += 4) {
                const a = 255 + this._innerDataCache[i] - this._coverDataCache[i];
                const l = this._innerDataCache[i] * 255 / a;
                this._outputData[i] = l;
                this._outputData[i + 1] = l;
                this._outputData[i + 2] = l;
                this._outputData[i + 3] = a;
            }
        }
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