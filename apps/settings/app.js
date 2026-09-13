/* =========================================================
   SETTINGS APP
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const darkModeButton =
    document.getElementById(
        "dark-mode"
    );

const soundButton =
    document.getElementById(
        "sound"
    );

const darkToggle =
    document.getElementById(
        "dark-toggle"
    );

const soundToggle =
    document.getElementById(
        "sound-toggle"
    );

const wallpaperGrid =
    document.getElementById(
        "wallpaper-grid"
    );

const currentWallpaperPreview =
    document.getElementById(
        "current-wallpaper-preview"
    );

const wallpaperUpload =
    document.getElementById(
        "wallpaper-upload"
    );

const resetWallpaper =
    document.getElementById(
        "reset-wallpaper"
    );

/* =========================================================
   SETTINGS
   ========================================================= */

let settings = {

    darkMode: true,

    sound: true,

    internet: true,

    wallpaper: null

};

const BUILTIN_WALLPAPERS = [

    {
        id: "wallpaper-1",
        name: "Halal Tech (Light)",
        src: "../../assets/wallpapers/001.png"
    },

    {
        id: "wallpaper-2",
        name: "Halal Tech (Dark)",
        src: "../../assets/wallpapers/002.png"
    },

    {
        id: "wallpaper-3",
        name: "Wallpaper 3 (Dark)",
        src: "../../assets/wallpapers/003.jpg"
    },

    {
        id: "wallpaper-4",
        name: "Wallpaper 4 (Light)",
        src: "../../assets/wallpapers/004.jpg"
    },

    {
        id: "wallpaper-5",
        name: "Wallpaper 5 (Dark)",
        src: "../../assets/wallpapers/005.jpg"
    }

];

/* =========================================================
   SEND MESSAGE TO MAIN OS
   ========================================================= */

function sendToOS(
    message
) {

    if (
        window.parent &&
        window.parent !== window
    ) {

        window.parent.postMessage(
            message,
            "*"
        );

    }

}


/* =========================================================
   REQUEST SETTINGS
   ========================================================= */

sendToOS({

    type: "settings-get"

});


/* =========================================================
   RECEIVE MESSAGES
   ========================================================= */

window.addEventListener(
    "message",
    event => {

        if (!event.data) {
            return;
        }


        /* =============================================
           SETTINGS DATA
           ============================================= */

        if (
            event.data.type ===
            "settings-data"
        ) {

            if (
                event.data.settings
            ) {

                settings = {

                    ...settings,

                    ...event.data.settings

                };

            }


            applyLocalTheme();

            renderWallpapers();

            updateUI();

        }


        /* =============================================
           SETTINGS CHANGED
           ============================================= */

        if (
            event.data.type ===
            "settings-changed"
        ) {

            if (
                event.data.settings
            ) {

                settings = {

                    ...settings,

                    ...event.data.settings

                };

            }


            applyLocalTheme();

            renderWallpapers();

            updateUI();

        }

    }
);

function renderWallpapers() {

    if (!wallpaperGrid) {
        return;
    }

    wallpaperGrid.innerHTML = "";

    BUILTIN_WALLPAPERS.forEach(
        wallpaper => {

            const item =
                document.createElement("button");

            item.className =
                "wallpaper-item";

            item.dataset.wallpaper =
                wallpaper.src;

            item.innerHTML = `
                <img
                    src="${wallpaper.src}"
                    alt="${wallpaper.name}"
                >

                <span>
                    ${wallpaper.name}
                </span>
            `;

            item.addEventListener(
                "click",
                () => {

                    setWallpaper(
                        wallpaper.src
                    );

                }
            );

            wallpaperGrid.appendChild(item);

        }
    );

    updateWallpaperSelection();
}

function setWallpaper(value) {

    settings.wallpaper = value;

    updateWallpaperSelection();

    updateWallpaperPreview();

    sendToOS({

        type: "settings-set",

        setting: "wallpaper",

        value: value

    });

}

