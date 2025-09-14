// modules/soundModule.js
export const soundModule = {
    sounds: {
        login: new Audio('sounds/login.mp3'),
        failure: new Audio('sounds/failure.mp3'),
        stimuli: new Audio('sounds/stimuli.mp3'),
        finish: new Audio('sounds/finish.mp3'),
        missed: new Audio('sounds/missed.mp3'),
        pop: new Audio('sounds/pop.mp3'),
        quack: new Audio('sounds/quack.mp3'),
        car: new Audio('sounds/car.mp3'),
        catch: new Audio('sounds/catch.mp3'),
        mouse: new Audio('sounds/mouse.mp3'),
        correct: new Audio('sounds/correct.mp3'),
    },

        play(name) {
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0;
            sound.volume = 1.0; // default full
            sound.play().catch(err => console.warn(`Audio failed: ${err.message}`));
        }
    },

    playWithVolume(name, volume = 1.0) {
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0;
            sound.volume = volume;
            sound.play().catch(err => console.warn(`Audio failed: ${err.message}`));
        }
    }
};
