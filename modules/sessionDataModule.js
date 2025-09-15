// modules/sessionDataModule.js
export const sessionDataModule = {
    sessionData: null,

    startSession(profileId, mode) {
        this.sessionData = {
            profileId,
            mode,
            trials: [],
            startTime: Date.now(),
            endTime: null
        };
    },

    recordTrialData(data) {
        this.sessionData.trials.push(data);
    },

    endSession() {
        this.sessionData.endTime = Date.now();
    },

    async saveSessionData() {
        if (!this.sessionData) return;
        try {
            await fetch('sessions/save_session.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId: this.sessionData.profileId,
                    mode: this.sessionData.mode,
                    startTime: this.sessionData.startTime,
                    endTime: this.sessionData.endTime,
                    data: JSON.stringify(this.sessionData)  // store entire session object as JSON string
                })                
            });
        } catch (error) {
            console.error('Error saving session data:', error);
        }
    }
};

// sessionDataModule.js
const STORAGE_KEY = 'profiles';

export function getProfiles() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function persist(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function createProfile({ name, color }) {
  const profiles = getProfiles();
  const now = new Date().toISOString();
  const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());
  const profile = { id, name: name?.trim() || 'Unnamed', color: color || '#888888', createdAt: now };
  profiles.push(profile);
  persist(profiles);
  return profile;
}

export function updateProfile(id, patch) {
  const profiles = getProfiles();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx === -1) return null;
  profiles[idx] = { ...profiles[idx], ...patch };
  persist(profiles);
  return profiles[idx];
}

export function deleteProfile(id) {
  const profiles = getProfiles().filter(p => p.id !== id);
  persist(profiles);
  return profiles;
}
