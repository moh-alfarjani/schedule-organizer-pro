// --- IIFE Wrapper ---
// نستخدم (IIFE) لتجنب تلويث النطاق العام (Global Scope) والحفاظ على خصوصية المتغيرات والدوال.
(function () {
    'use strict';

    // --- DOM Element Selection ---
    // هنا نجمع كل عناصر الـ DOM التي سنتعامل معها في كائن واحد لسهولة الوصول إليها.
    const dom = {
        scheduleGrid: document.getElementById('schedule-grid'),
        lectureModal: document.getElementById('lecture-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalViewContent: document.getElementById('modal-view-content'),
        editForm: document.getElementById('edit-form'),
        modalFooter: document.getElementById('modal-footer'),
        headerTitle: document.getElementById('header-title'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        moonIcon: document.getElementById('theme-icon-moon'),
        sunIcon: document.getElementById('theme-icon-sun'),
        fileInput: document.getElementById('file-input'),
        searchInput: document.getElementById('search-input'),
        settingsBtn: document.getElementById('settings-btn'),

        // Filters
        dayFilter: document.getElementById('day-filter'),
        subjectFilter: document.getElementById('subject-filter'),

        // Modals
        confirmModal: document.getElementById('confirm-modal'),
        confirmTitle: document.getElementById('confirm-title'),
        confirmMessage: document.getElementById('confirm-message'),
        confirmOkBtn: document.getElementById('confirm-ok-btn'),

        settingsModal: document.getElementById('settings-modal'),
        appTitleInputEn: document.getElementById('app-title-input-en'),
        appTitleInputAr: document.getElementById('app-title-input-ar'),
        dataManagementTabs: document.getElementById('data-management-tabs'),
        dataManagementContent: document.getElementById('data-management-content'),

        copyPasteModal: document.getElementById('copy-paste-modal'),
        copyPasteTargetGrid: document.getElementById('copy-paste-target-grid'),

        exportModal: document.getElementById('export-modal'),
        exportFilenameInput: document.getElementById('export-filename'),
        exportSummary: document.getElementById('export-summary'),
        exportConfirmBtn: document.getElementById('export-confirm-btn'),

        // New FAB elements
        fabContainer: document.getElementById('fab-container'),
        fabMainBtn: document.getElementById('fab-main-btn'),
        fabImportBtn: document.getElementById('fab-import-btn'),
        fabExportBtn: document.getElementById('fab-export-btn'),
        fabLangBtn: document.getElementById('fab-lang-btn'),

        // New Language Modal
        languageModal: document.getElementById('language-modal'),
        langModalSwitchBtn: document.getElementById('lang-modal-switch-btn'),
        langModalKeepBtn: document.getElementById('lang-modal-keep-btn'),
        langModalDontAsk: document.getElementById('lang-modal-dont-ask'),
    };

    // --- Constants, State, and i18n ---
    const LOCAL_STORAGE_KEY = 'school-schedule-pro';
    const LANG_STORAGE_KEY = 'school-schedule-lang';
    const CANONICAL_DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    let state;
    let clipboard = null;
    let filters = { dayStatus: 'all', subject: 'all' };
    let currentLang = 'en';

    // كائن الترجمة لدعم اللغتين العربية والإنجليزية
    const i18n = {
        en: {
            appTitle: "Schedule Organizer",
            days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            timeSuffix: { am: 'AM', pm: 'PM' },
            duration: (h, m) => {
                let res = [];
                if (h > 0) res.push(`${h} hour${h > 1 ? 's' : ''}`);
                if (m > 0) res.push(`${m} minute${m > 1 ? 's' : ''}`);
                return res.join(' and ') || '0 minutes';
            },
            header: { searchPlaceholder: "Search in schedule...", settingsAria: "Settings", themeAria: "Toggle Theme" },
            filters: { view: "View:", allDays: "All", filledDays: "Filled Days", emptyDays: "Empty Days", subject: "Subject:", allSubjects: "All Subjects" },
            lectureCard: { newSubject: "New Subject", location: "{college} / {hall}", timeRange: "{start} - {end}", countdownStarts: "Starts in: {time}", countdownInProgress: "In Progress" },
            lectureModal: { detailsTitle: "Lecture Details", addTitle: "Add Lecture - {day}", editTitle: "Edit: {subject}", viewLectureNum: "Lecture No.", viewSubject: "Subject", viewLocation: "College / Hall", viewGroup: "Group", viewTime: "Time", viewDuration: "Duration", viewLecturer: "Lecturer", notSet: "Not set", form: { subject: "Subject (Required)", lecturer: "Lecturer", college: "College", hall: "Hall", group: "Group", startTime: "Start Time", endTime: "End Time" }, footer: { copy: "Copy", delete: "Delete", edit: "Edit", cancel: "Cancel", save: "Save" } },
            confirmModal: { deleteTitle: "Confirm Deletion", deleteMessage: `Are you sure you want to delete the lecture "{subject}"?`, deleteBtn: "Yes, Delete", importTitle: "Confirm Import", importMessage: `Are you sure you want to replace your current schedule? The file contains {count} lectures. This action cannot be undone.`, importBtn: "Yes, Replace", errorTitle: "Import Error", errorMessage: "The selected file is invalid or corrupted.", okBtn: "OK", cancel: "Cancel", replaceTitle: "Confirm Replacement", replaceMessage: "This slot contains data. Do you want to replace it?", replaceBtn: "Yes, Replace" },
            settings: { title: "Settings", appearance: "Appearance", appTitleEn: "Application Title (English)", appTitleAr: "Application Title (Arabic)", dataManagement: "Data Management", dataDescription: "Add or remove items that appear in autocomplete suggestions.", tabs: { subjects: "Subjects", lecturers: "Lecturers", colleges: "Colleges", halls: "Halls", groups: "Groups" }, noItems: "No items found.", newItemPlaceholder: "Add a new item...", addBtn: "Add", saveBtn: "Save" },
            copyPaste: { title: "Paste Lecture", description: "Select the day and slot where you want to paste the lecture.", slot: "Lecture {index}" },
            export: { title: "Export Schedule", filename: "Filename", summary: "This will create a backup of a schedule containing <strong>{count}</strong> lectures.", cancel: "Cancel", confirm: "Confirm Export", alertNone: "There are no lectures to export.", alertFail: "Export failed." },
            fab: { import: "Import", export: "Export", language: "Switch Language", main: "Actions" },
            langModal: { title: "Language Preference", description: "We noticed your system is in Arabic. Would you like to switch the app language?", switchBtn: "Switch to Arabic", keepBtn: "Keep English", dontAsk: "Don't ask me again", love: "I love you ❤️" },
            alerts: { importSuccess: "Schedule imported successfully!" }
        },
        ar: {
            appTitle: "منظم الجدول الدراسي",
            days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            timeSuffix: { am: 'ص', pm: 'م' },
            duration: (h, m) => {
                let res = [];
                if (h > 0) res.push(`${h} ساعة`);
                if (m > 0) res.push(`${m} دقيقة`);
                return res.join(' و ') || '0 دقيقة';
            },
            header: { searchPlaceholder: "ابحث في الجدول...", settingsAria: "الإعدادات", themeAria: "تبديل المظهر" },
            filters: { view: "عرض:", allDays: "الكل", filledDays: "الأيام الممتلئة", emptyDays: "الأيام الفارغة", subject: "المادة:", allSubjects: "كل المواد" },
            lectureCard: { newSubject: "مادة جديدة", location: "{college} / {hall}", timeRange: "{start} - {end}", countdownStarts: "يبدأ خلال: {time}", countdownInProgress: "جاري الآن" },
            lectureModal: { detailsTitle: "تفاصيل المحاضرة", addTitle: "إضافة محاضرة - {day}", editTitle: "تعديل: {subject}", viewLectureNum: "رقم المحاضرة", viewSubject: "المادة", viewLocation: "الكلية / القاعة", viewGroup: "المجموعة", viewTime: "التوقيت", viewDuration: "المدة", viewLecturer: "المحاضر", notSet: "غير محدد", form: { subject: "المادة (مطلوب)", lecturer: "المحاضر", college: "الكلية", hall: "القاعة", group: "المجموعة", startTime: "وقت البدء", endTime: "وقت الإنتهاء" }, footer: { copy: "نسخ", delete: "حذف", edit: "تعديل", cancel: "إلغاء", save: "حفظ" } },
            confirmModal: { deleteTitle: "تأكيد الحذف", deleteMessage: `هل أنت متأكد من حذف محاضرة "{subject}"؟`, deleteBtn: "نعم, احذف", importTitle: "تأكيد استرجاع النسخة", importMessage: `هل أنت متأكد من استبدال جدولك الحالي؟ الملف يحتوي على {count} محاضرة. هذا الإجراء لا يمكن التراجع عنه.`, importBtn: "نعم, استبدل", errorTitle: "خطأ في الاسترجاع", errorMessage: "الملف الذي تم اختياره غير صالح أو تالف.", okBtn: "حسنًا", cancel: "إلغاء", replaceTitle: "تأكيد الاستبدال", replaceMessage: "هذه الخانة تحتوي على بيانات. هل تريد استبدالها؟", replaceBtn: "نعم, استبدل" },
            settings: { title: "الإعدادات", appearance: "المظهر", appTitleEn: "عنوان التطبيق (انجليزي)", appTitleAr: "عنوان التطبيق (عربي)", dataManagement: "إدارة البيانات", dataDescription: "أضف أو أزل العناصر التي تظهر في اقتراحات الإكمال التلقائي.", tabs: { subjects: "المواد", lecturers: "المحاضرين", colleges: "الكليات", halls: "القاعات", groups: "المجموعات" }, noItems: "لا توجد عناصر.", newItemPlaceholder: "إضافة عنصر جديد...", addBtn: "إضافة", saveBtn: "حفظ" },
            copyPaste: { title: "لصق المحاضرة", description: "اختر اليوم والمحاضرة التي تريد لصق البيانات فيها.", slot: "محاضرة {index}" },
            export: { title: "النسخ الاحتياطي للجدول", filename: "اسم الملف", summary: `سيتم إنشاء نسخة احتياطية لجدول يحتوي على <strong>{count}</strong> محاضرة.`, cancel: "إلغاء", confirm: "تأكيد النسخ", alertNone: "لا توجد محاضرات لعمل نسخة احتياطية.", alertFail: "فشل النسخ الاحتياطي." },
            fab: { import: "استيراد", export: "تصدير", language: "تبديل اللغة", main: "إجراءات" },
            langModal: { title: "تفضيل اللغة", description: "لقد لاحظنا أن لغة نظامك هي العربية. هل تود تبديل لغة التطبيق؟", switchBtn: "التبديل إلى العربية", keepBtn: "إبقاء الإنجليزية", dontAsk: "عدم السؤال مرة أخرى" },
            alerts: { importSuccess: "تم استرجاع الجدول بنجاح!" }
        }
    };

    // دالة مساعدة لجلب النصوص من كائن الترجمة مع استبدال المتغيرات.
    const t = (key, replacements = {}) => {
        const textValue = key.split('.').reduce((obj, k) => obj && obj[k], i18n[currentLang]);

        if (textValue === undefined || textValue === null) {
            return key;
        }

        if (typeof textValue !== 'string') {
            return textValue;
        }

        let text = textValue;
        for (const [k, v] of Object.entries(replacements)) {
            text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
        }
        return text;
    };


    // --- Core Data Functions ---
    // هذه الدوال مسؤولة عن إنشاء البيانات، تحميلها من LocalStorage، وحفظها.

    const createEmptyLecture = () => ({
        id: `lec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        subject: '', lecturer: '', college: '', hall: '', group: '',
        startTime: '', endTime: '',
    });

    const getInitialData = () => {
        const schedule = {};
        for (const day of CANONICAL_DAYS) {
            schedule[day] = [];
        }
        return {
            schedule,
            settings: {
                appTitle: { en: i18n['en'].appTitle, ar: i18n['ar'].appTitle },
                darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
            },
            managedData: { subjects: [], lecturers: [], colleges: [], halls: [], groups: [] },
        };
    };

    // دالة لتنقية وتوحيد البيانات المحملة لضمان توافقها مع الهيكل المطلوب.
    const normalizeData = (rawData) => {
        const initial = getInitialData();
        if (typeof rawData !== 'object' || rawData === null) return initial;

        const normalized = JSON.parse(JSON.stringify(initial));

        if (rawData.schedule) {
            const dayNameToCanonical = {};
            CANONICAL_DAYS.forEach((canonicalDay, index) => {
                dayNameToCanonical[canonicalDay] = canonicalDay;
                dayNameToCanonical[i18n.en.days[index].toLowerCase()] = canonicalDay;
                dayNameToCanonical[i18n.ar.days[index]] = canonicalDay;
            });

            for (const rawDayKey in rawData.schedule) {
                const canonicalDay = dayNameToCanonical[rawDayKey.toLowerCase()];
                if (canonicalDay && Array.isArray(rawData.schedule[rawDayKey])) {
                    normalized.schedule[canonicalDay] = rawData.schedule[rawDayKey].map((lec) => ({
                        id: lec.id || `lec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        subject: String(lec.subject ?? ''),
                        lecturer: String(lec.lecturer ?? ''),
                        college: String(lec.college ?? ''),
                        hall: String(lec.hall ?? ''),
                        group: String(lec.group ?? ''),
                        startTime: String(lec.startTime ?? ''),
                        endTime: String(lec.endTime ?? ''),
                    }));
                }
            }
        }

        if (rawData.settings) {
            if (typeof rawData.settings.darkMode === 'boolean') {
                normalized.settings.darkMode = rawData.settings.darkMode;
            }
            if (typeof rawData.settings.appTitle === 'string') {
                normalized.settings.appTitle = { en: rawData.settings.appTitle, ar: rawData.settings.appTitle };
            } else if (rawData.settings.appTitle && typeof rawData.settings.appTitle.en === 'string' && typeof rawData.settings.appTitle.ar === 'string') {
                normalized.settings.appTitle = rawData.settings.appTitle;
            }
        }

        if (rawData.managedData) {
            for (const key in normalized.managedData) {
                if (Array.isArray(rawData.managedData[key])) {
                    normalized.managedData[key] = [...new Set((rawData.managedData[key]).map(String))];
                }
            }
        }

        return normalized;
    };

    const saveData = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("Failed to save state:", error);
        }
    };

    const loadData = () => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            const parsedData = storedData ? JSON.parse(storedData) : getInitialData();
            state = normalizeData(parsedData);
        } catch (error) {
            console.error("Failed to load state, creating a new one.", error);
            state = getInitialData();
        }
    };

    // --- Helper Functions ---
    // دوال مساعدة لتنسيق الوقت وحساب المدة.
    const formatTime12Hour = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const suffix = h >= 12 ? t('timeSuffix.pm') : t('timeSuffix.am');
        const hour12 = ((h + 11) % 12 + 1);
        return `${hour12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return '';
        try {
            const startDate = new Date(`1970-01-01T${start}`);
            const endDate = new Date(`1970-01-01T${end}`);
            let diff = (endDate.getTime() - startDate.getTime()) / 60000;
            if (diff < 0) diff += 24 * 60;
            const hours = Math.floor(diff / 60);
            const minutes = diff % 60;
            return i18n[currentLang].duration(hours, minutes);
        } catch (e) { return ''; }
    };

    const getTotalLectures = () => Object.values(state.schedule).reduce((acc, day) => acc + (Array.isArray(day) ? day.length : 0), 0);

    // --- UI Rendering ---
    // هذا الجزء مسؤول عن عرض البيانات في واجهة المستخدم.
    const ICONS = {
        subject: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5v-10A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
        lecturer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12h-5z"></path><path d="M2 12v1.5a2.5 2.5 0 0 0 5 0V12H2z"></path><path d="M12 12v7h-4v-7a2 2 0 0 1 4 0z"></path><path d="M12 12v7h4v-7a2 2 0 0 0-4 0z"></path></svg>`,
        location: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
        group: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        time: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        duration: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4"></path><path d="M12 14v-4"></path><path d="M4 14h16"></path><path d="M6 22h12"></path><path d="M6 18h12"></path></svg>`,
        edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`
    };

    const createLectureCard = (lecture, day, index) => {
        const card = document.createElement('div');
        card.className = 'lecture-card';
        card.dataset.day = day;
        card.dataset.index = index.toString();
        card.dataset.id = lecture.id;
        card.draggable = true;

        let content = `<div class="card-item"><span class="subject">${lecture.subject || t('lectureCard.newSubject')}</span></div>`;
        if (lecture.college || lecture.hall) content += `<div class="card-item location">${ICONS.location} <span>${t('lectureCard.location', { college: lecture.college || '...', hall: lecture.hall || '...' })}</span></div>`;
        if (lecture.group) content += `<div class="card-item group">${ICONS.group} <span>${lecture.group}</span></div>`;

        const timeText = formatTime12Hour(lecture.startTime) && formatTime12Hour(lecture.endTime) ? t('lectureCard.timeRange', { start: formatTime12Hour(lecture.startTime), end: formatTime12Hour(lecture.endTime) }) : '';
        if (timeText) content += `<div class="card-item time">${ICONS.time} <span>${timeText}</span></div>`;

        const duration = calculateDuration(lecture.startTime, lecture.endTime);
        if (duration) content += `<div class="card-item duration">${ICONS.duration} <span>${duration}</span></div>`;

        if (lecture.lecturer) content += `<div class="card-item lecturer">${ICONS.lecturer} <span>${lecture.lecturer}</span></div>`;

        card.innerHTML = content;

        const countdown = document.createElement('div');
        countdown.className = 'countdown-timer hidden';
        card.appendChild(countdown);

        return card;
    };

    // الدالة الرئيسية لرسم جدول المحاضرات
    const renderGrid = () => {
        if (!dom.scheduleGrid) return;
        dom.scheduleGrid.innerHTML = "";

        CANONICAL_DAYS.forEach((dayKey, dayIndex) => {
            const dayDisplayName = i18n[currentLang].days[dayIndex];
            const lectures = state.schedule[dayKey] || [];
            const dayHasLectures = lectures.length > 0;

            const dayIsVisible = (filters.dayStatus === 'all') ||
                (filters.dayStatus === 'filled' && dayHasLectures) ||
                (filters.dayStatus === 'empty' && !dayHasLectures);

            if (!dayIsVisible) return;

            const dayRow = document.createElement('div');
            dayRow.className = 'day-row';
            dayRow.innerHTML = `<div class="day-cell">${dayDisplayName}</div>`;
            const lecturesContainer = document.createElement('div');
            lecturesContainer.className = 'lectures-container';
            if (dayHasLectures) lecturesContainer.classList.add('has-lectures');

            lectures.forEach((lecture, index) => {
                const subjectIsVisible = filters.subject === 'all' || filters.subject === lecture.subject;
                if (subjectIsVisible) {
                    lecturesContainer.appendChild(createLectureCard(lecture, dayKey, index));
                }
            });

            const addCard = document.createElement('div');
            addCard.className = 'add-lecture-card';
            addCard.textContent = '+';
            addCard.dataset.day = dayKey;
            lecturesContainer.appendChild(addCard);

            dayRow.appendChild(lecturesContainer);
            dom.scheduleGrid.appendChild(dayRow);
        });
        handleSearch();
    };

    // --- Autocomplete ---
    const setupAutocomplete = () => {
        ['subject', 'lecturer', 'college', 'hall', 'group'].forEach(fieldName => {
            const input = dom.editForm.elements.namedItem(fieldName);
            const suggestionsContainer = input.nextElementSibling;

            const showSuggestions = (filter = '') => {
                const value = filter.toLowerCase();
                suggestionsContainer.innerHTML = '';
                const dataKey = `${fieldName}s`;
                const suggestions = state.managedData[dataKey].filter(item => item.toLowerCase().includes(value));

                if (suggestions.length > 0) {
                    suggestions.forEach(item => {
                        const div = document.createElement('div');
                        div.textContent = item;
                        div.addEventListener('mousedown', (e) => {
                            e.preventDefault();
                            input.value = item;
                            suggestionsContainer.classList.add('hidden');
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        });
                        suggestionsContainer.appendChild(div);
                    });
                    suggestionsContainer.classList.remove('hidden');
                } else {
                    suggestionsContainer.classList.add('hidden');
                }
            };

            input.addEventListener('input', () => showSuggestions(input.value));
            input.addEventListener('focus', () => showSuggestions(''));
            input.addEventListener('blur', () => setTimeout(() => suggestionsContainer.classList.add('hidden'), 150));
        });
    };

    const updateManagedData = (lecture) => {
        Object.keys(state.managedData).forEach(key => {
            const field = key.slice(0, -1);
            const value = lecture[field];
            const dataKey = key;
            if (value && !state.managedData[dataKey].includes(value)) {
                state.managedData[dataKey].push(value);
                state.managedData[dataKey].sort();
            }
        });
    };

    // --- Modals ---
    // دوال للتحكم في إظهار وإخفاء النوافذ المنبثقة (Modals).
    const showModal = (modal) => modal?.classList.remove('hidden');
    const hideModal = (modal) => modal?.classList.add('hidden');

    const showConfirm = (title, message, okText, okClass, onOk, showCancel = true) => {
        dom.confirmTitle.textContent = title;
        dom.confirmMessage.innerHTML = message;
        dom.confirmOkBtn.textContent = okText;
        dom.confirmOkBtn.className = `btn ${okClass}`;
        dom.confirmOkBtn.onclick = () => {
            onOk();
            hideModal(dom.confirmModal);
        };
        const cancelBtn = dom.confirmModal.querySelector('#confirm-cancel-btn');
        cancelBtn.textContent = t('confirmModal.cancel');
        cancelBtn.style.display = showCancel ? '' : 'none';
        dom.confirmOkBtn.parentElement.style.justifyContent = showCancel ? '' : 'flex-end';
        showModal(dom.confirmModal);
    };

    const openLectureModal = (day, index) => {
        dom.lectureModal.dataset.day = day;
        const isNew = index === undefined;
        const lecture = isNew ? createEmptyLecture() : state.schedule[day][index];
        if (!isNew) dom.lectureModal.dataset.index = index.toString();
        else delete dom.lectureModal.dataset.index;

        if (isNew) {
            switchToEditMode(day);
        } else {
            populateViewModal(lecture, day, index);
        }
        showModal(dom.lectureModal);
    };

    const populateViewModal = (lecture, day, index) => {
        dom.modalTitle.textContent = lecture.subject || t('lectureModal.detailsTitle');
        dom.editForm.classList.add('hidden');
        dom.modalViewContent.classList.remove('hidden');

        let content = `<div class="view-item"><div class="view-item-content"><span class="label">${t('lectureModal.viewLectureNum')}</span><span class="value">${index + 1}</span></div></div>`;
        content += `<div class="view-item">${ICONS.subject}<div class="view-item-content"><span class="label">${t('lectureModal.viewSubject')}</span><span class="value subject">${lecture.subject || '-'}</span></div></div>`;
        if (lecture.college || lecture.hall) content += `<div class="view-item">${ICONS.location}<div class="view-item-content"><span class="label">${t('lectureModal.viewLocation')}</span><span class="value location">${t('lectureCard.location', { college: lecture.college || '-', hall: lecture.hall || '-' })}</span></div></div>`;
        if (lecture.group) content += `<div class="view-item">${ICONS.group}<div class="view-item-content"><span class="label">${t('lectureModal.viewGroup')}</span><span class="value group">${lecture.group}</span></div></div>`;

        const timeText = formatTime12Hour(lecture.startTime) && formatTime12Hour(lecture.endTime) ? t('lectureCard.timeRange', { start: formatTime12Hour(lecture.startTime), end: formatTime12Hour(lecture.endTime) }) : t('lectureModal.notSet');
        content += `<div class="view-item">${ICONS.time}<div class="view-item-content"><span class="label">${t('lectureModal.viewTime')}</span><span class="value time">${timeText}</span></div></div>`;

        const duration = calculateDuration(lecture.startTime, lecture.endTime);
        if (duration) content += `<div class="view-item">${ICONS.duration}<div class="view-item-content"><span class="label">${t('lectureModal.viewDuration')}</span><span class="value duration">${duration}</span></div></div>`;
        if (lecture.lecturer) content += `<div class="view-item lecturer">${ICONS.lecturer}<div class="view-item-content"><span class="label">${t('lectureModal.viewLecturer')}</span><span class="value">${lecture.lecturer}</span></div></div>`;

        dom.modalViewContent.innerHTML = content;

        dom.modalFooter.innerHTML = `
            <button type="button" id="modal-copy-btn" class="btn btn-secondary">${t('lectureModal.footer.copy')}</button>
            <div style="flex-grow: 1;"></div>
            <button type="button" id="modal-delete-btn" class="btn btn-danger">${t('lectureModal.footer.delete')}</button>
            <button type="button" id="modal-edit-btn" class="btn btn-primary">${t('lectureModal.footer.edit')}</button>
        `;
        document.getElementById('modal-edit-btn').onclick = () => switchToEditMode(day, index);
        document.getElementById('modal-delete-btn').onclick = () => handleDeleteLecture(day, index);
        document.getElementById('modal-copy-btn').onclick = () => handleCopyLecture(lecture);
    };

    const switchToEditMode = (day, index) => {
        const isNew = index === undefined;
        const lecture = isNew ? createEmptyLecture() : state.schedule[day][index];
        const titleKey = isNew ? 'lectureModal.addTitle' : 'lectureModal.editTitle';

        const dayIndex = CANONICAL_DAYS.indexOf(day);
        const dayDisplayName = dayIndex > -1 ? i18n[currentLang].days[dayIndex] : day;
        dom.modalTitle.textContent = t(titleKey, { day: dayDisplayName, subject: lecture.subject || 'lecture' });

        Object.keys(lecture).forEach(key => {
            const element = dom.editForm.elements.namedItem(key);
            if (element instanceof HTMLInputElement) {
                element.value = lecture[key];
            }
        });

        dom.modalViewContent.classList.add('hidden');
        dom.editForm.classList.remove('hidden');

        dom.modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary modal-close-button">${t('lectureModal.footer.cancel')}</button>
            <button type="submit" form="edit-form" id="modal-save-btn" class="btn btn-primary">${t('lectureModal.footer.save')}</button>
        `;
        dom.modalFooter.querySelector('.modal-close-button').onclick = () => {
            if (isNew) hideModal(dom.lectureModal);
            else populateViewModal(lecture, day, index);
        };
        updateFormState();
    };

    const updateFormState = () => {
        const saveBtn = document.getElementById('modal-save-btn');
        const subjectInput = dom.editForm.elements.namedItem('subject');
        if (saveBtn) {
            saveBtn.disabled = !subjectInput.value.trim();
        }
    };

    // --- Countdown Timer ---
    const updateAllCountdowns = () => {
        const now = new Date();
        const jsDay = now.getDay(); // 0 = Sunday, 6 = Saturday
        const appDayIndex = (jsDay + 1) % 7;
        const todayKey = CANONICAL_DAYS[appDayIndex];
        const todayName = i18n[currentLang].days[appDayIndex];

        document.querySelectorAll('.countdown-timer').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.lecture-card').forEach(card => card.classList.remove('status-safe', 'status-soon', 'status-urgent', 'in-progress-card'));

        const todayRow = Array.from(dom.scheduleGrid.querySelectorAll('.day-row')).find(row => {
            const dayCell = row.querySelector('.day-cell');
            return dayCell && dayCell.textContent === todayName;
        });

        if (!todayRow) return;

        (state.schedule[todayKey] || []).forEach((lecture, index) => {
            const card = todayRow.querySelector(`.lecture-card[data-index="${index}"]`);
            const countdownEl = card?.querySelector('.countdown-timer');
            if (!card || !lecture || !lecture.startTime || !countdownEl) return;

            const [startHours, startMinutes] = lecture.startTime.split(':').map(Number);
            const startTime = new Date();
            startTime.setHours(startHours, startMinutes, 0, 0);

            const endTime = lecture.endTime ? new Date() : null;
            if (endTime && lecture.endTime) {
                const [endHours, endMinutes] = lecture.endTime.split(':').map(Number);
                endTime.setHours(endHours, endMinutes, 0, 0);
            }

            const diffSeconds = Math.round((startTime.getTime() - now.getTime()) / 1000);

            countdownEl.classList.remove('hidden', 'in-progress', 'ended', 'status-safe', 'status-soon', 'status-urgent');

            if (diffSeconds > 0) {
                const hours = Math.floor(diffSeconds / 3600);
                const minutes = Math.floor((diffSeconds % 3600) / 60);
                const seconds = diffSeconds % 60;
                const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                countdownEl.textContent = t('lectureCard.countdownStarts', { time: timeString });

                if (diffSeconds <= 5 * 60) {
                    card.classList.add('status-urgent');
                    countdownEl.classList.add('status-urgent');
                } else if (diffSeconds <= 30 * 60) {
                    card.classList.add('status-soon');
                    countdownEl.classList.add('status-soon');
                } else {
                    card.classList.add('status-safe');
                    countdownEl.classList.add('status-safe');
                }
            } else if (endTime && now < endTime) {
                countdownEl.textContent = t('lectureCard.countdownInProgress');
                countdownEl.classList.add('in-progress');
                card.classList.add('in-progress-card');
            } else {
                countdownEl.classList.add('ended');
            }
        });
    };

    // --- Settings Modal ---
    const openSettingsModal = () => {
        dom.appTitleInputEn.value = state.settings.appTitle.en;
        dom.appTitleInputAr.value = state.settings.appTitle.ar;
        renderDataManagement();
        showModal(dom.settingsModal);
    };

    const applyTheme = (darkMode) => {
        document.documentElement.classList.toggle('dark', darkMode);
        dom.moonIcon?.classList.toggle('hidden', darkMode);
        dom.sunIcon?.classList.toggle('hidden', !darkMode);
    };

    const updateScheduleData = (category, oldValue, newValue) => {
        const field = category.slice(0, -1);
        Object.values(state.schedule).forEach(day => {
            day.forEach(lecture => {
                if (lecture[field] === oldValue) {
                    lecture[field] = newValue;
                }
            });
        });
    };

    const renderDataManagement = (activeTab = 'subjects') => {
        const tabs = t('settings.tabs');
        dom.dataManagementTabs.innerHTML = (Object.entries(tabs)).map(([key, name]) =>
            `<button class="btn ${key === activeTab ? 'btn-primary' : 'btn-secondary'}" data-tab="${key}">${name}</button>`
        ).join('');

        dom.dataManagementContent.innerHTML = `
            <div class="data-management-list">
                ${state.managedData[activeTab].map(item => `
                    <div class="data-management-item" data-value="${item}">
                        <span class="item-text">${item}</span>
                        <div class="item-actions">
                            <button class="btn btn-ghost btn-edit" title="${t('lectureModal.footer.edit')}">${ICONS.edit}</button>
                            <button class="btn btn-ghost btn-delete" title="${t('lectureModal.footer.delete')}">&times;</button>
                        </div>
                    </div>
                `).join('') || `<p class="text-tertiary">${t('settings.noItems')}</p>`}
            </div>
            <div class="data-management-input-container">
                <input type="text" placeholder="${t('settings.newItemPlaceholder')}" id="new-data-item" class="data-management-input">
                <button id="add-data-item-btn" class="btn btn-primary">${t('settings.addBtn')}</button>
            </div>
        `;

        dom.dataManagementTabs.querySelectorAll('button').forEach(btn => btn.onclick = () => renderDataManagement(btn.dataset.tab));

        const input = document.getElementById('new-data-item');
        const addButton = document.getElementById('add-data-item-btn');

        const addItem = () => {
            const value = input.value.trim();
            if (value && !state.managedData[activeTab].includes(value)) {
                state.managedData[activeTab].push(value);
                state.managedData[activeTab].sort();
                saveData();
                renderDataManagement(activeTab);
            } else {
                input.value = '';
                input.focus();
            }
        };

        addButton.onclick = addItem;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
            }
        };
    };

    // --- Copy/Paste ---
    const handleCopyLecture = (lecture) => {
        clipboard = JSON.parse(JSON.stringify(lecture));
        hideModal(dom.lectureModal);
        renderCopyPasteGrid();
        showModal(dom.copyPasteModal);
    };

    const renderCopyPasteGrid = () => {
        dom.copyPasteTargetGrid.innerHTML = '';
        CANONICAL_DAYS.forEach((dayKey, dayIndex) => {
            const dayDisplayName = i18n[currentLang].days[dayIndex];
            const dayLabel = document.createElement('h5');
            dayLabel.textContent = dayDisplayName;
            dom.copyPasteTargetGrid.appendChild(dayLabel);
            const slotsContainer = document.createElement('div');
            slotsContainer.className = 'copy-paste-grid';
            const maxSlots = Math.max(...Object.values(state.schedule).map(d => Array.isArray(d) ? d.length : 0)) + 1;

            for (let i = 0; i < maxSlots; i++) {
                const slot = document.createElement('div');
                slot.className = 'copy-paste-slot';
                slot.dataset.day = dayKey;
                slot.dataset.index = i.toString();
                if (state.schedule[dayKey] && state.schedule[dayKey][i]) {
                    slot.classList.add('filled', 'replaceable');
                    slot.textContent = state.schedule[dayKey][i].subject.substring(0, 10) || '...';
                } else {
                    slot.textContent = t('copyPaste.slot', { index: i + 1 });
                }
                slotsContainer.appendChild(slot);
            }
            dom.copyPasteTargetGrid.appendChild(slotsContainer);
        });
    };

    // --- Import/Export ---
    const handleExport = () => {
        const totalLectures = getTotalLectures();
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        dom.exportFilenameInput.value = `schedule_backup_${timestamp}`;
        dom.exportSummary.innerHTML = `<p>${t('export.summary', { count: totalLectures })}</p>`;
        showModal(dom.exportModal);
    };

    const handleImport = (event) => {
        const target = event.target;
        const file = target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== 'string') throw new Error("File content is not readable.");
                const parsedData = JSON.parse(content);

                if (!parsedData.schedule || !parsedData.settings) {
                    throw new Error("Invalid file format.");
                }

                const totalLectures = Object.values(parsedData.schedule).reduce((acc, day) => acc + (Array.isArray(day) ? day.length : 0), 0);

                showConfirm(
                    t('confirmModal.importTitle'),
                    t('confirmModal.importMessage', { count: totalLectures }),
                    t('confirmModal.importBtn'),
                    'btn-danger',
                    () => {
                        state = normalizeData(parsedData);
                        saveData();
                        applyState();
                        renderGrid();
                        updateFilters();
                        alert(t('alerts.importSuccess'));
                    }
                );

            } catch (error) {
                console.error("Import failed:", error);
                showConfirm(t('confirmModal.errorTitle'), t('confirmModal.errorMessage'), t('confirmModal.okBtn'), 'btn-primary', () => { });
            }
        };
        reader.readAsText(file);
        if (dom.fileInput) dom.fileInput.value = "";
    };

    // --- Filters ---
    const updateFilters = () => {
        const hasAnyLectures = getTotalLectures() > 0;
        const hasAnyFilledDays = CANONICAL_DAYS.some(day => state.schedule[day] && state.schedule[day].length > 0);

        dom.subjectFilter.disabled = !hasAnyLectures;

        const filledOption = dom.dayFilter.querySelector('option[value="filled"]');
        if (filledOption) {
            filledOption.disabled = !hasAnyFilledDays;
        }

        // Populate subject filter
        const currentSubject = dom.subjectFilter.value;
        dom.subjectFilter.innerHTML = `<option value="all">${t('filters.allSubjects')}</option>`;
        state.managedData.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            dom.subjectFilter.appendChild(option);
        });
        dom.subjectFilter.value = state.managedData.subjects.includes(currentSubject) ? currentSubject : 'all';
    };

    // --- Event Handlers ---
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const { day, index } = dom.lectureModal.dataset;
        if (!day) return;

        const isNew = index === undefined;
        const subject = dom.editForm.elements.namedItem('subject').value.trim();
        if (!subject) return;

        const lectureData = {
            id: isNew ? `lec_${Date.now()}` : state.schedule[day][parseInt(index, 10)].id,
            subject: subject,
            lecturer: dom.editForm.elements.namedItem('lecturer').value.trim(),
            college: dom.editForm.elements.namedItem('college').value.trim(),
            hall: dom.editForm.elements.namedItem('hall').value.trim(),
            group: dom.editForm.elements.namedItem('group').value.trim(),
            startTime: dom.editForm.elements.namedItem('startTime').value,
            endTime: dom.editForm.elements.namedItem('endTime').value,
        };

        updateManagedData(lectureData);

        if (isNew) {
            if (!state.schedule[day]) state.schedule[day] = [];
            state.schedule[day].push(lectureData);
        } else {
            state.schedule[day][parseInt(index, 10)] = lectureData;
        }

        saveData();
        applyState();
        renderGrid();
        updateFilters();
        hideModal(dom.lectureModal);
    };

    const handleDeleteLecture = (day, index) => {
        showConfirm(
            t('confirmModal.deleteTitle'),
            t('confirmModal.deleteMessage', { subject: state.schedule[day][index].subject }),
            t('confirmModal.deleteBtn'),
            'btn-danger',
            () => {
                state.schedule[day].splice(index, 1);
                saveData();
                applyState();
                renderGrid();
                updateFilters();
                hideModal(dom.lectureModal);
            }
        );
    };

    const handleSearch = () => {
        const query = dom.searchInput.value.toLowerCase().trim();
        dom.scheduleGrid.querySelectorAll(".lecture-card").forEach(card => {
            card.classList.remove("highlight", "dimmed");
            if (query) {
                const cardText = card.textContent?.toLowerCase() || "";
                if (cardText.includes(query)) card.classList.add("highlight");
                else card.classList.add("dimmed");
            }
        });
    };

    // --- Initialization ---
    // هنا نربط كل الأحداث (events) بعناصر الـ DOM.
    const addEventListeners = () => {
        // Main grid clicks
        dom.scheduleGrid.addEventListener('click', (e) => {
            const target = e.target;
            const card = target.closest('.lecture-card');
            const addCard = target.closest('.add-lecture-card');
            if (card) openLectureModal(card.dataset.day, parseInt(card.dataset.index, 10));
            else if (addCard) openLectureModal(addCard.dataset.day);
        });

        // Search
        dom.searchInput.addEventListener('input', handleSearch);

        // Filters
        dom.dayFilter.addEventListener('change', e => {
            filters.dayStatus = e.target.value;
            renderGrid();
        });
        dom.subjectFilter.addEventListener('change', e => {
            filters.subject = e.target.value;
            renderGrid();
        });


        // Header Actions
        dom.settingsBtn.addEventListener('click', openSettingsModal);
        dom.themeToggleBtn.addEventListener('click', () => {
            state.settings.darkMode = !state.settings.darkMode;
            applyTheme(state.settings.darkMode);
            saveData();
        });

        // FAB Actions
        dom.fabMainBtn.addEventListener('click', () => dom.fabContainer.classList.toggle('open'));
        document.addEventListener('click', (e) => {
            if (!dom.fabContainer.contains(e.target)) {
                dom.fabContainer.classList.remove('open');
            }
        });
        dom.fabImportBtn.addEventListener('click', () => dom.fileInput.click());
        dom.fileInput.addEventListener('change', handleImport);
        dom.fabExportBtn.addEventListener('click', () => {
            if (dom.fabExportBtn.classList.contains('is-inactive')) {
                dom.fabExportBtn.classList.add('flash-error');
                setTimeout(() => dom.fabExportBtn.classList.remove('flash-error'), 700);

                showConfirm(
                    t('export.title'),
                    t('export.alertNone'),
                    t('confirmModal.okBtn'),
                    'btn-primary',
                    () => { },
                    false
                );
            } else {
                handleExport();
            }
        });
        dom.fabLangBtn.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'ar' : 'en';
            setLanguage(newLang, true);
        });

        // Main Modal
        dom.lectureModal.addEventListener('click', (e) => {
            const target = e.target;
            if (target === dom.lectureModal || target.closest('.modal-close-button')) {
                hideModal(dom.lectureModal);
            }
        });
        dom.editForm.addEventListener('submit', handleFormSubmit);
        dom.editForm.addEventListener('input', (e) => {
            const target = e.target;
            if (target.id === 'subject') {
                updateFormState();
            }
        });
        dom.editForm.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const target = e.target;
                const focusable = Array.from(dom.editForm.querySelectorAll('input:not([type="checkbox"])'));
                const currentIndex = focusable.indexOf(target);
                const isLast = currentIndex === focusable.length - 1;

                if (!isLast) {
                    e.preventDefault();
                    focusable[currentIndex + 1]?.focus();
                } else {
                    const saveBtn = document.getElementById('modal-save-btn');
                    if (saveBtn && !saveBtn.disabled) {
                        handleFormSubmit(new SubmitEvent('submit', { submitter: saveBtn }));
                    }
                }
            }
        });


        // Confirm Modal
        dom.confirmModal.addEventListener('click', (e) => {
            const target = e.target;
            if (target === dom.confirmModal || target.closest('.modal-close-button')) {
                hideModal(dom.confirmModal);
            }
        });

        // Settings Modal
        dom.settingsModal.addEventListener('click', (e) => {
            const target = e.target;
            if (target === dom.settingsModal || target.closest('.modal-close-button')) {
                hideModal(dom.settingsModal);
            }
        });
        dom.appTitleInputEn.addEventListener('change', (e) => {
            const target = e.target;
            state.settings.appTitle.en = target.value.trim() || i18n['en'].appTitle;
            if (currentLang === 'en') {
                dom.headerTitle.textContent = state.settings.appTitle.en;
            }
            saveData();
        });
        dom.appTitleInputAr.addEventListener('change', (e) => {
            const target = e.target;
            state.settings.appTitle.ar = target.value.trim() || i18n['ar'].appTitle;
            if (currentLang === 'ar') {
                dom.headerTitle.textContent = state.settings.appTitle.ar;
            }
            saveData();
        });

        dom.dataManagementContent.addEventListener('click', e => {
            const target = e.target;
            const activeTab = dom.dataManagementTabs.querySelector('.btn-primary')?.dataset.tab;

            const editBtn = target.closest('.btn-edit');
            if (editBtn) {
                const itemEl = target.closest('.data-management-item');
                const oldValue = itemEl.dataset.value;
                itemEl.innerHTML = `
                    <input type="text" value="${oldValue}" class="data-management-input">
                    <div class="item-actions">
                         <button class="btn btn-ghost btn-save">${t('settings.saveBtn')}</button>
                    </div>
                `;
                const input = itemEl.querySelector('input');
                input.focus();
                input.select();
            }

            const saveBtn = target.closest('.btn-save');
            if (saveBtn) {
                const itemEl = target.closest('.data-management-item');
                const oldValue = itemEl.dataset.value;
                const newValue = itemEl.querySelector('input').value.trim();

                if (newValue && newValue !== oldValue) {
                    const index = state.managedData[activeTab].indexOf(oldValue);
                    if (index > -1) {
                        state.managedData[activeTab][index] = newValue;
                        state.managedData[activeTab].sort();
                        updateScheduleData(activeTab, oldValue, newValue);
                        saveData();
                        renderGrid();
                        updateFilters();
                    }
                }
                renderDataManagement(activeTab);
            }

            const deleteBtn = target.closest('.btn-delete');
            if (deleteBtn) {
                const itemEl = target.closest('.data-management-item');
                const item = itemEl.dataset.value;
                state.managedData[activeTab] = state.managedData[activeTab].filter(i => i !== item);
                saveData();
                renderDataManagement(activeTab);
                updateFilters();
            }
        });

        // Copy Paste Modal
        dom.copyPasteModal.addEventListener('click', (e) => {
            const target = e.target;
            if (target === dom.copyPasteModal || target.closest('.modal-close-button')) {
                hideModal(dom.copyPasteModal);
            }
        });
        dom.copyPasteTargetGrid.addEventListener('click', (e) => {
            const target = e.target;
            const slot = target.closest('.copy-paste-slot');
            if (!slot || !clipboard) return;
            const { day, index: indexStr } = slot.dataset;
            const index = parseInt(indexStr, 10);
            const paste = () => {
                clipboard.id = `lec_${Date.now()}`;
                if (!state.schedule[day]) state.schedule[day] = [];
                state.schedule[day].splice(index, 0, clipboard);
                saveData();
                renderGrid();
                updateFilters();
                hideModal(dom.copyPasteModal);
                clipboard = null;
            };

            if (slot.classList.contains('filled')) {
                showConfirm(t('confirmModal.replaceTitle'), t('confirmModal.replaceMessage'), t('confirmModal.replaceBtn'), 'btn-danger', paste);
            } else {
                paste();
            }
        });

        // Export Modal
        dom.exportModal.addEventListener('click', (e) => {
            const target = e.target;
            if (target === dom.exportModal || target.closest('.modal-close-button')) {
                hideModal(dom.exportModal);
            }
        });
        dom.exportConfirmBtn.addEventListener('click', () => {
            try {
                const filenameBase = dom.exportFilenameInput.value.trim() || 'schedule_backup';
                const filename = `${filenameBase}.json`;
                const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
                const a = document.createElement('a');
                a.href = dataStr;
                a.download = filename;
                a.click();
                a.remove();
                hideModal(dom.exportModal);
            } catch (error) {
                alert(t('export.alertFail'));
            }
        });

        // Language Modal Listeners
        dom.langModalSwitchBtn.addEventListener('click', () => {
            if (dom.langModalDontAsk.checked) localStorage.setItem('lang_dont_ask', 'true');
            setLanguage('ar', true);
            hideModal(dom.languageModal);
        });
        dom.langModalKeepBtn.addEventListener('click', () => {
            if (dom.langModalDontAsk.checked) localStorage.setItem('lang_dont_ask', 'true');
            hideModal(dom.languageModal);
        });


        // Global keydown
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => hideModal(m));
                dom.fabContainer.classList.remove('open');
            }
        });

        // --- Drag & Drop ---
        let draggedInfo = null;
        dom.scheduleGrid.addEventListener('dragstart', (e) => {
            const target = e.target;
            const card = target.closest('.lecture-card');
            if (card) {
                draggedInfo = { el: card, day: card.dataset.day, index: parseInt(card.dataset.index, 10) };
                setTimeout(() => card.classList.add('dragging'), 0);
            }
        });
        dom.scheduleGrid.addEventListener('dragover', (e) => {
            e.preventDefault();
            const target = e.target;
            const container = target.closest('.lectures-container');
            if (container && draggedInfo && container.parentElement.querySelector('.day-cell').textContent === i18n[currentLang].days[CANONICAL_DAYS.indexOf(draggedInfo.day)]) {
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            } else {
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
            }
        });
        dom.scheduleGrid.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!draggedInfo) return;
            draggedInfo.el.classList.remove('dragging');
            const target = e.target;
            const targetCard = target.closest('.lecture-card');
            if (targetCard && targetCard !== draggedInfo.el) {
                const toIndex = parseInt(targetCard.dataset.index, 10);
                if (draggedInfo.day === targetCard.dataset.day) {
                    const [movedItem] = state.schedule[draggedInfo.day].splice(draggedInfo.index, 1);
                    state.schedule[draggedInfo.day].splice(toIndex, 0, movedItem);
                    saveData();
                    renderGrid();
                }
            }
            draggedInfo = null;
        });
        dom.scheduleGrid.addEventListener('dragend', () => {
            if (draggedInfo) {
                draggedInfo.el.classList.remove('dragging');
                draggedInfo = null;
            }
        });
    };

    const updateUIText = () => {
        document.title = state.settings.appTitle[currentLang] || t('appTitle');
        dom.headerTitle.textContent = state.settings.appTitle[currentLang] || t('appTitle');
        dom.searchInput.placeholder = t('header.searchPlaceholder');
        dom.settingsBtn.setAttribute('aria-label', t('header.settingsAria'));
        dom.themeToggleBtn.setAttribute('aria-label', t('header.themeAria'));

        // Filters
        document.getElementById('day-filter-label').textContent = t('filters.view');
        document.getElementById('day-filter-all').textContent = t('filters.allDays');
        document.getElementById('day-filter-filled').textContent = t('filters.filledDays');
        document.getElementById('day-filter-empty').textContent = t('filters.emptyDays');
        document.getElementById('subject-filter-label').textContent = t('filters.subject');

        // Form Labels
        document.getElementById('form-label-subject').textContent = t('lectureModal.form.subject');
        document.getElementById('form-label-lecturer').textContent = t('lectureModal.form.lecturer');
        document.getElementById('form-label-college').textContent = t('lectureModal.form.college');
        document.getElementById('form-label-hall').textContent = t('lectureModal.form.hall');
        document.getElementById('form-label-group').textContent = t('lectureModal.form.group');
        document.getElementById('form-label-startTime').textContent = t('lectureModal.form.startTime');
        document.getElementById('form-label-endTime').textContent = t('lectureModal.form.endTime');

        // Modals
        document.getElementById('settings-title').textContent = t('settings.title');
        document.getElementById('settings-appearance-title').textContent = t('settings.appearance');
        document.getElementById('settings-app-title-label-en').textContent = t('settings.appTitleEn');
        document.getElementById('settings-app-title-label-ar').textContent = t('settings.appTitleAr');
        document.getElementById('settings-data-mgmnt-title').textContent = t('settings.dataManagement');
        document.getElementById('settings-data-mgmnt-desc').textContent = t('settings.dataDescription');
        document.getElementById('copy-paste-title').textContent = t('copyPaste.title');
        document.getElementById('copy-paste-desc').textContent = t('copyPaste.description');
        document.getElementById('export-title').textContent = t('export.title');
        document.getElementById('export-filename-label').textContent = t('export.filename');
        document.getElementById('export-cancel-btn').textContent = t('export.cancel');
        document.getElementById('export-confirm-btn').textContent = t('export.confirm');

        // FAB Tooltips
        dom.fabImportBtn.title = t('fab.import');
        dom.fabExportBtn.title = t('fab.export');
        dom.fabLangBtn.title = t('fab.language');
        dom.fabMainBtn.setAttribute('aria-label', t('fab.main'));
    };

    const setLanguage = (lang, savePreference) => {
        currentLang = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        if (savePreference) {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        }
        loadData();
        updateUIText();
        applyState();
        updateFilters();
        renderGrid();
    };

    const applyState = () => {
        dom.headerTitle.textContent = state.settings.appTitle[currentLang] || t('appTitle');
        applyTheme(state.settings.darkMode);
        const totalLectures = getTotalLectures();
        dom.fabExportBtn.disabled = false;
        dom.fabExportBtn.classList.toggle('is-inactive', totalLectures === 0);
    };

    const initializeLanguage = () => {
        const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
        if (savedLang) {
            setLanguage(savedLang, false);
            return;
        }

        const dontAsk = localStorage.getItem('lang_dont_ask');
        const browserLang = navigator.language.split('-')[0];

        if (browserLang === 'ar' && !dontAsk) {
            document.getElementById('lang-modal-title').textContent = i18n.ar.langModal.title;
            document.getElementById('lang-modal-desc').textContent = i18n.ar.langModal.description;
            document.getElementById('lang-modal-switch-btn').textContent = i18n.ar.langModal.switchBtn;
            document.getElementById('lang-modal-keep-btn').textContent = i18n.ar.langModal.keepBtn;
            document.getElementById('lang-modal-dont-ask-label').textContent = i18n.ar.langModal.dontAsk;
            showModal(dom.languageModal);
        }

        setLanguage('en', false); // Default to English
    };


    // دالة التشغيل الرئيسية التي تبدأ كل شيء.
    const initialize = () => {
        addEventListeners();
        initializeLanguage();
        setupAutocomplete();
        setInterval(updateAllCountdowns, 1000); // Update countdowns every second
    };

    initialize();
})();