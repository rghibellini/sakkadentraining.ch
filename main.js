// main.js
import { profileModule } from './modules/profileModule.js';
import { settingsModule, DEFAULT_SETTINGS } from './modules/settingsModule.js';
import { AufwaermenMode } from './modules/modes/aufwaermenMode.js';
import { Aufwaermen2Mode } from './modules/modes/aufwaermen2Mode.js';
import { NormalMode } from './modules/modes/normalMode.js';
import { FolgenMode } from './modules/modes/folgenMode.js';
import { PunkteMode } from './modules/modes/punkteMode.js';
import { VergleichMode } from './modules/modes/vergleichMode.js';
import { ReihenfolgeMode } from './modules/modes/reihenfolgeMode.js';
import { FangenMode } from './modules/modes/fangenMode.js';
import { SchwimmenMode } from './modules/modes/schwimmenMode.js';
import { SchiessenMode } from './modules/modes/schiessenMode.js';
import { AutofahrenMode } from './modules/modes/autofahrenMode.js';
import { oksModule } from './modules/oksModule.js';
import { backgroundModule } from './modules/backgroundModule.js';
import { sessionDataModule } from './modules/sessionDataModule.js';
import { userInteractionModule } from './modules/userInteractionModule.js';
import { initDataInterface } from './modules/dataInterfaceModule.js';
import { uiModule } from './modules/uiModule.js';
import { soundModule } from './modules/soundModule.js';
import { initProfileOverlay } from './modules/userInteractionModule.js';

