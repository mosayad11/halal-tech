// ============================================================
// API
// ============================================================

const API =
    "https://api.aladhan.com/v1";


// ============================================================
// Prayer Configuration
// ============================================================

const PRAYERS = [

    {
        key: "Fajr",
        name: "الفجر",
        icon: "🌅"
    },

    {
        key: "Sunrise",
        name: "الشروق",
        icon: "☀️"
    },

    {
        key: "Dhuhr",
        name: "الظهر",
        icon: "🌞"
    },

    {
        key: "Asr",
        name: "العصر",
        icon: "🌤️"
    },

    {
        key: "Maghrib",
        name: "المغرب",
        icon: "🌇"
    },

    {
        key: "Isha",
        name: "العشاء",
        icon: "🌙"
    }

];


// ============================================================
// Elements
// ============================================================

const locationElement =
    document.getElementById("location");

const gregorianDate =
    document.getElementById("gregorianDate");

const hijriDate =
    document.getElementById("hijriDate");

const prayerContainer =
    document.getElementById("prayerContainer");

const nextPrayerName =
    document.getElementById("nextPrayerName");

const nextPrayerTime =
    document.getElementById("nextPrayerTime");

const countdown =
    document.getElementById("countdown");

const midnight =
    document.getElementById("midnight");

const firstThird =
    document.getElementById("firstThird");

const lastThird =
    document.getElementById("lastThird");

const refreshButton =
    document.getElementById("refreshButton");

const themeButton =
    document.getElementById("themeButton");

const settingsButton =
    document.getElementById("settingsButton");

const settingsModal =
    document.getElementById("settingsModal");

const closeSettings =
    document.getElementById("closeSettings");

const saveSettings =
    document.getElementById("saveSettings");

const locationButton =
    document.getElementById("locationButton");

const cityInput =
    document.getElementById("cityInput");

const countryInput =
    document.getElementById("countryInput");

const methodSelect =
    document.getElementById("methodSelect");

const schoolSelect =
    document.getElementById("schoolSelect");


// ============================================================
// State
// ============================================================

let prayerData =
    null;

let timings =
    null;

let countdownTimer =
    null;

let userLocation =
    null;


// ============================================================
// Settings
// ============================================================

const defaultSettings = {

    city: "Cairo",

    country: "Egypt",

    method: "5",

    school: "0"

};


let settings = {

    ...defaultSettings,

    ...loadSavedSettings()

};


function loadSavedSettings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "prayer-settings"
            )
        ) || {};

    } catch {

        return {};

    }

}


function saveSettingsToStorage() {

    localStorage.setItem(

        "prayer-settings",

        JSON.stringify(settings)

    );

}


// ============================================================
// Theme
// ============================================================

function loadTheme() {

    const theme =
        localStorage.getItem(
            "prayer-theme"
        ) || "dark";


    document.body.classList.toggle(
        "light",
        theme === "light"
    );


    themeButton.textContent =
        theme === "light"
            ? "🌙"
            : "☀️";

}


themeButton.addEventListener(
    "click",
    () => {

        const isLight =
            document.body.classList.toggle(
                "light"
            );


        localStorage.setItem(
            "prayer-theme",
            isLight
                ? "light"
                : "dark"
        );


        themeButton.textContent =
            isLight
                ? "🌙"
                : "☀️";

    }
);


// ============================================================
// Date
// ============================================================

function getApiDate(date = new Date()) {

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const year =
        date.getFullYear();


    return `${day}-${month}-${year}`;

}


// ============================================================
// Get Current Coordinates
// ============================================================

function getCurrentLocation() {

    return new Promise(
        (resolve, reject) => {

            if (
                !navigator.geolocation
            ) {

                reject(
                    new Error(
                        "Geolocation not supported"
                    )
                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    resolve({

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude

                    });

                },

                error => {

                    reject(error);

                },

                {

                    enableHighAccuracy: true,

                    timeout: 10000,

                    maximumAge: 300000

                }

            );

        }
    );

}


// ============================================================
// Load Prayer Times
// ============================================================

async function loadPrayerTimes(
    coordinates = null
) {

    showLoading();


    const date =
        getApiDate();


    let url;


    if (coordinates) {

        url =
            `${API}/timings/${date}` +
            `?latitude=${coordinates.latitude}` +
            `&longitude=${coordinates.longitude}` +
            `&method=${settings.method}` +
            `&school=${settings.school}`;

    } else {

        url =
            `${API}/timingsByCity/${date}` +
            `?city=${encodeURIComponent(settings.city)}` +
            `&country=${encodeURIComponent(settings.country)}` +
            `&method=${settings.method}` +
            `&school=${settings.school}`;

    }


    console.log(
        "Prayer API URL:",
        url
    );


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "API request failed"
            );

        }


        const result =
            await response.json();


        if (
            result.code !== 200 ||
            !result.data
        ) {

            throw new Error(
                "Invalid API response"
            );

        }


        prayerData =
            result.data;


        timings =
            result.data.timings;


        console.log(
            "Prayer API:",
            result
        );


        renderData();


    } catch (error) {

        console.error(
            error
        );


        prayerContainer.innerHTML = `

            <div class="loading">

                <p>
                    ❌ حدث خطأ أثناء تحميل المواقيت.
                </p>

                <p>
                    تأكد من اتصالك بالإنترنت.
                </p>

            </div>

        `;

    }

}


