export const userInteractionModule = {
    currentMode: null,
    handleClickBound: null,
    handleKeyDownBound: null,

    registerInputHandlers(mode) {
        if (!mode || typeof mode.handleInput !== 'function') {
            console.error('Invalid mode: Must provide a handleInput method.');
            return;
        }
        this.currentMode = mode;

        // ✅ Explicitly save references for proper removal later
        this.handleClickBound = this.handleClick.bind(this);
        this.handleKeyDownBound = this.handleKeyDown.bind(this);

        document.addEventListener('click', this.handleClickBound);
        document.addEventListener('keydown', this.handleKeyDownBound);
        console.log('✅ Input handlers attached explicitly.');
    },

    removeInputHandlers() {
        if (this.handleClickBound && this.handleKeyDownBound) {
            document.removeEventListener('click', this.handleClickBound);
            document.removeEventListener('keydown', this.handleKeyDownBound);
            console.log('✅ Input handlers removed explicitly.');
        } else {
            console.warn('⚠️ No handlers found to remove explicitly.');
        }
        this.currentMode = null;
        this.handleClickBound = null;
        this.handleKeyDownBound = null;
    },

    handleClick(event) {
        if (this.currentMode && this.currentMode.handleInput) {
            this.currentMode.handleInput(event);
        }
    },

    handleKeyDown(event) {
        if (this.currentMode && this.currentMode.handleInput) {
            this.currentMode.handleInput(event);
        }
    }
};