let currentModeInstance = null;
let isGameActive = false;
let isPaused = false;
let logoutBtn;

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements (these may not exist on login page)
    const startBtn = document.getElementById('startBtn');
    const saveBtn = document.getElementById('saveSettings');
    const menuBtn = document.getElementById('settingsBtn');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const closeSettingsBtn = document.getElementById('closeSettingsPanel');
    const exitGameBtn = document.getElementById("exitGameBtn");

    const mainContent = document.querySelector('.main-content');
    const gameArea = document.getElementById('gameArea');
    const logo = document.getElementById('logoMain');
    const modeButtonBar = document.getElementById('modeButtonBar');
    const modeButtons = modeButtonBar?.querySelectorAll('.mode-btn');

    const instructionsBtn = document.getElementById('instructionsBtn');
    const instructionPanel = document.getElementById('instructionPanel');
    const backToMain = document.getElementById('backToMain');
    const prevStep = document.getElementById('prevStep');
    const nextStep = document.getElementById('nextStep');
    const dataBtn = document.getElementById('dataBtn');
    logoutBtn = document.getElementById('logoutBtn');
    const closeProfilePanel = document.getElementById('closeProfilePanel');
    const profilePanel = document.getElementById('profileOverlay');

    const profileDrawer = document.getElementById('profileDrawer');
    const profileForm = document.getElementById('profileForm');
    const profileNameInput = document.getElementById('profileName');
    const colorGrid = document.getElementById('colorGrid');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn'); // if you have an X in the drawer

    initProfileOverlay();

    if (colorGrid) {
        colorGrid.querySelectorAll('.color-swatch').forEach(btn => {
            const hex = btn.getAttribute('data-color');
            if (hex) btn.style.background = hex;
            btn.addEventListener('click', () => {
                colorGrid.querySelectorAll('.color-swatch').forEach(b => {
                    b.setAttribute('aria-checked', b === btn ? 'true' : 'false');
                    b.style.borderColor = (b === btn) ? 'var(--text, #111827)' : 'transparent';
                });
            });
        });
    }

    if (sessionStorage.getItem('playLoginSound') === 'true') {
        const loginSound = new Audio('sounds/login.mp3');
        loginSound.play().catch(() => { });
        sessionStorage.removeItem('playLoginSound');
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('login/logout.php', { method: 'GET' });
            window.location.reload();
        });
    }

    if (menuBtn && settingsOverlay && closeSettingsBtn) {
        menuBtn.addEventListener('click', () => {
            settingsOverlay.style.display = 'flex';
            pauseGame(); // optional
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsOverlay.style.display = 'none';
            resumeGame(); // optional
        });
    }

    if (closeProfilePanel) {
        closeProfilePanel.addEventListener('click', () => {
            profilePanel.style.display = 'none';
        });
    }

    if (profilePanel) {
        profilePanel.addEventListener('click', (e) => {
            // Only close if the user clicked directly on the dark overlay, not inside the inner panel
            if (e.target === profilePanel) {
                profilePanel.style.display = 'none';
            }
        });
    }

    // Close settings when clicking outside
    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', (e) => {
            if (e.target === settingsOverlay) {
                settingsOverlay.style.display = 'none';
                resumeGame();
            }
        });
    }

    // Close data overlay when clicking outside
    const dataOverlay = document.getElementById('dataOverlay');
    if (dataOverlay) {
        dataOverlay.addEventListener('click', (e) => {
            if (e.target === dataOverlay) {
                dataOverlay.style.display = 'none';
            }
        });
    }

    if (gameArea) {
        // Prevent right-click menu
        gameArea.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            // Simulate a left-click event
            const syntheticClick = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0, // Left click
                clientX: e.clientX,
                clientY: e.clientY
            });

            e.target.dispatchEvent(syntheticClick);
        });
    }

    if (!settingsModule.currentSettings) {
        settingsModule.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }

    if (modeButtons) {
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === 'normal') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    if (modeButtons) {
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                if (!settingsModule.currentSettings) {
                    settingsModule.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                }
                settingsModule.currentSettings.currentMode = mode;

                modeButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                updateDisplay(); // 👈 add this line
            });
        });
    }

    if (addProfileBtn) {
        addProfileBtn.addEventListener('click', () => {
            // open overlay (already opened by openProfilePanel), now open drawer
            if (profileDrawer) profileDrawer.style.display = 'block';
            if (profileNameInput) profileNameInput.value = '';

            // reset color selection: remove all checks, then select the default
            if (colorGrid) {
                colorGrid.querySelectorAll('.color-swatch').forEach(btn => {
                    btn.setAttribute('aria-checked', 'false');
                    btn.style.borderColor = 'transparent';
                });
                const defaultBtn = colorGrid.querySelector('.color-swatch[aria-checked="true"]')
                    || colorGrid.querySelector('.color-swatch[data-color="#3B82F6"]');
                if (defaultBtn) {
                    defaultBtn.setAttribute('aria-checked', 'true');
                    defaultBtn.style.borderColor = 'var(--text, #111827)';
                }
            }

            // clear any "edit mode" id we might store on the form dataset
            if (profileForm) {
                profileForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = (profileNameInput?.value || '').trim();
                    const color = colorGrid?.querySelector('.color-swatch[aria-checked="true"]')?.getAttribute('data-color');

                    if (!name) { alert('Bitte einen Namen eingeben.'); return; }
                    if (!color) { alert('Bitte eine Farbe wählen.'); return; }

                    const editId = profileForm.dataset.editId; // we set this in the edit flow
                    if (editId) {
                        await profileModule.saveProfile({ id: editId, name, color });
                    } else {
                        await profileModule.createProfileWithColor(name, color);
                    }

                    if (profileDrawer) profileDrawer.style.display = 'none';
                });
            }

            // focus name
            if (profileNameInput) profileNameInput.focus();
        });
    }

    function updateDisplay() {
        const selectedMode = settingsModule.currentSettings?.currentMode || 'normal';

        const get = (id) => document.getElementById(id);
        const show = (...ids) => ids.forEach(id => get(id)?.style && (get(id).style.display = 'block'));
        const hide = (...ids) => ids.forEach(id => get(id)?.style && (get(id).style.display = 'none'));

        // Reset everything
        hide(
            'fixationDotGroup', 'backgroundTypeGroup', 'oksDirectionGroup', 'punktezahlGroup',
            'geschwOKSGroup', 'anzahlOKSPunkteGroup', 'grosseOKSGroup', 'seitenverhaltnisGroup',
            'hintergrundGroup', 'vergleichGridGroup', 'trialsNormalGroup', 'durationNormalGroup',
            'trialsFolgenGroup', 'durationFolgenGroup', 'dotSpeedFolgenGroup',
            'dotSpeedAufwaermenGroup', 'durationAufwaermen2Group', 'trialsPunkteGroup',
            'durationPunkteGroup', 'antwortfensterPunkteGroup', 'dotSpeedPunkteGroup',
            'trialsVergleichGroup', 'durationVergleichGroup', 'antwortfensterVergleichGroup',
            'quadrantGridGroup', 'trialsReihenfolgeGroup', 'numCheesesReihenfolgeGroup',
            'torGroup', 'goalWidthGroup', 'geschwindigkeitGroup', 'trialsFangenGroup', 'trialsSchwimmenGroup',
            'geschwindigkeitSchwimmenGroup', 'maxBalloonBalloonCountGroup', 'distractorBalloonGroup', 'geschwindigkeitBallonGroup',
            'trialsSchiessenGroup', 'durationAutofahrenGroup', 'roadSpeedAutofahrenGroup', 'targetsDistractorsRatioAutofahrenGroup',
            'stimulusDurationAutofahrenGroup', 'stimulusIntervalAutofahrenGroup'
        );

        // Show basic groups for mode
        if (selectedMode === 'normal') {
            show('fixationDotGroup', 'trialsNormalGroup', 'durationNormalGroup', 'hintergrundGroup', 'quadrantGridGroup');
        } else if (selectedMode === 'folgen') {
            show('trialsFolgenGroup', 'durationFolgenGroup', 'dotSpeedFolgenGroup', 'hintergrundGroup', 'quadrantGridGroup');
        } else if (selectedMode === 'aufwaermen') {
            show('dotSpeedAufwaermenGroup', 'hintergrundGroup');
        } else if (selectedMode === 'aufwaermen2') {
            show('durationAufwaermen2Group', 'hintergrundGroup');
        } else if (selectedMode === 'punkte') {
            show('punktezahlGroup', 'trialsPunkteGroup', 'durationPunkteGroup', 'antwortfensterPunkteGroup', 'dotSpeedPunkteGroup', 'hintergrundGroup', 'quadrantGridGroup');
        } else if (selectedMode === 'vergleich') {
            show('trialsVergleichGroup', 'durationVergleichGroup', 'antwortfensterVergleichGroup', 'vergleichGridGroup');
        } else if (selectedMode === 'reihenfolge') {
            show('trialsReihenfolgeGroup', 'numCheesesReihenfolgeGroup', 'hintergrundGroup', 'quadrantGridGroup');
        } else if (selectedMode === 'fangen') {
            show('torGroup', 'goalWidthGroup', 'geschwindigkeitGroup', 'trialsFangenGroup', "hintergrundGroup");
        } else if (selectedMode === 'schwimmen') {
            show('trialsSchwimmenGroup', 'geschwindigkeitSchwimmenGroup', 'hintergrundGroup', 'quadrantGridGroup');
        } else if (selectedMode === 'schiessen') {
            show('trialsSchiessenGroup', 'maxBalloonBalloonCountGroup', 'distractorBalloonGroup', 'geschwindigkeitBallonGroup', 'hintergrundGroup');
        } else if (selectedMode === 'autofahren') {
            show('durationAutofahrenGroup', 'roadSpeedAutofahrenGroup', 'targetsDistractorsRatioAutofahrenGroup', 'stimulusDurationAutofahrenGroup', 'stimulusIntervalAutofahrenGroup');
        }

        // 🟢 NEW: Use LIVE CHECKBOX STATE to control visibility
        const isBackgroundChecked = !!get('background')?.checked;
        const isOKSChecked = !!get('oks')?.checked;

        // 🧹 ZUERST alles verstecken
        hide('backgroundTypeGroup', 'oksDirectionGroup', 'geschwOKSGroup', 'anzahlOKSPunkteGroup', 'grosseOKSGroup');

        // 🧹 DANN basierend auf aktuellem Zustand sichtbar machen
        if (isBackgroundChecked) {
            show('backgroundTypeGroup');
        }
        if (isOKSChecked) {
            show('oksDirectionGroup', 'geschwOKSGroup', 'anzahlOKSPunkteGroup', 'grosseOKSGroup');
        }

        setTimeout(() => {
            if (typeof updateDisplay === 'function') {
                updateDisplay();
            }
        }, 50);
    }

    // Check if we're on the training page (mainContent exists) vs. login page
    if (!mainContent) {
        // On login page, skip profile loading and other initialization
        return;
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const oksCanvas = document.getElementById('oksCanvas');
            const gameArea = document.getElementById('gameArea');

            const exitGameBtn = document.getElementById('exitGameBtn');
            if (exitGameBtn) exitGameBtn.style.display = 'block';

            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.style.display = 'none';

            const settingsBtn = document.getElementById('settingsBtn');
            if (settingsBtn) settingsBtn.style.display = 'none';

            const openProfilePanel = document.getElementById('openProfilePanel');
            if (openProfilePanel) openProfilePanel.style.display = 'none';

            stopCurrentMode();

            if (!settingsModule.currentSettings) {
                settingsModule.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            }

            settingsModule.updateSettingsFromUI();
            const modeName = settingsModule.currentSettings.currentMode;
            modeButtons?.forEach(btn => {
                if (btn.dataset.mode === modeName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            const globalSettings = settingsModule.currentSettings;
            const modeSettings = {
                ...JSON.parse(JSON.stringify(globalSettings.modes[modeName])),
                oksSpeed: globalSettings.oksSpeed,
                oksNumDots: globalSettings.oksNumDots,
                oksDotSize: globalSettings.oksDotSize
            };

            if (modeSettings.background) {
                backgroundModule.updateBackgroundSettings(modeSettings);
            } else {
                backgroundModule.clearBackground();
            }

            // Step 1: Make game area visible
            gameArea.style.display = 'block';
            document.body.classList.add('game-active');

            // Step 2: Wait for the layout to fully apply, then size the canvas
            requestAnimationFrame(() => {
                const rect = gameArea.getBoundingClientRect();

                const dpr = window.devicePixelRatio || 1;
                oksCanvas.width = Math.floor(rect.width * dpr);
                oksCanvas.height = Math.floor(rect.height * dpr);
                oksCanvas.style.width = `${rect.width}px`;
                oksCanvas.style.height = `${rect.height}px`;

                console.log("✅ Canvas size set to match gameArea:", rect.width, rect.height);

                // Step 4: Start the training mode
                currentModeInstance = createModeInstance(modeName, modeSettings);
                userInteractionModule.registerInputHandlers(currentModeInstance);
                sessionDataModule.startSession(profileModule.getCurrentProfile()?.id, modeName);

                if (modeName === 'aufwaermen2') {
                    if (modeSettings.background) backgroundModule.updateBackgroundSettings(modeSettings);
                    if (modeSettings.oks) oksModule.startOKSAnimation(oksCanvas, modeSettings);
                    currentModeInstance.start?.(); // only Aufwärmen2 has start()
                } else if (modeName === 'aufwaermen') {
                    currentModeInstance.startTrial?.(); // Aufwärmen uses startTrial()
                } else {
                    uiModule.updateProgressBars(0, modeSettings.trials);
                    currentModeInstance.startTrial?.();
                }

                // Step 5: Hide UI buttons and logo
                isGameActive = true;
                startBtn.style.display = 'none';
                logo.style.display = 'none';
            });
        });
    }

    // Save settings handler
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            stopCurrentMode();
            settingsModule.updateSettingsFromUI();

            const modeName = settingsModule.currentSettings.currentMode;
            const profile = profileModule.getCurrentProfile();

            if (profile) {
                const profileId = profile.id;
                const profileName = profile.name;
                await settingsModule.saveSettings(profileId, settingsModule.currentSettings, profileName);
                console.log(`[SAVE] Settings for mode '${modeName}' saved to profile '${profileName}'`);
            } else {
                console.warn('[SAVE] Kein Profil ausgewählt – Einstellungen nicht gespeichert');
            }

            // ✅ CLOSE the new overlay panel
            document.getElementById('settingsOverlay').style.display = 'none';
            resumeGame(); // Optional
            endGame();
        });
    }

    // Instructions handler
    if (instructionsBtn && instructionPanel) {
        instructionsBtn.addEventListener('click', () => {
            mainContent.classList.add('instructions-active');
            instructionPanel.classList.add('active');
            displayInstructionStep(0);
        });
    }

    if (backToMain) {
        backToMain.addEventListener('click', () => {
            mainContent.classList.remove('instructions-active');
            instructionPanel.classList.remove('active');
        });
    }

    if (prevStep) {
        prevStep.addEventListener('click', () => {
            const currentStep = parseInt(instructionPanel.dataset.step || 0);
            if (currentStep > 0) {
                displayInstructionStep(currentStep - 1);
            }
        });
    }

    if (nextStep) {
        nextStep.addEventListener('click', () => {
            const currentStep = parseInt(instructionPanel.dataset.step || 0);
            const currentMode = settingsModule.currentSettings?.currentMode || 'normal';
            const steps = modeInstructions[currentMode];
            if (currentStep < steps.length - 1) {
                displayInstructionStep(currentStep + 1);
            }
        });
    }

    // Data button handler
    if (dataBtn) {
        dataBtn.addEventListener('click', async () => {
            injectDataInterfaceStyles();

            // Load Chart.js dynamically
            try {
                await loadChartJs();
            } catch (err) {
                console.error('❌ Failed to load Chart.js:', err);
                alert('Fehler beim Laden der Diagrammkomponente.');
                return;
            }

            renderDataInterface();
            initDataInterface();
            document.getElementById('dataOverlay').style.display = 'flex';
        });
    }

    // EndGame button handler
    if (exitGameBtn) {
        exitGameBtn.addEventListener('click', () => {
            console.log('⛔ Exit button clicked');
            stopCurrentMode();
            endGame(); // existing function to reset UI
        });
    }

    const bg = document.getElementById('background');
    const oks = document.getElementById('oks');

    bg?.addEventListener('change', () => {
        settingsModule.currentSettings.modes[settingsModule.currentSettings.currentMode].background = bg.checked;
        updateDisplay();
    });

    oks?.addEventListener('change', () => {
        settingsModule.currentSettings.modes[settingsModule.currentSettings.currentMode].oks = oks.checked;
        updateDisplay();
    });

    const hilfeBtn = document.getElementById('hilfeBtn');
    if (hilfeBtn) {
        hilfeBtn.addEventListener('click', () => {
            const overlay = document.getElementById('hilfeOverlay');
            overlay.style.display = (overlay.style.display === 'none') ? 'block' : 'none';
        });
    }

    // Close help overlay when clicking anywhere on it
    // Close help overlay on any click outside the help button
    document.addEventListener('click', (e) => {
        const overlay = document.getElementById('hilfeOverlay');
        const helpBtn = document.getElementById('hilfeBtn');

        // If overlay is open and the click was NOT on the help button, close it
        if (overlay && overlay.style.display === 'block' && !helpBtn.contains(e.target)) {
            overlay.style.display = 'none';
        }
    });
    updateDisplay();

    // === THEME: init + wiring ===
    function applyTheme(theme) {
        document.body.classList.toggle('theme-dark', theme === 'dark');

        // keep the switch's ARIA state and checked state in sync
        const label = document.querySelector('label.theme-toggle[role="switch"]');
        if (label) label.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');

        const toggle = document.getElementById('themeToggle');
        if (toggle) toggle.checked = (theme === 'dark');
    }

    function getInitialTheme() {
        // prefer saved value; otherwise system preference
        const saved = localStorage.getItem('app_theme'); // use settingsModule later if you want profile-based
        if (saved === 'light' || saved === 'dark') return saved;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }

    // 1) Apply initial theme
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // 2) Hook up the toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            const next = themeToggle.checked ? 'dark' : 'light';
            applyTheme(next);
            localStorage.setItem('app_theme', next); // swap to settingsModule when ready
        });
    }
});