// ============================================================
// Render Data
// ============================================================

function renderData() {

    if (!prayerData || !timings) {
        return;
    }


    renderDates();

    renderLocation();

    renderPrayers();

    renderExtraTimes();

    startCountdown();

}


// ============================================================
// Dates
// ============================================================

function renderDates() {

    const date =
        prayerData.date;


    gregorianDate.textContent =
        date.readable || "--";


    const hijri =
        date.hijri;


    if (hijri) {

        const month =
            hijri.month?.ar ||
            hijri.month?.en ||
            "";


        hijriDate.textContent =
            `${hijri.day} ${month} ${hijri.year}`;

    }

}


// ============================================================
// Location
// ============================================================

function renderLocation() {

    const meta =
        prayerData.meta;


    if (
        userLocation
    ) {

        locationElement.textContent =
            "📍 موقعك الحالي";

        return;

    }


    locationElement.textContent =
        `📍 ${settings.city}, ${settings.country}`;

}


// ============================================================
// Prayer Cards
// ============================================================

function renderPrayers() {

    prayerContainer.innerHTML = "";


    PRAYERS.forEach(
        prayer => {

            const time =
                cleanTime(
                    timings[prayer.key]
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "prayer-card";


            card.dataset.prayer =
                prayer.key;


            card.innerHTML = `

                <div class="prayer-icon">
                    ${prayer.icon}
                </div>

                <div class="prayer-name">
                    ${prayer.name}
                </div>

                <strong
                    class="prayer-time"
                >
                    ${time}
                </strong>

            `;


            prayerContainer.appendChild(
                card
            );

        }
    );

}


// ============================================================
// Extra Times
// ============================================================

function renderExtraTimes() {

    midnight.textContent =
        cleanTime(
            timings.Midnight
        );


    firstThird.textContent =
        cleanTime(
            timings.Firstthird
        );


    lastThird.textContent =
        cleanTime(
            timings.Lastthird
        );

}


// ============================================================
// Clean API Time
// ============================================================

function cleanTime(time) {

    if (!time) {
        return "--";
    }

    // Remove timezone information
    time = time
        .replace(/\s*\(.+?\)/, "")
        .trim();

    const [hours, minutes] =
        time
            .split(":")
            .map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return "--";
    }

    const period =
        hours >= 12
            ? "م"
            : "ص";

    let hour =
        hours % 12;

    if (hour === 0) {
        hour = 12;
    }

    return `${hour}:${pad(minutes)} ${period}`;

}


// ============================================================
// Convert API Time to Date
// ============================================================

function timeToDate(
    time,
    date = new Date()
) {

    if (!time) {
        return null;
    }

    // Keep original 24-hour API time
    time =
        time
            .replace(/\s*\(.+?\)/, "")
            .trim();

    const [hours, minutes] =
        time
            .split(":")
            .map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return null;
    }

    const result =
        new Date(date);

    result.setHours(
        hours,
        minutes,
        0,
        0
    );

    return result;

}


// ============================================================
// Next Prayer
// ============================================================

function getNextPrayer() {

    if (!timings) {
        return null;
    }

    const now = new Date();

    for (const prayer of PRAYERS) {

        const rawTime =
            timings[prayer.key];

        if (!rawTime) {
            continue;
        }

        const clean =
            rawTime
                .replace(/\s*\(.+?\)/, "")
                .trim();

        const [hours, minutes] =
            clean.split(":").map(Number);

        const prayerDate =
            new Date();

        prayerDate.setHours(
            hours,
            minutes,
            0,
            0
        );

        console.log(
            prayer.name,
            clean,
            prayerDate,
            now
        );

        if (prayerDate > now) {

            return {
                prayer: {
                    ...prayer,
                    time: cleanTime(rawTime)
                },
                date: prayerDate
            };

        }

    }

    // كل صلوات اليوم خلصت
    const tomorrow =
        new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    const rawFajr =
        timings.Fajr
            .replace(/\s*\(.+?\)/, "")
            .trim();

    const [fajrHours, fajrMinutes] =
        rawFajr.split(":").map(Number);

    tomorrow.setHours(
        fajrHours,
        fajrMinutes,
        0,
        0
    );

    return {

        prayer: {
            ...PRAYERS[0],
            time: cleanTime(
                timings.Fajr
            )
        },

        date: tomorrow,

        tomorrow: true

    };

}


