// set up global variables
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const user = new User(canvas);
const game = new Game();
const loader = new Loader();
const editor = new StructureEditor();
//editor.enabled = true;

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
        'Zombie 0.png', 'Zombie 1.png', 'Zombie 2.png',
        'Player.png',
        'Axe.png', 'Machete.png', 'Bat.png', 'Spiked Bat.png',
        'Shotgun.png', 'Pistol.png', 'Flamethrower.png',
        'Shotgun Ammo.png', 'Pistol Ammo.png',
        'Food.png'
    ],
    audios: [
        'Day By Day.mp3', 'Hum.mp3', 'Midnight Ballad.mp3',
        'Hover.mp3', 'Click.mp3',
        'Eating 0.mp3', 'Eating 1.mp3',
        'Glass Breaking 0.mp3', 'Glass Breaking 1.mp3', 'Glass Breaking 2.mp3',
        'Bullet Impact 0.mp3', 'Bullet Impact 1.mp3', 'Bullet Impact 2.mp3',
        'Bullet Hit Flesh 0.mp3', 'Bullet Hit Flesh 1.mp3',
        'Axe Hit Flesh 0.mp3', 'Axe Hit Flesh 1.mp3',
        'Machete Hit Flesh 0.mp3', 'Machete Hit Flesh 1.mp3',
        'Thud Against Flesh.mp3',
        'Whoosh.mp3',
        'Zombie 0.mp3', 'Zombie 1.mp3', 'Zombie 2.mp3', 'Zombie 3.mp3', 'Zombie 4.mp3', 'Zombie 5.mp3', 'Zombie 6.mp3',
        'Pistol Firing.mp3', 'Pistol Empty.mp3',
        'Shotgun Firing.mp3', 'Shotgun Empty.mp3', 'Shotgun Reloading.mp3',
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