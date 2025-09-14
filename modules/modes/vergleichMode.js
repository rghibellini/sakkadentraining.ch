import { soundModule } from '../soundModule.js';
import { backgroundModule } from '../backgroundModule.js';

export class VergleichMode {
    constructor(settings, uiModule, sessionDataModule, onGameEnd, resizeCanvas, oksModule) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.onGameEnd = onGameEnd;
        this.resizeCanvas = resizeCanvas;
        this.oksModule = oksModule;
        this.currentTrial = 0;
        this._active = false;
        this.settings.background = false;
        this._boundClickHandler = this.handleClick.bind(this);

        if (this.settings.oks) {
            const canvas = document.getElementById('oksCanvas');
            requestAnimationFrame(() => {
                this.resizeCanvas(canvas);
                this.oksModule.startOKSAnimation(canvas, this.settings);
            });
        }
    }

    startTrial() {
        this._active = true;
        this.uiModule.updateProgressBars(this.currentTrial, this.settings.trials);
        this.uiModule.clearGameElements();
        backgroundModule.clearBackground(); // 👈 force background reset
        this.uiModule.hideFixationDot();
        this.tooLate = false;
        this.hasResponded = false;

        if (this.currentTrial >= this.settings.trials) {
            this.uiModule.resetProgressBars();
            this.sessionDataModule.endSession();
            if (this.onGameEnd) this.onGameEnd();
            return;
        }

        const totalCells = this.settings.vergleichRows * this.settings.vergleichColumns;
        const images = [...this.settings.imagePool];

        const shuffled = [...images].sort(() => Math.random() - 0.5);
        const selectedImages = shuffled.slice(0, totalCells);

        const leftGrid = [...selectedImages];
        const rightGrid = [...selectedImages];

        this.differenceIndex = Math.floor(Math.random() * totalCells);
        let newImg;
        do {
            newImg = images[Math.floor(Math.random() * images.length)];
        } while (newImg === rightGrid[this.differenceIndex]);
        rightGrid[this.differenceIndex] = newImg;

        this.uiModule.displayImageGrids(
            leftGrid,
            rightGrid,
            this.settings.vergleichRows,
            this.settings.vergleichColumns
        );

        soundModule.play("stimuli");

        document.addEventListener('click', this._boundClickHandler);

        this.startTime = Date.now();
        this.uiModule.startDurationProgressBar(
            this.settings.duration,
            this.settings.antwortfenster
        );

        this._antwortfensterTimer = setTimeout(() => {
            this.tooLate = true;
        }, this.settings.antwortfenster * 1000);

        this._durationTimer = setTimeout(() => {
            if (!this.hasResponded) {
                soundModule.play("missed");
                this.uiModule.clearGameElements();
                this.uiModule.showFeedback('Keine Reaktion', 'orange');
                this.recordTrial(null, false, null, 'keineReaktion');
                this.prepareNextTrial();
            }
        }, this.settings.duration * 1000);
    }

    handleClick(event) {
        if (!this._active || this.hasResponded) return;

        const target = event.target.closest('[data-index]');
        if (!target) return;

        const index = parseInt(target.dataset.index);
        const side = target.dataset.side;
        const isCorrect = index === this.differenceIndex;

        const reactionTime = Date.now() - this.startTime;
        this.hasResponded = true;
        clearTimeout(this._antwortfensterTimer);
        clearTimeout(this._durationTimer);

        let verdict = 'falsch';
        let color = 'red';

        if (isCorrect && !this.tooLate) {
            verdict = 'korrekt';
            color = 'green';
            soundModule.playWithVolume('correct', 0.2);
        } else if (isCorrect && this.tooLate) {
            verdict = 'zuSpät';
            color = 'orange';
            soundModule.play('missed');
        } else {
            soundModule.play('failure'); // Only here, not above
        }

        const messages = {
            korrekt: 'Korrekt!',
            zuSpät: 'Zu spät...',
            falsch: 'Falsch!',
            keineReaktion: 'Keine Reaktion'
        };

        this.uiModule.clearGameElements();
        this.uiModule.showFeedback(messages[verdict], color);
        this.recordTrial(index, isCorrect, reactionTime, verdict);
        this.prepareNextTrial();
    }

    recordTrial(clickedIndex, isCorrect, reactionTime, verdict) {
        this.sessionDataModule.recordTrialData({
            trialNumber: this.currentTrial,
            clickedIndex,
            correctIndex: this.differenceIndex,
            isCorrect,
            reactionTime,
            verdict
        });
    }

    async prepareNextTrial() {
        document.removeEventListener('click', this._boundClickHandler);
        setTimeout(async () => {
            this.currentTrial++;
            if (this.currentTrial >= this.settings.trials) {
                this.sessionDataModule.endSession();
                await this.sessionDataModule.saveSessionData();
                setTimeout(() => {
                    if (this.onGameEnd) this.onGameEnd();
                }, 500);
            } else {
                this.startTrial();
            }
        }, 2000);
    }

    stop() {
        this._active = false;
        clearTimeout(this._antwortfensterTimer);
        clearTimeout(this._durationTimer);
        document.removeEventListener('click', this._boundClickHandler);
        this.uiModule.clearGameElements();
        this.uiModule.resetProgressBars();
        if (this.settings.oks) this.oksModule.stopOKSAnimation();
    }

    handleInput() {
        // Not used
    }
}