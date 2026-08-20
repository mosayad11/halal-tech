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
        desktop: true,
        pinned: true
    },

    {
        id: 'store',
        name: 'Store',
        icon: 'assets/icons/store.png',
        category: 'System',
        path: 'apps/store/index.html',
        desktop: true,
        pinned: true
    },

    {
        id: 'browser',
        name: 'Browser',
        icon: 'assets/icons/browser.png',
        category: 'Internet',
        path: 'apps/browser/index.html',
        desktop: true,
        pinned: true
    },

    {
        id: 'calculator',
        name: 'Calculator',
        icon: 'assets/icons/calculator.png',
        category: 'Utilities',
        path: 'apps/calculator/index.html',
        desktop: true,
        pinned: true
    },

    {
        id: 'quran',
        name: 'المصحف الشريف',
        icon: 'assets/icons/quran.jpg',
        category: 'Islamic',
        path: 'apps/quran/index.html',
        desktop: true,
        pinned: true
    },

    {
        id: 'adhkar',
        name: 'الاذكار اليومية',
        icon: 'assets/icons/adhkar.jpg',
        category: 'Islamic',
        path: 'apps/adhkar/index.html',
        desktop: true,
        pinned: true
    },

    {
        id: 'prayer',
        name: 'مواقيت الصلاة',
        icon: 'assets/icons/prayer.jpg',
        category: 'Islamic',
        path: 'apps/prayer/index.html',
        desktop: true,
        pinned: true
    }

];
/* =========================================================
   EXPORT APPLICATIONS
   ========================================================= */

window.APPS =
    APPS;