document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('focus', (e) => {
        e.target.select();
    });
});

// Helper function to create mode instances
function createModeInstance(modeName, modeSettings, onGameEnd = endGame) {
    switch (modeName) {
        case 'aufwaermen':
            return new AufwaermenMode(
                modeSettings,
                uiModule,
                sessionDataModule,
                onGameEnd,
                resizeCanvas,
                oksModule,
                backgroundModule
            );
        case 'aufwaermen2':
            return new Aufwaermen2Mode(
                modeSettings,
                uiModule,
                sessionDataModule,
                backgroundModule,
                oksModule,
                resizeCanvas,
                onGameEnd
            );
        case 'normal':
            return new NormalMode(
                modeSettings,
                uiModule,
                sessionDataModule,
                onGameEnd,
                resizeCanvas,
                oksModule,
                backgroundModule
            );
        case 'folgen':
            return new FolgenMode(modeSettings,
                uiModule,
                sessionDataModule,
                onGameEnd,
                resizeCanvas,
                oksModule,
                backgroundModule
            );
        case 'punkte':
            return new PunkteMode(
                modeSettings,
                uiModule,
                sessionDataModule,
                onGameEnd,
                resizeCanvas,
                oksModule,
                backgroundModule
            );
        case 'vergleich': {
            const rowsInput = document.getElementById('vergleichRows');
            const colsInput = document.getElementById('vergleichColumns');
            const rows = parseInt(rowsInput?.value) || 3;
            const cols = parseInt(colsInput?.value) || 3;

            return new VergleichMode({
                ...modeSettings,
                vergleichRows: rows,
                vergleichColumns: cols,
                imagePool: ITEMS
            },
                uiModule,
                sessionDataModule,
                onGameEnd,
                resizeCanvas,
                oksModule
            );
        }
        case 'reihenfolge':
            return new ReihenfolgeMode({
                ...modeSettings,
                sequenceLength: modeSettings.numCheeses
            },
                uiModule,
                sessionDataModule,
                onGameEnd,
                resizeCanvas,
                oksModule,
                backgroundModule
            );
        case 'fangen':
            return new FangenMode({
                ...modeSettings,
                targetSpeed: modeSettings.geschwindigkeit,
                catchZone: { startX: 0, endX: modeSettings.goalWidth }
            },
                uiModule,
                sessionDataModule,
                onGameEnd,
                resizeCanvas,
                oksModule,
                backgroundModule
            );
        case 'schwimmen':
            return new SchwimmenMode(
                modeSettings,
                uiModule,
                sessionDataModule,
                onGameEnd,
                backgroundModule,
                oksModule,
                resizeCanvas
            );
        case 'schiessen':
            return new SchiessenMode(
                modeSettings,
                uiModule,
                sessionDataModule,
                backgroundModule,
                oksModule,
                resizeCanvas,
                onGameEnd
            );
        case 'autofahren':
            return new AutofahrenMode(
                modeSettings,
                uiModule,
                sessionDataModule,
                onGameEnd,
                oksModule,
                resizeCanvas
            );

        default: throw new Error(`Unknown mode: ${modeName}`);
    }
}

export function resizeCanvas(canvas) {
    const gameArea = document.getElementById('gameArea');
    if (!canvas || !gameArea) return;

    // 🛠️ Round DPR to avoid fractional mismatch
    const rawDPR = window.devicePixelRatio || 1;
    const dpr = Math.ceil(rawDPR * 100) / 100; // e.g. 0.9 → 0.9, 1.25 → 1.25

    const width = gameArea.clientWidth;
    const height = gameArea.clientHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    console.log(`✅ Canvas resized: ${width} x ${height}, DPR: ${dpr}`);
}


function stopCurrentMode() {
    if (currentModeInstance && typeof currentModeInstance.stop === 'function') {
        currentModeInstance.stop();
    }
}

function injectDataInterfaceStyles() {
    if (document.getElementById('dataInterfaceStyle')) return;

    const link = document.createElement('link');
    link.id = 'dataInterfaceStyle';
    link.rel = 'stylesheet';
    link.href = 'dataInterface.css'; // Adjust if you place it somewhere else
    document.head.appendChild(link);
}

function loadChartJs() {
    return new Promise((resolve, reject) => {
        if (window.Chart) return resolve(); // already loaded

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}


function renderDataInterface() {
    const container = document.getElementById('dataInterfaceContent');
    container.innerHTML = `
        <div class="data-overlay-header">
            <button id="closeOverlay" class="close-button">✖</button>
        </div>
        <div class="main-container with-filter-column">
            <div class="left-panel" style="display: flex !important; flex-direction: column !important; height: auto !important; overflow: visible !important;">
                <input id="profileSearch" placeholder="Suche Profil...">
                <ul id="dataProfileList" class="profile-tabs" style="display: block !important; position: static !important; top: auto !important; flex: 1 !important;"></ul>
            </div>
            <div class="middle-panel">
                <div class="mode-tabs">
                    <button class="mode-tab" data-mode="normal">Normal</button>
                    <button class="mode-tab" data-mode="folgen">Folgen</button>
                    <button class="mode-tab" data-mode="punkte">Punkte</button>
                    <button class="mode-tab" data-mode="vergleich">Vergleich</button>
                    <button class="mode-tab" data-mode="reihenfolge">Reihenfolge</button>
                    <button class="mode-tab" data-mode="fangen">Fangen</button>
                    <button class="mode-tab" data-mode="schwimmen">Schwimmen</button>
                    <button class="mode-tab" data-mode="schiessen">Schießen</button>
                    <button class="mode-tab" data-mode="autofahren">Autofahren</button>
                </div>
                <div class="data-content">
                    <div id="session-data"></div>
                </div>
            </div>
            <div class="filter-column">
                <label for="dateFrom">Von:</label>
                <input type="date" id="dateFrom" />
                <label for="dateTo">Bis:</label>
                <input type="date" id="dateTo" />
                <div class="filter-buttons">
                    <button id="applyFilter" title="Filter anwenden">✓</button>
                    <button id="resetFilter" title="Filter zurücksetzen">✖</button>
                </div>
            </div>
        </div>
    `;
    // Hook up all interface behavior
    if (typeof initDataInterface === 'function') initDataInterface();
    setTimeout(() => {
        if (typeof attachDeleteListeners === 'function') attachDeleteListeners();
    }, 0);

    // Close overlay logic
    const overlay = document.getElementById('dataOverlay');
    const closeBtn = document.getElementById('closeOverlay');
    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
        });
    }
}

