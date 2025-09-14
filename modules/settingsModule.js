// modules/settingsModule.js
export const DEFAULT_SETTINGS = {
    currentMode: 'normal',
    modes: {
        normal: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: true,
            oksDirection: 'left',
            trials: 10,
            duration: 15
        },
        aufwaermen: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: true,
            oksDirection: 'left',
            dotSpeed: 0.5
        },
        aufwaermen2: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: true,
            fixationDot: false,
            oksDirection: 'left',
            duration: 30
        },
        folgen: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: true,
            oksDirection: 'left',
            trials: 15,
            duration: 15,
            dotSpeed: 0.5
        },
        punkte: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: true,
            oksDirection: 'left',
            trials: 10,
            duration: 15,
            antwortfenster: 5,
            dotSpeed: 0.5,
            punktezahl: 'vier'
        },
        vergleich: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: false,
            oksDirection: 'left',
            trials: 10,
            duration: 15,
            antwortfenster: 5,
            vergleichRows: 3,
            vergleichColumns: 3
        },
        reihenfolge: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: true,
            oksDirection: 'left',
            trials: 10,
            numCheeses: 6
        },
        fangen: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: true,
            oksDirection: 'left',
            trials: 10,
            geschwindigkeit: 0.5,
            goalWidth: 20,
            tor: 'Links'
        },
        schwimmen: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: true,
            oksDirection: 'left',
            trials: 10,
            speed: 0.5
        },
        balloonshooter: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: false,
            oksDirection: 'left',
            trials: 10,
            maxBalloonCount: 10,
            distractorCount: 5,
            balloonSpeed: 0.5  // pixels per frame
        },
        schiessen: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            background: false,
            backgroundType: 'colorful',
            oks: false,
            fixationDot: false,
            oksDirection: 'left',
            trials: 10,
            maxBalloonCount: 10,
            distractorCount: 5,
            balloonSpeed: 0.5  // pixels per frame
        },
        autofahren: {
            grid: {
                '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
                '2-1': true, '2-2': true, '2-3': true, '2-4': true, '2-5': true,
                '3-1': true, '3-2': true, '3-3': false, '3-4': true, '3-5': true,
                '4-1': true, '4-2': true, '4-3': true, '4-4': true, '4-5': true,
                '5-1': true, '5-2': true, '5-3': true, '5-4': true, '5-5': true
            },
            duration: 60,
            roadSpeed: 0.5,
            targetsDistractorsRatio: 50,
            stimulusDuration: 2,
            stimulusInterval: 2
        },
    },
    oksSpeed: 0.5,
    oksNumDots: 40,
    oksDotSize: 10,
    aspectRatio: '1920x1080'
};

