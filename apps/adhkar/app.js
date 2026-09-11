// ============================================================
// API
// ============================================================

const API =
    "https://api.islamic.app/v1/dhikr";


// ============================================================
// Elements
// ============================================================

const categories =
    document.getElementById("categories");

const adhkarPage =
    document.getElementById("adhkarPage");

const adhkarContainer =
    document.getElementById("adhkarContainer");

const categoryTitle =
    document.getElementById("categoryTitle");

const backButton =
    document.getElementById("backButton");

const themeButton =
    document.getElementById("themeButton");


// ============================================================
// State
// ============================================================

let currentAdhkar = [];

let currentCategory = "";


// ============================================================
// Category Information
// ============================================================

const categoryNames = {

    "morning":
        "🌅 أذكار الصباح",

    "evening":
        "🌇 أذكار المساء",

    "after-prayer":
        "🕌 أذكار بعد الصلاة",

    "before-sleep":
        "🌙 أذكار النوم",

    "waking-up":
        "🌤️ أذكار الاستيقاظ",

    "prayer":
        "🤲 أذكار الصلاة",

    "mosque":
        "🕌 أذكار المسجد",

    "travel":
        "✈️ أذكار السفر",

    "food":
        "🍽️ أذكار الطعام والشراب",

    "home":
        "🏠 أذكار المنزل",

    "anxiety":
        "🌿 الكرب والهم",

    "protection":
        "🛡️ التحصين والحفظ",

    "forgiveness":
        "💚 الاستغفار",

    "hajj":
        "🕋 الحج والعمرة"

};


// ============================================================
// Category Buttons
// ============================================================

document
    .querySelectorAll(".category-card")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;

                if (!category) {
                    return;
                }

                loadAdhkar(category);

            }
        );

    });


// ============================================================
// Load Adhkar
// ============================================================

async function loadAdhkar(category) {

    if (!category) {
        return;
    }


    currentCategory =
        category;


    // --------------------------------------------------------
    // Show adhkar page
    // --------------------------------------------------------

    categories.classList.add(
        "hidden"
    );

    adhkarPage.classList.remove(
        "hidden"
    );


    categoryTitle.textContent =
        categoryNames[category] ||
        "🤲 الأذكار";


    // --------------------------------------------------------
    // Loading
    // --------------------------------------------------------

    adhkarContainer.innerHTML = `

        <div class="loading">

            <div class="spinner"></div>

            <p>
                جاري تحميل الأذكار...
            </p>

        </div>

    `;


    try {

        const url =
            `${API}/${encodeURIComponent(category)}`;


        console.log(
            "[Adhkar] Loading:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `API Error: HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "[Adhkar API]",
            result
        );


        // ----------------------------------------------------
        // Validate API response
        // ----------------------------------------------------

        currentAdhkar =
            extractAdhkar(result);


        if (
            !Array.isArray(currentAdhkar) ||
            currentAdhkar.length === 0
        ) {

            throw new Error(
                "The API returned no adhkar."
            );

        }


        // ----------------------------------------------------
        // Render
        // ----------------------------------------------------

        renderAdhkar();


    } catch (error) {

        console.error(
            "[Adhkar] Failed to load:",
            error
        );


        showError(category);

    }

}


// ============================================================
// Extract Adhkar
// ============================================================

function extractAdhkar(result) {

    if (
        !result ||
        typeof result !== "object"
    ) {

        return [];

    }


    const duas =
        result?.data?.duas;


    if (!Array.isArray(duas)) {

        return [];

    }


    return duas.filter(
        dhikr =>
            dhikr &&
            typeof dhikr === "object"
    );

}


// ============================================================
// Render Adhkar
// ============================================================

function renderAdhkar() {

    if (
        !Array.isArray(currentAdhkar) ||
        currentAdhkar.length === 0
    ) {

        adhkarContainer.innerHTML = `

            <div class="error-card">

                <div class="error-icon">
                    📭
                </div>

                <h3>
                    لا توجد أذكار
                </h3>

                <p>
                    لم يتم العثور على أذكار في هذا القسم.
                </p>

            </div>

        `;

        return;

    }


    adhkarContainer.innerHTML =

        currentAdhkar
            .map(
                (dhikr, index) => {

                    return createDhikrCard(
                        dhikr,
                        index
                    );

                }
            )
            .join("");

}


// ============================================================
// Create Dhikr Card
// ============================================================

