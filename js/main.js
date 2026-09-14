/* =========================================================
   SO HALAL MODE OS
   Main Operating System
   ========================================================= */


/* =========================================================
   FIREBASE
   ========================================================= */

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



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
        internet: true,
        wallpaper: null
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
const backgroundMusic = document.getElementById("background-music");
const hoverSound = document.getElementById("hover-sound");
const clickSound = document.getElementById("click-sound");
const userNameElement = document.getElementById("user-name");
const usersCountElement = document.getElementById("users-count");

let deferredInstallPrompt = null;

const installPwaButton =
    document.getElementById("install-pwa-btn");

function isRunningAsPWA() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}

window.addEventListener("beforeinstallprompt", event => {
    // منع المتصفح من إظهار الـ prompt تلقائيًا
    event.preventDefault();

    deferredInstallPrompt = event;

    // لو الموقع مفتوح كـ Website عادي
    if (!isRunningAsPWA()) {
        installPwaButton?.classList.add("show");
    }
});

installPwaButton?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();

    const result = await deferredInstallPrompt.userChoice;

    if (result.outcome === "accepted") {
        console.log("[PWA] User installed Halal Tech.");
    }

    deferredInstallPrompt = null;

    installPwaButton?.classList.remove("show");
});

window.addEventListener("appinstalled", () => {
    console.log("[PWA] Halal Tech installed.");

    deferredInstallPrompt = null;

    installPwaButton?.classList.remove("show");
});

/* =========================================================
   SOUND SYSTEM
   ========================================================= */

const SOUND_VOLUME = {
    hover: 0.25,
    click: 0.45,
    music: 0.20
};

const BACKGROUND_TRACKS = [];

const SOUND_STATE_KEY = "so_halal_mode_sound_state";

let currentBackgroundTrack = 0;
let backgroundPosition = 0;

function saveSoundState() {
    if (!backgroundMusic) return;

    const state = {
        track: currentBackgroundTrack,
        time: backgroundMusic.currentTime || 0,
        enabled: OS.settings.sound
    };

    localStorage.setItem(
        SOUND_STATE_KEY,
        JSON.stringify(state)
    );
}

function loadSoundState() {
    try {
        const saved = localStorage.getItem(SOUND_STATE_KEY);

        if (!saved) return;

        const state = JSON.parse(saved);

        if (
            typeof state.track === "number" &&
            state.track >= 0 &&
            state.track < BACKGROUND_TRACKS.length
        ) {
            currentBackgroundTrack = state.track;
        }

        if (
            typeof state.time === "number" &&
            state.time >= 0
        ) {
            backgroundPosition = state.time;
        }

    } catch (error) {
        console.error("Failed to load sound state:", error);
    }
}

function playBackgroundTrack(index, resumeTime = 0) {
    if (!backgroundMusic) return;

    if (!OS.settings.sound) {
        backgroundMusic.pause();
        return;
    }

    if (BACKGROUND_TRACKS.length === 0) return;

    currentBackgroundTrack =
        index % BACKGROUND_TRACKS.length;

    backgroundMusic.src = "../sounds/background/" +
        BACKGROUND_TRACKS[currentBackgroundTrack] + ".mp3";

    backgroundMusic.volume = SOUND_VOLUME.music;

    backgroundMusic.addEventListener(
        "loadedmetadata",
        () => {
            if (resumeTime > 0 && resumeTime < backgroundMusic.duration) {
                backgroundMusic.currentTime = resumeTime;
            }

            const promise = backgroundMusic.play();

            if (promise) {
                promise.catch(() => {});
            }
        },
        { once: true }
    );
}


let lastSoundSave = 0;

backgroundMusic.addEventListener("timeupdate", () => {
    const now = Date.now();

    if (now - lastSoundSave < 1000) {
        return;
    }

    lastSoundSave = now;

    backgroundPosition = backgroundMusic.currentTime;

    saveSoundState();
});

backgroundMusic.addEventListener("ended", () => {
    if (!OS.settings.sound) return;

    currentBackgroundTrack++;

    if (currentBackgroundTrack >= BACKGROUND_TRACKS.length) {
        currentBackgroundTrack = 0;
    }

    backgroundPosition = 0;

    saveSoundState();

    playBackgroundTrack(currentBackgroundTrack, 0);
});