export const settingsModule = {
    currentSettings: null,

    /** Load the entire settings object for a profile from the server */
    async loadSettings(profileId) {
        console.log("[DEBUG] loadSettings called with profileId:", profileId);

        if (!profileId) {
            this.showProfileFeedback('Kein Profil zum Laden ausgewählt', 'red');
            this.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            return this.currentSettings;
        }

        try {
            const response = await fetch(`profiles/search_profiles.php?profileId=${profileId}`);
            const text = await response.text();
            console.log("[DEBUG] Raw response text:", text);

            const data = JSON.parse(text);
            console.log("[DEBUG] Parsed response:", data);

            if (data.success) {
                if (data.settings) {
                    try {
                        this.currentSettings = JSON.parse(data.settings || JSON.stringify(DEFAULT_SETTINGS));
                    } catch (parseError) {
                        console.error("[ERROR] Failed to parse settings:", parseError);
                        this.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                    }
                } else {
                    console.warn("[WARN] No settings in response, using defaults.");
                    this.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                }
                return this.currentSettings;
            } else {
                console.error("[ERROR] loadSettings: Server returned error:", data.message);
            }
        } catch (error) {
            console.error("[ERROR] loadSettings fetch failed:", error);
        }

        // Fallback in case of any error
        let parsed;
        try {
            parsed = JSON.parse(data.settings);
        } catch {
            parsed = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
        this.currentSettings = JSON.parse(JSON.stringify(parsed)); // full deep clone
        return this.currentSettings;
    },

    /** Save the entire settings object for a profile to the server */
    async saveSettings(profileId, settings, profileName) {
        if (!profileId) {
            this.showProfileFeedback('Kein Profil ausgewählt zum Speichern', 'red');
            return null;
        }
        try {
            // Merge provided settings (if any) with UI-updated settings
            this.currentSettings = settings;

            const profileToSave = {
                name: profileName || 'Unnamed Profile',
                settings: this.currentSettings // ✅ send settings as an object
            };

            const response = await fetch('profiles/save_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileToSave)
            });

            const text = await response.text();
            console.log('[RAW RESPONSE]', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error('JSON parse error:', err);
                return null;
            }


            if (data.success) {
                return { id: data.profile_id, name: profileToSave.name, settings: profileToSave.settings };
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    },

    /** Update settings based on UI inputs */
    updateSettingsFromUI() {
        const settings = JSON.parse(JSON.stringify(this.currentSettings)); // deep clone
        const currentMode = settings.currentMode;
        const modeSettings = settings.modes[currentMode] || {};

        settings.modes[currentMode] = modeSettings;
        this.currentSettings = settings;


        // Global settings
        settings.oksSpeed = parseFloat(document.getElementById('oksSpeed')?.value) || 0.5;
        settings.oksNumDots = parseInt(document.getElementById('oksNumDots')?.value) || 40;
        settings.oksDotSize = parseInt(document.getElementById('oksDotSize')?.value) || 10;
        settings.aspectRatio = document.getElementById('aspectRatio')?.value || '1920x1080';

        // Update grid
        modeSettings.grid = modeSettings.grid || {};
        for (let row = 1; row <= 5; row++) {
            for (let col = 1; col <= 5; col++) {
                if (row === 3 && col === 3) continue;
                const checkbox = document.getElementById(`square${row}-${col}`);
                modeSettings.grid[`${row}-${col}`] = checkbox ? checkbox.checked : false;
            }
        }

        // Shared UI toggles
        modeSettings.background = document.getElementById('background')?.checked || false;
        modeSettings.backgroundType = document.querySelector('input[name="backgroundType"]:checked')?.value || 'colorful';
        modeSettings.oks = document.getElementById('oks')?.checked || false;
        modeSettings.fixationDot = document.getElementById('fixationDotToggle')?.checked || false;
        modeSettings.oksDirection = document.querySelector('input[name="oksDirection"]:checked')?.value || 'left';

        // Per-mode input mapping
        switch (currentMode) {
            case 'normal':
                modeSettings.trials = parseInt(document.getElementById('trialsNormal')?.value) || 10;
                modeSettings.duration = parseInt(document.getElementById('durationNormal')?.value) || 15;
                break;

            case 'aufwaermen':
                modeSettings.dotSpeed = parseFloat(document.getElementById('dotSpeedAufwaermen')?.value) || 0.5;
                break;

            case 'aufwaermen2':
                modeSettings.duration = parseInt(document.getElementById('durationAufwaermen2')?.value) || 30;
                break;

            case 'folgen':
                modeSettings.trials = parseInt(document.getElementById('trialsFolgen')?.value) || 15;
                modeSettings.duration = parseInt(document.getElementById('durationFolgen')?.value) || 15;
                modeSettings.dotSpeed = parseFloat(document.getElementById('dotSpeedFolgen')?.value) || 0.5;
                break;

            case 'punkte':
                modeSettings.trials = parseInt(document.getElementById('trialsPunkte')?.value) || 10;
                modeSettings.duration = parseInt(document.getElementById('durationPunkte')?.value) || 15;
                modeSettings.antwortfenster = parseInt(document.getElementById('antwortfensterPunkte')?.value) || 5;
                modeSettings.dotSpeed = parseFloat(document.getElementById('dotSpeedPunkte')?.value) || 0.5;
                modeSettings.punktezahl = document.querySelector('input[name="punktezahl"]:checked')?.value || 'vier';
                break;

            case 'vergleich':
                modeSettings.trials = parseInt(document.getElementById('trialsVergleich')?.value) || 10;
                modeSettings.duration = parseInt(document.getElementById('durationVergleich')?.value) || 15;
                modeSettings.antwortfenster = parseInt(document.getElementById('antwortfensterVergleich')?.value) || 5;
                modeSettings.vergleichRows = parseInt(document.getElementById('vergleichRows')?.value) || 3;
                modeSettings.vergleichColumns = parseInt(document.getElementById('vergleichColumns')?.value) || 3;
                break;

            case 'reihenfolge':
                modeSettings.trials = parseInt(document.getElementById('trialsReihenfolge')?.value) || 10;
                modeSettings.numCheeses = parseInt(document.getElementById('numCheesesReihenfolge')?.value) || 6;
                break;

            case 'fangen':
                modeSettings.trials = parseInt(document.getElementById('trialsFangen')?.value) || 10;
                modeSettings.goalWidth = parseInt(document.getElementById('goalWidth')?.value) || 20;
                modeSettings.tor = document.getElementById('torSelect')?.value || 'Links';
                modeSettings.geschwindigkeit = parseFloat(document.getElementById('geschwindigkeit')?.value) || 0.5;
                break;
                break;

            case 'schwimmen':
                modeSettings.trials = parseInt(document.getElementById('trialsSchwimmen')?.value) || 10;
                modeSettings.speed = parseFloat(document.getElementById('geschwindigkeitSchwimmen')?.value) || 0.5;
                break;
            case 'schiessen':
                modeSettings.trials = parseInt(document.getElementById('trialsSchiessen')?.value) || 10;
                modeSettings.distractorCount = parseInt(document.getElementById('distractorCount')?.value);
                if (isNaN(modeSettings.distractorCount)) modeSettings.distractorCount = 5;
                modeSettings.maxBalloonCount = parseInt(document.getElementById('maxBalloonCount')?.value) || 10;
                modeSettings.balloonSpeed = parseFloat(document.getElementById('balloonSpeed')?.value) || 0.5;
                break;
            case 'autofahren':
                modeSettings.duration = parseInt(document.getElementById('durationAutofahren')?.value) || 60;
                modeSettings.roadSpeed = parseFloat(document.getElementById('roadSpeedAutofahren')?.value) || 0.5;
                modeSettings.targetsDistractorsRatio = parseInt(document.getElementById('targetsDistractorsRatioAutofahren')?.value) || 50;
                modeSettings.stimulusDuration = parseFloat(document.getElementById('stimulusDurationAutofahren')?.value) || 2;
                modeSettings.stimulusInterval = parseFloat(document.getElementById('stimulusIntervalAutofahren')?.value) || 2;
                break;
        }
        this.currentSettings = settings;
    },

    /** Apply settings to the UI */
    applySettingsToUI() {
        if (!this.currentSettings) {
            console.error("[applySettingsToUI] No current settings loaded!");
            return;
        }

        const settings = this.currentSettings;

        // 1. Global fields
        if (document.getElementById('oksSpeed')) document.getElementById('oksSpeed').value = settings.oksSpeed ?? 0.5;
        if (document.getElementById('oksNumDots')) document.getElementById('oksNumDots').value = settings.oksNumDots ?? 40;
        if (document.getElementById('oksDotSize')) document.getElementById('oksDotSize').value = settings.oksDotSize ?? 10;
        if (document.getElementById('aspectRatio')) document.getElementById('aspectRatio').value = settings.aspectRatio ?? '1920x1080';

        // 2. Update Quadranten Grid (common across all modes)
        const currentModeSettings = settings.modes[settings.currentMode];
        if (currentModeSettings && currentModeSettings.grid) {
            for (let row = 1; row <= 5; row++) {
                for (let col = 1; col <= 5; col++) {
                    const id = `square${row}-${col}`;
                    const checkbox = document.getElementById(id);
                    if (checkbox) {
                        checkbox.checked = currentModeSettings.grid[`${row}-${col}`] ?? false;
                    }
                }
            }
        }

        // 3. Global toggles
        if (document.getElementById('background')) document.getElementById('background').checked = currentModeSettings.background ?? false;
        if (document.getElementById('backgroundColorful')) document.getElementById('backgroundColorful').checked = (currentModeSettings.backgroundType === 'colorful');
        if (document.getElementById('backgroundBlackAndWhite')) document.getElementById('backgroundBlackAndWhite').checked = (currentModeSettings.backgroundType === 'blackandwhite');
        if (document.getElementById('oks')) document.getElementById('oks').checked = currentModeSettings.oks ?? false;
        if (document.getElementById('oksLeft')) document.getElementById('oksLeft').checked = (currentModeSettings.oksDirection === 'left');
        if (document.getElementById('oksRight')) document.getElementById('oksRight').checked = (currentModeSettings.oksDirection === 'right');
        if (document.getElementById('fixationDotToggle')) document.getElementById('fixationDotToggle').checked = currentModeSettings.fixationDot ?? true;

        // 4. Mode-specific fields
        const modeConfigs = {
            'normal': ['trialsNormal', 'durationNormal'],
            'aufwaermen': ['dotSpeedAufwaermen'],
            'aufwaermen2': ['durationAufwaermen2'],
            'folgen': ['trialsFolgen', 'durationFolgen', 'dotSpeedFolgen'],
            'punkte': ['trialsPunkte', 'durationPunkte', 'antwortfensterPunkte', 'dotSpeedPunkte', 'punktezahlVier', 'punktezahlFünf', 'punktezahlSechs'],
            'vergleich': ['trialsVergleich', 'durationVergleich', 'antwortfensterVergleich', 'vergleichColumns', 'vergleichRows'],
            'reihenfolge': ['trialsReihenfolge', 'numCheesesReihenfolge'], // Assuming `anzahlKaese` is mapped
            'fangen': ['trialsFangen', 'goalWidth', 'torLinks', 'torRechts', 'geschwindigkeit', 'torSelect'], // Assuming tor selection
            'schwimmen': ['trialsSchwimmen', 'geschwindigkeitSchwimmen'],
            'schiessen': ['trialsSchiessen', 'maxBalloonCount', 'distractorCount', 'balloonSpeed'],
            'autofahren': ['durationAutofahren', 'roadSpeedAutofahren', 'targetsDistractorsRatioAutofahren', 'stimulusDurationAutofahren', 'stimulusIntervalAutofahren']
        };

        for (const [mode, fields] of Object.entries(modeConfigs)) {
            const modeSettings = settings.modes[mode];
            if (!modeSettings) continue;

            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field) return;

                let value = null;

                switch (fieldId) {
                    case 'trialsNormal':
                        value = modeSettings.trials;
                        break;
                    case 'durationNormal':
                        value = modeSettings.duration;
                        break;
                    case 'dotSpeedAufwaermen':
                        value = modeSettings.dotSpeed;
                        break;
                    case 'durationAufwaermen2':
                        value = modeSettings.duration;
                        break;
                    case 'trialsFolgen':
                        value = modeSettings.trials;
                        break;
                    case 'durationFolgen':
                        value = modeSettings.duration;
                        break;
                    case 'dotSpeedFolgen':
                        value = modeSettings.dotSpeed;
                        break;
                    case 'trialsPunkte':
                        value = modeSettings.trials;
                        break;
                    case 'durationPunkte':
                        value = modeSettings.duration;
                        break;
                    case 'antwortfensterPunkte':
                        value = modeSettings.antwortfenster;
                        break;
                    case 'dotSpeedPunkte':
                        value = modeSettings.dotSpeed;
                        break;
                    case 'punktezahlVier':
                        field.checked = modeSettings.punktezahl === 'vier';
                        break;
                    case 'punktezahlFünf':
                        field.checked = modeSettings.punktezahl === 'fünf';
                        break;
                    case 'punktezahlSechs':
                        field.checked = modeSettings.punktezahl === 'sechs';
                        break;
                    case 'trialsVergleich':
                        value = modeSettings.trials;
                        break;
                    case 'durationVergleich':
                        value = modeSettings.duration;
                        break;
                    case 'antwortfensterVergleich':
                        value = modeSettings.antwortfenster;
                        break;
                    case 'vergleichColumns':
                        value = modeSettings.vergleichColumns;
                        break;
                    case 'vergleichRows':
                        value = modeSettings.vergleichRows;
                        break;
                    case 'trialsReihenfolge':
                        value = modeSettings.trials;
                        break;
                    case 'numCheesesReihenfolge':
                        value = modeSettings.numCheeses;
                        break;
                    case 'trialsFangen':
                        value = modeSettings.trials;
                        break;
                    case 'goalWidth':
                        value = modeSettings.goalWidth;
                        break;
                    case 'torLinks':
                        field.checked = modeSettings.tor === 'Links';
                        break;
                    case 'torRechts':
                        field.checked = modeSettings.tor === 'Rechts';
                        break;
                    case 'torSelect':
                        field.value = modeSettings.tor;
                        break;
                    case 'trialsSchwimmen':
                        value = modeSettings.trials;
                        break;
                    case 'geschwindigkeitSchwimmen':
                        value = modeSettings.speed;
                        break;
                    case 'trialsSchiessen':
                        value = modeSettings.trials;
                        break;
                    case 'maxBalloonCountSchiessen':
                        value = modeSettings.maxBalloonCount;
                        break;
                    case 'distractorCountSchiessen':
                        value = modeSettings.distractorCount;
                        break;
                    case 'balloonSpeedSchiessen':
                        value = modeSettings.balloonSpeed;
                        break;
                    case 'durationAutofahren':
                        value = modeSettings.duration;
                        break;
                    case 'roadSpeed':
                        value = modeSettings.roadSpeed;
                        break;
                    case 'targetsDistractorsRatio':
                        value = modeSettings.targetsDistractorsRatio;
                        break;
                    case 'stimulusDuration':
                        value = modeSettings.stimulusDuration;
                        break;
                    case 'stimulusInterval':
                        value = modeSettings.stimulusInterval;
                        break;
                }

                if (value !== null && field.type === 'number') {
                    field.value = value;
                }
            });
        }
    },

    setValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    },

    setChecked(id, value) {
        const el = document.getElementById(id);
        if (el && el.checked !== !!value) {
            el.checked = !!value;
        }
    },

    /** Displays feedback messages for settings actions */
    showProfileFeedback(message, color) {
        console.log('Feedback triggered:', message);
        const existingFeedback = document.querySelector('.profile-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'profile-feedback';
        feedbackElement.textContent = message;
        feedbackElement.style.position = 'fixed';
        feedbackElement.style.fontFamily = 'Montserrat, Arial, sans-serif';
        feedbackElement.style.fontSize = '1vw';
        feedbackElement.style.color = color;
        feedbackElement.style.textAlign = 'center';
        feedbackElement.style.padding = '5px';
        feedbackElement.style.background = 'rgba(255, 255, 255, 0.9)';
        feedbackElement.style.zIndex = '10000';
        feedbackElement.style.width = '10vw';

        const profileSearch = document.getElementById('profileSearch');
        if (profileSearch) {
            const profileSearchRect = profileSearch.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            let topPos = profileSearchRect.bottom + 5;
            if (topPos + 30 > windowHeight) {
                topPos = profileSearchRect.top - 35;
            }
            feedbackElement.style.left = `${profileSearchRect.left + (profileSearchRect.width / 2)}px`;
            feedbackElement.style.top = `${topPos}px`;
            feedbackElement.style.transform = 'translateX(-50%)';
        } else {
            feedbackElement.style.left = '50%';
            feedbackElement.style.top = '50%';
            feedbackElement.style.transform = 'translate(-50%, -50%)';
        }

        document.body.appendChild(feedbackElement);

        setTimeout(() => {
            if (feedbackElement.parentNode) {
                feedbackElement.parentNode.removeChild(feedbackElement);
            }
        }, 2000);
    }
};