// uiModule.js
// Helper function to remove existing feedback elements
function removeExistingFeedback() {
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) existingFeedback.remove();
}

export const uiModule = {
    /**
     * Displays a feedback message on the screen for 2 seconds.
     * @param {string} message - The message to display.
     * @param {string} color - The color of the message text.
     */
    showFeedback(message, color) {
        removeExistingFeedback();
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'feedback';
        feedbackElement.textContent = message;
        feedbackElement.style.position = 'fixed';
        feedbackElement.style.top = '50%';
        feedbackElement.style.left = '50%';
        feedbackElement.style.transform = 'translate(-50%, -50%)';
        feedbackElement.style.fontFamily = 'Montserrat, Arial, sans-serif';
        feedbackElement.style.fontSize = '2vw';
        feedbackElement.style.color = color;
        feedbackElement.style.zIndex = '1000';
        feedbackElement.style.textAlign = 'center';
        feedbackElement.style.padding = '10px';
        feedbackElement.style.background = 'rgba(255, 255, 255, 0.8)';
        feedbackElement.style.pointerEvents = 'none'; // Don't block clicks

        document.body.appendChild(feedbackElement);

        setTimeout(() => {
            if (feedbackElement.parentNode) document.body.removeChild(feedbackElement);
        }, 2000);
    },

    /**
     * Updates the hits display with the provided value.
     * @param {number} hits - The number of hits to display.
     */
    updateDisplays(hits) {
        const hitsDisplay = document.getElementById('hitsDisplay');
        if (hitsDisplay) hitsDisplay.textContent = hits || 0;
    },

    /**
     * Toggles the visibility of the settings panel.
     */
    toggleSettingsPanel() {
        const settingsPanel = document.querySelector('.settings-panel');
        if (settingsPanel) settingsPanel.classList.toggle('open');
    },

    /**
     * Updates the trial progress bar based on current and total trials.
     * @param {number} current - The current trial number.
     * @param {number} total - The total number of trials.
     */
    updateProgressBars(current, total) {
        const trialProgressBar = document.getElementById('trialProgressBar');
        const fill = trialProgressBar?.querySelector('.progress-fill');
        if (fill) fill.style.width = `${(current / total) * 100}%`;
    },

    /**
     * Displays the fixation dot at the center of the game area.
     */
    showFixationDot() {
        let fixationDot = document.getElementById('fixationDot');
        if (!fixationDot) {
            fixationDot = document.createElement('div');
            fixationDot.id = 'fixationDot';
            fixationDot.style.width = '2vw';
            fixationDot.style.height = '2vw';
            fixationDot.style.backgroundColor = 'red';
            fixationDot.style.borderRadius = '50%';
            fixationDot.style.position = 'absolute';
            fixationDot.style.zIndex = '10';
            document.getElementById('gameArea').appendChild(fixationDot);
        }

        // ✅ rely on CSS centering, don’t compute px from vw
        fixationDot.style.left = '50%';
        fixationDot.style.top = '50%';
        fixationDot.style.transform = 'translate(-50%, -50%)';
        fixationDot.style.display = 'block';
    },

    /**
     * Hides the fixation dot.
     */
    hideFixationDot() {
        const fixationDot = document.getElementById('fixationDot');
        if (fixationDot) fixationDot.style.display = 'none';
    },

    /**
     * Displays a single target at the specified position.
     * @param {number} x - The x-coordinate in pixels.
     * @param {number} y - The y-coordinate in pixels.
     * @param {number} [number] - Optional number to display on the target (for ReihenfolgeMode).
     */
    showTarget(x, y, number) {
        let target = document.getElementById('target');
        if (!target) {
            target = document.createElement('div');
            target.id = 'target';
            target.style.width = '20px';
            target.style.height = '20px';
            target.style.backgroundColor = 'blue';
            target.style.borderRadius = '50%';
            target.style.position = 'absolute';
            target.style.zIndex = '10';
            target.style.display = 'flex';
            target.style.alignItems = 'center';
            target.style.justifyContent = 'center';
            target.style.color = 'white';
            target.style.fontSize = '12px';
            document.getElementById('gameArea').appendChild(target);
        }
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
        if (number) target.textContent = number;
        else target.textContent = '';
        target.style.display = 'block';
    },

    /**
     * Hides the single target.
     */
    hideTarget() {
        const target = document.getElementById('target');
        if (target) target.style.display = 'none';
    },

    /**
     * Displays multiple targets on the screen (for PunkteMode).
     * @param {Array} targets - Array of target objects with {x, y, id, clicked} properties.
     */
    displayTargets(targets) {
        this.clearTargets();
        const gameArea = document.getElementById('gameArea');
        targets.forEach(target => {
            const targetElement = document.createElement('div');
            targetElement.className = 'target';
            targetElement.dataset.id = target.id;
            targetElement.style.width = '2vw';
            targetElement.style.height = '2vw';
            targetElement.style.backgroundColor = 'blue';
            targetElement.style.borderRadius = '50%';
            targetElement.style.position = 'absolute';
            targetElement.style.left = `${target.x}px`;
            targetElement.style.top = `${target.y}px`;
            targetElement.style.zIndex = '10';
            gameArea.appendChild(targetElement);
        });
    },

    showMovingDot(color = 'green') {
        let dot = document.getElementById('movingDot');
        const gameArea = document.getElementById('gameArea');

        if (!dot) {
            dot = document.createElement('div');
            dot.id = 'movingDot';
            dot.style.position = 'absolute';
            dot.style.width = '2vw';
            dot.style.height = '2vw';
            dot.style.borderRadius = '50%';
            dot.style.zIndex = '10';
            dot.style.transition = 'left 0.5s ease, top 0.5s ease';
            gameArea.appendChild(dot);
        }

        dot.style.backgroundColor = color;
        dot.style.transition = 'none';
        dot.style.display = 'block';

        // Force reflow before measuring
        void dot.offsetWidth;

        const rect = gameArea.getBoundingClientRect();
        const size = dot.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        dot.style.left = `${centerX - size.width / 2}px`;
        dot.style.top = `${centerY - size.height / 2}px`;

        // Enable transition again after positioning
        void dot.offsetWidth;
        dot.style.transition = 'left 0.5s ease, top 0.5s ease';
    },

    animateDotTo(x, y, callback) {
        const dot = document.getElementById('movingDot');
        if (!dot) return;

        const onEnd = () => {
            dot.removeEventListener('transitionend', onEnd);
            if (typeof callback === 'function') callback();
        };

        dot.addEventListener('transitionend', onEnd);

        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
    },

    /**
     * Marks a target as hit by changing its color (for PunkteMode).
     * @param {number} targetId - The ID of the target to mark.
     */
    markTargetAsHit(targetId) {
        const targetElement = document.querySelector(`.target[data-id="${targetId}"]`);
        if (targetElement) targetElement.style.backgroundColor = 'green';
    },

    clearTargets() {
        const targets = document.querySelectorAll('.target');
        targets.forEach(target => target.remove());
    },

    /**
     * Displays a pair of images side by side (for VergleichMode).
     * @param {string} image1 - URL of the first image.
     * @param {string} image2 - URL of the second image.
     */
    displayImagePair(image1, image2) {
        this.clearGameElements();
        const gameArea = document.getElementById('gameArea');
        const container = document.createElement('div');
        container.className = 'image-pair';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-around';
        container.style.alignItems = 'center';
        container.style.width = '80%';
        container.style.height = '80%';
        container.style.position = 'absolute';
        container.style.left = '10%';
        container.style.top = '10%';

        const img1 = document.createElement('img');
        img1.src = image1;
        img1.style.maxWidth = '45%';
        img1.style.maxHeight = '100%';

        const img2 = document.createElement('img');
        img2.src = image2;
        img2.style.maxWidth = '45%';
        img2.style.maxHeight = '100%';

        container.appendChild(img1);
        container.appendChild(img2);
        gameArea.appendChild(container);
    },

    displayImageGrids(leftImages, rightImages, rows, columns) {
        this.clearGameElements();
        const gameArea = document.getElementById('gameArea');

        const container = document.createElement('div');
        container.className = 'image-grid-container';

        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        container.style.gap = '5%';
        container.style.zIndex = '5';

        function createGrid(images, side) {
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            grid.style.gap = '1vh';
            grid.style.width = '40%';
            grid.style.height = '80%';
            grid.style.alignItems = 'stretch';
            grid.style.justifyItems = 'stretch';

            images.forEach((src, index) => {
                const cell = document.createElement('div');
                cell.style.backgroundImage = `url('${src}')`;
                cell.style.backgroundSize = 'contain';
                cell.style.backgroundPosition = 'center';
                cell.style.backgroundRepeat = 'no-repeat';
                cell.style.border = '1px solid #ccc';
                cell.style.cursor = 'pointer';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
                cell.style.width = '100%';
                cell.style.height = '100%';

                cell.dataset.index = index;
                cell.dataset.side = side;

                grid.appendChild(cell);
            });

            return grid;
        }

        const leftGrid = createGrid(leftImages, 'left');
        const rightGrid = createGrid(rightImages, 'right');

        const line = document.createElement('div');
        line.style.width = '2px';
        line.style.height = '80%';
        line.style.background = 'black';
        line.style.position = 'absolute';
        line.style.left = '50%';
        line.style.transform = 'translateX(-50%)';
        line.style.zIndex = '6';

        container.appendChild(leftGrid);
        container.appendChild(line);
        container.appendChild(rightGrid);

        gameArea.appendChild(container);
    },

    spawnCheeses(count, grid) {
        const gameArea = document.getElementById('gameArea');
        const gameRect = gameArea.getBoundingClientRect();
        const cheeseSize = 80;
        const hitboxScale = 1.5;
        const rows = 5, cols = 5;

        const activeSquares = Object.keys(grid).filter(key => grid[key]);
        if (activeSquares.length < count) {
            console.warn("⚠ Not enough grid squares for cheese count.");
            return [];
        }

        const shuffled = activeSquares.sort(() => Math.random() - 0.5).slice(0, count);
        const cheeses = [];

        shuffled.forEach((squareKey, index) => {
            const [row, col] = squareKey.split('-').map(Number);

            const maxWidth = gameRect.width * 0.9;
            const maxHeight = gameRect.height * 0.8;
            const squareWidth = maxWidth / cols;
            const squareHeight = maxHeight / rows;
            const centerX = gameRect.width / 2 - maxWidth / 2;
            const centerY = gameRect.height / 2 - maxHeight / 2;

            const x = centerX + (col - 1) * squareWidth + squareWidth / 2 - cheeseSize / 2;
            const y = centerY + (row - 1) * squareHeight + squareHeight / 2 - cheeseSize / 2;

            const cheese = document.createElement('div');
            cheese.className = 'cheese';
            cheese.dataset.number = index + 1;
            cheese.style.position = 'absolute';
            cheese.style.left = `${x}px`;
            cheese.style.top = `${y}px`;
            cheese.style.width = `${cheeseSize * hitboxScale}px`;
            cheese.style.height = `${cheeseSize * hitboxScale}px`;
            cheese.style.backgroundImage = 'url("images/reihenfolge/cheese.png")';
            cheese.style.backgroundSize = 'contain';
            cheese.style.backgroundRepeat = 'no-repeat';
            cheese.style.backgroundPosition = 'top';
            cheese.style.zIndex = '5';
            cheese.style.display = 'flex';
            cheese.style.flexDirection = 'column';
            cheese.style.alignItems = 'center';
            cheese.style.justifyContent = 'flex-end';

            const label = document.createElement('div');
            label.textContent = index + 1;
            label.style.fontSize = '1.8vw';
            label.style.color = '#173C56';
            label.style.fontWeight = 'bold';
            label.style.marginBottom = '4px';

            cheese.appendChild(label);
            gameArea.appendChild(cheese);
            cheeses.push(cheese);
        });

        return cheeses;
    },

    showFeedbackIcon(referenceEl, symbol = '❤', color = 'green', offset = 20) {
        const gameArea = document.getElementById('gameArea');
        const icon = document.createElement('div');
        icon.textContent = symbol;
        icon.style.position = 'absolute';
        icon.style.fontSize = '2vw';
        icon.style.color = color;
        icon.style.zIndex = '20';

        const mouseX = referenceEl.offsetLeft + referenceEl.offsetWidth / 2;
        const mouseY = referenceEl.offsetTop - offset; // Place above mouse

        icon.style.left = `${mouseX}px`;
        icon.style.top = `${mouseY}px`;
        icon.style.transform = 'translate(-50%, 0%)'; // Align top edge, center horizontally

        icon.className = 'feedback-icon';
        gameArea.appendChild(icon);

        // Debug logs
        console.log('Icon placed at:', { left: mouseX, top: mouseY });
        console.log('Game area bounds:', gameArea.getBoundingClientRect());

        setTimeout(() => {
            if (icon && icon.parentNode) icon.parentNode.removeChild(icon);
        }, 800);
    },

    recenterGameArea(callback) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (typeof callback === 'function') {
                    callback();
                }
            });
        });
    },

    createGoal(goalWidthPercent, side) {
        const gameArea = document.getElementById('gameArea');

        // 🧹 Remove any existing goal
        const oldGoal = gameArea.querySelector('.goal');
        if (oldGoal) oldGoal.remove();

        const goal = document.createElement('div');
        goal.className = 'goal';

        const rect = gameArea.getBoundingClientRect();
        const halfWidth = rect.width / 2;
        const goalWidthPx = (goalWidthPercent / 100) * halfWidth;

        goal.style.width = `${goalWidthPx}px`; // ✅ scaled to half screen
        goal.style.height = '100%';
        goal.style.position = 'absolute';
        goal.style.top = '0';
        goal.style.backgroundColor = 'rgba(0, 100, 0, 0.4)'; // darker green grass
        goal.style.zIndex = '2';

        if (side === 'Links') {
            goal.style.left = '0';
            goal.style.right = 'unset';
        } else {
            goal.style.right = '0';
            goal.style.left = 'unset';
        }

        gameArea.appendChild(goal);
    },
    /**
     * Shows and animates the footballer (wait → charge1 → shoot)
     */
    async showFootballer(side) {
        const gameArea = document.getElementById('gameArea');
        const footballer = document.createElement('img');
        footballer.className = 'footballer';
        footballer.src = 'images/fangen/wait.png';
        footballer.style.width = '200px';
        footballer.style.height = '200px';
        footballer.style.position = 'absolute';
        footballer.style.zIndex = '5';

        const rect = gameArea.getBoundingClientRect();
        footballer.style.left = side === 'Links' ? `${rect.width - 220}px` : '70px';
        footballer.style.top = `${rect.height / 2 - 100}px`;
        if (side !== 'Links') footballer.style.transform = 'scaleX(-1)';

        gameArea.appendChild(footballer);

        return new Promise(resolve => {
            setTimeout(() => {
                footballer.src = 'images/fangen/charge1.png';
                setTimeout(() => {
                    footballer.src = 'images/fangen/shoot.png';
                    setTimeout(() => {
                        footballer.remove();
                        resolve();
                    }, 500);
                }, 500);
            }, 1000);
        });
    },

    /**
     * Launches the football across the screen.
     */
    launchFootball(startX, startY, targetX, targetY, duration) {
        const gameArea = document.getElementById('gameArea');
        const football = document.createElement('img');
        football.src = 'images/fangen/football.png';
        football.className = 'football';
        football.style.width = '50px';
        football.style.height = '50px';
        football.style.position = 'absolute';
        football.style.zIndex = '10';
        football.style.left = `${startX}px`;
        football.style.top = `${startY}px`;
        football.style.transition = 'none';
        gameArea.appendChild(football);

        requestAnimationFrame(() => {
            football.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
            football.style.left = `${targetX}px`;
            football.style.top = `${targetY}px`;
        });

        return football;
    },

    showGoalkeeper(centerY, centerX, centerYPos, side = 'Links') {
        const gameArea = document.getElementById('gameArea');
        const screenHeight = window.innerHeight;
        let src;
        if (centerY < screenHeight / 3) src = 'images/fangen/goalup.png';
        else if (centerY < 2 * screenHeight / 3) src = 'images/fangen/goalcenter.png';
        else src = 'images/fangen/goaldown.png';

        const keeper = document.createElement('img');
        keeper.src = src;
        keeper.className = 'goal-image';
        keeper.style.width = '200px';
        keeper.style.height = '200px';
        keeper.style.left = `${centerX - 100}px`;
        keeper.style.top = `${centerYPos - 100}px`;
        keeper.style.zIndex = '15';
        keeper.style.position = 'absolute';

        // 👈 Mirror if on the right side
        if (side === 'Rechts') {
            keeper.style.transform = 'scaleX(-1)';
        }

        gameArea.appendChild(keeper);
        setTimeout(() => keeper.remove(), 1000);
    },

    clearGameElements() {
        const gameArea = document.getElementById('gameArea');

        // Remove targets
        const targets = gameArea.querySelectorAll('.target');
        targets.forEach(t => t.remove());

        // Remove moving dot
        const movingDot = gameArea.querySelector('#movingDot');
        if (movingDot) movingDot.remove();

        // Remove cheeses
        const cheeses = gameArea.querySelectorAll('.cheese');
        cheeses.forEach(c => c.remove());

        // Remove mouse
        const mouse = gameArea.querySelector('.mouse');
        if (mouse) mouse.remove();

        // Remove feedback icons
        const feedbackIcons = gameArea.querySelectorAll('.feedback-icon');
        feedbackIcons.forEach(icon => icon.remove());

        // Remove image pairs
        const imagePair = gameArea.querySelector('.image-pair');
        if (imagePair) imagePair.remove();

        // Remove image grids
        const imageGridContainer = gameArea.querySelector('.image-grid-container');
        if (imageGridContainer) imageGridContainer.remove();

        // Remove goal
        const goal = gameArea.querySelector('.goal');
        if (goal) goal.remove();

        // Remove footballs
        const footballs = gameArea.querySelectorAll('.football');
        footballs.forEach(f => f.remove());

        // Remove goalkeeper images
        const goalImages = gameArea.querySelectorAll('.goal-image');
        goalImages.forEach(g => g.remove());

        // Remove moving targets
        const movingTarget = gameArea.querySelector('#movingTarget');
        if (movingTarget) movingTarget.remove();

        // 🆕 Remove balloons and airballoons
        const balloons = gameArea.querySelectorAll('img:not(#oksCanvas)');
        balloons.forEach(b => b.remove());

        // Hide fixationDot (do not delete it!)
        const fixationDot = document.getElementById('fixationDot');
        if (fixationDot) fixationDot.style.display = 'none';

        // Schwimmen Mode Elements
        const ducks = gameArea.querySelectorAll('.duck, .duck-guide, .bread');
        ducks.forEach(d => d.remove());

        // 🆕 AutofahrenMode elements: car, obstacles, stimuli
        const autofahrenElements = gameArea.querySelectorAll('img[src*="autofahren"]');
        autofahrenElements.forEach(el => el.remove());
    },

    /**
     * Displays a temporary message (for Aufwaermen2Mode).
     * @param {string} message - The message to display.
     * @param {string} color - The color of the message text.
     */
    showMessage(message, color) {
        this.showFeedback(message, color); // Reuse showFeedback for simplicity
    },

    setFixationDotOpacity(opacity) {
        const fixationDot = document.getElementById('fixationDot');
        if (fixationDot) fixationDot.style.opacity = opacity;
    },

    isTargetVisible() {
        const target = document.getElementById('target');
        return target && target.style.display !== 'none';
    },

    getGameAreaRect() {
        const gameArea = document.getElementById('gameArea');
        return gameArea ? gameArea.getBoundingClientRect() : { width: 0, height: 0 };
    },

    getTargetWidth() {
        const target = document.getElementById('target');
        return target ? target.offsetWidth : 0;
    },

    getTargetHeight() {
        const target = document.getElementById('target');
        return target ? target.offsetHeight : 0;
    },

    setTargetPosition(x, y) {
        const target = document.getElementById('target');
        if (target) {
            target.style.left = `${x}px`;
            target.style.top = `${y}px`;
        }
    },

    updateProgressBars(currentTrial, totalTrials) {
        const trialBar = document.getElementById('trialProgressBar');
        const fill = trialBar.querySelector('.progress-fill');

        if (trialBar) {
            trialBar.style.display = 'block';
            const percent = (currentTrial / totalTrials) * 100;
            if (fill) fill.style.width = `${percent}%`;
        }
    },

    startDurationProgressBar(durationSeconds, antwortfensterSeconds) {
        const durationBar = document.getElementById('durationProgressBar');
        const fill = durationBar.querySelector('.duration-fill');

        if (!durationBar || !fill) return;

        durationBar.style.display = 'block';
        fill.style.transition = 'none';
        fill.style.width = '100%';
        fill.style.backgroundColor = '#173C56'; // ✅ your desired blue

        // Force reflow
        void fill.offsetWidth;

        // Step 1: Full bar to shrink to 0% over total duration
        fill.style.transition = `width ${durationSeconds}s linear`;
        fill.style.width = '0%';

        // Optional: If you want to visually indicate antwortfenster timeout
        if (typeof antwortfensterSeconds === 'number' && antwortfensterSeconds > 0 && antwortfensterSeconds < durationSeconds) {
            const antwortRatio = antwortfensterSeconds / durationSeconds;
            const keyframe = document.createElement('style');
            keyframe.innerHTML = `
            @keyframes antwortSplitFade {
                0%   { background-color: #173C56; }
                ${antwortRatio * 100}% { background-color: #173C56; }
                ${antwortRatio * 100.01}% { background-color: #666666; }
                100% { background-color: #666666; }
            }`;
            document.head.appendChild(keyframe);
            fill.style.animation = `antwortSplitFade ${durationSeconds}s linear forwards`;
        }
    },

    resetProgressBars() {
        const trialBar = document.getElementById('trialProgressBar');
        const durationBar = document.getElementById('durationProgressBar');

        if (trialBar) {
            trialBar.style.display = 'none';
            const fill = trialBar.querySelector('.progress-fill');
            if (fill) fill.style.width = '0%';
        }

        if (durationBar) {
            durationBar.style.display = 'none';
            const fill = durationBar.querySelector('.progress-fill');
            if (fill) {
                fill.style.transition = 'none';
                fill.style.width = '0%';
                fill.style.backgroundColor = '#173C56'; // reset to original blue
            }
        }
    }

    
};