/* =========================================================
   PLAY SOUND
   ========================================================= */

function playSound(
    type
) {

    /*
        Respect the user's sound setting.
    */

    if (!OS.settings.sound) {
        return;
    }


    let audio = null;
    let volume = 1;


    if (type === "hover") {

        audio = hoverSound;
        volume = SOUND_VOLUME.hover;

    }


    else if (type === "click") {

        audio = clickSound;
        volume = SOUND_VOLUME.click;

    }


    if (!audio) {
        return;
    }


    try {

        /*
            Reset the sound so repeated clicks
            can play immediately.
        */

        audio.pause();

        audio.currentTime = 0;

        audio.volume = volume;


        const promise =
            audio.play();


        if (promise) {

            promise.catch(
                () => {
                    /*
                        Browser may block audio
                        until user interaction.
                    */
                }
            );

        }

    } catch (error) {

        console.warn(
            "Sound playback failed:",
            error
        );

    }

}


/* =========================================================
   BACKGROUND MUSIC
   ========================================================= */

function updateBackgroundMusic() {
    if (!backgroundMusic) return;

    if (!OS.settings.sound) {
        backgroundMusic.pause();
        return;
    }

    backgroundMusic.volume = SOUND_VOLUME.music;
}


/* =========================================================
   START BACKGROUND MUSIC
   ========================================================= */

function startBackgroundMusic() {
    if (!backgroundMusic) return;
    if (!OS.settings.sound) return;

    if (!backgroundMusic.src) {
        playBackgroundTrack(
            currentBackgroundTrack,
            backgroundPosition
        );

        return;
    }

    backgroundMusic.volume = SOUND_VOLUME.music;

    const promise = backgroundMusic.play();

    if (promise) {
        promise.catch(() => {});
    }
}

/* =========================================================
   GLOBAL UI SOUNDS
   ========================================================= */

function setupSoundEvents() {

    /*
        Elements that should produce UI sounds.
    */

    const interactiveSelector = [
        "button",
        "input",
        "select",
        "textarea",
        "a",
        ".desktop-app",
        ".app-list-item",
        ".start-app",
        ".running-app",
        ".os-window"
    ].join(",");


    /* =====================================================
       HOVER SOUND
       ===================================================== */

    document.addEventListener(
        "mouseover",
        event => {

            const element =
                event.target.closest(
                    interactiveSelector
                );


            if (!element) {
                return;
            }


            /*
                Prevent playing the sound again
                when moving between children
                of the same element.
            */

            if (
                event.relatedTarget &&
                element.contains(
                    event.relatedTarget
                )
            ) {

                return;

            }


            playSound(
                "hover"
            );

        }
    );


    /* =====================================================
       CLICK SOUND
       ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const element =
                event.target.closest(
                    interactiveSelector
                );


            if (!element) {
                return;
            }


            playSound(
                "click"
            );

        },
        true
    );


    /* =====================================================
       FIRST USER INTERACTION
       ===================================================== */

    document.addEventListener(
        "pointerdown",
        () => {

            startBackgroundMusic();

        },
        {
            once: true
        }
    );

}


/* =========================================================
   LOGIN CHECK
   ========================================================= */

function checkLogin() {

    const userId =
        localStorage.getItem("userId");

    if (!userId) {

        window.location.href = "login.html";

        return false;
    }

    return true;
}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

async function loadCurrentUser() {

    const userId =
        localStorage.getItem("userId");

    const savedName =
        localStorage.getItem("userName");


    if (savedName) {

        userNameElement.textContent =
            savedName;

    }


    if (!userId) {
        return;
    }


    try {

        const userRef =
            doc(db, "users", userId);

        const userSnapshot =
            await getDoc(userRef);


        if (userSnapshot.exists()) {

            const userData =
                userSnapshot.data();

            const name =
                userData.name || savedName || DEFAULT_USER_NAME;


            userNameElement.textContent =
                name;


            localStorage.setItem(
                "userName",
                name
            );

        }

    }

    catch (error) {

        console.error(
            "Failed to load user:",
            error
        );

    }

}


