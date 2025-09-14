import { soundModule } from '../soundModule.js';
// modules/modes/schiessenMode.js
export class SchiessenMode {
    constructor(settings, uiModule, sessionDataModule, backgroundModule, oksModule, resizeCanvas, onGameEnd) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.backgroundModule = backgroundModule;
        this.oksModule = oksModule;
        this.resizeCanvas = resizeCanvas;
        this.onGameEnd = onGameEnd;
        this.targets = [];
        this.distractors = [];
        this.spawnQueue = [];
        this.timeoutHandles = [];

        this.animationFrame = null;
        this.lastColumn = null;
        this.currentTrial = 0;
        this.trials = this.settings.trials;
        this._blinkInterval = null;

        if (this.settings.background) {
            this.backgroundModule.updateBackgroundSettings(this.settings);
        }
        if (this.settings.oks) {
            const canvas = document.getElementById('oksCanvas');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.resizeCanvas(canvas);
                    this.oksModule.startOKSAnimation(canvas, this.settings);
                });
            });
        }
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startTrial() {

        this.uiModule.resetProgressBars();
        this.uiModule.updateProgressBars(this.currentTrial, this.settings.trials || 10);

        if (this.settings.fixationDot) {
            this.uiModule.showFixationDot();
            let blinkCount = 0;
            this._blinkInterval = setInterval(() => {
                this.uiModule.setFixationDotOpacity(blinkCount % 2 === 0 ? 0 : 1);
                blinkCount++;
                if (blinkCount >= 6) {
                    clearInterval(this._blinkInterval);
                    this._blinkInterval = null;
                    this.uiModule.hideFixationDot();
                    setTimeout(() => {
                        this.startSpawnPhase();
                    }, 500);
                }
            }, 500);
        } else {
            this.startSpawnPhase();
        }
    }

    startSpawnPhase() {
        soundModule.play('stimuli');
        this.prepareSpawnQueue();
        this.animate();
        this.spawnNext();
    }

    prepareSpawnQueue() {
        const totalTargets = this.settings.maxBalloonCount;
        const totalDistractors = this.settings.distractorCount;

        let remainingTargets = totalTargets;
        let remainingDistractors = totalDistractors;

        this.spawnQueue = [];

        while (remainingTargets > 0 || remainingDistractors > 0) {
            const totalRemaining = remainingTargets + remainingDistractors;
            const probabilityTarget = remainingTargets / totalRemaining;

            if (Math.random() < probabilityTarget && remainingTargets > 0) {
                this.spawnQueue.push('target');
                remainingTargets--;
            } else if (remainingDistractors > 0) {
                this.spawnQueue.push('distractor');
                remainingDistractors--;
            }
        }
    }

    spawnNext() {
        if (this.spawnQueue.length === 0) return;

        const type = this.spawnQueue.shift();
        if (type === 'target') {
            this.spawnTarget();
        } else {
            this.spawnDistractor();
        }

        const baseDelay = 1200;
        const speedFactor = this.settings.balloonSpeed || 0.5;
        const adjustedDelay = baseDelay / speedFactor;
        const randomAdjustment = Math.random() * 300;
        const nextDelay = adjustedDelay + randomAdjustment; // ✅ calculate first!

        const timeoutHandle = setTimeout(() => this.spawnNext(), nextDelay); // ✅ then use
        this.timeoutHandles.push(timeoutHandle);
    }

    spawnTarget() {
        const balloon = this.createBalloon('target');
        this.targets.push(balloon);
    }

    spawnDistractor() {
        const airballoon = this.createBalloon('distractor');
        this.distractors.push(airballoon);
    }

    createBalloon(type) {
        const img = document.createElement('img');
        const gameArea = document.getElementById('gameArea');
        const rect = gameArea.getBoundingClientRect();
        const size = 150;

        img.style.position = 'absolute';
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.style.bottom = '-100px';
        img.style.zIndex = 10;
        img.dataset.type = type;
        img.style.top = 'unset';
        img.style.transform = 'none';

        const columns = 10;
        const colWidth = rect.width / columns;
        let col;
        do {
            col = Math.floor(Math.random() * columns);
        } while (col === this.lastColumn);
        this.lastColumn = col;

        img.style.left = (col * colWidth + (colWidth - size) / 2) + 'px';

        if (type === 'target') {
            const idx = Math.floor(Math.random() * 3) + 1;
            img.src = `images/schiessen/balloon${idx}.png`;
            img.addEventListener('click', () => this.destroyBalloon(img));
        } else {
            const idx = Math.floor(Math.random() * 3) + 1;
            img.src = `images/schiessen/airballoon${idx}.png`;
            img.addEventListener('click', () => this.blinkDistractor(img));
        }

        gameArea.appendChild(img);
        return img;
    }

    destroyBalloon(balloon) {
        soundModule.playWithVolume('pop', 0.3);
        balloon.src = 'images/schiessen/pop.png';
        setTimeout(() => {
            this.sessionDataModule.recordTrialData({
                hit: true
            });
            balloon.remove();
            this.targets = this.targets.filter(b => b !== balloon);
            this.checkEndOfTrial();
        }, 200);
    }

    blinkDistractor(airballoon) {
        this.sessionDataModule.recordTrialData({
            hit: false,
            false: true
        });

        soundModule.play('failure');
        let blinkCount = 0;
        const blink = setInterval(() => {
            airballoon.style.visibility = (airballoon.style.visibility === 'hidden') ? 'visible' : 'hidden';
            blinkCount++;
            if (blinkCount >= 6) {
                clearInterval(blink);
                airballoon.style.visibility = 'visible';
                airballoon.dataset.falling = 'true';
            }
        }, 150);
    }

    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        this.moveBalloons();
    }

    moveBalloons() {
        const gameArea = document.getElementById('gameArea');
        const rect = gameArea.getBoundingClientRect();
        const riseSpeed = this.settings.balloonSpeed * 1.5;
        const fallSpeed = this.settings.balloonSpeed * 7.5;

        [...this.targets, ...this.distractors].forEach(balloon => {
            const bottom = parseFloat(balloon.style.bottom);
            const isFalling = balloon.dataset.falling === 'true';

            if (isFalling) {
                balloon.style.bottom = (bottom - fallSpeed) + 'px';
                if (bottom < -100) {
                    balloon.remove();
                    this.distractors = this.distractors.filter(b => b !== balloon);
                }
            } else {
                balloon.style.bottom = (bottom + riseSpeed) + 'px';
                if (bottom > rect.height) {
                    if (balloon.dataset.type === 'target') {
                        this.sessionDataModule.recordTrialData({
                            hit: false,
                            missed: true
                        });
                    }

                    balloon.remove();
                    this.targets = this.targets.filter(b => b !== balloon);
                    this.distractors = this.distractors.filter(b => b !== balloon);
                }
            }
        });

        this.checkEndOfTrial();
    }

    checkEndOfTrial() {
        if (this.targets.length === 0 && this.distractors.length === 0 && this.spawnQueue.length === 0) {
            cancelAnimationFrame(this.animationFrame);
            this.clearAllTimeouts(); this.clearAllTimeouts();
            this.currentTrial++;
            if (this.currentTrial < this.settings.trials) {
                setTimeout(() => this.startTrial(), 1000);
            } else {
                this.uiModule.resetProgressBars();
                setTimeout(() => {
                    (async () => {
                        this.uiModule.clearGameElements();
                        this.sessionDataModule.endSession();
                        await this.sessionDataModule.saveSessionData();
                        if (this.onGameEnd) this.onGameEnd();
                    })();
                }, 1000);
            }
        }
    }

    clearAllTimeouts() {
        this.timeoutHandles.forEach(clearTimeout);
        this.timeoutHandles = [];
    }

    stop() {
        if (this._blinkInterval) {
            clearInterval(this._blinkInterval);
            this._blinkInterval = null;
        }

        cancelAnimationFrame(this.animationFrame);
        this.clearAllTimeouts();
        this.targets = [];
        this.distractors = [];
        this.spawnQueue = [];

        this.uiModule.clearGameElements(); // ✅ Safely clear only dynamic elements

        if (this.settings.oks) {
            const canvas = document.getElementById('oksCanvas');
            if (canvas) {
                this.oksModule.stopOKSAnimation(canvas); // ✅ Always pass the current canvas
            }
        }
        this.backgroundModule.clearBackground();
    }

    handleInput(event) {
        // aktuell nichts tun
    }
}