class Music {
    constructor() {

    }

    init() {
        // set up music conditions
        this.playMusic('Hum.mp3', () => {
            return game.page == 'menu';
        });
        this.playMusic('Day By Day.mp3', () => {
            const timeOfDay = game.world.getTimeOfDay();
            return game.page == 'game' && timeOfDay !== 'night';
        });
        this.playMusic('Midnight Ballad.mp3', () => {
            const timeOfDay = game.world.getTimeOfDay();
            return game.page == 'game' && timeOfDay == 'night';
        });
    }

    update() {
        if (!this.initialized) {
            this.init();
            this.initialized = true;
        }

        // play all the audio
        for (const audio of audios.values()) {
            const MAX_VOLUME = 0.5;
            if (typeof audio.condition !== 'function') continue;
            if (audio.condition()) {
                audio.play();
                audio.volume = Math.min(audio.volume + 0.0025, MAX_VOLUME); // fade in
            } else if (audio.volume > 0) {
                audio.volume = Math.max(0, audio.volume - 0.0025); // fade out
            } else {
                audio.currentTime = 0;
                audio.pause();
            }
        }
    }

    playSound(src, volume = 1) {
        const music = audios.get(src);
        if (!music) return console.log('sound', src, 'not found');

        const clone = music.cloneNode();
        clone.volume = volume;
        clone.play();
    }

    playMusic(src, condition) {
        const music = audios.get(src);
        music.condition = condition;
        music.volume = 0.5;
    }
}