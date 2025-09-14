// Refactored version of data.js to be callable dynamically from main.js
// This assumes the DOM target #dataInterfaceContent already contains the HTML structure.
export async function loadSessions(profileId, mode) {
    const sessionDataDiv = document.getElementById('session-data');
    const dateFrom = document.getElementById('dateFrom')?.value;
    const dateTo = document.getElementById('dateTo')?.value;
    let url = `sessions/get_session_data.php?profile_id=${profileId}&mode=${mode}`;
    if (dateFrom) url += `&date_from=${encodeURIComponent(dateFrom)}`;
    if (dateTo) url += `&date_to=${encodeURIComponent(dateTo)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
            data.sessions.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            window.renderLegacySessionData(data.sessions, mode);
        } else {
            sessionDataDiv.innerHTML = 'No data available.';
        }
    } catch (e) {
        console.error('❌ Failed to load session data:', e);
    }
}

export function initDataInterface() {
    const sessionDataDiv = document.getElementById('session-data');
    const profileSearch = document.getElementById('profileSearch');
    if (profileSearch) profileSearch.value = '';
    const profileList = document.getElementById('dataProfileList');
    if (!profileList) {
        console.error('❌ profileList not found on init!');
        setTimeout(initDataInterface, 100); // Retry after a short delay
        return;
    }
    const modeTabs = document.querySelectorAll('.mode-tab');
    let sessionLineChart, reihenfolgeChart, stackedBarChart;
    let allProfiles = [];

    const reactionTimeColors = {
        '<=300': '#8CD47E',
        '<=500': '#7ABD7E',
        '<=700': '#F8D66D',
        '<=1000': '#FFB54C',
        '>1000': '#FF6961'
    };

    async function loadProfiles() {
        try {
            const response = await fetch('profiles/search_profiles.php');
            const result = await response.json();
            console.log('Profile fetch result:', result); // 👈 Add this line
            allProfiles = result.profiles || result || [];
            renderProfileList(allProfiles);
            if (allProfiles.length > 0) {
                showProfileTab(allProfiles[0].id);
            } else {
                console.warn('⚠️ No profiles received from the server.');
            }
        } catch (err) {
            console.error('❌ Error loading profiles:', err);
        }
    }

    function renderProfileList(profiles) {
        const profileList = document.getElementById('dataProfileList');
        if (!profileList) {
            console.error('❌ profileList element not found!');
            return;
        }

        profileList.innerHTML = '';
        profiles.forEach(profile => {
            const tab = document.createElement('li');
            tab.className = 'profile-tab';
            tab.dataset.profileId = profile.id;
            tab.textContent = profile.name;
            tab.addEventListener('click', () => {
                showProfileTab(profile.id);
            });
            profileList.appendChild(tab);
        });
    }

    function handleProfileSearch() {
        const query = profileSearch.value.trim().toLowerCase();
        const filtered = allProfiles.filter(p => p.name.toLowerCase().includes(query));
        renderProfileList(filtered);
    }

    profileSearch.addEventListener('input', debounce(handleProfileSearch, 300));

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function showProfileTab(profileId) {
        const profileTabs = document.querySelectorAll('.profile-tab');
        profileTabs.forEach(tab => tab.classList.remove('active'));
        const selectedTab = document.querySelector(`.profile-tab[data-profile-id="${profileId}"]`);
        if (selectedTab) selectedTab.classList.add('active');
        loadSessions(profileId, document.querySelector('.mode-tab.active')?.dataset.mode || 'normal');
    }

    modeTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const profileId = document.querySelector('.profile-tab.active')?.dataset.profileId;
            if (profileId) await loadSessions(profileId, tab.dataset.mode); // only runs if profile is active
        });
    });

    document.getElementById('applyFilter')?.addEventListener('click', () => {
        const profileId = document.querySelector('.profile-tab.active')?.dataset.profileId;
        const mode = document.querySelector('.mode-tab.active')?.dataset.mode;
        if (profileId && mode) loadSessions(profileId, mode);
    });

    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        const profileId = document.querySelector('.profile-tab.active')?.dataset.profileId;
        const mode = document.querySelector('.mode-tab.active')?.dataset.mode;
        if (profileId && mode) loadSessions(profileId, mode);
    });

    async function loadSessions(profileId, mode) {
        const dateFrom = document.getElementById('dateFrom')?.value;
        const dateTo = document.getElementById('dateTo')?.value;
        let url = `sessions/get_session_data.php?profile_id=${profileId}&mode=${mode}`;
        if (dateFrom) url += `&date_from=${encodeURIComponent(dateFrom)}`;
        if (dateTo) url += `&date_to=${encodeURIComponent(dateTo)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                data.sessions.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
                renderLegacySessionData(data.sessions, mode);
            } else {
                sessionDataDiv.innerHTML = 'No data available.';
            }
        } catch (e) {
            console.error('❌ Failed to load session data:', e);
        }
    }

    loadProfiles();
}

// Expose chart containers for legacy renderer compatibility
window.sessionLineChart = null;
window.reihenfolgeChart = null;
window.stackedBarChart = null;
window.reactionTimeColors = {
    '<=300': '#8CD47E',
    '<=500': '#7ABD7E',
    '<=700': '#F8D66D',
    '<=1000': '#FFB54C',
    '>1000': '#FF6961'
};

// Load the legacy session renderer
import { renderLegacySessionData } from './legacy/renderLegacySessionData.js';
window.renderLegacySessionData = renderLegacySessionData;
window.loadSessions = loadSessions;