function createDhikrCard(
    dhikr,
    index
) {

    const text =
        getArabicBody(dhikr);


    const repeatCount =
        getRepeatCount(dhikr);


    const transliteration =
        getTransliteration(dhikr);


    const reference =
        getReference(dhikr);


    const hasRepeatCount =
        repeatCount !== null;


    const number =
        escapeHTML(
            dhikr?.number ??
            String(index + 1)
        );


    let repeatHTML = "";


    // --------------------------------------------------------
    // Official repeat count
    // --------------------------------------------------------

    if (hasRepeatCount) {

        repeatHTML = `

            <div class="dhikr-counter">

                <span class="counter">
                    0 / ${repeatCount}
                </span>

            </div>

        `;

    }


    // --------------------------------------------------------
    // No official repeat count
    // --------------------------------------------------------

    else {

        repeatHTML = `

            <div class="dhikr-counter">

                <span class="counter">
                    اضغط بعد كل مرة
                </span>

            </div>

        `;

    }


    // --------------------------------------------------------
    // Transliteration
    // --------------------------------------------------------

    const transliterationHTML =
        transliteration
            ? `

                <div class="dhikr-transliteration">

                    ${escapeHTML(
                        transliteration
                    )}

                </div>

            `
            : "";


    // --------------------------------------------------------
    // Reference
    // --------------------------------------------------------

    const referenceHTML =
        reference
            ? `

                <div class="dhikr-reference">

                    <strong>
                        المصدر:
                    </strong>

                    <span>
                        ${escapeHTML(
                            reference
                        )}
                    </span>

                </div>

            `
            : "";


    // --------------------------------------------------------
    // Card
    // --------------------------------------------------------

    return `

        <article
            class="dhikr-card"
            data-index="${index}"
            ${hasRepeatCount
                ? `data-count="${repeatCount}"`
                : ""
            }
            data-current="0"
        >

            <div class="dhikr-number">

                ${number}

            </div>


            <div class="dhikr-content">

                <div class="dhikr-text">

                    ${text}

                </div>


                ${transliterationHTML}


                ${referenceHTML}


                <div class="dhikr-footer">

                    ${repeatHTML}


                    <button
                        class="count-button"
                        type="button"
                        data-index="${index}"
                    >

                        📿 تسبيح

                    </button>

                </div>

            </div>

        </article>

    `;

}


// ============================================================
// Get Arabic Body
// ============================================================

function getArabicBody(dhikr) {

    const body =
        dhikr?.ar?.body;


    if (
        typeof body === "string" &&
        body.trim()
    ) {

        return sanitizeArabicHTML(
            body
        );

    }


    // --------------------------------------------------------
    // Fallback to plain Arabic text
    // --------------------------------------------------------

    const text =
        dhikr?.ar?.text;


    if (
        typeof text === "string" &&
        text.trim()
    ) {

        return `
            <p>
                ${escapeHTML(text)}
            </p>
        `;

    }


    return `
        <p>
            لا يوجد نص لهذا الذكر.
        </p>
    `;

}


// ============================================================
// Sanitize Arabic HTML
// ============================================================
//
// The API returns HTML inside ar.body.
// We keep only safe formatting tags/classes.
//
// ============================================================

function sanitizeArabicHTML(html) {

    const template =
        document.createElement("template");


    template.innerHTML =
        String(html);


    const allowedTags = new Set([

        "P",
        "BR",
        "SPAN",
        "STRONG",
        "B",
        "EM",
        "I"

    ]);


    const allowedClasses = new Set([

        "hisn_arabic_instructions"

    ]);


    const elements =
        template.content.querySelectorAll("*");


    elements.forEach(element => {

        if (
            !allowedTags.has(
                element.tagName
            )
        ) {

            const fragment =
                document.createDocumentFragment();


            while (
                element.firstChild
            ) {

                fragment.appendChild(
                    element.firstChild
                );

            }


            element.replaceWith(
                fragment
            );

            return;

        }


        // ----------------------------------------------------
        // Remove every attribute
        // ----------------------------------------------------

        [...element.attributes]
            .forEach(attribute => {

                element.removeAttribute(
                    attribute.name
                );

            });


        // ----------------------------------------------------
        // Keep only safe class
        // ----------------------------------------------------

        const originalClass =
            element.className;


        if (
            typeof originalClass === "string" &&
            allowedClasses.has(originalClass)
        ) {

            element.className =
                originalClass;

        }

    });


    return template.innerHTML;

}


// ============================================================
// Get Repeat Count
// ============================================================

function getRepeatCount(dhikr) {

    const value =
        dhikr?.repeatCount;


    if (
        typeof value !== "number"
    ) {

        return null;

    }


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        return null;

    }


    return Math.floor(value);

}


// ============================================================
// Get Transliteration
// ============================================================

function getTransliteration(dhikr) {

    const value =
        dhikr?.transliteration?.en;


    if (
        typeof value !== "string"
    ) {

        return "";

    }


    return value.trim();

}


// ============================================================
// Get Reference
// ============================================================

