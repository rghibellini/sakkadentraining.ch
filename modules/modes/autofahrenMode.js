import { soundModule } from '../soundModule.js';
import { backgroundModule } from '../backgroundModule.js';

export class AutofahrenMode {
    constructor(settings, uiModule, sessionDataModule, onGameEnd, oksModule, resizeCanvas) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.onGameEnd = onGameEnd;
        this.oksModule = oksModule;
        this.resizeCanvas = resizeCanvas;

        this.gameArea = document.getElementById('gameArea');
        this.settings.background = false;
        this.car = null;
        this.lanes = [null, null];
        this.stimuliInterval = null;
        this.obstaclesInterval = null;
        this.speed = 0.5;
        this.carLane = 1;
        this.isActive = false;

        this.duration = settings.duration || 60; // new
        this.roadScrollSpeed = (settings.roadSpeed !== undefined ? settings.roadSpeed : 0.5) * 400;
        this.targetsDistractorsRatio = (settings.targetsDistractorsRatio !== undefined ? settings.targetsDistractorsRatio / 100 : 0.5);
        this.stimulusDuration = settings.stimulusDuration || 2;
        this.stimulusInterval = settings.stimulusInterval || 2;

        this.laneOccupied = [false, false];

        this.roadLeftPercent = 35;
        this.roadWidthPercent = 30;
        this.laneWidthPercent = this.roadWidthPercent / 2;

        this.roadAnimationFrame = null;
        this.obstacleAnimationFrames = [];
        this.stimuliTimeouts = [];

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

    startTrial() {
        this.isActive = true;
        this.setupGame();

        // Clear old progress bars
        this.uiModule.resetProgressBars();

        setTimeout(() => {
            if (!this.isActive) return;

            this.startObstacles();
            this.startStimuli();

            // ✅ Start the duration bar at bottom
            this.uiModule.startDurationProgressBar(this.duration, this.duration);

            // ✅ End game after duration
            setTimeout(() => {
                if (this.isActive) {
                    this.endGame(true);
                }
            }, this.duration * 1000);
        }, 2000); // Wait 2 seconds before starting obstacles
    }


    setupGame() {
        this.uiModule.clearGameElements();
        this.uiModule.clearGameElements();
        backgroundModule.clearBackground(); // ✅ reset background explicitly

        this.uiModule.resetProgressBars();

        requestAnimationFrame(() => {
            const gameAreaRect = this.gameArea.getBoundingClientRect();

            // Create road container
            this.roadContainer = document.createElement('div');
            this.roadContainer.style.position = 'absolute';
            this.roadContainer.style.top = '0';
            this.roadContainer.style.left = `${this.roadLeftPercent}%`;
            this.roadContainer.style.width = `${this.roadWidthPercent}%`;
            this.roadContainer.style.height = `${gameAreaRect.height}px`;
            this.roadContainer.style.overflow = 'hidden';
            this.roadContainer.style.zIndex = '0';
            this.gameArea.appendChild(this.roadContainer);

            // Create two road divs
            this.road1 = document.createElement('div');
            this.road2 = document.createElement('div');

            for (const road of [this.road1, this.road2]) {
                road.style.position = 'absolute';
                road.style.left = '0';
                road.style.width = '100%';
                road.style.height = '107%'; // 👈 stretch height slightly (or 110%)
                road.style.backgroundImage = "url('images/autofahren/road/road.png')";
                road.style.backgroundRepeat = 'no-repeat';
                road.style.backgroundSize = 'cover';
                road.style.backgroundPosition = 'center top';
            }

            this.road1.style.top = '0';
            this.road2.style.top = '-100%'; // start right above

            this.roadContainer.appendChild(this.road1);
            this.roadContainer.appendChild(this.road2);

            this.roadOffset = 0;
            this.roadScrollSpeed = 200; // px per second
            let lastTimestamp = null;

            const scrollRoad = (timestamp) => {
                if (!this.isActive) return;
                if (!lastTimestamp) lastTimestamp = timestamp;

                const deltaTime = (timestamp - lastTimestamp) / 1000;
                lastTimestamp = timestamp;

                this.roadOffset += this.roadScrollSpeed * deltaTime;

                const offset = this.roadOffset % (gameAreaRect.height);

                this.road1.style.top = `${offset}px`;
                this.road2.style.top = `${offset - gameAreaRect.height}px`;

                this.roadAnimationFrame = requestAnimationFrame(scrollRoad);
            };

            this.roadAnimationFrame = requestAnimationFrame(scrollRoad);;

            this.car = document.createElement('img');
            this.car.style.transition = 'left 0.4s ease'; // 0.3 seconds smooth move
            this.car.src = 'images/autofahren/car.png';
            this.car.style.position = 'absolute';
            this.car.style.width = '15%';
            this.car.style.height = 'auto';
            this.car.style.objectFit = 'contain';
            this.car.style.top = '70%';
            const centerOffset = 4; // 🆕 Add offset here too

            const rightLaneCenter = this.roadLeftPercent + this.laneWidthPercent * 0.75 + centerOffset;
            this.car.style.left = `${rightLaneCenter}%`;

            this.car.style.zIndex = '10';
            this.gameArea.appendChild(this.car);

            this.carLane = 1;

            this.gameArea.addEventListener('click', this.handleLaneSwitch.bind(this));
            document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
        });
    }

