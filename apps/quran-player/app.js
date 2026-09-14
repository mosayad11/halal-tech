/* =========================================================
   MOSAYAD QURAN PLAYER
========================================================= */


/* =========================================================
   API
========================================================= */

const API = "https://api.alquran.cloud/v1";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE = {

    reciter: "quran-player-reciter",

    surah: "quran-player-surah",

    theme: "quran-player-theme",

    autoNext: "quran-player-auto-next"

};


/* =========================================================
   STATE
========================================================= */

const state = {

    surahs: [],

    reciters: [],

    ayahs: [],

    currentSurahIndex: 0,

    currentAyahIndex: 0,

    repeatSurah: false,

    autoNextSurah: false,

    loading: false,

    selectedSurah: null,

    selectedReciter: null

};


/* =========================================================
   ELEMENTS
========================================================= */

const elements = {

    themeBtn:
        document.getElementById("themeBtn"),

    reciterSearch:
        document.getElementById("reciterSearch"),

    reciterArrow:
        document.getElementById("reciterArrow"),

    reciterResults:
        document.getElementById("reciterResults"),

    surahSearch:
        document.getElementById("surahSearch"),

    surahArrow:
        document.getElementById("surahArrow"),

    surahResults:
        document.getElementById("surahResults"),

    openSurahBtn:
        document.getElementById("openSurahBtn"),

    currentSurah:
        document.getElementById("currentSurah"),

    currentReciter:
        document.getElementById("currentReciter"),

    currentAyah:
        document.getElementById("currentAyah"),

    audio:
        document.getElementById("audio"),

    progress:
        document.getElementById("progress"),

    currentTime:
        document.getElementById("currentTime"),

    duration:
        document.getElementById("duration"),

    previousBtn:
        document.getElementById("previousBtn"),

    playBtn:
        document.getElementById("playBtn"),

    nextBtn:
        document.getElementById("nextBtn"),

    autoNextBtn:
        document.getElementById("autoNextBtn"),

    repeatSurahBtn:
        document.getElementById("repeatSurahBtn"),

    muteBtn:
        document.getElementById("muteBtn"),

    volume:
        document.getElementById("volume"),

    sectionSurahName:
        document.getElementById("sectionSurahName"),

    ayahCount:
        document.getElementById("ayahCount"),

    ayahList:
        document.getElementById("ayahList"),

    toast:
        document.getElementById("toast")

};


/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", init);


async function init() {

    loadTheme();

    setupEvents();

    restoreSelections();

    await Promise.all([
        loadSurahs(),
        loadReciters()
    ]);

    restoreSelections();

    if (state.selectedSurah) {

        elements.surahSearch.value =
            `${state.selectedSurah.number}. ${state.selectedSurah.name}`;

    }

    if (state.selectedReciter) {

        elements.reciterSearch.value =
            state.selectedReciter.name;

    }

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    /* =========================
       THEME
    ========================== */

    elements.themeBtn.addEventListener(
        "click",
        toggleTheme
    );


    /* =========================
       SURAH SEARCH
    ========================== */

    elements.surahSearch.addEventListener(
        "input",
        handleSurahSearch
    );

    elements.surahSearch.addEventListener(
        "focus",
        openSurahResults
    );

    elements.surahArrow.addEventListener(
        "click",
        toggleSurahResults
    );


    /* =========================
       RECITER SEARCH
    ========================== */

    elements.reciterSearch.addEventListener(
        "input",
        handleReciterSearch
    );

    elements.reciterSearch.addEventListener(
        "focus",
        openReciterResults
    );

    elements.reciterArrow.addEventListener(
        "click",
        toggleReciterResults
    );


    /* =========================
       OPEN SURAH
    ========================== */

    elements.openSurahBtn.addEventListener(
        "click",
        () => loadSurah(false)
    );


    /* =========================
       PLAYER
    ========================== */

    elements.playBtn.addEventListener(
        "click",
        togglePlay
    );

    elements.previousBtn.addEventListener(
        "click",
        previousSurah
    );

    elements.nextBtn.addEventListener(
        "click",
        nextSurah
    );


    /* =========================
       AUTO NEXT
    ========================== */

    elements.autoNextBtn.addEventListener(
        "click",
        toggleAutoNext
    );


    /* =========================
       REPEAT SURAH
    ========================== */

    elements.repeatSurahBtn.addEventListener(
        "click",
        () => {

            state.repeatSurah =
                !state.repeatSurah;

            updateRepeatButton();

        }
    );


    /* =========================
       MUTE
    ========================== */

    elements.muteBtn.addEventListener(
        "click",
        toggleMute
    );


    /* =========================
       VOLUME
    ========================== */

    elements.volume.addEventListener(
        "input",
        () => {

            elements.audio.volume =
                Number(elements.volume.value);

            if (elements.audio.volume > 0) {
                elements.audio.muted = false;
            }

            updateMuteButton();

        }
    );


    /* =========================
       PROGRESS
    ========================== */

    elements.progress.addEventListener(
        "input",
        () => {

            if (!Number.isFinite(elements.audio.duration)) {
                return;
            }

            elements.audio.currentTime =
                (
                    Number(elements.progress.value) / 100
                ) *
                elements.audio.duration;

        }
    );


    /* =========================
       AUDIO EVENTS
    ========================== */

    elements.audio.addEventListener(
        "timeupdate",
        updateProgress
    );

    elements.audio.addEventListener(
        "loadedmetadata",
        updateDuration
    );

    elements.audio.addEventListener(
        "play",
        () => {
            elements.playBtn.textContent = "⏸";
        }
    );

    elements.audio.addEventListener(
        "pause",
        () => {
            elements.playBtn.textContent = "▶";
        }
    );

    elements.audio.addEventListener(
        "ended",
        handleEnded
    );

    elements.audio.addEventListener(
        "error",
        handleAudioError
    );


    /* =========================
       OUTSIDE CLICK
    ========================== */

    document.addEventListener(
        "click",
        handleOutsideClick
    );

}