/* =========================================================
   LOAD USERS COUNT
   ========================================================= */

async function loadUsersCount() {

    if (!usersCountElement) {
        return;
    }


    try {

        const usersSnapshot =
            await getDocs(
                collection(db, "users")
            );


        usersCountElement.textContent =
            usersSnapshot.size;

    }

    catch (error) {

        console.error(
            "Failed to load users count:",
            error
        );

        usersCountElement.textContent =
            "—";

    }

}


/* =========================================================
   INITIALIZE OS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeOS
);


function initializeOS() {

    loadSettings();
    loadSoundState();

    OS.apps = [...APPS];

    setupSoundEvents();

    updateBackgroundMusic();

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

function applyWallpaper() {

    const desktop = document.getElementById("desktop");

    if (!desktop) {
        return;
    }

    const wallpaper = OS.settings.wallpaper;

    if (!wallpaper) {

        desktop.style.backgroundImage = "";

        return;
    }

    desktop.style.backgroundImage =
        `url("${wallpaper}")`;

    desktop.style.backgroundSize = "cover";
    desktop.style.backgroundPosition = "center";
    desktop.style.backgroundRepeat = "no-repeat";
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

    applyWallpaper();

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
    OS.settings.sound = !OS.settings.sound;

    if (!OS.settings.sound) {
        saveSoundState();

        backgroundMusic.pause();
    } else {
        startBackgroundMusic();
    }

    applySettings();
    saveSettings();

    notifyApps(
        "settings-changed",
        { settings: { ...OS.settings } }
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
        "click",
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

            if (setting === "wallpaper") {

                if (
                    typeof value !== "string" &&
                    value !== null
                ) {
                    return;
                }

                OS.settings.wallpaper = value;

                applyWallpaper();

            } else {

                OS.settings[setting] = Boolean(value);

            }


            /* ---------------------------------------------
               Apply changes
               --------------------------------------------- */

            applySettings();


            /* ---------------------------------------------
            Sound handling
            --------------------------------------------- */

            if (setting === "sound") {

                if (!OS.settings.sound) {

                    // Save exact position before stopping
                    saveSoundState();

                    if (backgroundMusic) {
                        backgroundMusic.pause();
                    }

                } else {

                    // Resume from the saved position
                    startBackgroundMusic();
                }
            }


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

window.addEventListener("beforeunload", () => {
    saveSoundState();
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        saveSoundState();
    }
});

document.addEventListener(
    "pointerdown",
    () => {
        if (OS.settings.sound) {
            startBackgroundMusic();
        }
    },
    { once: true }
);


loadCurrentUser();
loadUsersCount();

/* =========================================================
   PWA SERVICE WORKER
   ========================================================= */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        async () => {

            try {

                const registration =
                    await navigator.serviceWorker.register(
                        "./sw.js",
                        {
                            scope: "./"
                        }
                    );


                console.log(
                    "[PWA] Service Worker registered:",
                    registration.scope
                );


                /* =============================================
                   CHECK FOR UPDATES
                   ============================================= */

                registration.update();


                registration.addEventListener(
                    "updatefound",
                    () => {

                        const newWorker =
                            registration.installing;

                        if (!newWorker) {
                            return;
                        }


                        console.log(
                            "[PWA] New version found..."
                        );


                        newWorker.addEventListener(
                            "statechange",
                            () => {

                                console.log(
                                    "[PWA] Worker state:",
                                    newWorker.state
                                );

                            }
                        );

                    }
                );


            } catch (error) {

                console.error(
                    "[PWA] Service Worker registration failed:",
                    error
                );

            }

        }
    );


    /* =====================================================
       NEW SERVICE WORKER TOOK CONTROL
       ===================================================== */

    let refreshing = false;


    navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {

            /*
             * Prevent infinite reload
             */
            if (refreshing) {
                return;
            }

            refreshing = true;


            console.log(
                "[PWA] New version activated. Reloading..."
            );


            window.location.reload();

        }
    );

}

if (isRunningAsPWA()) {
    installPwaButton?.classList.remove("show");
}

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