// Mode instructions (simplified from script.js)
const modeInstructions = {
    normal: [
        {
            text: "Fixieren Sie zu Beginn den blinkenden roten Punkt in der Mitte des Bildschirms",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'red';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute'; // Center within mock-up
                dot.style.left = '50%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        },
        {
            text: "Sobald der rote Fixationspunkt verschwindet, taucht auf dem Bildschirm ein blauer Punkt auf. Drücken Sie so schnell wie möglich einen Knopf, klicken Sie mit der Maus oder drücken Sie auf den Bildschirm",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'blue';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute';
                dot.style.left = '25%';
                dot.style.top = '25%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        }
    ],
    folgen: [
        {
            text: "Fixieren Sie zu Beginn den blinkenden roten Punkt in der Mitte des Bildschirms",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'red';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute'; // Center within mock-up
                dot.style.left = '50%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        },
        {
            text: "Folgen Sie dem Grünen Punkt, während sich dieser bewegt.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                // Main green dot (midpoint between 50%,50% and 25%,25%)
                const mainDot = document.createElement('div');
                mainDot.style.width = '2vw';
                mainDot.style.height = '2vw';
                mainDot.style.background = 'green';
                mainDot.style.borderRadius = '50%';
                mainDot.style.position = 'absolute';
                mainDot.style.left = '37.5%'; // Halfway between 50% and 25%
                mainDot.style.top = '37.5%';  // Halfway between 50% and 25%
                mainDot.style.transform = 'translate(-50%, -50%)';
                container.appendChild(mainDot);

                // Trail dots moving diagonally from 37.5%,37.5% toward 50%,50%
                for (let i = 1; i <= 3; i++) {
                    const trailDot = document.createElement('div');
                    trailDot.style.width = '2vw';
                    trailDot.style.height = '2vw';
                    trailDot.style.background = `rgba(0, 128, 0, ${0.6 - i * 0.2})`; // Fading opacity
                    trailDot.style.borderRadius = '50%';
                    trailDot.style.position = 'absolute';
                    // Linearly interpolate between 37.5% and 50%
                    const leftStep = (50 - 37.5) / 4; // Divide distance into 4 parts (3 trails + end)
                    const topStep = (50 - 37.5) / 4;
                    trailDot.style.left = `${37.5 + i * leftStep}%`;
                    trailDot.style.top = `${37.5 + i * topStep}%`;
                    trailDot.style.transform = 'translate(-50%, -50%)';
                    container.appendChild(trailDot);
                }

                return container;
            }
        },
        {
            text: "Sobald sich der grüne Punkt fertig bewegt hat wird er blau und bleibt stehen. Drücken Sie so schnell wie möglich einen Knopf, klicken Sie mit der Maus oder drücken Sie auf den Bildschirm",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'blue';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute';
                dot.style.left = '25%';
                dot.style.top = '25%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        }
    ],
    aufwaermen: [
        {
            text: "Fixieren Sie zu Beginn den blinkenden roten Punkt in der Mitte des Bildschirms",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'red';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute'; // Center within mock-up
                dot.style.left = '50%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        },
        {
            text: "Folgen Sie dem grünen Punkt während sich dieser bewegt.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                // Main green dot (midpoint moving right from center)
                const mainDot = document.createElement('div');
                mainDot.style.width = '2vw';
                mainDot.style.height = '2vw';
                mainDot.style.background = 'green';
                mainDot.style.borderRadius = '50%';
                mainDot.style.position = 'absolute';
                mainDot.style.left = '62.5%'; // Moving right from 50% toward 75%
                mainDot.style.top = '50%';
                mainDot.style.transform = 'translate(-50%, -50%)';
                container.appendChild(mainDot);

                // Trail dots moving left from 62.5% toward 50% (center)
                for (let i = 1; i <= 3; i++) {
                    const trailDot = document.createElement('div');
                    trailDot.style.width = '2vw';
                    trailDot.style.height = '2vw';
                    trailDot.style.background = `rgba(0, 128, 0, ${0.6 - i * 0.2})`;
                    trailDot.style.borderRadius = '50%';
                    trailDot.style.position = 'absolute';
                    const leftStep = (62.5 - 50) / 4; // Distance from 62.5% to 50%
                    trailDot.style.left = `${62.5 - i * leftStep}%`;
                    trailDot.style.top = '50%';
                    trailDot.style.transform = 'translate(-50%, -50%)';
                    container.appendChild(trailDot);
                }

                return container;
            }
        },
        {
            text: "Ruhen Sie Ihre Augen auf dem blauen Punkt aus, bevor dieser wieder zu seiner Ursprungsposition bewegt und wieder von neuem beginnt.",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'blue';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute';
                dot.style.left = '90%'; // Far left
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        }
    ],
    aufwaermen2: [
        {
            text: "Im Leer-Modus bleibt der Bildschirm vorerst weiss. Hier können Sie die Exploration eines Hintergrunds (farbig oder schwarz-weiss) und/oder OKS verwenden, um sich aufzuwärmen.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                // Add multiple OKS dots
                const dotPositions = [
                    { left: '20%', top: '30%' },
                    { left: '40%', top: '60%' },
                    { left: '60%', top: '40%' },
                    { left: '80%', top: '70%' },
                    { left: '10%', top: '80%' },
                    { left: '50%', top: '90%' },
                    { left: '70%', top: '10%' },
                    { left: '90%', top: '55%' }
                ];

                dotPositions.forEach(pos => {
                    const dot = document.createElement('div');
                    dot.style.width = '1vw'; // Smaller than other dots, matching OKS style
                    dot.style.height = '1vw';
                    dot.style.background = 'rgb(255, 191, 0)'; // OKS orange color
                    dot.style.borderRadius = '50%';
                    dot.style.position = 'absolute';
                    dot.style.left = pos.left;
                    dot.style.top = pos.top;
                    dot.style.transform = 'translate(-50%, -50%)';
                    container.appendChild(dot);
                });

                return container;
            }
        }
    ],
    punkte: [
        {
            text: "Fixieren Sie zu Beginn den blinkenden roten Punkt in der Mitte des Bildschirms",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'red';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute'; // Center within mock-up
                dot.style.left = '50%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        },
        {
            text: "Zählen Sie die Anzahl Punkte und drücken Sie so schnell wie möglich einen Knopf, klicken Sie mit der Maus oder drücken Sie auf den Bildschirm wenn die Anzahl Punkte der Zielzahl entspricht. Wenn dies nicht der Fall ist, dann warten Sie bis zum nächsten Durchgang.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                // Five blue dots scattered across the screen
                const dotPositions = [
                    { left: '20%', top: '30%' },
                    { left: '35%', top: '60%' },
                    { left: '50%', top: '40%' },
                    { left: '65%', top: '70%' },
                    { left: '80%', top: '50%' }
                ];

                dotPositions.forEach(pos => {
                    const dot = document.createElement('div');
                    dot.style.width = '2vw';
                    dot.style.height = '2vw';
                    dot.style.background = 'blue';
                    dot.style.borderRadius = '50%';
                    dot.style.position = 'absolute';
                    dot.style.left = pos.left;
                    dot.style.top = pos.top;
                    dot.style.transform = 'translate(-50%, -50%)';
                    container.appendChild(dot);
                });

                return container;
            }
        },
        {
            text: 'Wenn Sie innerhalb des vorgegebenen Antwortfensters reagieren, gilt die Antwort als "korrekt".',
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';

                const feedback = document.createElement('div');
                feedback.textContent = 'Korrekt!';
                feedback.style.position = 'absolute';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.fontFamily = 'Montserrat, Arial, sans-serif';
                feedback.style.fontSize = '2vw';
                feedback.style.color = 'green';
                feedback.style.zIndex = '10';
                feedback.style.textAlign = 'center';
                feedback.style.padding = '10px';
                feedback.style.background = 'rgba(255, 255, 255, 0.8)';

                container.appendChild(feedback);
                return container;
            }
        },
        {
            text: 'Wenn Sie zwar korrekt reagieren, jedoch das Antwortfenster verpassen, dann gilt die Antwort als "verspätet".',
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';

                const feedback = document.createElement('div');
                feedback.textContent = 'Zu spät...';
                feedback.style.position = 'absolute';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.fontFamily = 'Montserrat, Arial, sans-serif';
                feedback.style.fontSize = '2vw';
                feedback.style.color = 'orange';
                feedback.style.zIndex = '10';
                feedback.style.textAlign = 'center';
                feedback.style.padding = '10px';
                feedback.style.background = 'rgba(255, 255, 255, 0.8)';

                container.appendChild(feedback);
                return container;
            }
        },
        {
            text: 'Wenn Sie falsch antworten gilt die Antwort als "falsch".',
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';

                const feedback = document.createElement('div');
                feedback.textContent = 'Falsch!';
                feedback.style.position = 'absolute';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.fontFamily = 'Montserrat, Arial, sans-serif';
                feedback.style.fontSize = '2vw';
                feedback.style.color = 'red';
                feedback.style.zIndex = '10';
                feedback.style.textAlign = 'center';
                feedback.style.padding = '10px';
                feedback.style.background = 'rgba(255, 255, 255, 0.8)';

                container.appendChild(feedback);
                return container;
            }
        }
    ],
    vergleich: [
        {
            text: "Es werden zwei Gitter mit Bildern angezeigt, die sich in einer Position unterscheiden.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.gap = '5%';

                // Static images from ITEMS array
                const leftGridImages = [
                    'images/items/001-palm tree.png',
                    'images/items/002-hammock.png',
                    'images/items/003-coconut drink.png',
                    'images/items/004-hut.png',
                    'images/items/005-coconut.png',
                    'images/items/006-ice cream.png',
                    'images/items/007-grapes.png',
                    'images/items/008-cocktail.png',
                    'images/items/009-apple.png'
                ];

                const rightGridImages = [...leftGridImages];
                rightGridImages[4] = 'images/items/010-avocado.png'; // Differing item at index 4 (middle)

                // Left Grid
                const leftGrid = document.createElement('div');
                leftGrid.style.width = '40%';
                leftGrid.style.height = '80%';
                leftGrid.style.display = 'grid';
                leftGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                leftGrid.style.gridTemplateRows = 'repeat(3, 1fr)';
                leftGrid.style.gap = '2%';

                leftGridImages.forEach((src) => {
                    const cell = document.createElement('div');
                    cell.style.backgroundImage = `url('${src}')`;
                    cell.style.backgroundSize = '80%';
                    cell.style.backgroundPosition = 'center';
                    cell.style.backgroundRepeat = 'no-repeat';
                    leftGrid.appendChild(cell);
                });

                // Right Grid
                const rightGrid = document.createElement('div');
                rightGrid.style.width = '40%';
                rightGrid.style.height = '80%';
                rightGrid.style.display = 'grid';
                rightGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                rightGrid.style.gridTemplateRows = 'repeat(3, 1fr)';
                rightGrid.style.gap = '2%';

                rightGridImages.forEach((src) => {
                    const cell = document.createElement('div');
                    cell.style.backgroundImage = `url('${src}')`;
                    cell.style.backgroundSize = '80%';
                    cell.style.backgroundPosition = 'center';
                    cell.style.backgroundRepeat = 'no-repeat';
                    rightGrid.appendChild(cell);
                });

                // Vertical Line (optional, mimics game)
                const line = document.createElement('div');
                line.style.width = '2px';
                line.style.height = '80%';
                line.style.background = 'black';
                line.style.position = 'absolute';
                line.style.left = '50%';
                line.style.transform = 'translateX(-50%)';

                container.appendChild(leftGrid);
                container.appendChild(line);
                container.appendChild(rightGrid);

                return container;
            }
        },
        {
            text: "Klicken Sie auf das Bild, dass vom anderen Gitter abweicht. Es spielt dabei keine Rolle, ob die Antwort im linken oder rechten Gitter angeklickt wird.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.gap = '5%';

                // Static images from ITEMS array
                const leftGridImages = [
                    'images/items/001-palm tree.png',
                    'images/items/002-hammock.png',
                    'images/items/003-coconut drink.png',
                    'images/items/004-hut.png',
                    'images/items/005-coconut.png', // Differing item
                    'images/items/006-ice cream.png',
                    'images/items/007-grapes.png',
                    'images/items/008-cocktail.png',
                    'images/items/009-apple.png'
                ];

                const rightGridImages = [...leftGridImages];
                rightGridImages[4] = 'images/items/010-avocado.png'; // Differing item at index 4

                // Left Grid
                const leftGrid = document.createElement('div');
                leftGrid.style.width = '40%';
                leftGrid.style.height = '80%';
                leftGrid.style.display = 'grid';
                leftGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                leftGrid.style.gridTemplateRows = 'repeat(3, 1fr)';
                leftGrid.style.gap = '2%';

                leftGridImages.forEach((src, index) => {
                    const cell = document.createElement('div');
                    cell.style.backgroundImage = `url('${src}')`;
                    cell.style.backgroundSize = '80%';
                    cell.style.backgroundPosition = 'center';
                    cell.style.backgroundRepeat = 'no-repeat';
                    if (index === 4) { // Highlight differing item
                        cell.style.border = '4px dotted #173C56'; // Dark blue dotted border
                    }
                    leftGrid.appendChild(cell);
                });

                // Right Grid
                const rightGrid = document.createElement('div');
                rightGrid.style.width = '40%';
                rightGrid.style.height = '80%';
                rightGrid.style.display = 'grid';
                rightGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                rightGrid.style.gridTemplateRows = 'repeat(3, 1fr)';
                rightGrid.style.gap = '2%';

                rightGridImages.forEach((src, index) => {
                    const cell = document.createElement('div');
                    cell.style.backgroundImage = `url('${src}')`;
                    cell.style.backgroundSize = '80%';
                    cell.style.backgroundPosition = 'center';
                    cell.style.backgroundRepeat = 'no-repeat';
                    if (index === 4) { // Highlight differing item
                        cell.style.border = '4px dotted #173C56'; // Dark blue dotted border
                    }
                    rightGrid.appendChild(cell);
                });

                // Vertical Line
                const line = document.createElement('div');
                line.style.width = '2px';
                line.style.height = '80%';
                line.style.background = 'black';
                line.style.position = 'absolute';
                line.style.left = '50%';
                line.style.transform = 'translateX(-50%)';

                container.appendChild(leftGrid);
                container.appendChild(line);
                container.appendChild(rightGrid);

                return container;
            }
        },
        {
            text: 'Wenn Sie innerhalb des vorgegebenen Antwortfensters reagieren, gilt die Antwort als "korrekt".',
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';

                const feedback = document.createElement('div');
                feedback.textContent = 'Korrekt!';
                feedback.style.position = 'absolute';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.fontFamily = 'Montserrat, Arial, sans-serif';
                feedback.style.fontSize = '2vw';
                feedback.style.color = 'green';
                feedback.style.zIndex = '10';
                feedback.style.textAlign = 'center';
                feedback.style.padding = '10px';
                feedback.style.background = 'rgba(255, 255, 255, 0.8)';

                container.appendChild(feedback);
                return container;
            }
        },
        {
            text: 'Wenn Sie zwar korrekt reagieren, jedoch das Antwortfenster verpassen, dann gilt die Antwort als "verspätet".',
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';

                const feedback = document.createElement('div');
                feedback.textContent = 'Zu spät...';
                feedback.style.position = 'absolute';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.fontFamily = 'Montserrat, Arial, sans-serif';
                feedback.style.fontSize = '2vw';
                feedback.style.color = 'orange';
                feedback.style.zIndex = '10';
                feedback.style.textAlign = 'center';
                feedback.style.padding = '10px';
                feedback.style.background = 'rgba(255, 255, 255, 0.8)';

                container.appendChild(feedback);
                return container;
            }
        },
        {
            text: 'Wenn Sie falsch antworten gilt die Antwort als "falsch".',
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';

                const feedback = document.createElement('div');
                feedback.textContent = 'Falsch!';
                feedback.style.position = 'absolute';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.fontFamily = 'Montserrat, Arial, sans-serif';
                feedback.style.fontSize = '2vw';
                feedback.style.color = 'red';
                feedback.style.zIndex = '10';
                feedback.style.textAlign = 'center';
                feedback.style.padding = '10px';
                feedback.style.background = 'rgba(255, 255, 255, 0.8)';

                container.appendChild(feedback);
                return container;
            }
        }
    ],
    reihenfolge: [
        {
            text: "Fixieren Sie zu Beginn den blinkenden roten Punkt in der Mitte des Bildschirms.",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'red';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute';
                dot.style.left = '50%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        },
        {
            text: "Nach dem Blinken erscheinen auf dem Spielfeld nummerierte Käse.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';
                for (let i = 1; i <= 6; i++) {
                    const cheese = document.createElement('div');
                    cheese.style.width = '5vw';
                    cheese.style.height = '5vw';
                    cheese.style.backgroundImage = 'url("images/reihenfolge/cheese.png")';
                    cheese.style.backgroundSize = 'contain';
                    cheese.style.backgroundRepeat = 'no-repeat';
                    cheese.style.position = 'absolute';
                    cheese.style.left = `${10 + i * 12}%`;
                    cheese.style.top = `${20 + (i % 2) * 30}%`;
                    cheese.style.display = 'flex';
                    cheese.style.alignItems = 'center';
                    cheese.style.justifyContent = 'center';
                    cheese.style.fontWeight = 'bold';
                    cheese.style.fontSize = '1.5vw';
                    cheese.style.color = 'black';
                    cheese.textContent = i;
                    container.appendChild(cheese);
                }
                return container;
            }
        },
        {
            text: "Klicken Sie die Käse in der richtigen Reihenfolge (1 → 2 → 3 usw.) an.",
            visual: () => {
                const container = modeInstructions.reihenfolge[1].visual();
                const mouse = document.createElement('img');
                mouse.src = 'images/reihenfolge/mouse.png';
                mouse.style.width = '6vw';
                mouse.style.position = 'absolute';
                mouse.style.left = '22%';
                mouse.style.top = '55%';
                container.appendChild(mouse);
                return container;
            }
        },
        {
            text: "Nach jedem Klick bewegt sich der Mauszeiger automatisch zum nächsten Käse.",
            visual: () => {
                const container = modeInstructions.reihenfolge[1].visual();
                // Remove cheese 1 and cheese 2
                if (container.children.length >= 2) {
                    container.removeChild(container.children[0]);
                    container.removeChild(container.children[0]); // Always remove first twice
                }

                const mouse = document.createElement('img');
                mouse.src = 'images/reihenfolge/mouse.png';
                mouse.style.width = '6vw';
                mouse.style.position = 'absolute';
                mouse.style.left = '38%';
                mouse.style.top = '28%';
                container.appendChild(mouse);

                const heart = document.createElement('div');
                heart.textContent = '❤';
                heart.style.color = 'green';
                heart.style.fontSize = '3vw';
                heart.style.position = 'absolute';
                heart.style.left = '45%';
                heart.style.top = '25%';
                heart.style.transform = 'translate(-50%, -50%)';
                container.appendChild(heart);

                return container;
            }
        },
        {
            text: "Wenn Sie einen falschen Käse anklicken, wird ein rotes Kreuz angezeigt. Versuchen Sie es erneut.",
            visual: () => {
                const container = modeInstructions.reihenfolge[1].visual();
                // Remove cheese 1 and cheese 2
                if (container.children.length >= 2) {
                    container.removeChild(container.children[0]);
                    container.removeChild(container.children[0]); // Always remove first twice
                }

                // Add the mouse at the position of cheese 2
                const mouse = document.createElement('img');
                mouse.src = 'images/reihenfolge/mouse.png';
                mouse.style.width = '6vw';
                mouse.style.position = 'absolute';
                mouse.style.left = '38%';
                mouse.style.top = '28%';
                container.appendChild(mouse);

                // Add a red cross above the mouse
                const cross = document.createElement('div');
                cross.textContent = '✖';
                cross.style.color = 'red';
                cross.style.fontSize = '3vw';
                cross.style.position = 'absolute';
                cross.style.left = '45%';
                cross.style.top = '25%';
                cross.style.transform = 'translate(-50%, -50%)';
                container.appendChild(cross);

                return container;
            }
        },
        {
            text: "Sobald alle Käse korrekt angeklickt wurden, startet der nächste Durchgang automatisch.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const mouse = document.createElement('img');
                mouse.src = 'images/reihenfolge/mouse.png';
                mouse.style.width = '6vw';
                mouse.style.position = 'absolute';
                mouse.style.left = '50%';
                mouse.style.top = '50%';
                mouse.style.transform = 'translate(-50%, -50%)';

                container.appendChild(mouse);
                return container;
            }
        }
    ],
    fangen: [
        {
            text: "Fixieren Sie zu Beginn den blinkenden roten Punkt in der Mitte des Bildschirms.",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'red';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute';
                dot.style.left = '50%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        },
        {
            text: "Ein Fußballspieler schießt einen Ball quer über das Spielfeld.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const footballer = document.createElement('img');
                footballer.src = 'images/fangen/shoot.png';
                footballer.style.width = '6vw';
                footballer.style.position = 'absolute';
                footballer.style.left = '90%';  // moved to right
                footballer.style.top = '50%';
                footballer.style.transform = 'translate(-50%, -50%)';
                container.appendChild(footballer);

                const ball = document.createElement('img');
                ball.src = 'images/fangen/football.png';
                ball.style.width = '3vw';
                ball.style.position = 'absolute';
                ball.style.left = '70%';  // ball starts near shooter
                ball.style.top = '50%';
                ball.style.transform = 'translate(-50%, -50%)';
                container.appendChild(ball);

                return container;
            }
        },
        {
            text: "Sobald der Ball den Torbereich erreicht, drücken Sie die Leertaste oder klicken Sie auf den Bildschirm, um den Ball zu fangen.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const goal = document.createElement('div');
                goal.style.position = 'absolute';
                goal.style.left = '0%'; // Start directly at the very left
                goal.style.top = '0%'; // Fill from top
                goal.style.width = '15%'; // Width similar to goalWidth (e.g., 20% or 15%)
                goal.style.height = '100%'; // Fill full height
                goal.style.backgroundColor = 'rgba(0, 255, 0, 0.3)'; // Solid green with transparency like game
                container.appendChild(goal);

                const ball = document.createElement('img');
                ball.src = 'images/fangen/football.png';
                ball.style.width = '3vw';
                ball.style.position = 'absolute';
                ball.style.left = '10%'; // Ball inside goal
                ball.style.top = '50%';
                ball.style.transform = 'translate(-50%, -50%)';
                container.appendChild(ball);

                return container;
            }
        },
        {
            text: "Nur wenn sich der Ball im Torbereich befindet, zählt das Fangen als korrekt.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const goal = document.createElement('div');
                goal.style.position = 'absolute';
                goal.style.left = '0%'; // Start directly at the very left
                goal.style.top = '0%'; // Fill from top
                goal.style.width = '15%'; // Width similar to goalWidth (e.g., 20% or 15%)
                goal.style.height = '100%'; // Fill full height
                goal.style.backgroundColor = 'rgba(0, 255, 0, 0.3)'; // Solid green with transparency like game
                container.appendChild(goal);

                const ball = document.createElement('img');
                ball.src = 'images/fangen/football.png';
                ball.style.width = '3vw';
                ball.style.position = 'absolute';
                ball.style.left = '12%'; // ball inside goal
                ball.style.top = '50%';
                ball.style.transform = 'translate(-50%, -50%)';
                container.appendChild(ball);

                const check = document.createElement('div');
                check.textContent = '✔';
                check.style.color = 'green';
                check.style.fontSize = '5vw';
                check.style.position = 'absolute';
                check.style.left = '12%';
                check.style.top = '40%';
                check.style.transform = 'translate(-50%, -50%)';
                container.appendChild(check);

                return container;
            }
        },
        {
            text: "Wenn Sie zu früh oder außerhalb des Torbereichs reagieren, wird ein Fehler angezeigt.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const goal = document.createElement('div');
                goal.style.position = 'absolute';
                goal.style.left = '0%'; // Start directly at the very left
                goal.style.top = '0%'; // Fill from top
                goal.style.width = '15%'; // Width similar to goalWidth (e.g., 20% or 15%)
                goal.style.height = '100%'; // Fill full height
                goal.style.backgroundColor = 'rgba(0, 255, 0, 0.3)'; // Solid green with transparency like game
                container.appendChild(goal);

                const ball = document.createElement('img');
                ball.src = 'images/fangen/football.png';
                ball.style.width = '3vw';
                ball.style.position = 'absolute';
                ball.style.left = '50%'; // ball far away (miss)
                ball.style.top = '70%';
                ball.style.transform = 'translate(-50%, -50%)';
                container.appendChild(ball);

                const cross = document.createElement('div');
                cross.textContent = '✖';
                cross.style.color = 'red';
                cross.style.fontSize = '5vw';
                cross.style.position = 'absolute';
                cross.style.left = '50%';
                cross.style.top = '60%';
                cross.style.transform = 'translate(-50%, -50%)';
                container.appendChild(cross);

                return container;
            }
        },
    ],
    schwimmen: [
        {
            text: "Fixieren Sie zu Beginn den blinkenden roten Punkt in der Mitte des Bildschirms.",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'red';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute';
                dot.style.left = '50%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        },
        {
            text: "Ihre Ente und mehrere andere Enten erscheinen im Wasser.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const yourDuck = document.createElement('img');
                yourDuck.src = 'images/schwimmen/duck.png';
                yourDuck.style.width = '6vw';
                yourDuck.style.position = 'absolute';
                yourDuck.style.left = '50%';
                yourDuck.style.top = '50%';
                yourDuck.style.transform = 'translate(-50%, -50%)';
                container.appendChild(yourDuck);

                const positions = [
                    { left: '50%', top: '20%' }, // top
                    { left: '80%', top: '50%' }, // right
                    { left: '50%', top: '80%' }, // bottom
                    { left: '20%', top: '50%' }  // left
                ];

                positions.forEach(pos => {
                    const enemyDuck = document.createElement('img');
                    enemyDuck.src = 'images/schwimmen/duck_guide.png';
                    enemyDuck.style.width = '5vw';
                    enemyDuck.style.position = 'absolute';
                    enemyDuck.style.left = pos.left;
                    enemyDuck.style.top = pos.top;
                    enemyDuck.style.transform = 'translate(-50%, -50%)';
                    container.appendChild(enemyDuck);
                });

                return container;
            }
        },
        {
            text: "Kurz danach erscheint ein Stück Brot an einer zufälligen Stelle.",
            visual: () => {
                const container = modeInstructions.schwimmen[1].visual();

                const bread = document.createElement('img');
                bread.src = 'images/schwimmen/bread.png';
                bread.style.width = '4vw';
                bread.style.position = 'absolute';
                bread.style.left = '75%';
                bread.style.top = '25%';
                bread.style.transform = 'translate(-50%, -50%)';
                container.appendChild(bread);

                return container;
            }
        },
        {
            text: "Klicken Sie so schnell wie möglich auf das Brot, bevor die Führungsenten es erreichen.",
            visual: () => {
                const container = modeInstructions.schwimmen[2].visual();

                // Move all duck_guide toward the bread
                const ducks = container.querySelectorAll('img[src="images/schwimmen/duck_guide.png"]');
                ducks.forEach(duck => {
                    duck.style.left = '70%';  // Move closer to bread
                    duck.style.top = '30%';   // Adjusted position near bread
                });

                return container;
            }
        },
        {
            text: "Wenn Sie es schaffen, schwimmt Ihre Ente automatisch zum Brot.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const yourDuck = document.createElement('img');
                yourDuck.src = 'images/schwimmen/duck.png';
                yourDuck.style.width = '6vw';
                yourDuck.style.position = 'absolute';
                yourDuck.style.left = '70%';
                yourDuck.style.top = '30%';
                yourDuck.style.transform = 'translate(-50%, -50%)';
                container.appendChild(yourDuck);

                const bread = document.createElement('img');
                bread.src = 'images/schwimmen/bread.png';
                bread.style.width = '4vw';
                bread.style.position = 'absolute';
                bread.style.left = '75%';
                bread.style.top = '25%';
                bread.style.transform = 'translate(-50%, -50%)';
                container.appendChild(bread);

                const check = document.createElement('div');
                check.textContent = '✔';
                check.style.color = 'green';
                check.style.fontSize = '5vw';
                check.style.position = 'absolute';
                check.style.left = '75%';
                check.style.top = '15%';
                check.style.transform = 'translate(-50%, -50%)';
                container.appendChild(check);

                return container;
            }
        },
        {
            text: "Wenn die anderen Enten das Brot zuerst erreichen, endet der Durchgang als Fehler.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const yourDuck = document.createElement('img');
                yourDuck.src = 'images/schwimmen/duck.png';
                yourDuck.style.width = '6vw';
                yourDuck.style.position = 'absolute';
                yourDuck.style.left = '50%';
                yourDuck.style.top = '70%';
                yourDuck.style.transform = 'translate(-50%, -50%)';
                container.appendChild(yourDuck);

                const enemyDuck = document.createElement('img');
                enemyDuck.src = 'images/schwimmen/duck_guide.png';
                enemyDuck.style.width = '5vw';
                enemyDuck.style.position = 'absolute';
                enemyDuck.style.left = '75%';
                enemyDuck.style.top = '25%';
                enemyDuck.style.transform = 'translate(-50%, -50%)';
                container.appendChild(enemyDuck);

                const bread = document.createElement('img');
                bread.src = 'images/schwimmen/bread.png';
                bread.style.width = '4vw';
                bread.style.position = 'absolute';
                bread.style.left = '75%';
                bread.style.top = '25%';
                bread.style.transform = 'translate(-50%, -50%)';
                container.appendChild(bread);

                const cross = document.createElement('div');
                cross.textContent = '✖';
                cross.style.color = 'red';
                cross.style.fontSize = '5vw';
                cross.style.position = 'absolute';
                cross.style.left = '75%';
                cross.style.top = '15%';
                cross.style.transform = 'translate(-50%, -50%)';
                container.appendChild(cross);

                return container;
            }
        }
    ],
    schiessen: [
        {
            text: "Fixieren Sie zu Beginn den blinkenden roten Punkt in der Mitte des Bildschirms.",
            visual: () => {
                const dot = document.createElement('div');
                dot.style.width = '2vw';
                dot.style.height = '2vw';
                dot.style.background = 'red';
                dot.style.borderRadius = '50%';
                dot.style.position = 'absolute';
                dot.style.left = '50%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%, -50%)';
                return dot;
            }
        },
        {
            text: "Mehrere Ballons und Luftballons steigen von unten auf. Klicken Sie nur auf die normalen Ballons, nicht aber auf die Heissluftballons!",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const balloon = document.createElement('img');
                balloon.src = 'images/schiessen/balloon1.png';
                balloon.style.width = '4vw';
                balloon.style.position = 'absolute';
                balloon.style.left = '30%';
                balloon.style.top = '70%';
                balloon.style.transform = 'translate(-50%, -50%)';
                container.appendChild(balloon);

                const airBalloon = document.createElement('img');
                airBalloon.src = 'images/schiessen/airballoon2.png';
                airBalloon.style.width = '5vw';
                airBalloon.style.position = 'absolute';
                airBalloon.style.left = '60%';
                airBalloon.style.top = '40%'; // moved up (was 75%)
                airBalloon.style.transform = 'translate(-50%, -50%)';
                container.appendChild(airBalloon);

                return container;
            }
        },
        {
            text: "Bei korrektem Klick platzt der Ballon.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const pop = document.createElement('img');
                pop.src = 'images/schiessen/pop.png'; // Replaces 💥 with real pop image
                pop.style.width = '6vw';
                pop.style.position = 'absolute';
                pop.style.left = '30%';
                pop.style.top = '70%';
                pop.style.transform = 'translate(-50%, -50%)';
                container.appendChild(pop);

                const airBalloon = document.createElement('img');
                airBalloon.src = 'images/schiessen/airballoon2.png';
                airBalloon.style.width = '5vw';
                airBalloon.style.position = 'absolute';
                airBalloon.style.left = '60%';
                airBalloon.style.top = '40%'; // moved up (was 75%)
                airBalloon.style.transform = 'translate(-50%, -50%)';
                container.appendChild(airBalloon);

                return container;
            }
        },
        {
            text: "Falsche Klicks auf Heissluftballons lassen diese abstürzen.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const fallingBalloon = document.createElement('img');
                fallingBalloon.src = 'images/schiessen/airballoon2.png';
                fallingBalloon.style.width = '5vw';
                fallingBalloon.style.position = 'absolute';
                fallingBalloon.style.left = '60%';
                fallingBalloon.style.top = '80%';
                fallingBalloon.style.transform = 'translate(-50%, -50%)';
                container.appendChild(fallingBalloon);

                const cross = document.createElement('div');
                cross.textContent = '✖';
                cross.style.color = 'red';
                cross.style.fontSize = '5vw';
                cross.style.position = 'absolute';
                cross.style.left = '60%';
                cross.style.top = '70%';
                cross.style.transform = 'translate(-50%, -50%)';
                container.appendChild(cross);

                return container;
            }
        }
    ],
    autofahren: [
        {
            text: "Ein Auto fährt automatisch auf einer zweispurigen Straße. Klicken Sie auf die linke oder rechte Straßenseite oder verwenden Sie die Pfeiltasten, um die Spur zu wechseln.",
            visual: () => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = '100%';
                container.style.height = '100%';

                const road = document.createElement('div');
                road.style.width = '30%';
                road.style.height = '80%';
                road.style.background = 'lightgray';
                road.style.position = 'absolute';
                road.style.left = '35%';
                road.style.top = '10%';

                const car = document.createElement('img');
                car.src = 'images/autofahren/car.png';
                car.style.width = '6vw';
                car.style.position = 'absolute';
                car.style.left = '42%';
                car.style.top = '70%';
                car.style.transform = 'translate(-50%, -50%)';

                container.appendChild(road);
                container.appendChild(car);

                return container;
            }
        },
        {
            text: "Weichen Sie entgegenkommenden Autos aus, indem Sie rechtzeitig die Spur wechseln.",
            visual: () => {
                const container = modeInstructions.autofahren[0].visual();

                // Move the car.png to the right lane (58%)
                const car = container.querySelector('img[src="images/autofahren/car.png"]');
                if (car) {
                    car.style.left = '58%';
                }

                const obstacle = document.createElement('img');
                obstacle.src = 'images/autofahren/othercars/redcar.png';
                obstacle.style.width = '5vw';
                obstacle.style.position = 'absolute';
                obstacle.style.left = '42%'; // obstacle stays on left lane
                obstacle.style.top = '30%';
                obstacle.style.transform = 'translate(-50%, -50%)';

                container.appendChild(obstacle);

                return container;
            }
        },
        {
            text: "Während der Fahrt tauchen Strassenschilder auf der linken oder rechten Seite des Bildschirms auf. Wenn Sie ein STOP-Schild bemerken, klicken Sie dieses so schnell wie möglich an oder drücken Sie die Leertaste.",
            visual: () => {
                const container = modeInstructions.autofahren[0].visual();

                const stopSign = document.createElement('img');
                stopSign.src = 'images/autofahren/stop.png';
                stopSign.style.width = '5vw';
                stopSign.style.position = 'absolute';
                stopSign.style.left = '20%';
                stopSign.style.top = '50%';
                stopSign.style.transform = 'translate(-50%, -50%)';

                container.appendChild(stopSign);

                return container;
            }
        },
        {
            text: "Wenn Sie ein anderes Strassenschild sehen, dürfen Sie nicht darauf reagieren.",
            visual: () => {
                const container = modeInstructions.autofahren[0].visual();

                const wrongSign = document.createElement('img');
                wrongSign.src = 'images/autofahren/distractors/distractor7.png';
                wrongSign.style.width = '5vw';
                wrongSign.style.position = 'absolute';
                wrongSign.style.left = '80%';
                wrongSign.style.top = '50%';
                wrongSign.style.transform = 'translate(-50%, -50%)';

                container.appendChild(wrongSign);

                return container;
            }
        },
        {
            text: "Ziel ist es, die Fahrt ohne Kollisionen bis zum Ende der Durchgangszeit zu überstehen.",
            visual: () => {
                const container = modeInstructions.autofahren[0].visual();

                return container;
            }
        }
    ]
};


