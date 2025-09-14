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