/* =========================================================
   LOAD SURAHS
========================================================= */

async function loadSurahs() {

    try {

        const response =
            await fetch(`${API}/surah`);

        if (!response.ok) {
            throw new Error("Failed to load surahs");
        }

        const json =
            await response.json();

        state.surahs =
            json.data || [];

        restoreSurahSelection();

    } catch (error) {

        console.error(
            "Failed to load surahs:",
            error
        );

        showToast(
            "حدث خطأ أثناء تحميل السور."
        );

    }

}


/* =========================================================
   LOAD RECITERS
========================================================= */

async function loadReciters() {

    try {

        const response =
            await fetch(
                `${API}/edition/format/audio`
            );

        if (!response.ok) {
            throw new Error("Failed to load reciters");
        }

        const json =
            await response.json();

        const editions =
            json.data || [];


        /*
         * Arabic audio editions only.
         */

        const arabicEditions =
            editions.filter(
                edition =>
                    edition.language === "ar"
            );


        /*
         * Remove duplicate identifiers.
         */

        const unique =
            new Map();

        arabicEditions.forEach(
            edition => {

                if (
                    edition.identifier &&
                    !unique.has(
                        edition.identifier
                    )
                ) {

                    unique.set(
                        edition.identifier,
                        edition
                    );

                }

            }
        );


        state.reciters =
            Array.from(unique.values());


        /*
         * Put Alafasy first.
         */

        state.reciters.sort(
            (a, b) => {

                if (
                    a.identifier === "ar.alafasy"
                ) {
                    return -1;
                }

                if (
                    b.identifier === "ar.alafasy"
                ) {
                    return 1;
                }

                return (
                    String(a.name || "")
                        .localeCompare(
                            String(b.name || ""),
                            "ar"
                        )
                );

            }
        );


        restoreReciterSelection();

    } catch (error) {

        console.error(
            "Failed to load reciters:",
            error
        );

        showToast(
            "حدث خطأ أثناء تحميل القراء."
        );

    }

}


/* =========================================================
   SEARCH NORMALIZATION
========================================================= */

function normalizeSearch(value) {

    return String(value || "")
        .toLowerCase()
        .trim()

        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[إأآا]/g,
            "ا"
        )

        .replace(
            /ى/g,
            "ي"
        )

        .replace(
            /ة/g,
            "ه"
        );

}


/* =========================================================
   SURAH SEARCH
========================================================= */

function filterSurahs(search) {

    const query =
        normalizeSearch(search);

    if (!query) {
        return state.surahs;
    }

    return state.surahs.filter(
        surah => {

            const values = [

                surah.number,

                surah.name,

                surah.englishName,

                surah.englishNameTranslation

            ];

            return values.some(
                value =>
                    normalizeSearch(value)
                        .includes(query)
            );

        }
    );

}


