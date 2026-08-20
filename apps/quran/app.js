// ============================================================
// Quran App
// Data source: Al Quran Cloud API
// ============================================================

const API = "https://api.alquran.cloud/v1";


// ============================================================
// Elements
// ============================================================

const surahsPage = document.getElementById("surahsPage");
const readerPage = document.getElementById("readerPage");
const searchPage = document.getElementById("searchPage");

const surahsContainer = document.getElementById("surahsContainer");
const ayahsContainer = document.getElementById("ayahsContainer");

const surahSearch = document.getElementById("surahSearch");

const readerName = document.getElementById("readerName");
const readerNumber = document.getElementById("readerNumber");
const readerInfo = document.getElementById("readerInfo");

const backButton = document.getElementById("backButton");
const themeButton = document.getElementById("themeButton");

const continueCard = document.getElementById("continueCard");
const continueSurah = document.getElementById("continueSurah");
const continueAyah = document.getElementById("continueAyah");
const continueButton = document.getElementById("continueButton");

const fontIncrease = document.getElementById("fontIncrease");
const fontDecrease = document.getElementById("fontDecrease");
const fontSizeValue = document.getElementById("fontSizeValue");

const globalSearchButton =
    document.getElementById("globalSearchButton");

const searchOverlay =
    document.getElementById("searchOverlay");

const closeSearch =
    document.getElementById("closeSearch");

const ayahSearch =
    document.getElementById("ayahSearch");

const searchButton =
    document.getElementById("searchButton");

const searchResults =
    document.getElementById("searchResults");

const searchQuery =
    document.getElementById("searchQuery");

const toast =
    document.getElementById("toast");


// ============================================================
// State
// ============================================================

let surahs = [];

let currentSurah = null;

let fontSize =
    Number(localStorage.getItem("quranFontSize")) || 30;


// ============================================================
// Initialize
// ============================================================

document.documentElement.style.setProperty(
    "--font-size",
    `${fontSize}px`
);

fontSizeValue.textContent = fontSize;

loadTheme();
loadSurahs();
loadContinueReading();


// ============================================================
// Load Surahs
// ============================================================

async function loadSurahs() {

    try {

        showLoading(
            surahsContainer,
            "جاري تحميل سور القرآن..."
        );

        const response =
            await fetch(`${API}/surah`);

        if (!response.ok) {
            throw new Error("API Error");
        }

        const result =
            await response.json();

        surahs = result.data;

        renderSurahs(surahs);

    } catch (error) {

        console.error(error);

        showError(
            surahsContainer,
            "تعذر تحميل السور. تأكد من اتصالك بالإنترنت."
        );
    }
}


// ============================================================
// Render Surahs
// ============================================================

function renderSurahs(list) {

    if (!list.length) {

        surahsContainer.innerHTML = `
            <div class="loading">
                <p>لا توجد نتائج.</p>
            </div>
        `;

        return;
    }


    surahsContainer.innerHTML =
        list.map(surah => {

            const type =
                surah.revelationType === "Meccan"
                    ? "مكية"
                    : "مدنية";


            return `
                <article
                    class="surah-card"
                    data-id="${surah.number}"
                >

                    <div class="surah-number">
                        ${surah.number}
                    </div>

                    <div class="surah-content">

                        <div class="surah-name">
                            ${surah.name}
                        </div>

                        <div class="surah-english">
                            ${surah.englishName}
                        </div>

                        <div class="surah-meta">
                            ${type} • ${surah.numberOfAyahs} آية
                        </div>

                    </div>

                </article>
            `;

        }).join("");


    document
        .querySelectorAll(".surah-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                const id =
                    Number(card.dataset.id);

                openSurah(id);
            });

        });
}


// ============================================================
// Surah Search
// ============================================================

surahSearch.addEventListener(
    "input",
    () => {

        const query =
            normalizeArabic(
                surahSearch.value.trim()
            );

        if (!query) {

            renderSurahs(surahs);

            return;
        }


        const filtered =
            surahs.filter(surah => {

                const arabicName =
                    normalizeArabic(surah.name);

                const englishName =
                    normalizeArabic(surah.englishName);

                return (
                    arabicName.includes(query) ||
                    englishName.includes(query) ||
                    String(surah.number).includes(query)
                );

            });


        renderSurahs(filtered);

    }
);


