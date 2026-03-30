import { applicationState, errorHandling, processor } from './global';

const loadImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                resolve(img);
            }
            img.onerror = (e) => {
                reject(e);
            }
        }
        reader.onerror = (e) => {
            reject(e);
        }
        reader.readAsDataURL(file);
    });
}

const setup = async (event, callback, errorMsg = '操作失败! ') => {
    try {
        await callback(event);
    } catch (e) {
        alert(errorMsg + e.message);
        console.error(errorMsg, e.message, e.stack);
    }
}

const eventListU = [
    {
        id: 'innerFileInput', event: 'change', callback: async (e) => {
            const file = e.target.files[0];
            const name = file.name.replace(/\.[^/.]+$/, '');
            processor.mirage.innerFileName = name;
            processor.mirage.updateInnerImg(await loadImage(file));
            const label = document.getElementById('innerCanvasLabel');
            if (label) label.style.display = 'none';
            e.target.value = '';
        }, errorMsg: '里图加载失败! '
    },
    {
        id: 'coverFileInput', event: 'change', callback: async (e) => {
            const file = e.target.files[0];
            processor.mirage.updateCoverImg(await loadImage(file));
            const label = document.getElementById('coverCanvasLabel');
            if (label) label.style.display = 'none';
            e.target.value = '';
        }, errorMsg: '表图加载失败! '
    },
    {
        id: 'innerCanvas', event: 'click', callback: () => {
            document.getElementById('innerFileInput').click();
        }, errorMsg: '里图加载失败! '
    },
    {
        id: 'coverCanvas', event: 'click', callback: () => {
            document.getElementById('coverFileInput').click();
        }, errorMsg: '表图加载失败! '
    },
    {
        id: 'innerScaleRange', event: 'input', callback: (e) => {
            applicationState.innerScaleInput.value = e.target.value;
            processor.mirage.updateInnerScale(parseFloat(e.target.value) / 100);
        }
    },
    {
        id: 'innerScaleInput', event: 'input', callback: (e) => {
            clearTimeout(applicationState.innerScaleTimeout);
            applicationState.innerScaleTimeout = setTimeout(() => {
                let value = parseFloat(e.target.value);
                if (isNaN(value)) {
                    return;
                }
                value = Math.min(Math.max(value, 0), 100);
                applicationState.innerScaleSlider.value = value;
                applicationState.innerScaleInput.value = value;
                processor.mirage.updateInnerScale(value / 100);
            }, 500);
        }
    },
    {
        id: 'coverScaleRange', event: 'input', callback: (e) => {
            applicationState.coverScaleInput.value = e.target.value;
            processor.mirage.updateCoverScale(parseFloat(e.target.value) / 100);
        }
    },
    {
        id: 'coverScaleInput', event: 'input', callback: (e) => {
            clearTimeout(applicationState.coverScaleTimeout);
            applicationState.coverScaleTimeout = setTimeout(() => {
                let value = parseFloat(e.target.value);
                if (isNaN(value)) {
                    return;
                }
                value = Math.min(Math.max(value, 0), 100);
                applicationState.coverScaleSlider.value = value;
                applicationState.coverScaleInput.value = value;
                processor.mirage.updateCoverScale(value / 100);
            }, 500);
        }
    },
    {
        id: 'innerWeightRange', event: 'input', callback: (e) => {
            applicationState.innerWeightInput.value = e.target.value;
            processor.mirage.updateInnerWeight(parseFloat(e.target.value) / 100);
        }
    },
    {
        id: 'innerWeightInput', event: 'input', callback: (e) => {
            clearTimeout(applicationState.innerWeightTimeout);
            applicationState.innerWeightTimeout = setTimeout(() => {
                let value = parseFloat(e.target.value);
                if (isNaN(value)) {
                    return;
                }
                value = Math.min(Math.max(value, 0), 100);
                applicationState.innerWeightSlider.value = value;
                applicationState.innerWeightInput.value = value;
                processor.mirage.updateInnerWeight(value / 100);
            }, 500);
        }
    },
    {
        id: 'innerDesatRange', event: 'input', callback: (e) => {
            applicationState.innerDesatInput.value = e.target.value;
            processor.mirage.updateInnerDesat(parseFloat(e.target.value) / 100);
        }
    },
    {
        id: 'innerDesatInput', event: 'input', callback: (e) => {
            clearTimeout(applicationState.innerDesatTimeout);
            applicationState.innerDesatTimeout = setTimeout(() => {
                let value = parseFloat(e.target.value);
                if (isNaN(value)) {
                    return;
                }
                value = Math.min(Math.max(value, 0), 100);
                applicationState.innerDesatSlider.value = value;
                applicationState.innerDesatInput.value = value;
                processor.mirage.updateInnerDesat(value / 100);
            }, 500);
        }
    },
    {
        id: 'coverDesatRange', event: 'input', callback: (e) => {
            applicationState.coverDesatInput.value = e.target.value;
            processor.mirage.updateCoverDesat(parseFloat(e.target.value) / 100);
        }
    },
    {
        id: 'coverDesatInput', event: 'input', callback: (e) => {
            clearTimeout(applicationState.coverDesatTimeout);
            applicationState.coverDesatTimeout = setTimeout(() => {
                let value = parseFloat(e.target.value);
                if (isNaN(value)) {
                    return;
                }
                value = Math.min(Math.max(value, 0), 100);
                applicationState.coverDesatSlider.value = value;
                applicationState.coverDesatInput.value = value;
                processor.mirage.updateCoverDesat(value / 100);
            }, 500);
        }
    },
    {
        id: 'isColoredCheckbox', event: 'change', callback: (e) => {
            processor.mirage.updateColorMode(e.target.checked);
        }
    },
    {
        id: 'maxSizeInput', event: 'input', callback: (e) => {
            clearTimeout(applicationState.maxSizeTimeout);
            applicationState.maxSizeTimeout = setTimeout(() => {
                let value = parseInt(e.target.value);
                value = Math.min(Math.max(value, 0), 4096);
                e.target.value = value;
                processor.mirage.updateMaxSize(value);
            }, 500);
        }
    },
    {
        id: 'saveButton', event: 'click', callback: () => {
            processor.mirage.saveResult();
        }, errorMsg: '保存失败! '
    },
    {
        id: 'swapButton', event: 'click', callback: () => {
            processor.mirage.swapImg();
        }
    },
]

