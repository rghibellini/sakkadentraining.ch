import { soundModule } from '../soundModule.js';

// modules/modes/fangenMode.js
export class FangenMode {
    constructor(settings, uiModule, sessionDataModule, onGameEnd, resizeCanvas, oksModule, backgroundModule) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.onGameEnd = onGameEnd;
        this.resizeCanvas = resizeCanvas;
        this.oksModule = oksModule;
        this.backgroundModule = backgroundModule;

        this.currentTrial = 0;
        this.hits = 0;
        this._timers = [];

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

    async startTrial() {
        if (this.currentTrial >= this.settings.trials) {
            this.sessionDataModule.endSession();
            if (this.onGameEnd) this.onGameEnd();
            return;
        }

        this.uiModule.updateProgressBars(this.currentTrial, this.settings.trials);

        // ✅ Add blinking fixation dot
        this.showFixationBlinking(async () => {
            this.uiModule.createGoal(this.settings.goalWidth, this.settings.tor);
            soundModule.play("stimuli");
            await this.uiModule.showFootballer(this.settings.tor);
            this._startFootballMovement();
        });
    }

    showFixationBlinking(callback) {
        this.uiModule.showFixationDot();
        let blinkCount = 0;

        this._blinkInterval = setInterval(() => {
            this.uiModule.setFixationDotOpacity(blinkCount % 2 === 0 ? 0 : 1);
            blinkCount++;

            if (blinkCount >= 6) {
                clearInterval(this._blinkInterval);
                this.uiModule.hideFixationDot();
                setTimeout(callback, 500); // Continue after blink
            }
        }, 500);
    }

    _startFootballMovement() {
        const gameArea = document.getElementById('gameArea');
        const rect = gameArea.getBoundingClientRect();
        const isLeft = this.settings.tor === 'Links';
        const startX = isLeft ? rect.width - 120 : 120;
        const startY = rect.height / 2 + 50;

        const marginHeight = rect.height * 0.1;
        const targetY = marginHeight + Math.random() * (rect.height - marginHeight * 2 - 50);
        const targetX = isLeft ? -50 : rect.width + 50;

        const speed = 1 + (1000 - 1) * this.settings.geschwindigkeit;
        const distance = Math.abs(targetX - startX);
        const duration = (distance / speed) * 1000;

        const football = this.uiModule.launchFootball(startX, startY, targetX, targetY, duration);

        let hitRecorded = false;

        // 🧠 Define as instance method so handleInput() can delegate to it
        this._handleReaction = (e) => {
            if (hitRecorded) return;
            if (e.type === 'keydown' && e.code !== 'Space') return;

            hitRecorded = true;

            const fbRect = football.getBoundingClientRect();
            const goalRect = gameArea.querySelector('.goal').getBoundingClientRect();
            const centerX = fbRect.left + fbRect.width / 2;
            const centerY = fbRect.top + fbRect.height / 2;
            const isInGoal = centerX >= goalRect.left && centerX <= goalRect.right;

            if (isInGoal) {
                soundModule.playWithVolume('catch', 0.5);
                this.sessionDataModule.recordTrialData({ hit: true });
                this.uiModule.showGoalkeeper(centerY, fbRect.left, fbRect.top, this.settings.tor);
                football.remove();
                setTimeout(() => this._endTrial(), 1000);
            } else {
                soundModule.play('failure');
                this.sessionDataModule.recordTrialData({ hit: false, early: true });
                this.uiModule.showFeedback('Falsch!', 'red');
                setTimeout(() => {
                    football.remove();
                    this._endTrial();
                }, 1000);
            }

            // 🧼 Cleanup
            document.removeEventListener('keydown', this._handleReaction);
            gameArea.removeEventListener('click', this._handleReaction);
        };

        // 🎮 Register input handlers
        document.addEventListener('keydown', this._handleReaction);
        gameArea.addEventListener('click', this._handleReaction);

        football.addEventListener('transitionend', () => {
            if (!hitRecorded) {
                soundModule.play('missed');
                this.sessionDataModule.recordTrialData({ hit: false, missed: true });
                football.remove();
                this._endTrial();
            }

            document.removeEventListener('keydown', this._handleReaction);
            gameArea.removeEventListener('click', this._handleReaction);
        }, { once: true });
    }

    handleInput(event) {
        if (typeof this._handleReaction === 'function') {
            this._handleReaction(event);
        }
    }

    async _endTrial() {
        this._timers.forEach(clearTimeout);
        this._timers = [];
        this.currentTrial++;

        const footballs = document.querySelectorAll('.football');
        footballs.forEach(f => f.remove());

        this.uiModule.updateProgressBars(this.currentTrial, this.settings.trials);

        if (this.currentTrial < this.settings.trials) {
            this._timers.push(setTimeout(() => this.startTrial(), 1000));
        } else {
            this.sessionDataModule.endSession();
            await this.sessionDataModule.saveSessionData();  // ✅ Save data
            this.uiModule.resetProgressBars();
            if (this.onGameEnd) this.onGameEnd();
        }
    }

    stop() {
        this._timers.forEach(clearTimeout);
        this._timers = [];

        document.querySelectorAll('.football').forEach(el => el.remove());
        document.querySelectorAll('.goal-image').forEach(el => el.remove());
        const goal = document.querySelector('.goal');
        if (goal) goal.remove();

        if (this._blinkInterval) {
            clearInterval(this._blinkInterval);
            this._blinkInterval = null;
            this.uiModule.hideFixationDot();
        }

        if (this._handleReaction) {
            document.removeEventListener('keydown', this._handleReaction);
            document.getElementById('gameArea').removeEventListener('click', this._handleReaction);
        }

        this.uiModule.resetProgressBars();

        if (this.settings.oks) this.oksModule.stopOKSAnimation();
        if (this.settings.background) this.backgroundModule.clearBackground();
    }
}