function getReference(dhikr) {

    const body =
        dhikr?.en?.body;


    if (
        typeof body !== "string"
    ) {

        return "";

    }


    const template =
        document.createElement("template");


    template.innerHTML =
        body;


    const referenceElement =
        template.content.querySelector(
            ".hisn_english_reference"
        );


    if (
        !referenceElement
    ) {

        return "";

    }


    return (
        referenceElement.textContent ||
        ""
    ).trim();

}


// ============================================================
// Count Button Events
// ============================================================

adhkarContainer.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".count-button"
            );


        if (!button) {
            return;
        }


        const index =
            Number(
                button.dataset.index
            );


        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= currentAdhkar.length
        ) {

            return;

        }


        countDhikr(index);

    }
);


// ============================================================
// Count Dhikr
// ============================================================

function countDhikr(index) {

    const card =
        document.querySelector(
            `.dhikr-card[data-index="${index}"]`
        );


    if (!card) {
        return;
    }


    const button =
        card.querySelector(
            ".count-button"
        );


    const counter =
        card.querySelector(
            ".counter"
        );


    const hasCount =
        card.dataset.count !== undefined;


    // ========================================================
    // No official repeat count
    // ========================================================

    if (!hasCount) {

        card.classList.add(
            "counted"
        );


        if (button) {

            button.classList.add(
                "pressed"
            );


            button.textContent =
                "✓ تم الذكر";


            setTimeout(
                () => {

                    if (
                        !button.isConnected
                    ) {

                        return;

                    }


                    button.classList.remove(
                        "pressed"
                    );


                    button.textContent =
                        "📿 تسبيح";

                },
                700
            );

        }


        return;

    }


    // ========================================================
    // Official repeat count
    // ========================================================

    let current =
        Number(
            card.dataset.current
        );


    const count =
        Number(
            card.dataset.count
        );


    if (
        !Number.isFinite(current) ||
        !Number.isFinite(count)
    ) {

        return;

    }


    if (
        current >= count
    ) {

        return;

    }


    current++;


    card.dataset.current =
        String(current);


    if (counter) {

        counter.textContent =
            `${current} / ${count}`;

    }


    // --------------------------------------------------------
    // Completed
    // --------------------------------------------------------

    if (
        current >= count
    ) {

        card.classList.add(
            "completed"
        );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "✓ تم";

        }

    }

}


// ============================================================
// Error UI
// ============================================================

function showError(category) {

    adhkarContainer.innerHTML = `

        <div class="error-card">

            <div class="error-icon">
                ⚠️
            </div>


            <h3>
                تعذر تحميل الأذكار
            </h3>


            <p>
                حدثت مشكلة أثناء الاتصال بالخدمة.
            </p>


            <button
                class="retry-button"
                type="button"
                data-category="${escapeAttribute(category)}"
            >

                🔄 حاول مرة أخرى

            </button>

        </div>

    `;

}


// ============================================================
// Retry Button
// ============================================================

adhkarContainer.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".retry-button"
            );


        if (!button) {
            return;
        }


        const category =
            button.dataset.category;


        if (!category) {
            return;
        }


        loadAdhkar(
            category
        );

    }
);


// ============================================================
// Back Button
// ============================================================

backButton.addEventListener(
    "click",
    () => {

        adhkarPage.classList.add(
            "hidden"
        );


        categories.classList.remove(
            "hidden"
        );


        currentAdhkar = [];

        currentCategory = "";

    }
);


// ============================================================
// Theme
// ============================================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "adhkar-theme"
        );


    const isLight =
        savedTheme === "light";


    document.body.classList.toggle(
        "light-theme",
        isLight
    );


    updateThemeButton();

}


// ============================================================
// Update Theme Button
// ============================================================

function updateThemeButton() {

    if (!themeButton) {
        return;
    }


    const isLight =
        document.body.classList.contains(
            "light-theme"
        );


    themeButton.textContent =
        isLight
            ? "🌙"
            : "☀️";


    themeButton.setAttribute(
        "aria-label",
        isLight
            ? "تفعيل الوضع الداكن"
            : "تفعيل الوضع الفاتح"
    );

}


// ============================================================
// Theme Button
// ============================================================

if (themeButton) {

    themeButton.addEventListener(
        "click",
        () => {

            const isLight =
                document.body.classList.toggle(
                    "light-theme"
                );


            localStorage.setItem(
                "adhkar-theme",
                isLight
                    ? "light"
                    : "dark"
            );


            updateThemeButton();

        }
    );

}


loadTheme();


// ============================================================
// Escape HTML
// ============================================================

function escapeHTML(value) {

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


// ============================================================
// Escape Attribute
// ============================================================

function escapeAttribute(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        );

}


// ============================================================
// Debug
// ============================================================

console.log(
    "[Adhkar] App initialized."
);