// ============================================================
// Open Surah
// ============================================================

async function openSurah(id, ayahToScroll = null) {

    currentSurah = id;

    showPage("reader");

    showLoading(
        ayahsContainer,
        "جاري تحميل السورة..."
    );


    try {

        const response =
            await fetch(`${API}/surah/${id}`);

        if (!response.ok) {
            throw new Error("API Error");
        }

        const result =
            await response.json();

        const surah =
            result.data;


        readerName.textContent =
            surah.name;

        readerNumber.textContent =
            surah.number;

        const type =
            surah.revelationType === "Meccan"
                ? "مكية"
                : "مدنية";

        readerInfo.textContent =
            `${type} • ${surah.numberOfAyahs} آية`;


        renderAyahs(surah.ayahs);


        saveReadingPosition(
            surah.number,
            1,
            surah.name
        );


        if (ayahToScroll) {

            setTimeout(() => {

                const element =
                    document.getElementById(
                        `ayah-${ayahToScroll}`
                    );

                if (element) {

                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

            }, 200);

        }

    } catch (error) {

        console.error(error);

        showError(
            ayahsContainer,
            "تعذر تحميل السورة. تأكد من اتصالك بالإنترنت."
        );
    }
}


// ============================================================
// Render Ayahs
// ============================================================

function renderAyahs(ayahs) {

    const bismillah =
        document.getElementById("bismillah");


    // Bismillah
    if (currentSurah === 9) {

        bismillah.style.display = "none";

    } else {

        bismillah.style.display = "block";
    }


    // Quran-like continuous text
    ayahsContainer.innerHTML = `
        <div class="quran-text">
            ${ayahs.map(ayah => {

                return `
                    <span
                        class="ayah"
                        id="ayah-${ayah.numberInSurah}"
                        data-ayah="${ayah.numberInSurah}"
                    >
                        ${ayah.text}
                        <span class="ayah-number">
                            ${ayah.numberInSurah}
                        </span>
                    </span>
                `;

            }).join(" ")}
        </div>
    `;


    // Save reading position when user clicks an ayah
    document
        .querySelectorAll(".ayah")
        .forEach(ayah => {

            ayah.addEventListener(
                "click",
                () => {

                    const number =
                        Number(
                            ayah.dataset.ayah
                        );


                    saveReadingPosition(
                        currentSurah,
                        number,
                        readerName.textContent
                    );


                    showToast(
                        `تم حفظ الآية ${number} كآخر موضع قراءة`
                    );

                }
            );

        });
}


// ============================================================
// Reading Position
// ============================================================

function saveReadingPosition(
    surahNumber,
    ayahNumber,
    surahName
) {

    const data = {

        surahNumber,
        ayahNumber,
        surahName

    };

    localStorage.setItem(
        "quranLastReading",
        JSON.stringify(data)
    );


    loadContinueReading();
}


function loadContinueReading() {

    const saved =
        localStorage.getItem(
            "quranLastReading"
        );


    if (!saved) {

        continueCard.classList.add(
            "hidden"
        );

        return;
    }


    try {

        const data =
            JSON.parse(saved);


        continueSurah.textContent =
            data.surahName;

        continueAyah.textContent =
            `الآية ${data.ayahNumber}`;


        continueButton.onclick =
            () => {

                openSurah(
                    data.surahNumber,
                    data.ayahNumber
                );

            };


        continueCard.classList.remove(
            "hidden"
        );

    } catch {

        continueCard.classList.add(
            "hidden"
        );
    }
}


// ============================================================
// Font Size
// ============================================================

fontIncrease.addEventListener(
    "click",
    () => {

        if (fontSize >= 50) {
            return;
        }

        fontSize += 2;

        updateFontSize();

    }
);


fontDecrease.addEventListener(
    "click",
    () => {

        if (fontSize <= 20) {
            return;
        }

        fontSize -= 2;

        updateFontSize();

    }
);


function updateFontSize() {

    document.documentElement.style.setProperty(
        "--font-size",
        `${fontSize}px`
    );

    fontSizeValue.textContent =
        fontSize;

    localStorage.setItem(
        "quranFontSize",
        fontSize
    );
}


// ============================================================
// Theme
// ============================================================

themeButton.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const dark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "quranTheme",
        dark ? "dark" : "light"
    );


    themeButton.textContent =
        dark ? "☀️" : "🌙";
}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "quranTheme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        themeButton.textContent =
            "☀️";

    } else {

        themeButton.textContent =
            "🌙";
    }
}