function handleSurahSearch() {

    const results =
        filterSurahs(
            elements.surahSearch.value
        );

    renderSurahResults(results);

    elements.surahResults.classList.add(
        "open"
    );

}


function renderSurahResults(results) {

    if (!results.length) {

        elements.surahResults.innerHTML = `
            <div class="search-empty">
                لا توجد سورة بهذا الاسم
            </div>
        `;

        return;
    }


    elements.surahResults.innerHTML =
        results.map(
            surah => `

                <button
                    type="button"
                    class="search-result"
                    data-surah-number="${surah.number}"
                >

                    <span class="search-result-name">
                        ${escapeHTML(
                            `${surah.number}. ${surah.name}`
                        )}
                    </span>

                    <span class="search-result-meta">
                        ${escapeHTML(
                            surah.englishName || ""
                        )}
                    </span>

                </button>

            `
        ).join("");


    elements.surahResults
        .querySelectorAll(
            "[data-surah-number]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const number =
                        Number(
                            button.dataset.surahNumber
                        );

                    const surah =
                        state.surahs.find(
                            item =>
                                item.number === number
                        );

                    if (surah) {
                        selectSurah(surah);
                    }

                }
            );

        });

}


function selectSurah(surah) {

    state.selectedSurah =
        surah;


    state.currentSurahIndex =
        Math.max(
            0,
            state.surahs.findIndex(
                item =>
                    item.number === surah.number
            )
        );


    elements.surahSearch.value =
        `${surah.number}. ${surah.name}`;


    localStorage.setItem(
        STORAGE.surah,
        String(surah.number)
    );


    closeSurahResults();

}


/* =========================================================
   SURAH DROPDOWN
========================================================= */

function openSurahResults() {

    renderSurahResults(
        filterSurahs(
            elements.surahSearch.value
        )
    );

    elements.surahResults.classList.add(
        "open"
    );

}


function closeSurahResults() {

    elements.surahResults.classList.remove(
        "open"
    );

}


function toggleSurahResults(event) {

    event.stopPropagation();

    if (
        elements.surahResults.classList.contains(
            "open"
        )
    ) {

        closeSurahResults();

    } else {

        openSurahResults();

        elements.surahSearch.focus();

    }

}


/* =========================================================
   RECITER SEARCH
========================================================= */

function filterReciters(search) {

    const query =
        normalizeSearch(search);

    if (!query) {
        return state.reciters;
    }


    return state.reciters.filter(
        reciter => {

            const values = [

                reciter.name,

                reciter.englishName,

                reciter.englishNameTranslation,

                reciter.identifier

            ];

            return values.some(
                value =>
                    normalizeSearch(value)
                        .includes(query)
            );

        }
    );

}


function handleReciterSearch() {

    const results =
        filterReciters(
            elements.reciterSearch.value
        );

    renderReciterResults(results);

    elements.reciterResults.classList.add(
        "open"
    );

}


function renderReciterResults(results) {

    if (!results.length) {

        elements.reciterResults.innerHTML = `
            <div class="search-empty">
                لا يوجد قارئ بهذا الاسم
            </div>
        `;

        return;
    }


    elements.reciterResults.innerHTML =
        results.map(
            reciter => `

                <button
                    type="button"
                    class="search-result"
                    data-reciter-id="${escapeHTML(
                        reciter.identifier
                    )}"
                >

                    <span class="search-result-name">
                        ${escapeHTML(
                            reciter.name ||
                            reciter.englishName ||
                            reciter.identifier
                        )}
                    </span>

                    <span class="search-result-meta">
                        ${escapeHTML(
                            reciter.englishName || ""
                        )}
                    </span>

                </button>

            `
        ).join("");


    elements.reciterResults
        .querySelectorAll(
            "[data-reciter-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const identifier =
                        button.dataset.reciterId;

                    const reciter =
                        state.reciters.find(
                            item =>
                                item.identifier ===
                                identifier
                        );

                    if (reciter) {
                        selectReciter(reciter);
                    }

                }
            );

        });

}


function selectReciter(reciter) {

    state.selectedReciter =
        reciter;


    elements.reciterSearch.value =
        reciter.name ||
        reciter.englishName ||
        reciter.identifier;


    localStorage.setItem(
        STORAGE.reciter,
        reciter.identifier
    );


    closeReciterResults();

}


