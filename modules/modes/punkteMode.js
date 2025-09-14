import { soundModule } from '../soundModule.js';

export class PunkteMode {
    constructor(settings, uiModule, sessionDataModule, onGameEnd, resizeCanvas, oksModule, backgroundModule) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.onGameEnd = onGameEnd;
        this.resizeCanvas = resizeCanvas;
        this.oksModule = oksModule;
        this.backgroundModule = backgroundModule;
        this.currentTrial = 0;
        this.activeTargets = [];
        this.startTime = null;
        this.trialTimeout = null;
        this.feedbackDelay = 1500;
        this.blinkInterval = null;
        this._inputAccepted = false;
        this.reacted = false;

        if (this.settings.background) {
            this.backgroundModule.updateBackgroundSettings(this.settings);
        }
        if (this.settings.oks) {
            const canvas = document.getElementById('oksCanvas');
            requestAnimationFrame(() => {
                this.resizeCanvas(canvas);
                this.oksModule.startOKSAnimation(canvas, this.settings);
            });
        }
    }

    startTrial() {
        this._inputAccepted = false;
        this.reacted = false;
        this.uiModule.hideFixationDot();
        this.uiModule.hideTarget();
        this.uiModule.clearTargets();
        this.uiModule.resetProgressBars();
        clearTimeout(this.trialTimeout);
        clearInterval(this.blinkInterval);

        // 🟢 Hier neu: Progressbar sofort aktualisieren!
        this.uiModule.updateProgressBars(this.currentTrial, this.settings.trials);

        setTimeout(() => {
            if (this.settings.fixationDot) {
                this.showFixationBlinking(3, () => this.showTargets());
            } else {
                this.showTargets();
            }
        }, this.feedbackDelay);
    }

    showFixationBlinking(numBlinks, callback) {
        this.uiModule.showFixationDot();
        let blinkCount = 0;

        this.blinkInterval = setInterval(() => {
            this.uiModule.setFixationDotOpacity(blinkCount % 2 === 0 ? 0 : 1);
            blinkCount++;

            if (blinkCount >= numBlinks * 2) {
                clearInterval(this.blinkInterval);
                this.uiModule.hideFixationDot();
                setTimeout(() => callback(), 500);
            }
        }, 500);
    }

    showTargets() {
        soundModule.play("stimuli");
        this.targetCount = this.getPunkteCount();
        this.activeTargets = this.generateTargets(this.targetCount);
        this.startTime = Date.now();
        this._inputAccepted = true;

        this.uiModule.displayTargets(this.activeTargets);

        // ✅ Progressbar startet erst jetzt
        this.uiModule.startDurationProgressBar(
            this.settings.duration,
            this.settings.antwortfenster
        );

        this.trialTimeout = setTimeout(() => {
            this.endTrial();
        }, this.settings.duration * 1000);
    }

    getPunkteCount() {
        return 4 + Math.floor(Math.random() * 3); // 4, 5, or 6
    }

    generateTargets(count) {
        const gameArea = document.getElementById('gameArea');
        const rect = gameArea.getBoundingClientRect();
        const targetSize = parseFloat(getComputedStyle(document.getElementById('fixationDot')).width);
        const targets = [];

        const activeQuadrants = Object.entries(this.settings.grid)
            .filter(([_, enabled]) => enabled)
            .map(([quadrant]) => quadrant);

        if (activeQuadrants.length === 0) {
            console.error('No quadrants selected!');
            return targets;
        }

        for (let i = 0; i < count; i++) {
            const quadrant = activeQuadrants[Math.floor(Math.random() * activeQuadrants.length)];
            const [row, col] = quadrant.split('-').map(Number);

            const maxWidth = rect.width * 0.9;
            const maxHeight = rect.height * 0.8;
            const squareWidth = maxWidth / 5;
            const squareHeight = maxHeight / 5;

            const offsetX = (rect.width - maxWidth) / 2;
            const offsetY = (rect.height - maxHeight) / 2;

            const x = offsetX + (col - 1) * squareWidth + Math.random() * (squareWidth - targetSize);
            const y = offsetY + (row - 1) * squareHeight + Math.random() * (squareHeight - targetSize);

            targets.push({ x, y, id: i, clicked: false });
        }
        return targets;
    }

    handleInput(event) {
        if (!this._inputAccepted) return;

        if (event.type === 'click' || (event.type === 'keydown' && event.code === 'Space')) {
            this.registerResponse();
        }
    }

    registerResponse() {
        if (!this._inputAccepted || this.activeTargets.length === 0 || this.reacted) return;

        const reactionTime = Date.now() - this.startTime;
        const correctCount = this.getCorrectCount();

        this.reacted = true;
        this._inputAccepted = false;
        clearTimeout(this.trialTimeout);

        const isCorrectCount = this.targetCount === correctCount;
        const innerhalbFenster = reactionTime <= this.settings.antwortfenster * 1000;

        if (isCorrectCount && innerhalbFenster) {
            this.uiModule.showFeedback('Korrekt!', 'green');
        } else if (isCorrectCount && !innerhalbFenster) {
            soundModule.play("missed");
            this.uiModule.showFeedback('Zu spät...', 'orange');
        } else {
            soundModule.play("failure");
            this.uiModule.showFeedback('Falsch!', 'red');
        }

        this.activeTargets.forEach(target => {
            if (!target.clicked) {
                target.clicked = true;
                this.uiModule.markTargetAsHit(target.id);
            }
        });

        this.endTrial();
    }

    getCorrectCount() {
        const map = { 'vier': 4, 'fünf': 5, 'sechs': 6 };
        return map[this.settings.punktezahl] || 4;
    }

    async endTrial() {
        this._inputAccepted = false;
        this.uiModule.clearTargets();

        const duration = Date.now() - this.startTime;
        const hits = this.activeTargets.filter(t => t.clicked).length;
        const isCorrectCount = this.targetCount === this.getCorrectCount();

        if (!this.reacted) {
            if (isCorrectCount) {
                soundModule.play('failure'); // 👈 Play sound only when user missed and count was wrong
            }
            this.uiModule.showFeedback(
                isCorrectCount ? 'Verpasst...' : 'Korrekt!',
                isCorrectCount ? 'orange' : 'green'
            );
        }

        this.sessionDataModule.recordTrialData({
            hits,
            totalTargets: this.activeTargets.length,
            duration,
            reacted: this.reacted,
            correctCount: isCorrectCount
        });

        this.currentTrial++;

        if (this.currentTrial < this.settings.trials) {
            setTimeout(() => this.startTrial(), 1000);
        } else {
            this.uiModule.resetProgressBars();
            this.sessionDataModule.endSession();
            await this.sessionDataModule.saveSessionData();
            setTimeout(() => {
                this.uiModule.clearGameElements();
                if (this.onGameEnd) this.onGameEnd();
            }, 2500); // warte 1.5 Sekunden für Feedback!
        }
    }

    stop() {
        clearTimeout(this.trialTimeout);
        clearInterval(this.blinkInterval);
        this.uiModule.clearTargets();
        this.uiModule.hideFixationDot();
        this.uiModule.resetProgressBars();
        this._inputAccepted = false;
        if (this.settings.oks) this.oksModule.stopOKSAnimation();
        if (this.settings.background) this.backgroundModule.clearBackground();
    }
}