function displayInstructionStep(step) {
    const currentMode = settingsModule.currentSettings?.currentMode || 'normal';
    const steps = modeInstructions[currentMode];
    if (!steps || step >= steps.length || step < 0) return;

    const instruction = steps[step];
    const visualContainer = document.getElementById('instructionVisual');
    const textContainer = document.getElementById('instructionText');

    // Clear and update content
    visualContainer.innerHTML = '';
    visualContainer.appendChild(instruction.visual());
    textContainer.textContent = instruction.text;

    const instructionPanel = document.getElementById('instructionPanel');
    instructionPanel.dataset.step = step;

    // 🔁 Show or hide arrows based on step
    document.getElementById('prevStep').style.display = step === 0 ? 'none' : 'inline-block';
    document.getElementById('nextStep').style.display = step === steps.length - 1 ? 'none' : 'inline-block';
}


function pauseGame() {
    if (!isGameActive || isPaused) return;
    isPaused = true;
    if (currentModeInstance && currentModeInstance.pause) currentModeInstance.pause();
    userInteractionModule.removeInputHandlers();
}

function resumeGame() {
    if (!isPaused) return;
    isPaused = false;
    if (currentModeInstance && currentModeInstance.resume) currentModeInstance.resume();
    userInteractionModule.registerInputHandlers(currentModeInstance);
}