function openReciterResults() {

    renderReciterResults(
        filterReciters(
            elements.reciterSearch.value
        )
    );

    elements.reciterResults.classList.add(
        "open"
    );

}


function closeReciterResults() {

    elements.reciterResults.classList.remove(
        "open"
    );

}


function toggleReciterResults(event) {

    event.stopPropagation();

    if (
        elements.reciterResults.classList.contains(
            "open"
        )
    ) {

        closeReciterResults();

    } else {

        openReciterResults();

        elements.reciterSearch.focus();

    }

}


/* =========================================================
   OUTSIDE CLICK
========================================================= */

function handleOutsideClick(event) {

    if (
        !event.target.closest(".search-select")
    ) {

        closeSurahResults();

        closeReciterResults();

    }

}


/* =========================================================
   RESTORE SELECTIONS
========================================================= */

function restoreSelections() {

    state.autoNextSurah =
        localStorage.getItem(
            STORAGE.autoNext
        ) === "1";


    updateAutoNextButton();


    restoreSurahSelection();

    restoreReciterSelection();

}


function restoreSurahSelection() {

    if (!state.surahs.length) {
        return;
    }


    const saved =
        Number(
            localStorage.getItem(
                STORAGE.surah
            )
        );


    let surah;


    if (saved) {

        surah =
            state.surahs.find(
                item =>
                    item.number === saved
            );

    }


    if (!surah) {
        surah = state.surahs[0];
    }


    if (surah) {
        selectSurah(surah);
    }

}


function restoreReciterSelection() {

    if (!state.reciters.length) {
        return;
    }


    const saved =
        localStorage.getItem(
            STORAGE.reciter
        );


    let reciter;


    if (saved) {

        reciter =
            state.reciters.find(
                item =>
                    item.identifier === saved
            );

    }


    if (!reciter) {

        reciter =
            state.reciters.find(
                item =>
                    item.identifier ===
                    "ar.alafasy"
            );

    }


    if (!reciter) {
        reciter = state.reciters[0];
    }


    if (reciter) {
        selectReciter(reciter);
    }

}


/* =========================================================
   GET SELECTED VALUES
========================================================= */

function getSelectedSurah() {

    return state.selectedSurah;

}


function getSelectedReciter() {

    return state.selectedReciter;

}


/* =========================================================
   LOAD SURAH
========================================================= */

async function loadSurah(autoPlay = false) {

    if (state.loading) {
        return;
    }


    const selectedSurah =
        getSelectedSurah();

    const selectedReciter =
        getSelectedReciter();


    if (!selectedSurah) {

        showToast(
            "اختر سورة أولاً."
        );

        return;

    }


    if (!selectedReciter) {

        showToast(
            "اختر قارئًا أولاً."
        );

        return;

    }


    state.loading = true;


    elements.openSurahBtn.disabled =
        true;


    elements.openSurahBtn.textContent =
        "جاري التحميل...";


    try {

        const surahNumber =
            selectedSurah.number;

        const reciter =
            selectedReciter.identifier;


        /*
         * Quran text
         */

        const textResponse =
            await fetch(
                `${API}/surah/${surahNumber}/quran-uthmani`
            );


        if (!textResponse.ok) {
            throw new Error(
                "Failed to load Quran text"
            );
        }


        const textJson =
            await textResponse.json();


        /*
         * Audio edition
         */

        const audioResponse =
            await fetch(
                `${API}/surah/${surahNumber}/${encodeURIComponent(reciter)}`
            );


        if (!audioResponse.ok) {
            throw new Error(
                "Failed to load Quran audio"
            );
        }


        const audioJson =
            await audioResponse.json();


        const textAyahs =
            textJson.data?.ayahs || [];


        const audioAyahs =
            audioJson.data?.ayahs || [];


        /*
         * Combine text + audio
         */

        state.ayahs =
            textAyahs.map(
                (ayah, index) => {

                    const audioAyah =
                        audioAyahs[index];

                    return {

                        number:
                            ayah.numberInSurah,

                        globalNumber:
                            ayah.number,

                        text:
                            ayah.text,

                        audio:
                            audioAyah?.audio || null

                    };

                }
            );


        state.currentAyahIndex = 0;


        state.currentSurahIndex =
            state.surahs.findIndex(
                item =>
                    item.number ===
                    selectedSurah.number
            );


        /*
         * Update UI
         */

        elements.currentSurah.textContent =
            selectedSurah.name;


        elements.currentReciter.textContent =
            selectedReciter.name ||
            selectedReciter.englishName ||
            selectedReciter.identifier;


        elements.sectionSurahName.textContent =
            selectedSurah.name;


        elements.ayahCount.textContent =
            state.ayahs.length;


        renderAyahs();


        if (state.ayahs.length) {

            setCurrentAyah(
                0,
                autoPlay
            );

        }


        showToast(
            `تم تحميل سورة ${selectedSurah.name}`
        );


    } catch (error) {

        console.error(
            "Failed to load surah:",
            error
        );

        showToast(
            "حدث خطأ أثناء تحميل السورة."
        );

    } finally {

        state.loading = false;

        elements.openSurahBtn.disabled =
            false;

        elements.openSurahBtn.textContent =
            "فتح السورة";

    }

}


