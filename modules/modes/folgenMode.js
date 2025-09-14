import { soundModule } from '../soundModule.js';

// folgenMode.js
export class FolgenMode {
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
        this._inputAccepted = true;
        const existingDot = document.getElementById('movingDot');
        if (existingDot) existingDot.remove();
    
        this.uiModule.hideFixationDot();
        this.uiModule.hideTarget();
    
        if (this.settings.fixationDot) {
            this.showFixationBlinking();
        } else {
            this._timer = setTimeout(() => this.animateDotToTarget(), 3000);
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
                this._timer = setTimeout(() => this.animateDotToTarget(), 500);
            }
        }, 500);
    }

    animateDotToTarget() {
        this.currentQuadrant = this.selectQuadrant();
        if (!this.currentQuadrant) {
            this.cleanup();
            if (this.onGameEnd) this.onGameEnd();
            return;
        }

        const position = this.getPositionInQuadrant(this.currentQuadrant);

        this.uiModule.showMovingDot('green');

        const dot = document.getElementById('movingDot');
        if (dot) {
            const currentX = parseFloat(dot.style.left);
            const currentY = parseFloat(dot.style.top);
            const dx = position.x - currentX;
            const dy = position.y - currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const dotSpeed = this.settings.dotSpeedFolgen || 500; // pixels per second
            const duration = distance / dotSpeed;

            dot.style.transition = `left ${duration}s linear, top ${duration}s linear`;
        }

        this.uiModule.animateDotTo(position.x, position.y, () => {
            if (dot) {
                dot.style.backgroundColor = 'blue';
            }
            soundModule.play('stimuli');
            this.startTime = Date.now();
            this.uiModule.startDurationProgressBar(this.settings.duration);

            this._targetTimeout = setTimeout(() => {
                soundModule.play('missed');
                if (dot) dot.style.display = 'none';
                this.sessionDataModule.recordTrialData({
                    hit: false,
                    quadrant: this.currentQuadrant
                });
                this.quadrantUsage[this.currentQuadrant]++;
                this.endTrial();
            }, this.settings.duration * 1000);
        });
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
        const targetPosX = squareLeft + squareWidth / 2;
        const targetPosY = squareTop + squareHeight / 2;

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
            this.startTime &&
            this._inputAccepted
        ) {
            const movingDot = document.getElementById('movingDot');
    
            // Only accept input if the dot is blue
            if (!movingDot || movingDot.style.backgroundColor !== 'blue') return;
    
            this._inputAccepted = false; // ✅ prevent spamming clicks
    
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
            if (movingDot) movingDot.style.display = 'none';
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
    
        this.startTime = null;
        this.currentTrial = 0;
    
        const movingDot = document.getElementById('movingDot');
        if (movingDot) {
            movingDot.remove(); // ✅ full cleanup
        }
    
        this.uiModule.hideFixationDot();
        this.uiModule.resetProgressBars();
    }    

    cleanup() {
        this.stop();
    }
}