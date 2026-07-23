// set up global variables
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const user = new User(canvas);
const game = new Game();
const loader = new Loader();

// set up the project
const title = "Nuke Land";
const dimensions = {
    width: 1000,
    height: 1000
}

setup.initialize(title, dimensions, canvas, ctx);


// load assets
const sources = {
    images: [],
    audios: [],
    fonts: ['super-crawler.ttf'],
};

// load the sources
loader.load(sources);


function main() {
    // clear old canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // run game loop
    if (loader.loaded) gameLoop();

    const animation = loader.getDrawAnimation();
    if (animation < 1) loader.draw(animation);

    // clear old mouse / key inputs
    user.clear();
}
window.setInterval(main, 10);

//run the game loop
function gameLoop() {
    game.tick();
    user.tick();
}