import '../css/switch.css';
import '../css/class.css';
import '../css/spec.css';

import { applicationState, errorHandling, processor } from './global';
import { getArguments } from './defaultArguments';
import { Mirage_Colored } from './process';
import { setUpListeners } from './listener';

const userAgent = navigator.userAgent;
applicationState.isOnPhone = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
applicationState.isDownloadNotSupported = applicationState.isOnPhone && /xiaomi|miui|quark|ucbrowser/i.test(userAgent);
applicationState.isOnTiebaBrowser = /tieba/i.test(userAgent);

const applyTheme = (tarTheme) => {
    if (tarTheme === undefined || typeof tarTheme !== 'string') {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        tarTheme = prefersDarkScheme ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", tarTheme);
    document.getElementById('isDarkmodeCheckbox').checked = tarTheme === 'dark';
};

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
    document.getElementById('isDarkmodeCheckbox').addEventListener('change', (event) => {
        const theme = event.target.checked ? 'dark' : 'light';
        applyTheme(theme);
    });

    if (applicationState.isOnTiebaBrowser) {
        alert('建议点击右上角使用正常浏览器打开本页面。');
    }
    if (applicationState.isDownloadNotSupported) {
        alert('由于浏览器限制，图片保存功能可能出现异常，建议使用其他浏览器或等待后续更新适配。');
    }

    applicationState.defaultArguments = getArguments();
    applicationState.version = applicationState.defaultArguments.app_version;

    // 检查版本号，清除缓存
    console.log('target version:', applicationState.version);
    console.log('local version:', localStorage.getItem('version'));
    const previousVersion = localStorage.getItem('version');
    if (!previousVersion || previousVersion !== applicationState.version) {
        console.log('new version detected, clearing cache');
        localStorage.clear();
        localStorage.setItem('version', applicationState.version);
        location.reload(true);
    }

    // 显示版本号
    const versionInfoElement = document.getElementById('versionInfo');
    if (versionInfoElement) {
        versionInfoElement.innerHTML = `version: <b>${applicationState.version}</b>`;
    }

    const canvasList = [
        document.getElementById('innerCanvas'),
        document.getElementById('coverCanvas'),
        document.getElementById('outputCanvas'),
        document.getElementById('whiteCanvas'),
        document.getElementById('blackCanvas'),
    ];

    processor.mirage = new Mirage_Colored(applicationState.defaultArguments, ...canvasList);

    setUpListeners();
});