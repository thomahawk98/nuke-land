class Button {
    constructor(x, y, w, h, text, onclick, misc = {}) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.text = text;
        this.hovered = false;
        this.onclick = onclick;

        this.fillColor = 'white';
        this.hoverColor = 'rgb(200,200,200)';
        this.strokeColor = 'black';
        this.textColor = 'black';
        this.borderWidth = 5;
        this.textSize = 70;

        this.changeText = function () {}
        this.drawHovered = function () {}

        for (const [key, value] of Object.entries(misc)) {
            this[key] = value;
        }
    }

    update() {
        const hovered = user.mouse.inBox(this.x - this.w * 0.5, this.y - this.h * 0.5, this.w, this.h);
        if (!this.hovered && hovered) game.audioManager.playSound('Hover');
        this.hovered = hovered;

        if (this.hovered && user.mouse.left.click) {
            game.audioManager.playSound('Click');
            this.onclick();
        }

        this.changeText();
    }

    draw() {
        ctx.fillStyle = this.hovered ? this.hoverColor : this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.borderWidth;

        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.hovered) {
            ctx.scale(1.1, 1.1);
            ctx.rotate(Math.sin(game.t * 0.02) * 2 * Math.PI / 180);
            
            this.drawHovered();
        }

        const smallestDim = Math.min(this.w, this.h);
        const cornerAmount = Math.min(20, smallestDim * 0.25);

        ctx.fillCorneredRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h, cornerAmount);
        ctx.strokeCorneredRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h, cornerAmount);

        ctx.f(this.textSize);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.textColor;
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }
}