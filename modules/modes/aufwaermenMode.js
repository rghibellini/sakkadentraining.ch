import { soundModule } from '../soundModule.js';
// UPDATED AufwaermenMode.js with private fixation dot
export class AufwaermenMode {
    constructor(settings, uiModule, sessionDataModule, onGameEnd, resizeCanvas, oksModule) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.onGameEnd = onGameEnd;
        this.resizeCanvas = resizeCanvas;
        this.oksModule = oksModule;
        this.privateFixationDot = null;
        this.gameArea = document.getElementById('gameArea');
        this.clockPosition = 0;
        this.timers = [];
        this._blinkInterval = null;
    }

    startTrial() {
        const realFixationDot = document.getElementById('fixationDot');
        if (realFixationDot) {
            realFixationDot.style.display = 'none';
        }
        if (this.settings.oks) {
            const canvas = document.getElementById('oksCanvas');
            requestAnimationFrame(() => {
                this.resizeCanvas(canvas);
                this.oksModule.startOKSAnimation(canvas, this.settings);
            });
        }

        setTimeout(() => {
            this.createPrivateFixationDot();
            this.clockPosition = 0;
            this.moveToClockPosition();
        }, 1000);
    }

    createPrivateFixationDot() {
        if (this.privateFixationDot) {
            this.privateFixationDot.remove();
        }
        this.privateFixationDot = document.createElement('div');
        this.privateFixationDot.id = 'privateFixationDot';
        this.privateFixationDot.style.position = 'absolute';
        this.privateFixationDot.style.width = '2vw';
        this.privateFixationDot.style.height = '2vw';
        this.privateFixationDot.style.borderRadius = '50%';
        this.privateFixationDot.style.backgroundColor = 'red';
        this.privateFixationDot.style.opacity = '1';
        this.privateFixationDot.style.zIndex = '20';
        this.gameArea.appendChild(this.privateFixationDot);

        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const centerX = gameAreaRect.width / 2;
        const centerY = gameAreaRect.height / 2;

        this.privateFixationDot.style.left = `${centerX - 16}px`;
        this.privateFixationDot.style.top = `${centerY - 16}px`;
    }

    blinkFixation(times = 3, onComplete) {
        let blinkCount = 0;
        if (this._blinkInterval) clearInterval(this._blinkInterval);

        this._blinkInterval = setInterval(() => {
            this.privateFixationDot.style.opacity = (blinkCount % 2 === 0) ? '0' : '1';
            blinkCount++;
            if (blinkCount >= times * 2) {
                clearInterval(this._blinkInterval);
                this.privateFixationDot.style.opacity = '1';
                if (typeof onComplete === 'function') onComplete();
            }
        }, 500);

        this.timers.push(this._blinkInterval);
    }

    moveToClockPosition() {
        if (this.clockPosition >= 8) {
            this.sessionDataModule.recordTrialResult('success');
            this.onGameEnd();
            return;
        }

        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const centerX = gameAreaRect.width / 2;
        const centerY = gameAreaRect.height / 2;
        const dotWidth = 32;
        const dotHeight = 32;
        const maxWidth = gameAreaRect.width * 0.9;
        const maxHeight = gameAreaRect.height * 0.8;

        const angle = (this.clockPosition * 45) * (Math.PI / 180);
        const targetX = centerX + ((maxWidth / 2) * Math.cos(angle));
        const targetY = centerY - ((maxHeight / 2) * Math.sin(angle));
        const posX = Math.max(0, Math.min(targetX - (dotWidth / 2), gameAreaRect.width - dotWidth));
        const posY = Math.max(0, Math.min(targetY - (dotHeight / 2), gameAreaRect.height - dotHeight));
        const centerPosX = centerX - (dotWidth / 2);
        const centerPosY = centerY - (dotHeight / 2);

        const distance = Math.sqrt(Math.pow(posX - centerPosX, 2) + Math.pow(posY - centerPosY, 2));
        const duration = Math.max(100, (distance / ((this.settings.dotSpeed ** 2) * gameAreaRect.width)) * 1000);

        const t1 = setTimeout(() => {
            this.blinkFixation(3, () => {
                this.privateFixationDot.style.backgroundColor = 'green';
                this.privateFixationDot.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
                this.privateFixationDot.style.left = `${posX}px`;
                this.privateFixationDot.style.top = `${posY}px`;

                const t2 = setTimeout(() => {
                    this.privateFixationDot.style.backgroundColor = 'blue';
                    const t3 = setTimeout(() => {
                        this.privateFixationDot.style.backgroundColor = 'green';
                        this.privateFixationDot.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
                        this.privateFixationDot.style.left = `${centerPosX}px`;
                        this.privateFixationDot.style.top = `${centerPosY}px`;

                        const t4 = setTimeout(() => {
                            this.privateFixationDot.style.backgroundColor = 'red';
                            this.blinkFixation(0, () => {
                                this.clockPosition++;
                                this.moveToClockPosition();
                            });
                        }, duration);
                        this.timers.push(t4);
                    }, 2000);
                    this.timers.push(t3);
                }, duration);
                this.timers.push(t2);
            });
        }, 300);
        this.timers.push(t1);
    }

    stop() {
        this.timers.forEach(clearTimeout);
        this.timers = [];
        if (this._blinkInterval) {
            clearInterval(this._blinkInterval);
            this._blinkInterval = null;
        }
        if (this.privateFixationDot && this.privateFixationDot.parentNode) {
            this.privateFixationDot.remove();
            this.privateFixationDot = null;
        }
        if (this.oksModule) {
            this.oksModule.stopOKSAnimation();
        }
    }

    pause() { this.stop(); }
    resume() { this.startTrial(); }
    end() { this.stop(); }
    handleInput() {}
}
