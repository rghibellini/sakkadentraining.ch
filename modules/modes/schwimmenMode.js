import { soundModule } from '../soundModule.js';

export class SchwimmenMode {
    constructor(settings, uiModule, sessionDataModule, onGameEnd, backgroundModule, oksModule, resizeCanvas) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.onGameEnd = onGameEnd;
        this.backgroundModule = backgroundModule;
        this.oksModule = oksModule;
        this.resizeCanvas = resizeCanvas;
        this.currentTrial = 0;
        this.isActive = false;

        this.mainDuck = null;
        this.guideDucks = [];
        this.bread = null;
        this.breadPosition = null;
        this.speed = settings.speed || 0.5;
        this.lastBreadPosition = null;
        this._animationFrameId = null;
        this._blinkIntervalId = null;


        if (this.settings.background) {
            this.backgroundModule.updateBackgroundSettings(this.settings);
        }
        if (this.settings.oks) {
            const canvas = document.getElementById('oksCanvas');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.resizeCanvas(canvas); // now guaranteed full screen size
                    this.oksModule.startOKSAnimation(canvas, this.settings);
                });
            });
        }
    }

    async startTrial() {
        this.uiModule.clearGameElements();
        this.uiModule.hideTarget();
        this.uiModule.hideFixationDot();

        if (this.currentTrial === 0 && this.settings.fixationDot) {
            await this.showBlinkingFixation();
        }

        this.spawnMainDuck();
        this.spawnGuideDucks();

        setTimeout(() => this.spawnBread(), 1000);

        this.isActive = true;
        this.uiModule.updateProgressBars(this.currentTrial, this.settings.trials);
    }

    showBlinkingFixation() {
        return new Promise(resolve => {
            this.uiModule.showFixationDot();
            let blinkCount = 0;
            this._blinkIntervalId = setInterval(() => {
                this.uiModule.setFixationDotOpacity(blinkCount % 2 === 0 ? 0 : 1);
                blinkCount++;
                if (blinkCount >= 6) {
                    clearInterval(this._blinkIntervalId);
                    this._blinkIntervalId = null;
                    this.uiModule.hideFixationDot();
                    setTimeout(resolve, 500);
                }
            }, 500);
        });
    }

    spawnMainDuck() {
        const gameArea = document.getElementById('gameArea');
        this.mainDuck = document.createElement('img');
        this.mainDuck.src = 'images/schwimmen/duck.png';
        this.mainDuck.className = 'duck';
        this.mainDuck.style.position = 'absolute';
        this.mainDuck.style.left = '50%';
        this.mainDuck.style.top = '50%';
        this.mainDuck.style.transform = 'translate(-50%, -50%)';
        this.mainDuck.style.zIndex = '5';
        gameArea.appendChild(this.mainDuck);
    }

    spawnGuideDucks() {
        const gameArea = document.getElementById('gameArea');
        const offsets = [
            { x: -50, y: -200 },
            { x: -250, y: -50 },
            { x: -50, y: 100 },
            { x: 150, y: -50 },
        ];

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        this.guideDucks = offsets.map(offset => {
            const duck = document.createElement('img');
            duck.src = 'images/schwimmen/duck_guide.png';
            duck.className = 'duck-guide';
            duck.style.position = 'absolute';
            duck.style.left = `${centerX + offset.x}px`;
            duck.style.top = `${centerY + offset.y}px`;
            duck.style.width = '100px';
            duck.style.height = '100px';
            duck.style.zIndex = '4';
            gameArea.appendChild(duck);
            return duck;
        });
    }

    spawnBread() {
        soundModule.play('stimuli');
        const gameArea = document.getElementById('gameArea');
        const rect = gameArea.getBoundingClientRect();

        const selectedQuadrant = this.selectQuadrant();
        this.lastUsedQuadrant = selectedQuadrant; // ✅ Add this line
        if (!selectedQuadrant) {
            console.warn('No quadrant selected — cannot spawn bread.');
            return;
        }

        const { x, y } = this.getPositionInQuadrant(selectedQuadrant);

        this.bread = document.createElement('img');
        this.bread.src = 'images/schwimmen/bread.png';
        this.bread.className = 'bread';
        this.bread.style.position = 'absolute';
        this.bread.style.left = `${x}px`;
        this.bread.style.top = `${y}px`;
        this.bread.style.width = '5vw';
        this.bread.style.height = 'auto';
        this.bread.style.zIndex = '6';
        gameArea.appendChild(this.bread);

        this.breadShownAt = Date.now(); // ✅ Record bread spawn time
        this.bread.addEventListener('click', () => this.handleHit());

        this._animationFrameId = requestAnimationFrame(() => this.moveDucksTowardBread());
    }

    selectQuadrant() {
        const grid = this.settings.grid || {};
        const availableQuadrants = Object.entries(grid)
            .filter(([_, isSelected]) => isSelected)
            .map(([quadrant]) => quadrant);

        if (availableQuadrants.length === 0) {
            console.warn('No active quadrants selected.');
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableQuadrants.length);
        return availableQuadrants[randomIndex];
    }

    getPositionInQuadrant(quadrant) {
        const gameArea = document.getElementById('gameArea');
        const rect = gameArea.getBoundingClientRect();
        const maxWidth = rect.width * 0.9;
        const maxHeight = rect.height * 0.8;
        const squareWidth = maxWidth / 5;
        const squareHeight = maxHeight / 5;
        const centerX = rect.width / 2 - maxWidth / 2;
        const centerY = rect.height / 2 - maxHeight / 2;
        const [row, col] = quadrant.split('-').map(Number);

        const squareLeft = centerX + (col - 1) * squareWidth;
        const squareTop = centerY + (row - 1) * squareHeight;
        const breadX = squareLeft + Math.random() * squareWidth;
        const breadY = squareTop + Math.random() * squareHeight;

        return { x: breadX, y: breadY };
    }

    moveDucksTowardBread() {
        if (!this.isActive) return;

        const breadX = parseFloat(this.bread.style.left) + 25;
        const breadY = parseFloat(this.bread.style.top) + 25;

        let anyDuckReached = false;

        [...this.guideDucks].forEach(duck => {
            const dx = breadX - (parseFloat(duck.style.left) + 20);
            const dy = breadY - (parseFloat(duck.style.top) + 20);
            const dist = Math.hypot(dx, dy);

            if (dist < 10) {
                anyDuckReached = true;
            } else {
                duck.style.left = `${parseFloat(duck.style.left) + dx * this.speed * 0.01}px`;
                duck.style.top = `${parseFloat(duck.style.top) + dy * this.speed * 0.01}px`;

                // Flip Enten bei Linksbewegung
                if (dx > 0) {
                    duck.style.transform = 'scaleX(-1)';
                } else {
                    duck.style.transform = 'scaleX(1)';
                }
            }
        });

        if (anyDuckReached) {
            this.handleMiss();
        } else {
            requestAnimationFrame(() => this.moveDucksTowardBread());
        }
    }

    handleHit() {
        if (!this.isActive) return;
        this.isActive = false;

        soundModule.playWithVolume("quack", 0.2);
        this.hitPending = true; // Markiere Erfolg
        this.animateMainDuckToBread(() => {
            setTimeout(() => this.endTrial(), 2000);
        });
    }

    animateMainDuckToBread(callback) {
        const duckRect = this.mainDuck.getBoundingClientRect();
        const breadRect = this.bread.getBoundingClientRect();

        const duckCenterX = duckRect.left + duckRect.width / 2;
        const breadCenterX = breadRect.left + breadRect.width / 2;

        // 🦆 Flip NUR das Bild sofort (nicht Position)
        if (breadCenterX > duckCenterX) {
            this.mainDuck.style.transform = 'translate(-50%, -50%) scaleX(-1)';
        } else {
            this.mainDuck.style.transform = 'translate(-50%, -50%) scaleX(1)';
        }

        this.mainDuck.style.transition = 'left 0.5s linear, top 0.5s linear'; // ❗ Nur Position animieren, nicht transform!

        const breadX = parseFloat(this.bread.style.left);
        const breadY = parseFloat(this.bread.style.top);

        this.mainDuck.style.left = `${breadX}px`;
        this.mainDuck.style.top = `${breadY}px`;

        setTimeout(() => {
            if (this.bread) this.bread.remove(); // Brot löschen
            const reactionTime = Date.now() - this.breadShownAt; // ✅

            if (this.hitPending) {
                this.uiModule.showFeedback('Gut!', 'green');
                this.sessionDataModule.recordTrialData({
                    hit: true,
                    quadrant: this.lastUsedQuadrant,
                    reactionTime // ✅ include in hit
                });
            } else {
                this.uiModule.showFeedback('Schade!', 'red');
                this.sessionDataModule.recordTrialData({
                    hit: false,
                    quadrant: this.lastUsedQuadrant,
                    reactionTime // ✅ include in miss too
                });
            }
            callback();
        }, 500);
    }

    handleMiss() {
        soundModule.play('failure');
        if (!this.isActive) return;
        this.isActive = false;
        this.hitPending = false; // ✅ ensure hit flag is off

        this.uiModule.showFeedback('Schade!', 'red');
        this.sessionDataModule.recordTrialData({
            hit: false,
            quadrant: this.lastUsedQuadrant
        });

        setTimeout(() => this.endTrial(), 2000);
    }

    async endTrial() {
        if (this.bread) this.bread.remove();
        if (this.mainDuck) this.mainDuck.remove();
        this.guideDucks.forEach(duck => duck.remove());
        this.guideDucks = [];

        this.currentTrial++;

        if (this.currentTrial >= this.settings.trials) {
            this.uiModule.clearGameElements();
            this.sessionDataModule.endSession();
            await this.sessionDataModule.saveSessionData();
            if (this.onGameEnd) this.onGameEnd();
        } else {
            this.startTrial();
        }
    }

    stop() {
        this.isActive = false;

        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }

        if (this._blinkIntervalId) {
            clearInterval(this._blinkIntervalId);
            this._blinkIntervalId = null;
        }

        this.uiModule.clearGameElements();
        this.uiModule.hideFixationDot();
        this.uiModule.hideTarget();
        this.uiModule.resetProgressBars();

        if (this.mainDuck && this.mainDuck.parentNode) this.mainDuck.remove();
        this.guideDucks.forEach(duck => {
            if (duck.parentNode) duck.remove();
        });
        if (this.bread && this.bread.parentNode) this.bread.remove();

        this.mainDuck = null;
        this.guideDucks = [];
        this.bread = null;
    }

    handleInput() {
        // Not used
    }
}