// ============================================================
// Countdown
// ============================================================

function startCountdown() {

    clearInterval(
        countdownTimer
    );


    updateCountdown();


    countdownTimer =
        setInterval(
            updateCountdown,
            1000
        );

}


function updateCountdown() {

    const next =
        getNextPrayer();


    if (!next) {
        return;
    }


    const now =
        new Date();


    let difference =
        next.date - now;


    if (difference < 0) {

        loadPrayerTimes(
            userLocation
        );

        return;

    }


    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    nextPrayerName.textContent =
        next.prayer.name;


    nextPrayerTime.textContent =
        next.prayer.time;


    countdown.textContent =
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;


    updateActivePrayer(
        next.prayer.key
    );

}


function pad(number) {

    return String(
        number
    ).padStart(
        2,
        "0"
    );

}


// ============================================================
// Active Prayer
// ============================================================

function updateActivePrayer(
    nextKey
) {

    document
        .querySelectorAll(
            ".prayer-card"
        )
        .forEach(
            card => {

                card.classList.remove(
                    "active"
                );


                card.querySelector(
                    ".current-badge"
                )?.remove();

            }
        );


    const card =
        document.querySelector(
            `.prayer-card[data-prayer="${nextKey}"]`
        );


    if (!card) {
        return;
    }


    card.classList.add(
        "active"
    );


    const badge =
        document.createElement(
            "span"
        );


    badge.className =
        "current-badge";


    badge.textContent =
        "القادمة";


    card.appendChild(
        badge
    );

}


// ============================================================
// Loading
// ============================================================

function showLoading() {

    prayerContainer.innerHTML = `

        <div class="loading">

            <div class="spinner"></div>

            <p>
                جاري تحميل المواقيت...
            </p>

        </div>

    `;

}


// ============================================================
// Settings Modal
// ============================================================

settingsButton.addEventListener(
    "click",
    () => {

        cityInput.value =
            settings.city;

        countryInput.value =
            settings.country;

        methodSelect.value =
            settings.method;

        schoolSelect.value =
            settings.school;


        settingsModal.classList.remove(
            "hidden"
        );

    }
);


closeSettings.addEventListener(
    "click",
    () => {

        settingsModal.classList.add(
            "hidden"
        );

    }
);


settingsModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            settingsModal
        ) {

            settingsModal.classList.add(
                "hidden"
            );

        }

    }
);


// ============================================================
// Save Settings
// ============================================================

saveSettings.addEventListener(
    "click",
    () => {

        const city =
            cityInput.value.trim();


        const country =
            countryInput.value.trim();


        if (!city || !country) {

            alert(
                "من فضلك أدخل المدينة والدولة."
            );

            return;

        }


        settings.city =
            city;

        settings.country =
            country;

        settings.method =
            methodSelect.value;

        settings.school =
            schoolSelect.value;


        userLocation =
            null;


        saveSettingsToStorage();


        settingsModal.classList.add(
            "hidden"
        );


        loadPrayerTimes();

    }
);


// ============================================================
// Use Device Location
// ============================================================

locationButton.addEventListener(
    "click",
    async () => {

        try {

            locationButton.textContent =
                "📍 جاري تحديد الموقع...";


            const coordinates =
                await getCurrentLocation();


            userLocation =
                coordinates;


            settings.city =
                "موقعك الحالي";


            locationElement.textContent =
                "📍 موقعك الحالي";


            settingsModal.classList.add(
                "hidden"
            );


            await loadPrayerTimes(
                coordinates
            );


        } catch (error) {

            console.error(
                error
            );


            alert(
                "لم نتمكن من تحديد موقعك. تأكد من السماح للموقع في المتصفح."
            );

        }


        locationButton.textContent =
            "📍 استخدام موقعي";

    }
);


// ============================================================
// Refresh
// ============================================================

refreshButton.addEventListener(
    "click",
    () => {

        loadPrayerTimes(
            userLocation
        );

    }
);


// ============================================================
// Midnight Auto Refresh
// ============================================================

function scheduleMidnightRefresh() {

    const now =
        new Date();


    const tomorrow =
        new Date(now);


    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    tomorrow.setHours(
        0,
        1,
        0,
        0
    );


    const delay =
        tomorrow - now;


    setTimeout(
        () => {

            loadPrayerTimes(
                userLocation
            );


            scheduleMidnightRefresh();

        },
        delay
    );

}


// ============================================================
// Initialize
// ============================================================

async function init() {

    loadTheme();

    saveSettingsToStorage();


    try {

        /*
            Try device location first.
            If denied, use saved/default city.
        */

        const coordinates =
            await getCurrentLocation();


        userLocation =
            coordinates;


        await loadPrayerTimes(
            coordinates
        );


    } catch {

        userLocation =
            null;


        await loadPrayerTimes();

    }


    scheduleMidnightRefresh();

}


// ============================================================
// Start
// ============================================================

init();