// --- uiProfiles: drawer + list rendering for Profiles ---
export const uiProfiles = (() => {
  const $overlay = () => document.getElementById('profileOverlay');
  const $list = () => document.getElementById('profileList');
  const $drawer = () => document.getElementById('profileDrawer');
  const $form = () => document.getElementById('profileForm');
  const $name = () => document.getElementById('profileName');
  const $id = () => document.getElementById('profileId');
  const $msg = () => document.getElementById('profileFormMsg');
  const $drawerTitle = () => document.getElementById('drawerTitle');

  // init color grid once
  function initColors() {
    document.querySelectorAll('.color-swatch').forEach(btn => {
      const c = btn.getAttribute('data-color');
      btn.style.background = c;
      btn.addEventListener('click', () => selectColor(c));
    });
    // default selected already has aria-checked="true"
  }
  function selectColor(hex) {
    document.querySelectorAll('.color-swatch').forEach(btn => {
      const isSel = btn.getAttribute('data-color') === hex;
      btn.setAttribute('aria-checked', isSel ? 'true' : 'false');
      btn.style.borderColor = isSel ? 'var(--text)' : 'transparent';
    });
    $form().dataset.color = hex;
  }
  function getSelectedColor() {
    // fallback to a default if none clicked yet
    return $form().dataset.color || (document.querySelector('.color-swatch[aria-checked="true"]')?.getAttribute('data-color')) || '#3B82F6';
  }

  function fmtCH(iso) {
    try {
      return new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', day:'2-digit', month:'2-digit', year:'numeric' })
        .format(new Date(iso));
    } catch { return iso || ''; }
  }

  function rowTemplate(p) {
    const created = p.created_at || p.createdAt; // backend may provide created_at
    return `
      <div class="profile-row" data-id="${p.id}">
        <span class="profile-color" style="background:${p.color || '#3B82F6'}"></span>
        <div class="profile-name">${p.name || 'Unbenannt'}</div>
        <div class="profile-date">${fmtCH(created)}</div>
        <div class="profile-actions-row">
          <button class="profile-icon js-edit" title="Bearbeiten" aria-label="Bearbeiten">✎</button>
          <button class="profile-icon js-delete" title="Löschen" aria-label="Löschen">✖</button>
        </div>
      </div>
    `;
  }

  function renderList(profiles = []) {
    const el = $list();
    if (!el) return;
    el.innerHTML = profiles.map(rowTemplate).join('');
  }

  function openOverlay() {
    $overlay().classList.add('active');
  }
  function closeOverlay() {
    $overlay().classList.remove('active');
  }

  function openDrawer(mode, prof=null) {
    openOverlay();
    $msg().textContent = '';
    if (mode === 'create') {
      $drawerTitle().textContent = 'Profil anlegen';
      $id().value = '';
      $name().value = '';
      selectColor('#3B82F6');
    } else {
      $drawerTitle().textContent = 'Profil bearbeiten';
      $id().value = prof.id;
      $name().value = prof.name || '';
      selectColor(prof.color || '#3B82F6');
    }
    $name().focus();
  }

  function getFormData() {
    return {
      id: $id().value || null,
      name: ($name().value || '').trim(),
      color: getSelectedColor()
    };
  }

  return { initColors, renderList, openOverlay, closeOverlay, openDrawer, getFormData };
})();
