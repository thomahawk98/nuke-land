class Button {
    constructor(x, y, w, h, text, onclick) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.text = text;
        this.hovered = false;
        this.onclick = onclick;
    }

    update() {
        const hovered = user.mouse.inBox(this.x - this.w * 0.5, this.y - this.h * 0.5, this.w, this.h);
        if (!this.hovered && hovered) game.music.playSound('Hover.mp3');
        this.hovered = hovered;

        if (this.hovered && user.mouse.left.click) this.onclick();
    }

    draw() {
        ctx.fillStyle = this.hovered ? 'rgb(200,200,200)' : 'rgb(255,255,255)';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.hovered) {
            ctx.scale(1.1, 1.1);
            ctx.rotate(Math.sin(game.t * 0.02) * 2 * Math.PI / 180);
        }

        ctx.fillCorneredRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h, 20);
        ctx.strokeCorneredRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h, 20);

        ctx.f(70);
        ctx.fillStyle = 'black';
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }
}