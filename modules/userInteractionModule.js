export const userInteractionModule = {
    currentMode: null,
    handleClickBound: null,
    handleKeyDownBound: null,

    registerInputHandlers(mode) {
        if (!mode || typeof mode.handleInput !== 'function') {
            console.error('Invalid mode: Must provide a handleInput method.');
            return;
        }
        this.currentMode = mode;

        // ✅ Explicitly save references for proper removal later
        this.handleClickBound = this.handleClick.bind(this);
        this.handleKeyDownBound = this.handleKeyDown.bind(this);

        document.addEventListener('click', this.handleClickBound);
        document.addEventListener('keydown', this.handleKeyDownBound);
        console.log('✅ Input handlers attached explicitly.');
    },

    removeInputHandlers() {
        if (this.handleClickBound && this.handleKeyDownBound) {
            document.removeEventListener('click', this.handleClickBound);
            document.removeEventListener('keydown', this.handleKeyDownBound);
            console.log('✅ Input handlers removed explicitly.');
        } else {
            console.warn('⚠️ No handlers found to remove explicitly.');
        }
        this.currentMode = null;
        this.handleClickBound = null;
        this.handleKeyDownBound = null;
    },

    handleClick(event) {
        if (this.currentMode && this.currentMode.handleInput) {
            this.currentMode.handleInput(event);
        }
    },

    handleKeyDown(event) {
        if (this.currentMode && this.currentMode.handleInput) {
            this.currentMode.handleInput(event);
        }
    }
};

// --- Profile overlay wiring (list + drawer + CRUD) ---
import { uiProfiles } from './uiModule.js';
import { profileModule } from './profileModule.js';

export function initProfileOverlay() {
    const btnOpen = document.getElementById('openProfilePanel');
    const btnCloseOverlay = document.getElementById('closeProfileOverlay');
    const btnAdd = document.getElementById('addProfileBtn');
    const btnCloseDrawer = document.getElementById('closeDrawerBtn');
    const form = document.getElementById('profileForm');
    const list = document.getElementById('profileList');
    if (!btnOpen || !form || !list) return;

    uiProfiles.initColors();

    // Open overlay + load list
    btnOpen.addEventListener('click', async () => {
        uiProfiles.openOverlay();
        const profiles = await profileModule.loadProfiles('');
        uiProfiles.renderList(profiles);
    });

    // Close overlay
    if (btnCloseOverlay) btnCloseOverlay.addEventListener('click', uiProfiles.closeOverlay);

    // Add (create)
    if (btnAdd) btnAdd.addEventListener('click', () => uiProfiles.openDrawer('create'));

    // Close drawer (X)
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', uiProfiles.closeOverlay);

    // Submit (create/update)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { id, name, color } = uiProfiles.getFormData();
        const msg = document.getElementById('profileFormMsg');

        if (!name) { msg.textContent = 'Bitte einen Namen eingeben.'; return; }

        if (id) {
            const ok = await profileModule.saveProfile({ id, name, color });
            if (!ok) { msg.textContent = 'Speichern fehlgeschlagen.'; return; }
        } else {
            const created = await profileModule.createProfileWithColor?.(name, color)
                ?? await profileModule.createProfile(name);
            if (!created) { msg.textContent = 'Erstellen fehlgeschlagen.'; return; }
        }

        const profiles = await profileModule.loadProfiles('');
        uiProfiles.renderList(profiles);
        msg.textContent = '';
        // keep overlay open; if you want only the drawer to close, do:
        const drawer = document.getElementById('profileDrawer');
        if (drawer) drawer.style.display = 'none';
    });

    // Click outside to close
    document.getElementById('profileOverlay').addEventListener('click', (ev) => {
        const left = ev.target.closest('.profile-left');
        const right = ev.target.closest('.profile-drawer');
        if (!left && !right) uiProfiles.closeOverlay();
    });
}
