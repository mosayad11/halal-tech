/* =========================================================
   SO HALAL MODE OS
   Applications
   ========================================================= */


/* =========================================================
   APPLICATION DATABASE
   ========================================================= */

const APPS = [

    {
        id: 'settings',
        name: 'Settings',
        icon: 'assets/icons/settings.png',
        category: 'System',
        path: 'apps/settings/index.html',
        desktop: true,
        pinned: true
    },

    {
        id: 'notepad',
        name: 'Notepad',
        icon: 'assets/icons/notepad.png',
        category: 'Productivity',
        path: 'apps/notepad/index.html',
        desktop: false,
        pinned: true
    },

    {
        id: 'store',
        name: 'Store',
        icon: 'assets/icons/store.png',
        category: 'System',
        path: 'apps/store/index.html',
        desktop: false,
        pinned: false
    },

    {
        id: 'mosayad_apps',
        name: 'Mosayad apps',
        icon: 'assets/icons/mosayad_apps.png',
        category: 'Internet',
        path: 'https://mosayad11.github.io',
        desktop: true,
        pinned: true
    },

    {
        id: 'calculator',
        name: 'Calculator',
        icon: 'assets/icons/calculator.png',
        category: 'Utilities',
        path: 'apps/calculator/index.html',
        desktop: false,
        pinned: true
    },

    {
        id: 'quran',
        name: 'المصحف الشريف',
        icon: 'assets/icons/quran.jpg',
        category: 'Islamic',
        path: 'apps/quran/index.html',
        desktop: true,
        pinned: false
    },

    {
        id: 'adhkar',
        name: 'الاذكار اليومية',
        icon: 'assets/icons/adhkar.jpg',
        category: 'Islamic',
        path: 'apps/adhkar/index.html',
        desktop: true,
        pinned: false
    },

    {
        id: 'prayer',
        name: 'مواقيت الصلاة',
        icon: 'assets/icons/prayer.jpg',
        category: 'Islamic',
        path: 'apps/prayer/index.html',
        desktop: true,
        pinned: false
    },

    {
        id: 'battut',
        name: 'Battut',
        icon: 'assets/icons/battut.jpg',
        category: 'Internet',
        path: 'https://battut.app/',
        desktop: true,
        pinned: false
    },

    {
        id: 'haramblur',
        name: 'Haram Blur',
        icon: 'assets/icons/haramblur.jpg',
        category: 'Internet',
        path: 'https://haramblur.com/',
        desktop: true,
        pinned: false
    }

];
/* =========================================================
   EXPORT APPLICATIONS
   ========================================================= */

window.APPS =
    APPS;