const setupPlusMinusButton = (paramName, sliderEl, inputEl, updateFn, step = 2) => {
    const minusBtn = document.getElementById(paramName + 'Minus');
    const plusBtn = document.getElementById(paramName + 'Plus');
    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            let value = parseFloat(inputEl.value) - step;
            value = Math.min(Math.max(value, 0), 100);
            inputEl.value = value;
            sliderEl.value = value;
            updateFn(value / 100);
        });
    }
    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            let value = parseFloat(inputEl.value) + step;
            value = Math.min(Math.max(value, 0), 100);
            inputEl.value = value;
            sliderEl.value = value;
            updateFn(value / 100);
        });
    }
};

const setupCanvasZoom = () => {
    const mask = document.createElement('div');
    mask.className = 'preview-mask';
    document.body.appendChild(mask);

    const zoomableCanvases = ['outputCanvas', 'blackCanvas', 'whiteCanvas'];
    let zoomedCanvas = null;

    const closeZoom = () => {
        if (zoomedCanvas) {
            zoomedCanvas.classList.remove('canvas-zoomed');
            zoomedCanvas = null;
            mask.style.display = 'none';
        }
    };

    mask.addEventListener('click', () => {
        if (zoomedCanvas) {
            history.back();
        }
    });

    window.addEventListener('popstate', () => {
        if (!location.hash.startsWith('#preview')) {
            closeZoom();
        }
    });

    zoomableCanvases.forEach((id) => {
        const canvas = document.getElementById(id);
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                e.stopPropagation();
                if (zoomedCanvas === canvas) {
                    history.back();
                } else {
                    if (zoomedCanvas) closeZoom();
                    location.hash = '#preview';
                    canvas.classList.add('canvas-zoomed');
                    zoomedCanvas = canvas;
                    mask.style.display = 'block';
                }
            });
        }
    });
};