function endGame() {
    if (!isGameActive) return;
    soundModule.play("finish");
    isGameActive = false;
    isPaused = false;
    userInteractionModule.removeInputHandlers();
    if (currentModeInstance && currentModeInstance.end) currentModeInstance.end();
    sessionDataModule.endSession();
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('logoMain').style.display = 'block';

    if (logoutBtn) logoutBtn.style.display = 'block';
    document.getElementById('settingsBtn')?.style.setProperty('display', 'block');
    document.getElementById('openProfilePanel')?.style.setProperty('display', 'block');
    document.getElementById('exitGameBtn')?.style.setProperty('display', 'none');

    document.body.classList.remove('game-active');
    uiModule.clearTargets();
    uiModule.clearGameElements();
    oksModule.stopOKSAnimation();
    backgroundModule.clearBackground();
    uiModule.resetProgressBars(); // ✅ add this line if not present

    uiModule.showFixationDot();
}

window.addEventListener('resize', () => {
    const oksCanvas = document.getElementById('oksCanvas');
    const gameArea = document.getElementById('gameArea');

    if (!oksCanvas || !gameArea || !isGameActive) return;

    const rect = gameArea.getBoundingClientRect();

    // Resize canvas to match new size
    oksCanvas.width = Math.floor(rect.width);
    oksCanvas.height = Math.floor(rect.height);
    oksCanvas.style.width = `${rect.width}px`;
    oksCanvas.style.height = `${rect.height}px`;

    console.log("📐 Canvas resized on window resize:", rect.width, rect.height);

    // Restart OKS animation if enabled
    if (settingsModule.currentSettings) {
        const modeName = settingsModule.currentSettings.currentMode;
        const modeSettings = settingsModule.currentSettings.modes[modeName];

        if (modeSettings.oks) {
            oksModule.stopOKSAnimation(oksCanvas);
            oksModule.startOKSAnimation(oksCanvas, modeSettings);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Optional: highlight the active main tab
    const defaultTab = document.querySelector('.main-tab[data-topic="sakkadentraining"]');
    if (defaultTab) defaultTab.classList.add('active');
});

const ITEMS = [
    'images/items/001-palm tree.png',
    'images/items/001-strawberry.png',
    'images/items/002-hammock.png',
    'images/items/002-mineral water.png',
    'images/items/003-coconut drink.png',
    'images/items/003-sun.png',
    'images/items/004-hut.png',
    'images/items/004-steak.png',
    'images/items/005-coconut.png',
    'images/items/005-doughnut.png',
    'images/items/006-ice cream.png',
    'images/items/006-Surfboard.png',
    'images/items/007-grapes.png',
    'images/items/007-umbrella.png',
    'images/items/008-cocktail.png',
    'images/items/008-coral reef.png',
    'images/items/009-apple.png',
    'images/items/009-snorkel.png',
    'images/items/010-avocado.png',
    'images/items/010-wave.png',
    'images/items/011-hamburger.png',
    'images/items/011-stamp.png',
    'images/items/012-beer can.png',
    'images/items/012-tropical fish.png',
    'images/items/013-cherries.png',
    'images/items/013-flip flops.png',
    'images/items/014-bar.png',
    'images/items/014-ice.png',
    'images/items/015-beef.png',
    'images/items/015-flamingo.png',
    'images/items/016-hammock.png',
    'images/items/016-pear.png',
    'images/items/017-orange juice.png',
    'images/items/017-sand castle.png',
    'images/items/018-boat.png',
    'images/items/018-kiwi.png',
    'images/items/019-pancake.png',
    'images/items/019-ticket.png',
    'images/items/020-picture.png',
    'images/items/020-red.png',
    'images/items/021-mojito.png',
    'images/items/021-tiki mask.png',
    'images/items/022-island.png',
    'images/items/022-lemon.png',
    'images/items/023-parrot.png',
    'images/items/023-popsicle.png',
    'images/items/024-flower.png',
    'images/items/024-watermelon.png',
    'images/items/025-avocado.png',
    'images/items/025-shell.png',
    'images/items/026-bucket.png',
    'images/items/026-tomato.png',
    'images/items/027-healthy.png',
    'images/items/027-suitcase.png',
    'images/items/028-apricot.png',
    'images/items/028-dolphin.png',
    'images/items/029-Soft drink.png',
    'images/items/029-treasure chest.png',
    'images/items/030-popsicle.png',
    'images/items/030-turtle.png',
    'images/items/031-coral reef.png',
    'images/items/031-pizza slice.png',
    'images/items/032-shell.png',
    'images/items/032-soda.png',
    'images/items/033-hut.png',
    'images/items/033-snack.png',
    'images/items/034-crab.png',
    'images/items/034-martini.png',
    'images/items/035-beach bag.png',
    'images/items/035-Shrimp.png',
    'images/items/036-coffee cup.png',
    'images/items/036-starfish.png',
    'images/items/037-orange.png',
    'images/items/037-shell.png',
    'images/items/038-dragon fruit.png',
    'images/items/038-life ring.png',
    'images/items/039-jellyfish.png',
    'images/items/039-meat.png',
    'images/items/040-candy.png',
    'images/items/040-cocktail.png',
    'images/items/041-lime juice.png',
    'images/items/041-snorkel gear.png',
    'images/items/042-cocktail.png',
    'images/items/042-flippers.png',
    'images/items/043-pineapple.png',
    'images/items/043-stingray.png',
    'images/items/044-necklace.png',
    'images/items/044-soda can.png',
    'images/items/045-girl.png',
    'images/items/045-rainbow.png',
    'images/items/046-helmet.png',
    'images/items/046-popsicle stick.png',
    'images/items/047-cave.png',
    'images/items/047-pint of beer.png',
    'images/items/048-shark.png',
    'images/items/048-white wine.png',
    'images/items/049-ice lolly.png',
    'images/items/049-orange juice.png',
    'images/items/050-iced tea.png',
    'images/items/050-umbrella.png',
    'images/items/051-apricot.png',
    'images/items/051-barbecue.png',
    'images/items/051-beans.png',
    'images/items/051-bee.png',
    'images/items/051-bird-1.png',
    'images/items/051-bird.png',
    'images/items/051-branch-1.png',
    'images/items/051-branch-2.png',
    'images/items/051-branch.png',
    'images/items/051-bunny.png',
    'images/items/051-butterfly.png',
    'images/items/051-carrot.png',
    'images/items/051-cherries.png',
    'images/items/051-clover.png',
    'images/items/051-easter-egg.png',
    'images/items/051-flower-1.png',
    'images/items/051-flower.png',
    'images/items/051-frappe.png',
    'images/items/051-frog.png',
    'images/items/051-gloves.png',
    'images/items/051-grass.png',
    'images/items/051-ice-cream-1.png',
    'images/items/051-ice-cream-2.png',
    'images/items/051-ice-cream.png',
    'images/items/051-ladybug.png',
    'images/items/051-leaf.png',
    'images/items/051-lemonade.png',
    'images/items/051-milkshake.png',
    'images/items/051-mushroom.png',
    'images/items/051-onion.png',
    'images/items/051-plant-1.png',
    'images/items/051-plant-2.png',
    'images/items/051-plant.png',
    'images/items/051-rain.png',
    'images/items/051-rainbow.png',
    'images/items/051-scissors.png',
    'images/items/051-shovel.png',
    'images/items/051-snail.png',
    'images/items/051-sprout-1.png',
    'images/items/051-sprout.png',
    'images/items/051-strawberry.png',
    'images/items/051-sun.png',
    'images/items/051-sunflower.png',
    'images/items/051-sunglasses.png',
    'images/items/051-tree-1.png',
    'images/items/051-tree-2.png',
    'images/items/051-tree.png',
    'images/items/051-umbrella.png',
    'images/items/051-watering-can.png',
    'images/items/051-whale.png',
    'images/items/051-wheelbarrow.png',
    'images/items/052-treasure map.png',
    'images/items/053-postcard.png',
    'images/items/054-tropical fish.png',
    'images/items/055-watermelon.png',
    'images/items/056-dead fish.png',
    'images/items/057-lizard.png',
    'images/items/058-boy.png',
    'images/items/059-toucan.png',
    'images/items/060-flowers.png',
    'images/items/061-hut.png',
    'images/items/062-shell.png',
    'images/items/063-shell.png',
    'images/items/064-ship wheel.png',
    'images/items/065-temperature.png',
    'images/items/066-Surfboard.png',
    'images/items/067-t-shirt.png',
    'images/items/068-pineapple.png',
    'images/items/069-flower.png',
    'images/items/070-Sunbed.png',
    'images/items/adding-machine.png',
    'images/items/adhesive-tape.png',
    'images/items/batteries.png',
    'images/items/boxes.png',
    'images/items/calculator.png',
    'images/items/calendar.png',
    'images/items/chair.png',
    'images/items/clipboard.png',
    'images/items/clock.png',
    'images/items/coffee-cup.png',
    'images/items/coffee-machine.png',
    'images/items/compact-disc.png',
    'images/items/compass.png',
    'images/items/computer.png',
    'images/items/copier.png',
    'images/items/corrector.png',
    'images/items/cutter.png',
    'images/items/desk.png',
    'images/items/dossier.png',
    'images/items/eraser.png',
    'images/items/files.png',
    'images/items/flip-chart.png',
    'images/items/folder.png',
    'images/items/glue-stick.png',
    'images/items/headphones.png',
    'images/items/highlighter.png',
    'images/items/id-card.png',
    'images/items/lamp.png',
    'images/items/mobile-phone.png',
    'images/items/momentum.png',
    'images/items/notebook.png',
    'images/items/notes.png',
    'images/items/paperclip.png',
    'images/items/pen.png',
    'images/items/pencil-box.png',
    'images/items/pencil.png',
    'images/items/pendrive.png',
    'images/items/printer.png',
    'images/items/push-pin.png',
    'images/items/recycle-bin.png',
    'images/items/rubber-bands.png',
    'images/items/ruler.png',
    'images/items/scissors.png',
    'images/items/sharpener.png',
    'images/items/shredder.png',
    'images/items/stamp.png',
    'images/items/stapler-remover.png',
    'images/items/stapler.png',
    'images/items/tablet.png',
    'images/items/water.png'
];
