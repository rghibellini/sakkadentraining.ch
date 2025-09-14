import { soundModule } from '../soundModule.js';
// UPDATED NormalMode.js
export class NormalMode {
    constructor(modeSettings, uiModule, sessionDataModule, onGameEnd, resizeCanvas, oksModule, backgroundModule) {
        this.settings = modeSettings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.onGameEnd = onGameEnd;
        this.resizeCanvas = resizeCanvas;
        this.oksModule = oksModule;
        this.backgroundModule = backgroundModule;

        this.currentTrial = 0;
        this.hits = 0;
        this.reactionTimes = [];
        this.startTime = null;
        this.currentQuadrant = null;
        this.quadrantUsage = {};
        this._timer = null;
        this._targetTimeout = null;
        this._blinkInterval = null;

        for (let row = 1; row <= 5; row++) {
            for (let col = 1; col <= 5; col++) {
                const key = `${row}-${col}`;
                if (this.settings.grid[key]) {
                    this.quadrantUsage[key] = 0;
                }
            }
        }

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
        this.uiModule.hideFixationDot();
        this.uiModule.hideTarget();

        if (this.settings.fixationDot) {
            this.showFixationBlinking();
        } else {
            this._timer = setTimeout(() => this.showTarget(), 3000);
        }
    }

    showFixationBlinking() {
        this.uiModule.showFixationDot();
        let blinkCount = 0;

        this._blinkInterval = setInterval(() => {
            this.uiModule.setFixationDotOpacity(blinkCount % 2 === 0 ? 0 : 1);
            blinkCount++;

            if (blinkCount >= 6) {
                clearInterval(this._blinkInterval);
                this.uiModule.hideFixationDot();
                this._timer = setTimeout(() => this.showTarget(), 500);
            }
        }, 500);
    }

    showTarget() {
        soundModule.play('stimuli');
        this.currentQuadrant = this.selectQuadrant();
        if (!this.currentQuadrant) {
            this.cleanup();
            if (this.onGameEnd) this.onGameEnd();
            return;
        }

        const position = this.getPositionInQuadrant(this.currentQuadrant);
        this.uiModule.setTargetPosition(position.x, position.y);
        this.uiModule.showTarget();
        this.startTime = Date.now();

        this.uiModule.startDurationProgressBar(this.settings.duration);

        this._targetTimeout = setTimeout(() => {
            soundModule.play('missed');
            this.uiModule.hideTarget();
            this.sessionDataModule.recordTrialData({
                hit: false,
                quadrant: this.currentQuadrant
            });
            this.quadrantUsage[this.currentQuadrant]++;
            this.endTrial();
        }, this.settings.duration * 1000);
    }

    selectQuadrant() {
        const availableQuadrants = Object.entries(this.settings.grid)
            .filter(([_, isSelected]) => isSelected)
            .map(([quadrant]) => quadrant);

        if (availableQuadrants.length === 0) return null;

        const minUsage = Math.min(...availableQuadrants.map(q => this.quadrantUsage[q] || 0));
        const leastUsedQuadrants = availableQuadrants.filter(
            q => (this.quadrantUsage[q] || 0) === minUsage
        );
        return leastUsedQuadrants[Math.floor(Math.random() * leastUsedQuadrants.length)];
    }

    getPositionInQuadrant(quadrant) {
        const gameAreaRect = this.uiModule.getGameAreaRect();
        const maxWidth = gameAreaRect.width * 0.9;
        const maxHeight = gameAreaRect.height * 0.8;
        const squareWidth = maxWidth / 5;
        const squareHeight = maxHeight / 5;
        const centerX = gameAreaRect.width / 2 - maxWidth / 2;
        const centerY = gameAreaRect.height / 2 - maxHeight / 2;
        const [row, col] = quadrant.split('-').map(Number);

        const squareLeft = centerX + (col - 1) * squareWidth;
        const squareTop = centerY + (row - 1) * squareHeight;
        const targetPosX = squareLeft + Math.random() * squareWidth;
        const targetPosY = squareTop + Math.random() * squareHeight;

        const targetWidth = this.uiModule.getTargetWidth();
        const targetHeight = this.uiModule.getTargetHeight();
        const finalPosX = Math.max(
            0,
            Math.min(targetPosX - targetWidth / 2, gameAreaRect.width - targetWidth)
        );
        const finalPosY = Math.max(
            0,
            Math.min(targetPosY - targetHeight / 2, gameAreaRect.height - targetHeight)
        );

        return { x: finalPosX, y: finalPosY };
    }

    handleInput(event) {
        if (
            (event.type === 'click' || (event.type === 'keydown' && event.code === 'Space')) &&
            this.uiModule.isTargetVisible()
        ) {
            const reactionTime = Date.now() - this.startTime;
            this.reactionTimes.push(reactionTime);
            this.hits++;
            this.uiModule.updateDisplays();
            this.sessionDataModule.recordTrialData({
                hit: true,
                reactionTime,
                quadrant: this.currentQuadrant
            });
            this.quadrantUsage[this.currentQuadrant]++;
            clearTimeout(this._targetTimeout);
            this.uiModule.hideTarget();
            this.uiModule.resetProgressBars();
            this.endTrial();
        }
    }

    async endTrial() {
        this.currentTrial++;
        this.uiModule.updateProgressBars(this.currentTrial, this.settings.trials);
    
        if (this.currentTrial >= this.settings.trials) {
            this.cleanup();
            this.sessionDataModule.endSession();
            await this.sessionDataModule.saveSessionData();  // ✅ Save data
            if (this.onGameEnd) this.onGameEnd();
        } else {
            setTimeout(() => this.startTrial(), 500);
        }
    }    

    stop() {
        clearTimeout(this._timer);
        clearTimeout(this._targetTimeout);
        clearInterval(this._blinkInterval);
        this.uiModule.hideTarget();
        this.uiModule.hideFixationDot();
        this.uiModule.resetProgressBars();
        if (this.settings.oks) this.oksModule.stopOKSAnimation();
        if (this.settings.background) this.backgroundModule.clearBackground();
    }

    cleanup() {
        this.stop();
    }
}
