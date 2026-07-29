class AudioManager {
    constructor() {
        this.activeSoundsInWorld = [];
        this.ctx = new AudioContext();
    }

    init() {
        // set up music conditions
        this.playMusic('Hum.mp3', () => {
            return game.page == 'menu';
        });
        this.playMusic('Day By Day.mp3', () => {
            const timeOfDay = game.world.getTimeOfDay();
            return game.page == 'game' && timeOfDay !== 'night' && !game.gameOver;
        });
        this.playMusic('Midnight Ballad.mp3', () => {
            const timeOfDay = game.world.getTimeOfDay();
            return game.page == 'game' && timeOfDay == 'night' && !game.gameOver;
        });
    }

    update() {
        if (!this.initialized) {
            this.init();
            this.initialized = true;
        }

        // play music
        for (const audio of audios.values()) {
            const MAX_VOLUME = 0.5;
            if (typeof audio.condition !== 'function') continue; // check if the audio is music

            if (audio.condition()) { // music should be playing right now
                audio.play();
                audio.volume = Math.min(audio.volume + 0.0025, MAX_VOLUME); // fade in
            } else if (audio.volume > 0) {
                audio.volume = Math.max(0, audio.volume - 0.0025); // fade out
            } else {
                audio.currentTime = 0;
                audio.pause();
            }
        }

        // update world sounds
        for (const sound of this.activeSoundsInWorld) {

            // scale sound volume by distance to camera
            const dist = Math.distTo(sound.x, sound.y, user.cam.x, user.cam.y);
            if (dist == 0) {
                sound.volume = 1;
                continue;
            }

            const HEARING_RANGE = 40;
            sound.volume = Math.clamp01(1 - (dist / HEARING_RANGE));
            if(sound.ended) sound.delete = true;
        }

        this.activeSoundsInWorld = this.activeSoundsInWorld.filter(a => !a.delete);
    }

    playSound(name) {
        const audio = this.getAudioByName(name);
        if (!audio) {
            console.log(`no audio starting with ${name} was found`);
            return;
        }

        const clone = audio.cloneNode();
        clone.play();

        return clone;
    }

    playSoundInWorld(name, x, y) {
        const audioClone = this.playSound(name);
        audioClone.x = x;
        audioClone.y = y;

        this.activeSoundsInWorld.push(audioClone);
    }

    // get a list of audio files starting with name
    // this allows support for things like noise 0, noise 1, and noise 2 to be called by playSound('noise');
    // problems could arise if another file is named something like noise zombie 5, so hopefully dont do that
    getAudioByName(name) {
        const matches = [];

        for (const [audioName, audio] of audios) {
            if (audioName.startsWith(name)) {
                matches.push(audio);
            }
        }

        if (matches.length === 0) return null;

        return matches[Math.floor(Math.random() * matches.length)];
    }

    playMusic(src, condition) {
        const music = audios.get(src);
        music.condition = condition;
        music.volume = 0.5;
    }
}