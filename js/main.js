/* =========================================================
   SO HALAL MODE OS
   Main Operating System
   ========================================================= */


/* =========================================================
   GLOBAL STATE
   ========================================================= */

const OS = {
    apps: [],
    windows: new Map(),
    activeWindow: null,
    nextZIndex: 100,

    settings: {
        darkMode: true,
        sound: true,
        internet: true
    }
};


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const desktopApps = document.getElementById("desktop-apps");
const windowsContainer = document.getElementById("windows-container");
const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("start-button");
const pinnedApps = document.getElementById("pinned-apps");
const allApps = document.getElementById("all-apps");
const appSearch = document.getElementById("app-search");
const runningApps = document.getElementById("running-apps");
const loadingScreen = document.getElementById("loading-screen");
const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");
const toastContainer = document.getElementById("toast-container");
const contextMenu = document.getElementById("context-menu");


/* =========================================================
   INITIALIZE OS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeOS
);


function initializeOS() {

    loadSettings();

    OS.apps = [...APPS];

    renderDesktop();
    renderStartMenu();

    updateClock();

    setInterval(
        updateClock,
        1000
    );

    setupStartMenu();
    setupSearch();
    setupTaskbar();
    setupContextMenu();
    setupQuickSettings();
    setupGlobalEvents();

    if (loadingScreen) {

        setTimeout(() => {

            loadingScreen.style.opacity = "0";
            loadingScreen.style.visibility = "hidden";

            setTimeout(() => {
                loadingScreen.remove();
            }, 500);

        }, 700);

    }

}



/* =========================================================
   APPLY SETTINGS
   ========================================================= */

function applySettings() {

    /* =====================================================
       THEME
       ===================================================== */

    if (OS.settings.darkMode) {

        document.body.classList.add(
            "dark-mode"
        );

        document.body.classList.remove(
            "light-mode"
        );

    } else {

        document.body.classList.remove(
            "dark-mode"
        );

        document.body.classList.add(
            "light-mode"
        );

    }


    /* =====================================================
       UPDATE QUICK SETTINGS
       ===================================================== */

    updateDarkModeUI();

    updateInternetUI();

    updateSoundUI();

}

/* =========================================================
   DARK MODE
   ========================================================= */

function toggleDarkMode() {

    OS.settings.darkMode =
        !OS.settings.darkMode;


    applySettings();

    saveSettings();


    notifyApps(
        "settings-changed",
        {
            settings: {
                ...OS.settings
            }
        }
    );


    showToast(
        OS.settings.darkMode
            ? "Dark Mode enabled"
            : "Light Mode enabled"
    );

}


/* =========================================================
   SOUND
   ========================================================= */

function toggleSound() {

    OS.settings.sound =
        !OS.settings.sound;


    applySettings();

    saveSettings();


    notifyApps(
        "settings-changed",
        {
            settings: {
                ...OS.settings
            }
        }
    );


    showToast(
        OS.settings.sound
            ? "Sound enabled"
            : "Sound disabled"
    );

}

/* =========================================================
   INTERNET
   ========================================================= */

function toggleInternet() {

    OS.settings.internet =
        !OS.settings.internet;


    applySettings();

    saveSettings();


    notifyApps(
        "settings-changed",
        {
            settings: {
                ...OS.settings
            }
        }
    );


    showToast(
        OS.settings.internet
            ? "Internet enabled"
            : "Internet disabled"
    );

}


/* =========================================================
   UPDATE INTERNET UI
   ========================================================= */

