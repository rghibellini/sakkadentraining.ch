import { soundModule } from '../soundModule.js';

export class Aufwaermen2Mode {
    constructor(settings, uiModule, sessionDataModule, backgroundModule, oksModule, resizeCanvas, onGameEnd) {
        this.settings = settings;
        this.uiModule = uiModule;
        this.sessionDataModule = sessionDataModule;
        this.backgroundModule = backgroundModule;
        this.oksModule = oksModule;
        this.resizeCanvas = resizeCanvas;
        this.onGameEnd = onGameEnd; 

        this.startTime = null;
        this.endTime = null;
        this._timeout = null;
        this.isActive = false;
    }

    start() {
        this.isActive = true;
        this.uiModule.hideFixationDot();
        this.startTime = Date.now();

        this.uiModule.startDurationProgressBar(this.settings.duration);

        if (this.settings.background) {
            this.backgroundModule.updateBackgroundSettings(this.settings);
        }

        if (this.settings.oks) {
            const canvas = document.getElementById('oksCanvas');
            requestAnimationFrame(() => {
              this.resizeCanvas(canvas); // ensures full screen
              this.oksModule.startOKSAnimation(canvas, this.settings);
            });
          }          

        this._timeout = setTimeout(() => this.end(), this.settings.duration * 1000);
    }

    handleInput(event) {
        // No interaction required
    }

    end() {
        if (!this.isActive) return;
        this.isActive = false;
    
        clearTimeout(this._timeout);
    
        if (this.settings.oks) {
            this.oksModule.stopOKSAnimation();
        }
    
        if (this.settings.background) {
            this.backgroundModule.clearBackground();
        }
    
        this.uiModule.resetProgressBars();
    
        this.sessionDataModule.endSession(); // ✅ end session
    
        if (typeof this.onGameEnd === 'function') {
            this.onGameEnd(); // ✅ return to main screen
        }
    }      

    stop() {
        this.end();
    }
}
