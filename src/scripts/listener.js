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
            processor.mirage.updateInnerImg(await loadImage(file));
            e.target.value = '';
        }, errorMsg: '里图加载失败! '
    },
    {
        id: 'coverFileInput', event: 'change', callback: async (e) => {
            const file = e.target.files[0];
            processor.mirage.updateCoverImg(await loadImage(file));
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
            processor.mirage.updateInnerScale(parseFloat(e.target.value));
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
                value = Math.min(Math.max(value, 0), 1);
                applicationState.innerScaleSlider.value = value;
                applicationState.innerScaleInput.value = value;
                processor.mirage.updateInnerScale(value);
            }, 500);
        }
    },
    {
        id: 'coverScaleRange', event: 'input', callback: (e) => {
            applicationState.coverScaleInput.value = e.target.value;
            processor.mirage.updateCoverScale(parseFloat(e.target.value));
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
                value = Math.min(Math.max(value, 0), 1);
                applicationState.coverScaleSlider.value = value;
                applicationState.coverScaleInput.value = value;
                processor.mirage.updateCoverScale(value);
            }, 500);
        }
    },
    {
        id: 'innerWeightRange', event: 'input', callback: (e) => {
            applicationState.innerWeightInput.value = e.target.value;
            processor.mirage.updateInnerWeight(parseFloat(e.target.value));
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
                value = Math.min(Math.max(value, 0), 1);
                applicationState.innerWeightSlider.value = value;
                applicationState.innerWeightInput.value = value;
                processor.mirage.updateInnerWeight(value);
            }, 500);
        }
    },
    {
        id: 'innerDesatRange', event: 'input', callback: (e) => {
            applicationState.innerDesatInput.value = e.target.value;
            processor.mirage.updateInnerDesat(parseFloat(e.target.value));
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
                value = Math.min(Math.max(value, 0), 1);
                applicationState.innerDesatSlider.value = value;
                applicationState.innerDesatInput.value = value;
                processor.mirage.updateInnerDesat(value);
            }, 500);
        }
    },
    {
        id: 'coverDesatRange', event: 'input', callback: (e) => {
            applicationState.coverDesatInput.value = e.target.value;
            processor.mirage.updateCoverDesat(parseFloat(e.target.value));
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
                value = Math.min(Math.max(value, 0), 1);
                applicationState.coverDesatSlider.value = value;
                applicationState.coverDesatInput.value = value;
                processor.mirage.updateCoverDesat(value);
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
    {
        id: 'downloadHtmlLink', event: 'click', callback: () => {
            const currentHtml = document.documentElement.outerHTML;
            const parser = new DOMParser();
            const doc = parser.parseFromString(currentHtml, 'text/html');
            const sourceElement = doc.getElementById('content');
            const newDoc = document.implementation.createHTMLDocument('Filtered Document');
            newDoc.head.innerHTML = doc.head.innerHTML;
            doc.body.classList.forEach(cls => newDoc.body.classList.add(cls));
            newDoc.body.appendChild(newDoc.importNode(sourceElement, true));
            const a = document.createElement('a');
            a.download = 'mirage.html';
            a.href = URL.createObjectURL(new Blob([newDoc.documentElement.outerHTML], { type: 'text/html' }));
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        }, errorMsg: '下载失败! '
    }
]

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
            document.getElementById('innerInputHint').remove();
            document.getElementById('coverInputHint').remove();
        }

        document.getElementById('toggleVersionRecord').addEventListener('click', (event) => {
            const changelog = document.getElementById('versionRecordTable');
            const state = window.getComputedStyle(changelog).display;
            if (state === 'none') {
                changelog.classList.remove('displayNone');
                changelog.classList.add('displayBlock');
                event.target.textContent = '隐藏主要更新记录';
                window.scrollTo(0, document.body.scrollHeight);
            } else {
                changelog.classList.remove('displayBlock');
                changelog.classList.add('displayNone');
                event.target.textContent = '显示主要更新记录';
            }
        });
    } catch (e) {
        alert('监听器设置失败! ' + e.message);
        console.error('监听器设置失败!', e.message, e.stack);
    }
}

export {
    setUpListeners
}