// ============================================================
// Navigation
// ============================================================

function showPage(page) {

    surahsPage.classList.add(
        "hidden"
    );

    readerPage.classList.add(
        "hidden"
    );

    searchPage.classList.add(
        "hidden"
    );


    if (page === "surahs") {

        surahsPage.classList.remove(
            "hidden"
        );

        backButton.classList.add(
            "hidden"
        );

    }


    if (page === "reader") {

        readerPage.classList.remove(
            "hidden"
        );

        backButton.classList.remove(
            "hidden"
        );

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

    }


    if (page === "search") {

        searchPage.classList.remove(
            "hidden"
        );

        backButton.classList.remove(
            "hidden"
        );

    }
}


backButton.addEventListener(
    "click",
    () => {

        showPage("surahs");

        currentSurah = null;

    }
);


// ============================================================
// Global Search
// ============================================================

globalSearchButton.addEventListener(
    "click",
    () => {

        searchOverlay.classList.remove(
            "hidden"
        );

        setTimeout(
            () => ayahSearch.focus(),
            100
        );

    }
);


closeSearch.addEventListener(
    "click",
    closeSearchModal
);


searchOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target === searchOverlay
        ) {
            closeSearchModal();
        }

    }
);


function closeSearchModal() {

    searchOverlay.classList.add(
        "hidden"
    );

}


// ============================================================
// Search Quran
// ============================================================

searchButton.addEventListener(
    "click",
    performSearch
);


ayahSearch.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            performSearch();
        }

    }
);


async function performSearch() {

    const query =
        ayahSearch.value.trim();


    if (!query) {

        showToast(
            "اكتب كلمة للبحث أولًا"
        );

        return;
    }


    closeSearchModal();

    showPage("search");


    searchQuery.textContent =
        `البحث عن: ${query}`;


    searchResults.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>جاري البحث...</p>
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API}/search/${encodeURIComponent(query)}/all/quran-uthmani`
            );


        if (!response.ok) {
            throw new Error("Search Error");
        }


        const result =
            await response.json();


        const matches =
            result.data?.matches || [];


        renderSearchResults(matches);


    } catch (error) {

        console.error(error);

        searchResults.innerHTML = `
            <div class="loading">
                <p>
                    حدث خطأ أثناء البحث.
                    تأكد من اتصالك بالإنترنت.
                </p>
            </div>
        `;
    }
}


// ============================================================
// Search Results
// ============================================================

function renderSearchResults(matches) {

    if (!matches.length) {

        searchResults.innerHTML = `
            <div class="loading">
                <p>
                    لم يتم العثور على نتائج.
                </p>
            </div>
        `;

        return;
    }


    searchResults.innerHTML =
        matches.map(match => {

            const surah =
                match.surah;


            return `
                <article class="search-result">

                    <div class="search-result-info">
                        سورة ${surah.name}
                        • الآية ${match.numberInSurah}
                    </div>

                    <div class="search-result-text">
                        ${match.text}
                    </div>

                </article>
            `;

        }).join("");
}


// ============================================================
// Helpers
// ============================================================

function normalizeArabic(text) {

    return text

        .replace(
            /[\u064B-\u065F\u0670]/g,
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
        )

        .toLowerCase();
}


function showLoading(
    element,
    message
) {

    element.innerHTML = `
        <div class="loading">

            <div class="spinner"></div>

            <p>${message}</p>

        </div>
    `;
}


function showError(
    element,
    message
) {

    element.innerHTML = `
        <div class="loading">

            <p>${message}</p>

            <button
                onclick="location.reload()"
                style="
                    border:none;
                    background:var(--primary);
                    color:white;
                    padding:10px 18px;
                    border-radius:10px;
                    font-family:inherit;
                    cursor:pointer;
                "
            >
                إعادة المحاولة
            </button>

        </div>
    `;
}


function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2200
    );
}