const setUpListeners = () => {
    try {
        applicationState.innerScaleSlider = document.getElementById('innerScaleRange');
        applicationState.innerScaleInput = document.getElementById('innerScaleInput');
        applicationState.coverScaleSlider = document.getElementById('coverScaleRange');
        applicationState.coverScaleInput = document.getElementById('coverScaleInput');
        applicationState.innerWeightSlider = document.getElementById('innerWeightRange');
        applicationState.innerWeightInput = document.getElementById('innerWeightInput');
        applicationState.innerDesatSlider = document.getElementById('innerDesatRange');
        applicationState.innerDesatInput = document.getElementById('innerDesatInput');
        applicationState.coverDesatSlider = document.getElementById('coverDesatRange');
        applicationState.coverDesatInput = document.getElementById('coverDesatInput');

        eventListU.forEach((event) => {
            document.getElementById(event.id).addEventListener(event.event, (e) => {
                setup(e, event.callback, event.errorMsg || '操作失败! ');
            });
        });

        // Plus/minus buttons
        setupPlusMinusButton('innerScale', applicationState.innerScaleSlider, applicationState.innerScaleInput, (v) => processor.mirage.updateInnerScale(v));
        setupPlusMinusButton('coverScale', applicationState.coverScaleSlider, applicationState.coverScaleInput, (v) => processor.mirage.updateCoverScale(v));
        setupPlusMinusButton('innerWeight', applicationState.innerWeightSlider, applicationState.innerWeightInput, (v) => processor.mirage.updateInnerWeight(v));
        setupPlusMinusButton('innerDesat', applicationState.innerDesatSlider, applicationState.innerDesatInput, (v) => processor.mirage.updateInnerDesat(v));
        setupPlusMinusButton('coverDesat', applicationState.coverDesatSlider, applicationState.coverDesatInput, (v) => processor.mirage.updateCoverDesat(v));

        // File size limit -> triggers maxSize recalculation
        const maxFileSizeInput = document.getElementById('maxFileSizeInput');
        if (maxFileSizeInput) {
            window.getMaxBytes = () => {
                const mb = parseFloat(maxFileSizeInput.value);
                return (isNaN(mb) || mb <= 0) ? 0 : mb * 1024 * 1024;
            };
            maxFileSizeInput.addEventListener('input', () => {
                const maxSizeInput = document.getElementById('maxSizeInput');
                if (maxSizeInput) {
                    maxSizeInput.dispatchEvent(new Event('input'));
                }
            });
        }

        // Canvas zoom
        setupCanvasZoom();

        if (!applicationState.isOnPhone) {
            applicationState.mouseX = 0;
            window.addEventListener('mousemove', (event) => {
                applicationState.mouseX = event.clientX;
            });

            window.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            document.addEventListener('paste', (e) => {
                setup(e, async (e) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                            const file = items[i].getAsFile();
                            if (applicationState.mouseX > window.innerWidth / 2) {
                                processor.mirage.updateCoverImg(await loadImage(file));
                            } else {
                                processor.mirage.updateInnerImg(await loadImage(file));
                            }
                            break;
                        }
                    }
                }, '加载失败! ');
            });

            document.getElementById('innerCanvas').addEventListener('drop', (e) => {
                e.preventDefault();
                setup(e, async (e) => {
                    const items = e.dataTransfer.items;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].kind === 'file' && items[i].type.indexOf('image') !== -1) {
                            const file = items[i].getAsFile();
                            processor.mirage.updateInnerImg(await loadImage(file));
                            break;
                        }
                    }
                });
            });
            document.getElementById('coverCanvas').addEventListener('drop', (e) => {
                e.preventDefault();
                setup(e, async (e) => {
                    const items = e.dataTransfer.items;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].kind === 'file' && items[i].type.indexOf('image') !== -1) {
                            const file = items[i].getAsFile();
                            processor.mirage.updateCoverImg(await loadImage(file));
                            break;
                        }
                    }
                });
            });
        } else {
            const innerHint = document.getElementById('innerInputHint');
            const coverHint = document.getElementById('coverInputHint');
            if (innerHint) innerHint.remove();
            if (coverHint) coverHint.remove();
        }
    } catch (e) {
        alert('监听器设置失败! ' + e.message);
        console.error('监听器设置失败!', e.message, e.stack);
    }
}

export {
    setUpListeners
}