    handleLaneSwitch(event) {
        const rect = this.gameArea.getBoundingClientRect();
        const x = event.clientX - rect.left;

        const roadLeftPx = rect.width * (this.roadLeftPercent / 100);
        const roadWidthPx = rect.width * (this.roadWidthPercent / 100);

        if (x < roadLeftPx || x > (roadLeftPx + roadWidthPx)) {
            // 🚫 Click was outside the road, ignore for car switching
            return;
        }

        // Now handle normal lane switching
        const centerOffset = 4;
        const leftLaneCenter = this.roadLeftPercent + this.laneWidthPercent * 0.25 - centerOffset;
        const rightLaneCenter = this.roadLeftPercent + this.laneWidthPercent * 0.75 + centerOffset;

        if (x >= roadLeftPx && x < (roadLeftPx + roadWidthPx / 2)) {
            this.carLane = 0;
            this.car.style.left = `${leftLaneCenter}%`;
        } else if (x >= (roadLeftPx + roadWidthPx / 2) && x <= (roadLeftPx + roadWidthPx)) {
            this.carLane = 1;
            this.car.style.left = `${rightLaneCenter}%`;
        }
    }

    startObstacles() {
        const spawnObstacle = () => {
            if (!this.isActive) return;

            const freeLanes = this.laneOccupied.map((occupied, index) => !occupied ? index : null).filter(lane => lane !== null);

            if (freeLanes.length === 0) {
                // No free lane, try again shortly
                setTimeout(spawnObstacle, 500);
                return;
            }

            const lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
            this.laneOccupied[lane] = true;

            const obstacle = document.createElement('img');
            const obstacleCars = ['greencar.png', 'greycar.png', 'redcar.png', 'yellowcar.png', 'blackcar.png'];
            shuffleArray(obstacleCars);
            obstacle.src = `images/autofahren/othercars/${obstacleCars[0]}`;
            obstacle.style.position = 'absolute';
            obstacle.style.width = '15%';
            obstacle.style.height = 'auto';
            obstacle.style.objectFit = 'contain';
            obstacle.style.top = '-20%';

            const centerOffset = 4; // 🆕 Add here as well

            if (lane === 0) {
                obstacle.style.left = `${this.roadLeftPercent + this.laneWidthPercent * 0.25 - centerOffset}%`;
            } else {
                obstacle.style.left = `${this.roadLeftPercent + this.laneWidthPercent * 0.75 + centerOffset}%`;
            }

            obstacle.style.zIndex = '9';
            this.gameArea.appendChild(obstacle);

            const moveObstacle = (timestamp) => {
                if (!obstacle.startTime) {
                    obstacle.startTime = timestamp;
                }

                const deltaTime = (timestamp - obstacle.startTime) / 1000;
                obstacle.startTime = timestamp;

                let top = parseFloat(obstacle.style.top);
                top += (this.roadScrollSpeed / 8) * deltaTime; // Adjust scaling
                obstacle.style.top = `${top}%`;

                if (top > 45 && lane === this.carLane) {
                    soundModule.playWithVolume('car', 0.2);
                    this.uiModule.showFeedback('Crash!', 'red');
                    obstacle.remove();
                    this.laneOccupied[lane] = false;

                    const delay = 2500 + Math.random() * 1500;
                    setTimeout(spawnObstacle, delay);
                } else if (top > 100) {
                    obstacle.remove();
                    this.laneOccupied[lane] = false;

                    const delay = 2500 + Math.random() * 1500;
                    setTimeout(spawnObstacle, delay); // ✅ Also here
                } else {
                    const obstacleFrameId = requestAnimationFrame(moveObstacle);
                    this.obstacleAnimationFrames.push(obstacleFrameId);
                }
            };
            const obstacleFrameId = requestAnimationFrame(moveObstacle);
            this.obstacleAnimationFrames.push(obstacleFrameId);
        };

        spawnObstacle(); // Start first one
    }