function updateWallpaperSelection() {

    if (!wallpaperGrid) {
        return;
    }

    const items =
        wallpaperGrid.querySelectorAll(
            ".wallpaper-item"
        );

    items.forEach(item => {

        if (
            item.dataset.wallpaper ===
            settings.wallpaper
        ) {

            item.classList.add(
                "selected"
            );

        } else {

            item.classList.remove(
                "selected"
            );

        }

    });

}

function updateWallpaperPreview() {

    if (!currentWallpaperPreview) {
        return;
    }

    currentWallpaperPreview.innerHTML = "";

    if (!settings.wallpaper) {

        currentWallpaperPreview.textContent =
            "Default wallpaper";

        return;
    }

    const img =
        document.createElement("img");

    img.src =
        settings.wallpaper;

    img.alt =
        "Current wallpaper";

    currentWallpaperPreview.appendChild(
        img
    );

}

function compressImage(
    file,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82
) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                const img =
                    new Image();

                img.onload = () => {

                    let width =
                        img.width;

                    let height =
                        img.height;

                    const scale =
                        Math.min(
                            1,
                            maxWidth / width,
                            maxHeight / height
                        );

                    width =
                        Math.round(
                            width * scale
                        );

                    height =
                        Math.round(
                            height * scale
                        );

                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        width;

                    canvas.height =
                        height;

                    const ctx =
                        canvas.getContext(
                            "2d"
                        );

                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );

                    const result =
                        canvas.toDataURL(
                            "image/jpeg",
                            quality
                        );

                    resolve(result);

                };

                img.onerror =
                    reject;

                img.src =
                    reader.result;

            };

            reader.onerror =
                reject;

            reader.readAsDataURL(file);

        }
    );

}

/* =========================================================
   UPDATE UI
   ========================================================= */

function updateUI() {

    /* =====================================================
       DARK MODE
       ===================================================== */

    if (settings.darkMode) {

        darkToggle?.classList.add(
            "active"
        );

        darkModeButton?.classList.add(
            "active"
        );

    } else {

        darkToggle?.classList.remove(
            "active"
        );

        darkModeButton?.classList.remove(
            "active"
        );

    }


    /* =====================================================
       SOUND
       ===================================================== */

    if (settings.sound) {

        soundToggle?.classList.add(
            "active"
        );

        soundButton?.classList.add(
            "active"
        );

    } else {

        soundToggle?.classList.remove(
            "active"
        );

        soundButton?.classList.remove(
            "active"
        );

    }

    updateWallpaperSelection();

    updateWallpaperPreview();

}


/* =========================================================
   APPLY LOCAL THEME
   ========================================================= */

function applyLocalTheme() {

    if (settings.darkMode) {

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

}


/* =========================================================
   DARK MODE
   ========================================================= */

darkModeButton?.addEventListener(
    "click",
    () => {

        const newValue =
            !settings.darkMode;


        settings.darkMode =
            newValue;


        updateUI();

        applyLocalTheme();


        sendToOS({

            type: "settings-set",

            setting: "darkMode",

            value: newValue

        });

    }
);


/* =========================================================
   SOUND
   ========================================================= */

soundButton?.addEventListener(
    "click",
    () => {

        const newValue =
            !settings.sound;


        settings.sound =
            newValue;


        updateUI();


        sendToOS({

            type: "settings-set",

            setting: "sound",

            value: newValue

        });

    }
);

wallpaperUpload?.addEventListener(
    "change",
    async event => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {

            alert(
                "Please select an image."
            );

            return;
        }

        try {

            const dataURL =
                await compressImage(file);

            setWallpaper(dataURL);

        } catch (error) {

            console.error(
                "Failed to load wallpaper:",
                error
            );

            alert(
                "Failed to load the image."
            );

        }

        event.target.value = "";

    }
);

resetWallpaper?.addEventListener(
    "click",
    () => {

        settings.wallpaper = null;

        updateWallpaperSelection();

        updateWallpaperPreview();

        sendToOS({

            type: "settings-set",

            setting: "wallpaper",

            value: null

        });

    }
);

/* =========================================================
   INITIAL UI
   ========================================================= */

renderWallpapers();

updateUI();

applyLocalTheme();