class Inventory {
    constructor(container, width = 3, height = 3) {
        this.container = container;

        this.width = width;
        this.height = height;
        this.items = Array(width * height).fill(false);

        this.spacing = 100;
        this.size = 80;

        const gap = this.spacing - this.size;
        this.totalWidth = this.spacing * this.width - gap;
        this.totalHeight = this.spacing * this.height - gap;

        this.open = false;
        this.animation = 0;
        this.openCors = {
            x: canvas.width * 0.5,
            y: canvas.height * 0.5,
        };
        this.closedCors = {
            x: canvas.width * 0.5,
            y: canvas.height * 1 + this.totalHeight * 0.5,
        };
        this.x = this.openCors.x;
        this.y = this.openCors.y;
    }

    update() {
        const ANIMATION_SPEED = 0.05;
        if (this.open) this.animation = Math.min(this.animation + ANIMATION_SPEED, 1);
        else this.animation = Math.max(this.animation - ANIMATION_SPEED, 0);

        const ease = Math.easeInOut(this.animation);
        this.x = this.openCors.x * ease + this.closedCors.x * (1 - ease);
        this.y = this.openCors.y * ease + this.closedCors.y * (1 - ease);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        this.drawSlots();
        this.drawItems();

        ctx.restore();
    }

    drawSlots() {
        for (let n = 0; n < this.width * this.height; n++) {
            const cors = this.getLocalSlotCors(n);

            // check if the mouse is hovering over the option
            const mouseHovering = this.checkMouseHover(cors.x, cors.y);

            ctx.save();
            ctx.translate(cors.x, cors.y);

            ctx.lineWidth = mouseHovering ? 6 : 5;
            ctx.lineJoin = 'round';
            ctx.fillStyle = 'rgba(150,150,150,0.5)';
            ctx.strokeStyle = mouseHovering ? 'rgb(75,75,75)' : 'rgb(50,50,50)';
            ctx.fillRect(-this.spacing * 0.5, -this.spacing * 0.5, this.spacing, this.spacing);
            ctx.strokeRect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);

            ctx.restore();
        }
    }

    drawItems() {
        for (let n = 0; n < this.width * this.height; n++) {
            const item = this.items[n];
            if (!item) continue; // no item here

            const cors = this.getLocalSlotCors(n);
            const mouseHovering = this.checkMouseHover(cors.x, cors.y);

            ctx.save();
            ctx.translate(cors.x, cors.y);
            if (mouseHovering) ctx.scale(1.1, 1.1);

            item.draw();

            ctx.restore();
        }
    }

    getLocalSlotCors(slotIndex) {

        // get the cors of the first index slot
        const startingCors = {
            x: - this.totalWidth * 0.5 + this.size * 0.5,
            y: - this.totalHeight * 0.5 + this.size * 0.5,
        }

        // calculate offset from first index
        const offset = {
            x: this.spacing * (slotIndex % this.width),
            y: this.spacing * Math.floor(slotIndex / this.width),
        };

        // calculate final cors
        const x = startingCors.x + offset.x;
        const y = startingCors.y + offset.y;

        return { x, y };
    }

    checkMouseHover(lx, ly) {
        return user.mouse.inBox(
            this.x + lx - this.size * 0.5,
            this.y + ly - this.size * 0.5,
            this.size,
            this.size,
        )
    }
}