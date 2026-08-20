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


/* =========================================================
   SETTINGS
   ========================================================= */

let settings = {

    darkMode: true,

    sound: true,

    internet: true

};


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

            updateUI();

        }

    }
);


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


/* =========================================================
   INITIAL UI
   ========================================================= */

updateUI();

applyLocalTheme();