    startStimuli() {
        this.isStimulusActive = false;
        let activeClickHandler = null;

        const spawnStimulus = () => {
            if (!this.isActive) return;
            if (this.isStimulusActive) return;

            const roll = Math.random();
            const isTarget = roll < this.targetsDistractorsRatio;
            console.log('Random roll:', roll, '->', isTarget ? 'Target' : 'Distractor');

            soundModule.play('stimuli');
            const stimulus = document.createElement('img');
            this.activeStimulus = stimulus;
            if (isTarget) {
                stimulus.src = 'images/autofahren/stop.png';
            } else {
                const randomDistractor = Math.ceil(Math.random() * 8);
                stimulus.src = `images/autofahren/distractors/distractor${randomDistractor}.png`;
            }

            let side;

            if (isTarget) {
                side = this.lastTargetSide === 0 ? 1 : 0; // alternate sides
                this.lastTargetSide = side;
            } else {
                side = this.lastDistractorSide === 0 ? 1 : 0; // alternate sides
                this.lastDistractorSide = side;
            }

            const spawnTime = Date.now();
            stimulus.dataset.side = side === 0 ? 'left' : 'right';
            stimulus.dataset.isTarget = isTarget;
            stimulus.dataset.spawnTime = spawnTime;

            stimulus.style.left = side === 0 ? '5%' : '85%';

            stimulus.style.top = '50%';
            stimulus.style.transform = 'translateY(-50%)';
            stimulus.style.width = '10%';
            stimulus.style.height = 'auto';
            stimulus.style.objectFit = 'contain';

            stimulus.style.zIndex = '11';
            this.gameArea.appendChild(stimulus);

            this.isStimulusActive = true;

            const clickHandler = (e) => {
                if (!this.isStimulusActive || !stimulus?.parentNode) return;

                const rect = this.gameArea.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;

                const roadLeftPx = width * (this.roadLeftPercent / 100);
                const roadWidthPx = width * (this.roadWidthPercent / 100);

                const isOnRoad = x >= roadLeftPx && x <= (roadLeftPx + roadWidthPx);

                if (isOnRoad) {
                    // 👈 let road clicks go to lane switching
                    return;
                }

                // ✅ Handle stimulus reaction on valid side click
                const rt = Date.now() - Number(stimulus.dataset.spawnTime);
                const isTarget = stimulus.dataset.isTarget === 'true';
                const side = stimulus.dataset.side;

                this.sessionDataModule.recordTrialData({
                    reactionTime: rt,
                    side,
                    hit: isTarget,
                    false: !isTarget
                });

                if (!isTarget) soundModule.play('failure');

                stimulus.remove();
                document.removeEventListener('click', activeClickHandler);
                this.isStimulusActive = false;
                this.activeStimulus = null;
            };

            if (activeClickHandler) {
                document.removeEventListener('click', activeClickHandler);
            }

            activeClickHandler = clickHandler;
            document.addEventListener('click', activeClickHandler);

            setTimeout(() => {
                if (!this.isActive) return;
                if (isTarget) {
                    const side = stimulus.dataset.side;
                    this.sessionDataModule.recordTrialData({
                        reactionTime: null,
                        side,
                        hit: false,
                        missed: true
                    });
                }

                if (stimulus.parentNode) {
                    stimulus.remove();

                    if (isTarget) {
                        soundModule.play('missed');
                    }
                }

                document.removeEventListener('click', activeClickHandler);
                this.isStimulusActive = false;
                this.activeStimulus = null;

                const nextDelay = this.stimulusInterval * 1000;
                const timeoutId = setTimeout(() => {
                    if (this.isActive) spawnStimulus(); // Guard against inactive mode
                }, nextDelay);
                this.stimuliTimeouts.push(timeoutId);

            }, this.stimulusDuration * 1000);
        };

        spawnStimulus();
    }

    endGame(success) {
        this.isActive = false;
        clearInterval(this.obstaclesInterval);
        clearInterval(this.stimuliInterval);

        this.gameArea.removeEventListener('click', this.handleLaneSwitch.bind(this));

        this.sessionDataModule.recordTrialData({ success });
        this.sessionDataModule.endSession();
        this.sessionDataModule.saveSessionData();
        this.onGameEnd();
    }

    stop() {
        this.isActive = false;

        if (this.roadAnimationFrame) {
            cancelAnimationFrame(this.roadAnimationFrame);
        }

        for (const id of this.obstacleAnimationFrames) {
            cancelAnimationFrame(id);
        }
        this.obstacleAnimationFrames = [];

        for (const id of this.stimuliTimeouts) {
            clearTimeout(id);
        }
        this.stimuliTimeouts = [];

        if (this.road1 && this.road1.parentNode) {
            this.road1.remove();
        }
        if (this.road2 && this.road2.parentNode) {
            this.road2.remove();
        }

        this.uiModule.clearGameElements();
        this.uiModule.resetProgressBars();

        if (this.settings.oks) this.oksModule.stopOKSAnimation();
        if (this.settings.background) this.backgroundModule.clearBackground();
    }

    handleInput(event) {
        // aktuell nichts tun
    }

    handleKeyboardInput(event) {
        if (!this.isActive) return;

        const centerOffset = 4;
        const leftLaneCenter = this.roadLeftPercent + this.laneWidthPercent * 0.25 - centerOffset;
        const rightLaneCenter = this.roadLeftPercent + this.laneWidthPercent * 0.75 + centerOffset;

        if (event.key === 'ArrowLeft') {
            // Switch to left lane
            this.carLane = 0;
            this.car.style.left = `${leftLaneCenter}%`;
        } else if (event.key === 'ArrowRight') {
            // Switch to right lane
            this.carLane = 1;
            this.car.style.left = `${rightLaneCenter}%`;
        } else if (event.key === ' ' || event.code === 'Space') {
            // Simulate clicking a stimulus
            if (this.isStimulusActive && this.activeStimulus) {
                this.activeStimulus.click(); // manually trigger
            }
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
