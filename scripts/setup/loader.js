class Loader {
    constructor(assetFolderPath = '../assets') {
        this.assetFolderPath = assetFolderPath;

        this.loaded = false;

        this.loadStartTime = undefined;
        this.loadStartEnd = undefined;

        this.totalAssets = undefined;
        this.loadedAssets = 0;

        //create as global variables
        globalThis.images = new Map();
        globalThis.audios = new Map();
        globalThis.fonts = new Map();
    };

    async load(sources) {
        this.loadStartTime = performance.now();

        //count up all the sources
        this.totalAssets = Object.values(sources).flat().length;

        //total array of promises (to load all assets at once)
        const promises = [];

        //load sources for each source type
        for (const [sourceType, sourceValues] of Object.entries(sources)) {
            const loadFunctionName = 'load' + sourceType.charAt(0).toUpperCase() + sourceType.slice(1, -1);
            const loadFunction = this[loadFunctionName];
            if (typeof loadFunction !== 'function') {
                console.error(`no load function found for sourceType: ${sourceType} (function name: ${loadFunctionName})`);
                continue;
            }

            //load each asset
            for (const src of sourceValues) {
                promises.push(
                    this.loadAsset(src, loadFunction(src)).then(asset => {
                        globalThis[sourceType].set(src, asset);
                    })
                );
            }
        }

        await Promise.all(promises);

        //finished loading!
        this.loaded = true;
        this.loadEndTime = performance.now();
    };

    async loadAsset(name, promise) {
        const asset = await promise; //load the asset

        // asset loaded!
        this.loadedAssets++;
        return asset;
    }

    loadImage(name) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => resolve(image);
            image.onerror = reject;

            image.src = `${loader.assetFolderPath}/images/${name}`;
        });
    }

    loadAudio(name) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();

            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = reject;

            audio.src = `${loader.assetFolderPath}/audios/${name}`;
        });
    }

    loadFont(name) {
        const fontFamily = name.split('.')[0]; // remove .ttf at the end
        const font = new FontFace(
            fontFamily,
            `url(${loader.assetFolderPath}/fonts/${name})`
        );

        return font.load().then(font => {
            document.fonts.add(font);
            return font;
        });
    }

    getDrawAnimation() {
        if (this.loadEndTime == undefined) return 0; // loading still incomplete

        const TIME_UNTIL_FADE_OUT = 1000; //5s
        const timeElapsed = performance.now() - this.loadEndTime;
        if (timeElapsed > TIME_UNTIL_FADE_OUT) return 1; // loading was over a while ago bruh

        return timeElapsed / TIME_UNTIL_FADE_OUT;
    }

    draw(animation) {
        ctx.save();
        ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
        const scale = 1 + Math.easeInOut(animation) * 0.5;
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.clamp(1 - animation, 0, 1);

        ctx.fillStyle = 'black';
        ctx.fillRect(-canvas.width * 0.5, - canvas.height * 0.5, canvas.width, canvas.height);

        const percent = this.loadedAssets / this.totalAssets;

        this.drawLoadingText();
        this.drawLoadingLine(percent);
        this.drawLoadingPercent(percent);
        this.drawLoadingFraction();
        this.drawLoadingRemainder();

        ctx.gloablAlpha = 1;
        ctx.restore();
    };

    drawLoadingText() {
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '30px Arial';

        if (this.loaded) {
            ctx.fillText(`Loading complete`, 0, -30);
            return;
        }

        //dots
        const amount = 1 + performance.now() * 0.004 % 3;
        const dots = '.'.repeat(amount);

        //text
        function getLoadingText(time) {
            const texts = [
                'Loading',
                'Just a moment',
                'Working on it',
                'Almost there',
                'Finishing up',
            ];
            const seconds = time / 1000;
            const interval = Math.floor(seconds / 3) % texts.length;
            const text = texts[interval] += (seconds >= 6) ? `(${Math.floor(seconds)}s)` : '';

            return text;
        }

        //draw text
        const timeElapsed = performance.now() - this.loadStartTime;
        const text = getLoadingText(timeElapsed);
        ctx.fillText(`${text}${dots}`, 0, -30);
    };

    drawLoadingPercent(percent) {
        // percent loaded
        ctx.font = '25px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const text = `${Math.round(percent * 100)}%`;
        ctx.fillText(text, 220, 0);
    }

    drawLoadingFraction() {
        ctx.font = '25px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const text = `${this.loadedAssets}/${this.totalAssets}`;
        ctx.fillText(text, -220, 0);
    }

    drawLoadingLine(percent) {
        // loading line
        ctx.lineCap = 'round';
        ctx.lineWidth = 15;
        ctx.strokeStyle = 'rgba(125,125,125,0.5)';

        ctx.beginPath();
        ctx.moveTo(-200, 0);
        ctx.lineTo(200, 0);
        ctx.stroke();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;

        ctx.beginPath();
        ctx.moveTo(-200, 0);
        ctx.lineTo(-200 + 400 * percent, 0);
        ctx.stroke();
    };

    drawLoadingRemainder() {
        ctx.font = '15px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`waiting on ${this.totalAssets - this.loadedAssets} assets...`, 0, 30);
    }
}