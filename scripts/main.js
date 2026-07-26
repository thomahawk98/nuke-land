// set up global variables
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const user = new User(canvas);
const game = new Game();
const loader = new Loader();
const editor = new StructureEditor();
//editor.enabled = true;
//user.cam.locked = false;

// set up the project
const title = "Night Cycle";
const dimensions = {
    width: 1000,
    height: 1000
}

setup.initialize(title, dimensions, canvas, ctx);

// load assets
const sources = {
    images: [
        'Zombie.png',
        'Player.png',
        'Axe.png', 'Machete.png', 'Bat.png',
        'Shotgun.png', 'Pistol.png',
        'Shotgun Ammo.png', 'Pistol Ammo.png',
        'Food.png'
    ],
    audios: [
        'Day By Day.mp3', 'Hum.mp3', 'Midnight Ballad.mp3',
        'Hover.mp3', 'Click.mp3',
        'Glass Breaking.mp3',
        'Bullet Impact 0.mp3', 'Bullet Impact 1.mp3', 'Bullet Impact 2.mp3',
        'Bullet Hit Flesh.mp3',
        'Axe Hit Flesh 0.mp3', 'Axe Hit Flesh 1.mp3',
        'Machete Hit Flesh 0.mp3', 'Machete Hit Flesh 1.mp3',
        'Bat Hit Flesh.mp3',
        'Whoosh.mp3',
        'Zombie 0.mp3', 'Zombie 1.mp3', 'Zombie 2.mp3', 'Zombie 3.mp3', 'Zombie 4.mp3', 'Zombie 5.mp3', 'Zombie 6.mp3', 'Zombie 7.mp3',
    ],
    fonts: [
        'super-crawler.ttf'
    ],
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
    if (editor.enabled) editor.tick();
    else game.tick();
    user.tick();
}