/* =========================================================
   RENDER AYAHS
========================================================= */

function renderAyahs() {

    if (!state.ayahs.length) {

        elements.ayahList.innerHTML = "";

        return;

    }


    elements.ayahList.innerHTML =
        state.ayahs.map(
            (ayah, index) => `

                <span
                    class="ayah"
                    data-ayah-index="${index}"
                >
                    ${escapeHTML(ayah.text)}

                    <span class="ayah-number">
                        ${ayah.number}
                    </span>

                </span>

            `
        ).join(" ");


    elements.ayahList
        .querySelectorAll(".ayah")
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                element.dataset.ayahIndex
                            );

                        /*
                         * Clicking an ayah immediately
                         * starts playing that ayah.
                         */

                        setCurrentAyah(
                            index,
                            true
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SET CURRENT AYAH
========================================================= */

function setCurrentAyah(
    index,
    autoPlay = false
) {

    if (
        index < 0 ||
        index >= state.ayahs.length
    ) {
        return;
    }


    state.currentAyahIndex =
        index;


    const ayah =
        state.ayahs[index];


    elements.currentAyah.textContent =
        ayah.number;


    /*
     * Highlight current ayah.
     */

    elements.ayahList
        .querySelectorAll(".ayah")
        .forEach(
            (element, elementIndex) => {

                element.classList.toggle(
                    "playing",
                    elementIndex === index
                );

            }
        );


    if (autoPlay) {
        playCurrentAyah();
    }

}


/* =========================================================
   PLAY CURRENT AYAH
========================================================= */

function playCurrentAyah() {

    const ayah =
        state.ayahs[
            state.currentAyahIndex
        ];


    if (!ayah || !ayah.audio) {

        showToast(
            "الصوت غير متوفر لهذه الآية."
        );

        return;

    }


    elements.audio.src =
        ayah.audio;


    elements.audio.currentTime = 0;


    elements.audio.play()
        .catch(
            error => {

                console.error(
                    "Play error:",
                    error
                );

            }
        );

}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (!state.ayahs.length) {

        showToast(
            "افتح سورة أولاً."
        );

        return;

    }


    if (elements.audio.paused) {

        /*
         * If there is no audio source,
         * load current ayah first.
         */

        if (!elements.audio.src) {

            playCurrentAyah();

        } else {

            elements.audio.play()
                .catch(
                    error => {

                        console.error(
                            "Play error:",
                            error
                        );

                    }
                );

        }

    } else {

        elements.audio.pause();

    }

}


/* =========================================================
   AUDIO ENDED
========================================================= */

function handleEnded() {

    /*
     * Repeat current surah first.
     */

    if (state.repeatSurah) {

        state.currentAyahIndex = 0;

        setCurrentAyah(
            0,
            true
        );

        return;

    }


    /*
     * Move to next ayah.
     */

    const nextAyahIndex =
        state.currentAyahIndex + 1;


    if (
        nextAyahIndex <
        state.ayahs.length
    ) {

        setCurrentAyah(
            nextAyahIndex,
            true
        );

        return;

    }


    /*
     * Current surah finished.
     */

    if (state.autoNextSurah) {

        nextSurah();

        return;

    }


    /*
     * Stop when auto-next is disabled.
     */

    elements.playBtn.textContent =
        "▶";

    elements.audio.removeAttribute(
        "src"
    );

    elements.audio.load();

    showToast(
        "انتهت السورة."
    );

}


/* =========================================================
   PREVIOUS SURAH
========================================================= */

