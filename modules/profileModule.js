// modules/profileModule.js
import { settingsModule, DEFAULT_SETTINGS } from './settingsModule.js'; // Adjust path as needed

export const profileModule = {
    selectedProfile: null,

    /**
     * Loads profiles from the server and updates the profile list in the UI.
     * @param {string} [query=''] - Optional search query to filter profiles.
     */
    async loadProfiles(query = '') {
        try {
            const url = query ? `profiles/search_profiles.php?query=${encodeURIComponent(query)}` : 'profiles/search_profiles.php';
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                this.updateProfileList(data.profiles);
                return data.profiles;
            } else {
                console.error('Error loading profiles:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }
    },

    /**
     * Updates the profile list in the UI with fetched profiles.
     * @param {Array} profiles - Array of profile objects.
     */
    updateProfileList(profiles) {
        const profileList = document.getElementById('profileList');
        if (!profileList) return;

        profileList.innerHTML = '';
        profiles.forEach(profile => {
            const li = document.createElement('li');
            li.textContent = profile.name;
            li.addEventListener('click', () => this.selectProfile(profile));
            profileList.appendChild(li);
        });
        profileList.style.display = profiles.length > 0 ? 'block' : 'none';
    },

    /**
     * Selects a profile, updates the UI, and loads associated settings.
     * @param {Object} profile - The profile object to select.
     */
    async selectProfile(profile) {
        settingsModule.currentSettings = null;
    
        // ✅ Only one call
        const settings = await settingsModule.loadSettings(profile.id);
        settingsModule.applySettingsToUI(settings);
        if (settings?.currentMode) {
            settingsModule.currentSettings.currentMode = settings.currentMode;
        
            // Update mode button UI
            document.querySelectorAll('.mode-btn').forEach(btn =>
                btn.classList.toggle('active', btn.dataset.mode === settings.currentMode)
            );
        
            // Apply UI updates
            if (window.updateDisplay) setTimeout(() => updateDisplay(), 50);
        }        
    
        console.log("[DEBUG] selectProfile called with:", profile);
        this.selectedProfile = profile;
    
        const profileSearch = document.getElementById('profileSearch');
        if (profileSearch) profileSearch.value = profile.name;
    
        const profileList = document.getElementById('profileList');
        if (profileList) profileList.style.display = 'none';
    
        if (!profile.id) console.warn("[WARN] Profile ID is missing or invalid", profile);
    },    

    /**
     * Creates a new profile with the given name.
     * @param {string} name - The name of the new profile.
     */
    async createProfile(name) {
        try {
            // ✅ FORCE a fresh copy of all default settings, complete
            settingsModule.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); 
            const settings = settingsModule.currentSettings;
    
            console.log('[CREATE PROFILE] Creating with defaults:', settings);
    
            const response = await fetch('profiles/save_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, settings })
            });
    
            const data = await response.json();
            if (data.success) {
                this.selectedProfile = data.profile;
                this.showFeedback(`Profil "${name}" erstellt und ausgewählt`, 'green');
                await settingsModule.loadSettings(data.profile.id); // loads freshly saved settings
                settingsModule.applySettingsToUI(); // populates the UI
                await this.loadProfiles();
                return data.profile;
            } else {
                console.error('Fehler beim Erstellen des Profils:', data.message);
                this.showFeedback('Fehler beim Erstellen des Profils', 'red');
                return null;
            }
        } catch (error) {
            console.error('Fehler beim Erstellen des Profils:', error);
            this.showFeedback('Fehler beim Erstellen des Profils', 'red');
            return null;
        }
    },       

    /**
     * Saves the current profile.
     * @param {Object} profile - The profile object to save.
     */
    async saveProfile(profile) {
        try {
            const response = await fetch('profiles/save_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            const data = await response.json();
            if (data.success) {
                return data.profile;
            } else {
                console.error('Error saving profile:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            return null;
        }
    },

    async deleteProfile(profileId) {
        if (!profileId) {
            this.showFeedback('Profil-ID fehlt', 'red');
            return;
        }
    
        try {
            const response = await fetch('profiles/delete_profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: profileId })
            });
    
            const data = await response.json();
            if (data.success) {
    
                // Clear selected profile if it's the one we just deleted
                if (this.selectedProfile?.id === profileId) {
                    this.selectedProfile = null;
                }
    
                await this.loadProfiles(); // Refresh list
            } else {
                console.error('Fehler beim Löschen:', data.message);
            }
        } catch (error) {
            console.error('Fehler beim Löschen des Profils:', error);
        }
    },          

    /**
     * Gets the currently selected profile.
     * @returns {Object|null} The selected profile or null.
     */
    getCurrentProfile() {
        return this.selectedProfile;
    },

    /**
     * Displays feedback messages for profile actions.
     * @param {string} message - The message to display.
     * @param {string} color - The color of the message (e.g., 'green', 'red').
     */
    showFeedback(message, color) {
        const feedbackElement = document.createElement('div');
        feedbackElement.textContent = message;
        feedbackElement.style.position = 'fixed';
        feedbackElement.style.fontFamily = 'Arial, sans-serif';
        feedbackElement.style.fontSize = '16px';
        feedbackElement.style.color = color;
        feedbackElement.style.padding = '5px';
        feedbackElement.style.background = 'rgba(255, 255, 255, 0.9)';
        feedbackElement.style.zIndex = '1000';
        feedbackElement.style.textAlign = 'center';

        const profileSearch = document.getElementById('profileSearch');
        if (profileSearch) {
            const rect = profileSearch.getBoundingClientRect();
            feedbackElement.style.left = `${rect.left + rect.width / 2}px`;
            feedbackElement.style.top = `${rect.bottom + 5}px`;
            feedbackElement.style.transform = 'translateX(-50%)';
        }

        document.body.appendChild(feedbackElement);
        setTimeout(() => feedbackElement.remove(), 2000);
    }
};