function updateInternetUI() {

    const button =
        document.getElementById(
            "wifi-toggle"
        );


    if (!button) {
        return;
    }


    const icon =
        button.querySelector(
            "span:first-child"
        );


    const text =
        button.querySelector(
            "span:last-child"
        );


    if (OS.settings.internet) {

        if (icon) {
            icon.textContent = "🌐";
        }

        if (text) {
            text.textContent = "Internet";
        }

        button.classList.add(
            "active"
        );

    } else {

        if (icon) {
            icon.textContent = "📡";
        }

        if (text) {
            text.textContent = "Internet Off";
        }

        button.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   UPDATE SOUND UI
   ========================================================= */

function updateSoundUI() {

    const button =
        document.getElementById(
            "sound-toggle"
        );


    if (!button) {
        return;
    }


    const icon =
        button.querySelector(
            "span:first-child"
        );


    const text =
        button.querySelector(
            "span:last-child"
        );


    if (OS.settings.sound) {

        if (icon) {
            icon.textContent = "🔊";
        }

        if (text) {
            text.textContent = "Sound";
        }

        button.classList.add(
            "active"
        );

    } else {

        if (icon) {
            icon.textContent = "🔇";
        }

        if (text) {
            text.textContent = "Sound Off";
        }

        button.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   UPDATE DARK MODE UI
   ========================================================= */

function updateDarkModeUI() {

    const button =
        document.getElementById(
            "dark-mode-toggle"
        );


    if (!button) {
        return;
    }


    const icon =
        button.querySelector(
            "span:first-child"
        );


    const text =
        button.querySelector(
            "span:last-child"
        );


    if (OS.settings.darkMode) {

        if (icon) {
            icon.textContent = "🌙";
        }

        if (text) {
            text.textContent = "Dark Mode";
        }

        button.classList.add(
            "active"
        );

    } else {

        if (icon) {
            icon.textContent = "☀️";
        }

        if (text) {
            text.textContent = "Light Mode";
        }

        button.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function toggleFullscreen() {

    try {

        if (!document.fullscreenElement) {

            await document
                .documentElement
                .requestFullscreen();


            showToast(
                "Fullscreen enabled"
            );

        } else {

            await document.exitFullscreen();


            showToast(
                "Fullscreen disabled"
            );

        }

    } catch (error) {

        console.error(
            "Fullscreen error:",
            error
        );


        showToast(
            "Fullscreen is not available"
        );

    }

}


/* =========================================================
   FULLSCREEN UI
   ========================================================= */

function updateFullscreenUI() {

    const button =
        document.getElementById(
            "fullscreen-toggle"
        );


    if (!button) {
        return;
    }


    const icon =
        button.querySelector(
            "span:first-child"
        );


    const text =
        button.querySelector(
            "span:last-child"
        );


    if (document.fullscreenElement) {

        if (icon) {
            icon.textContent = "⛶";
        }

        if (text) {
            text.textContent = "Exit Fullscreen";
        }

    } else {

        if (icon) {
            icon.textContent = "⛶";
        }

        if (text) {
            text.textContent = "Fullscreen";
        }

    }

}


/* =========================================================
   NOTIFY APPLICATIONS
   ========================================================= */

function notifyApps(
    type,
    data = {}
) {

    document
        .querySelectorAll(
            ".app-frame"
        )
        .forEach(
            frame => {

                try {

                    frame.contentWindow.postMessage(
                        {
                            type: type,
                            ...data
                        },
                        "*"
                    );

                } catch (error) {

                    console.error(
                        "Failed to notify app:",
                        error
                    );

                }

            }
        );

}

/* =========================================================
   QUICK SETTINGS SETUP
   ========================================================= */

function setupQuickSettings() {

    /* =====================================================
       DARK MODE
       ===================================================== */

    const darkModeButton =
        document.getElementById(
            "dark-mode-toggle"
        );

    darkModeButton?.addEventListener(
        "click",
        () => {

            toggleDarkMode();

        }
    );


    /* =====================================================
       SOUND
       ===================================================== */

    const soundButton =
        document.getElementById(
            "sound-toggle"
        );

    soundButton?.addEventListener(
        "click",
        () => {

            toggleSound();

        }
    );


    /* =====================================================
       INTERNET
       ===================================================== */

    const wifiButton =
        document.getElementById(
            "wifi-toggle"
        );

    wifiButton?.addEventListener(
        "click",
        () => {

            toggleInternet();

        }
    );


    /* =====================================================
       FULLSCREEN
       ===================================================== */

    const fullscreenButton =
        document.getElementById(
            "fullscreen-toggle"
        );

    fullscreenButton?.addEventListener(
        "click",
        () => {

            toggleFullscreen();

        }
    );


    /* =====================================================
       FULLSCREEN CHANGE
       ===================================================== */

    document.addEventListener(
        "fullscreenchange",
        () => {

            updateFullscreenUI();

        }
    );


    /* =====================================================
       INITIAL UI
       ===================================================== */

    applySettings();

    updateFullscreenUI();

}

/* =========================================================
   RENDER DESKTOP
   ========================================================= */

function renderDesktop() {

    if (!desktopApps) {
        return;
    }


    desktopApps.innerHTML = "";


    OS.apps
        .filter(
            app => app.desktop
        )
        .forEach(
            app => {

                desktopApps.appendChild(
                    createDesktopApp(app)
                );

            }
        );

}


function createDesktopApp(app) {

    const element =
        document.createElement("div");


    element.className =
        "desktop-app";


    element.dataset.appId =
        app.id;


    element.innerHTML = `
        <img
            class="desktop-app-icon"
            src="${escapeAttribute(app.icon)}"
            alt=""
            onerror="this.style.display='none'"
        >

        <span class="desktop-app-name">
            ${escapeHTML(app.name)}
        </span>
    `;


    element.addEventListener(
        "dblclick",
        () => {

            openApp(
                app.id
            );

        }
    );


    element.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".desktop-app"
                )
                .forEach(
                    item => {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


            element.classList.add(
                "selected"
            );

        }
    );


    return element;

}


/* =========================================================
   START MENU
   ========================================================= */

function renderStartMenu() {

    if (!pinnedApps || !allApps) {
        return;
    }


    pinnedApps.innerHTML = "";

    allApps.innerHTML = "";


    OS.apps
        .filter(
            app => app.pinned
        )
        .forEach(
            app => {

                pinnedApps.appendChild(
                    createStartApp(app)
                );

            }
        );


    OS.apps
        .slice()
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        )
        .forEach(
            app => {

                allApps.appendChild(
                    createAppListItem(app)
                );

            }
        );

}


function createStartApp(app) {

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "start-app";


    button.dataset.appId =
        app.id;


    button.innerHTML = `
        <img
            src="${escapeAttribute(app.icon)}"
            alt=""
            onerror="this.style.display='none'"
        >

        <span>
            ${escapeHTML(app.name)}
        </span>
    `;


    button.addEventListener(
        "click",
        () => {

            openApp(
                app.id
            );

            closeStartMenu();

        }
    );


    return button;

}


function createAppListItem(app) {

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "app-list-item";


    button.dataset.appId =
        app.id;


    button.innerHTML = `
        <img
            src="${escapeAttribute(app.icon)}"
            alt=""
            onerror="this.style.display='none'"
        >

        <span>
            ${escapeHTML(app.name)}
        </span>
    `;


    button.addEventListener(
        "click",
        () => {

            openApp(
                app.id
            );

            closeStartMenu();

        }
    );


    return button;

}


/* =========================================================
   OPEN APPLICATION
   ========================================================= */

function openApp(appId) {

    const app =
        OS.apps.find(
            function(item) {
                return item.id === appId;
            }
        );


    if (!app) {
        return;
    }


    if (OS.windows.has(appId)) {

        const existing =
            OS.windows.get(appId);

        existing.classList.remove(
            'minimized'
        );

        focusWindow(
            existing
        );

        return;
    }


    const windowElement =
        createWindow(app);


    windowsContainer.appendChild(
        windowElement
    );


    OS.windows.set(
        appId,
        windowElement
    );


    focusWindow(
        windowElement
    );


    renderRunningApps();
}


/* =========================================================
   CREATE WINDOW
   ========================================================= */

function createWindow(app) {

    const windowElement =
        document.createElement('div');

    windowElement.className =
        'os-window';

    windowElement.dataset.appId =
        app.id;


    const width =
        app.width || 800;

    const height =
        app.height || 550;


    const offset =
        OS.windows.size * 25;


    windowElement.style.width =
        width + 'px';

    windowElement.style.height =
        height + 'px';

    windowElement.style.left =
        (100 + offset) + 'px';

    windowElement.style.top =
        (50 + offset) + 'px';


    windowElement.innerHTML =

        '<div class="window-header">' +

            '<div class="window-title">' +

                '<img ' +
                    'class="window-title-icon" ' +
                    'src="' + escapeAttribute(app.icon) + '"' +
                    ' alt="" ' +
                    'onerror="this.style.display=\'none\'"' +
                '>' +

                '<span class="window-title-text">' +
                    escapeHTML(app.name) +
                '</span>' +

            '</div>' +


            '<div class="window-controls">' +

                '<button ' +
                    'class="window-control minimize" ' +
                    'type="button"' +
                '>' +
                    '─' +
                '</button>' +

                '<button ' +
                    'class="window-control maximize" ' +
                    'type="button"' +
                '>' +
                    '□' +
                '</button>' +

                '<button ' +
                    'class="window-control close" ' +
                    'type="button"' +
                '>' +
                    '×' +
                '</button>' +

            '</div>' +

        '</div>' +


        '<div class="window-content">' +

            '<iframe ' +
                'class="app-frame" ' +
                'src="' + escapeAttribute(app.path) + '"' +
                'title="' + escapeAttribute(app.name) + '"' +
                'frameborder="0"' +
            '></iframe>' +

        '</div>';


    windowElement
        .querySelector('.minimize')
        .addEventListener(
            'click',
            function(event) {

                event.stopPropagation();

                minimizeWindow(
                    windowElement
                );

            }
        );


    windowElement
        .querySelector('.maximize')
        .addEventListener(
            'click',
            function(event) {

                event.stopPropagation();

                toggleMaximize(
                    windowElement
                );

            }
        );


    windowElement
        .querySelector('.close')
        .addEventListener(
            'click',
            function(event) {

                event.stopPropagation();

                closeWindow(
                    windowElement
                );

            }
        );


    windowElement.addEventListener(
        'mousedown',
        function() {

            focusWindow(
                windowElement
            );

        }
    );


    makeWindowDraggable(
        windowElement
    );


    return windowElement;
}

/* =========================================================
   FOCUS WINDOW
   ========================================================= */

function focusWindow(
    windowElement
) {

    if (!windowElement) {
        return;
    }


    OS.nextZIndex++;


    windowElement.style.zIndex =
        OS.nextZIndex;


    OS.activeWindow =
        windowElement;


    renderRunningApps();

}


/* =========================================================
   MINIMIZE
   ========================================================= */

function minimizeWindow(
    windowElement
) {

    windowElement.classList.add(
        "minimized"
    );


    if (
        OS.activeWindow ===
        windowElement
    ) {

        OS.activeWindow =
            null;

    }


    renderRunningApps();

}


/* =========================================================
   MAXIMIZE
   ========================================================= */

function toggleMaximize(
    windowElement
) {

    windowElement.classList.toggle(
        "maximized"
    );

}


/* =========================================================
   CLOSE WINDOW
   ========================================================= */

function closeWindow(
    windowElement
) {

    if (!windowElement) {
        return;
    }


    const appId =
        windowElement.dataset.appId;


    OS.windows.delete(
        appId
    );


    windowElement.remove();


    if (
        OS.activeWindow ===
        windowElement
    ) {

        OS.activeWindow =
            null;

    }


    renderRunningApps();

}


/* =========================================================
   DRAG WINDOWS
   ========================================================= */

function makeWindowDraggable(
    windowElement
) {

    const header =
        windowElement.querySelector(
            ".window-header"
        );


    if (!header) {
        return;
    }


    let dragging =
        false;


    let offsetX =
        0;


    let offsetY =
        0;


    header.addEventListener(
        "mousedown",
        event => {

            if (
                event.target.closest(
                    ".window-control"
                )
            ) {
                return;
            }


            if (
                windowElement.classList.contains(
                    "maximized"
                )
            ) {
                return;
            }


            dragging =
                true;


            const rect =
                windowElement.getBoundingClientRect();


            offsetX =
                event.clientX -
                rect.left;


            offsetY =
                event.clientY -
                rect.top;


            focusWindow(
                windowElement
            );

        }
    );


    document.addEventListener(
        "mousemove",
        event => {

            if (!dragging) {
                return;
            }


            const maxX =
                window.innerWidth -
                windowElement.offsetWidth;


            const maxY =
                window.innerHeight -
                62 -
                windowElement.offsetHeight;


            let x =
                event.clientX -
                offsetX;


            let y =
                event.clientY -
                offsetY;


            x =
                Math.max(
                    0,
                    Math.min(
                        x,
                        maxX
                    )
                );


            y =
                Math.max(
                    0,
                    Math.min(
                        y,
                        maxY
                    )
                );


            windowElement.style.left =
                `${x}px`;


            windowElement.style.top =
                `${y}px`;

        }
    );


    document.addEventListener(
        "mouseup",
        () => {

            dragging =
                false;

        }
    );

}


/* =========================================================
   RUNNING APPS
   ========================================================= */

function renderRunningApps() {

    if (!runningApps) {
        return;
    }


    runningApps.innerHTML =
        "";


    OS.windows.forEach(
        (
            windowElement,
            appId
        ) => {

            const app =
                OS.apps.find(
                    item =>
                        item.id ===
                        appId
                );


            if (!app) {
                return;
            }


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "running-app";


            if (
                OS.activeWindow ===
                windowElement
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.innerHTML = `
                <img
                    src="${escapeAttribute(app.icon)}"
                    alt=""
                    onerror="this.style.display='none'"
                >

                <span>
                    ${escapeHTML(app.name)}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    if (
                        windowElement.classList.contains(
                            "minimized"
                        )
                    ) {

                        windowElement.classList.remove(
                            "minimized"
                        );


                        focusWindow(
                            windowElement
                        );

                    } else if (
                        OS.activeWindow ===
                        windowElement
                    ) {

                        minimizeWindow(
                            windowElement
                        );

                    } else {

                        focusWindow(
                            windowElement
                        );

                    }

                }
            );


            runningApps.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   START MENU CONTROLS
   ========================================================= */

function setupStartMenu() {

    if (!startButton) {
        return;
    }


    startButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleStartMenu();

        }
    );

}


function toggleStartMenu() {

    if (!startMenu) {
        return;
    }


    const isHidden =
        startMenu.classList.contains(
            "hidden"
        );


    if (isHidden) {

        startMenu.classList.remove(
            "hidden"
        );


        startButton?.setAttribute(
            "aria-expanded",
            "true"
        );

    } else {

        closeStartMenu();

    }

}


function closeStartMenu() {

    if (!startMenu) {
        return;
    }


    startMenu.classList.add(
        "hidden"
    );


    startButton?.setAttribute(
        "aria-expanded",
        "false"
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    if (!appSearch) {
        return;
    }


    appSearch.addEventListener(
        "input",
        () => {

            const query =
                appSearch.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    "#all-apps .app-list-item"
                )
                .forEach(
                    item => {

                        const appId =
                            item.dataset.appId;


                        const app =
                            OS.apps.find(
                                a =>
                                    a.id ===
                                    appId
                            );


                        if (!app) {
                            return;
                        }


                        const matches =
                            app.name
                                .toLowerCase()
                                .includes(
                                    query
                                );


                        item.style.display =
                            matches
                                ? ""
                                : "none";

                    }
                );

        }
    );


    const taskbarSearch =
        document.getElementById(
            "taskbar-search"
        );


    if (taskbarSearch) {

        taskbarSearch.addEventListener(
            "click",
            () => {

                startMenu?.classList.remove(
                    "hidden"
                );


                appSearch.focus();

            }
        );

    }

}


/* =========================================================
   TASKBAR
   ========================================================= */

function setupTaskbar() {

    const clock =
        document.getElementById(
            "clock"
        );


    const networkButton =
        document.getElementById(
            "network-button"
        );


    const volumeButton =
        document.getElementById(
            "volume-button"
        );


    const batteryButton =
        document.getElementById(
            "battery-button"
        );


    clock?.addEventListener(
        "click",
        () => {

            const center =
                document.getElementById(
                    "notification-center"
                );


            center?.classList.toggle(
                "hidden"
            );

        }
    );


    networkButton?.addEventListener(
        "click",
        () => {

            toggleElement(
                "quick-settings"
            );

        }
    );


    volumeButton?.addEventListener(
        "click",
        () => {

            toggleElement(
                "quick-settings"
            );

        }
    );


    batteryButton?.addEventListener(
        "click",
        () => {

            showToast(
                "Battery information is not available in the browser."
            );

        }
    );

}


/* =========================================================
   CONTEXT MENU
   ========================================================= */

function setupContextMenu() {

    const desktop =
        document.getElementById(
            "desktop"
        );


    if (
        !desktop ||
        !contextMenu
    ) {
        return;
    }


    desktop.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();


            showContextMenu(
                event.clientX,
                event.clientY
            );

        }
    );


    document.addEventListener(
        "click",
        () => {

            contextMenu.classList.add(
                "hidden"
            );

        }
    );


    contextMenu.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );

}


function showContextMenu(
    x,
    y
) {

    if (!contextMenu) {
        return;
    }


    contextMenu.style.left =
        `${x}px`;


    contextMenu.style.top =
        `${y}px`;


    contextMenu.classList.remove(
        "hidden"
    );

}


/* =========================================================
   GLOBAL EVENTS
   ========================================================= */

function setupGlobalEvents() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeStartMenu();


                contextMenu?.classList.add(
                    "hidden"
                );

            }


            if (
                event.key ===
                "Meta"
            ) {

                toggleStartMenu();

            }

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    "#start-menu"
                ) &&
                !event.target.closest(
                    "#start-button"
                )
            ) {

                closeStartMenu();

            }

        }
    );

}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

    if (
        !timeElement ||
        !dateElement
    ) {
        return;
    }


    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    const date =
        now.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );


    timeElement.textContent =
        time;


    dateElement.textContent =
        date;

}


/* =========================================================
   SETTINGS
   ========================================================= */

function saveSettings() {

    localStorage.setItem(
        "so_halal_mode_settings",
        JSON.stringify(
            OS.settings
        )
    );

}


function loadSettings() {

    try {

        const saved =
            localStorage.getItem(
                "so_halal_mode_settings"
            );


        if (!saved) {
            return;
        }


        const parsed =
            JSON.parse(
                saved
            );


        Object.assign(
            OS.settings,
            parsed
        );

    } catch (error) {

        console.error(
            "Failed to load settings:",
            error
        );

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    duration = 2500
) {

    if (!toastContainer) {
        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "toast";


    toast.textContent =
        message;


    toastContainer.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";


            toast.style.transform =
                "translateX(20px)";


            setTimeout(
                () => {

                    toast.remove();

                },
                200
            );

        },
        duration
    );

}


/* =========================================================
   TOGGLE ELEMENT
   ========================================================= */

function toggleElement(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.classList.toggle(
        "hidden"
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   MESSAGE SYSTEM
   ========================================================= */

window.addEventListener(
    "message",
    function(event) {

        if (!event.data) {
            return;
        }


        /* =================================================
           OPEN APP
           ================================================= */

        if (
            event.data.type ===
            "open-app"
        ) {

            openApp(
                event.data.appId
            );

            return;
        }


        /* =================================================
           SETTINGS GET
           ================================================= */

        if (
            event.data.type ===
            "settings-get"
        ) {

            try {

                event.source.postMessage(
                    {
                        type: "settings-data",

                        settings: {
                            ...OS.settings
                        }
                    },
                    "*"
                );

            } catch (error) {

                console.error(
                    "Failed to send settings:",
                    error
                );

            }

            return;
        }


        /* =================================================
           SETTINGS SET
           ================================================= */

        if (
            event.data.type ===
            "settings-set"
        ) {

            const setting =
                event.data.setting;

            const value =
                event.data.value;


            /* ---------------------------------------------
               Make sure setting exists
               --------------------------------------------- */

            if (
                !Object.prototype.hasOwnProperty.call(
                    OS.settings,
                    setting
                )
            ) {

                console.warn(
                    "Unknown setting:",
                    setting
                );

                return;

            }


            /* ---------------------------------------------
               Update OS setting
               --------------------------------------------- */

            OS.settings[setting] =
                Boolean(value);


            /* ---------------------------------------------
               Apply changes
               --------------------------------------------- */

            applySettings();


            /* ---------------------------------------------
               Save
               --------------------------------------------- */

            saveSettings();


            /* ---------------------------------------------
               Notify ALL apps
               --------------------------------------------- */

            notifyApps(
                "settings-changed",
                {
                    settings: {
                        ...OS.settings
                    }
                }
            );


            /* ---------------------------------------------
               Toast
               --------------------------------------------- */

            let message = "";


            if (
                setting ===
                "darkMode"
            ) {

                message =
                    OS.settings.darkMode
                        ? "Dark Mode enabled"
                        : "Light Mode enabled";

            }


            else if (
                setting ===
                "sound"
            ) {

                message =
                    OS.settings.sound
                        ? "Sound enabled"
                        : "Sound disabled";

            }


            else if (
                setting ===
                "internet"
            ) {

                message =
                    OS.settings.internet
                        ? "Internet enabled"
                        : "Internet disabled";

            }


            if (message) {

                showToast(
                    message
                );

            }


            return;
        }

    }
);

/* =========================================================
   PUBLIC API
   ========================================================= */

window.SO = {

    OS,

    openApp,

    closeWindow,

    minimizeWindow,

    toggleMaximize,

    showToast

};