async function previousSurah() {

    if (!state.surahs.length) {
        return;
    }


    const previousIndex =
        state.currentSurahIndex - 1;


    if (previousIndex < 0) {

        showToast(
            "أنت عند أول سورة."
        );

        return;

    }


    const surah =
        state.surahs[
            previousIndex
        ];


    selectSurah(surah);

    await loadSurah(true);

}


/* =========================================================
   NEXT SURAH
========================================================= */

async function nextSurah() {

    if (!state.surahs.length) {
        return;
    }


    const nextIndex =
        state.currentSurahIndex + 1;


    if (
        nextIndex >=
        state.surahs.length
    ) {

        elements.playBtn.textContent =
            "▶";

        showToast(
            "أنت عند آخر سورة."
        );

        return;

    }


    const surah =
        state.surahs[
            nextIndex
        ];


    selectSurah(surah);

    await loadSurah(true);

}


/* =========================================================
   AUTO NEXT
========================================================= */

function toggleAutoNext() {

    state.autoNextSurah =
        !state.autoNextSurah;


    localStorage.setItem(
        STORAGE.autoNext,
        state.autoNextSurah
            ? "1"
            : "0"
    );


    updateAutoNextButton();

}


function updateAutoNextButton() {

    elements.autoNextBtn.classList.toggle(
        "active",
        state.autoNextSurah
    );


    const span =
        elements.autoNextBtn.querySelector(
            "span"
        );


    if (span) {

        span.textContent =
            state.autoNextSurah
                ? "التالي تلقائيًا: تشغيل"
                : "التالي تلقائيًا: إيقاف";

    }

}


/* =========================================================
   REPEAT SURAH
========================================================= */

function updateRepeatButton() {

    elements.repeatSurahBtn.classList.toggle(
        "active",
        state.repeatSurah
    );


    const span =
        elements.repeatSurahBtn.querySelector(
            "span"
        );


    if (span) {

        span.textContent =
            state.repeatSurah
                ? "تكرار السورة: تشغيل"
                : "تكرار السورة: إيقاف";

    }

}


/* =========================================================
   MUTE
========================================================= */

function toggleMute() {

    elements.audio.muted =
        !elements.audio.muted;


    updateMuteButton();

}


function updateMuteButton() {

    const span =
        elements.muteBtn.querySelector(
            "span"
        );


    if (elements.audio.muted) {

        elements.muteBtn.classList.add(
            "active"
        );

        elements.muteBtn.firstChild.textContent =
            "🔇";

        if (span) {
            span.textContent =
                "إلغاء الكتم";
        }

    } else {

        elements.muteBtn.classList.remove(
            "active"
        );

        elements.muteBtn.firstChild.textContent =
            "🔊";

        if (span) {
            span.textContent =
                "كتم الصوت";
        }

    }

}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress() {

    const duration =
        elements.audio.duration;


    const currentTime =
        elements.audio.currentTime;


    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {

        elements.progress.value = 0;

        return;

    }


    elements.progress.value =
        (currentTime / duration) * 100;


    elements.currentTime.textContent =
        formatTime(currentTime);

}


function updateDuration() {

    if (
        Number.isFinite(
            elements.audio.duration
        )
    ) {

        elements.duration.textContent =
            formatTime(
                elements.audio.duration
            );

    }

}


/* =========================================================
   TIME FORMAT
========================================================= */

function formatTime(seconds) {

    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {

        return "00:00";

    }


    const minutes =
        Math.floor(seconds / 60);


    const remainingSeconds =
        Math.floor(seconds % 60);


    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;

}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            STORAGE.theme
        );


    if (saved === "dark") {

        document.body.classList.add(
            "dark"
        );

        elements.themeBtn.textContent =
            "☀️";

    } else {

        document.body.classList.remove(
            "dark"
        );

        elements.themeBtn.textContent =
            "🌙";

    }

}


function toggleTheme() {

    const isDark =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        STORAGE.theme,
        isDark
            ? "dark"
            : "light"
    );


    elements.themeBtn.textContent =
        isDark
            ? "☀️"
            : "🌙";

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    elements.toast.textContent =
        message;


    elements.toast.classList.add(
        "show"
    );


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                elements.toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   AUDIO ERROR
========================================================= */

function handleAudioError(event) {

    console.error(
        "Audio error:",
        event
    );


    showToast(
        "حدث خطأ أثناء تشغيل الصوت."
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}