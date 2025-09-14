import { soundModule } from '../soundModule.js';
// updatedReihenfolgeMode.js
export class ReihenfolgeMode {
    constructor(settings, uiModule, sessionDataModule, onGameEnd, resizeCanvas, oksModule, backgroundModule) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.onGameEnd = onGameEnd;
        this.resizeCanvas = resizeCanvas;
        this.oksModule = oksModule;
        this.backgroundModule = backgroundModule;
        this.currentTrial = 0;
        this.mouse = null;
        this.cheeses = [];
        this.nextExpected = 1;
        this.misclicks = 0;
        this.trialStartTime = null;
        this.isProcessing = false;
        this._blinkInterval = null;

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
        this.uiModule.updateProgressBars(this.currentTrial, this.settings.trials);
        this.uiModule.clearGameElements();

        if (this.currentTrial >= this.settings.trials) {
            this.uiModule.resetProgressBars();
            this.sessionDataModule.endSession();
            if (this.onGameEnd) this.onGameEnd();
            return;
        }

        // Show blinking fixation dot before trial begins
        this.uiModule.showFixationDot();
        let blinkCount = 0;
        this._blinkInterval = setInterval(() => {
            this.uiModule.setFixationDotOpacity(blinkCount % 2 === 0 ? 0 : 1);
            blinkCount++;
            if (blinkCount >= 6) {
                clearInterval(this._blinkInterval);
                this._blinkInterval = null;
                this.uiModule.hideFixationDot();
                setTimeout(() => this.beginSequence(), 500);
            }
        }, 500);
    }

    beginSequence() {
        this.cheeses = this.uiModule.spawnCheeses(this.settings.numCheeses, this.settings.grid);
        if (this.cheeses.length === 0) {
            setTimeout(() => this.startTrial(), 1000);
            return;
        }

        this.trialStartTime = Date.now();
        this.misclicks = 0;
        this.nextExpected = 1;
        this.isProcessing = false;

        this.uiModule.recenterGameArea(() => {
            this.spawnMouse();
            this.attachClickHandlers();
        });
        soundModule.play('stimuli');
        this.uiModule.startDurationProgressBar(this.settings.duration);
    }

    spawnMouse() {
        const gameArea = document.getElementById('gameArea');
        const mouse = document.createElement('div');
        mouse.className = 'mouse';
        mouse.style.width = '100px';
        mouse.style.height = '100px';
        mouse.style.backgroundImage = 'url("images/reihenfolge/mouse.png")';
        mouse.style.backgroundSize = 'contain';
        mouse.style.position = 'absolute';
        mouse.style.zIndex = '10';
        mouse.style.pointerEvents = 'none';
        mouse.style.left = `${gameArea.offsetWidth / 2 - 50}px`;
        mouse.style.top = `${gameArea.offsetHeight / 2 - 50}px`;
        gameArea.appendChild(mouse);
        console.log('[DEBUG] Mouse position:', mouse.offsetLeft, mouse.offsetTop); // Console log
        this.mouse = mouse;
    }

    attachClickHandlers() {
        this.cheeses.forEach(cheese => {
            cheese.addEventListener('click', () => {
                if (this.isProcessing) return;
                this.handleCheeseClick(cheese);
            });
        });
    }

    async handleCheeseClick(cheese) {
        this.isProcessing = true;
        const clickedNumber = parseInt(cheese.dataset.number);

        if (clickedNumber === this.nextExpected) {
            this.animateMouseTo(cheese, async () => {
                cheese.remove();
                setTimeout(() => {
                    this.uiModule.showFeedbackIcon(this.mouse, '❤', 'green', 5);
                }, 50);
                this.nextExpected++;
                if (this.nextExpected > this.cheeses.length) {
                    soundModule.playWithVolume("mouse", 0.5);
                    const duration = Date.now() - this.trialStartTime;
                    setTimeout(async () => {
                        this.mouse.remove();
                        this.sessionDataModule.recordTrialData({
                            trialNumber: this.currentTrial,
                            duration,
                            misclicks: this.misclicks
                        });
                        this.currentTrial++;
                        if (this.currentTrial >= this.settings.trials) {
                            this.sessionDataModule.endSession();
                            await this.sessionDataModule.saveSessionData();  // ✅ Save data
                            if (this.onGameEnd) this.onGameEnd();
                        } else {
                            setTimeout(() => this.startTrial(), 1000);
                        }
                    }, 500);
                } else {
                    this.isProcessing = false;
                }
            });
        } else {
            soundModule.play("failure");
            this.misclicks++;
            this.uiModule.showFeedbackIcon(this.mouse, '✖', 'red', 10);
            setTimeout(() => {
                this.mouse.style.transition = 'none';
                this.isProcessing = false;
            }, 800);
        }
    }

    animateMouseTo(targetEl, onArrive) {
        const mouse = this.mouse;
        const mouseX = parseFloat(mouse.style.left);
        const mouseY = parseFloat(mouse.style.top);
        const targetX = parseFloat(targetEl.style.left);
        const targetY = parseFloat(targetEl.style.top);

        const dx = targetX - mouseX;
        const dy = targetY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 2000; // pixels per second
        const duration = (distance / speed) * 1000;

        if (dx < 0) mouse.style.transform = 'scaleX(-1)';
        else mouse.style.transform = 'scaleX(1)';

        mouse.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
        mouse.style.left = `${targetX}px`;
        mouse.style.top = `${targetY}px`;

        const transitionHandler = () => {
            mouse.removeEventListener('transitionend', transitionHandler);
            if (onArrive) onArrive();
        };

        mouse.addEventListener('transitionend', transitionHandler);
    }

    stop() {
        if (this._blinkInterval) {
            clearInterval(this._blinkInterval);
            this._blinkInterval = null;
        }

        this.uiModule.clearGameElements();
        this.uiModule.resetProgressBars();
        if (this.settings.oks) this.oksModule.stopOKSAnimation();
        if (this.settings.background) this.backgroundModule.clearBackground();
    }

    handleInput() {
        // Not used
    }
}