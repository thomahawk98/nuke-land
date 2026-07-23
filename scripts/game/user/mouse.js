class MouseTracker {
    constructor(canvas) {
        this.x = 0;
        this.y = 0;

        //buttons
        this.left = {
            down: false,
            click: false,
        }
        this.middle = {
            down: false,
            click: false
        }
        this.right = {
            down: false,
            click: false
        }

        //scroll
        this.scroll = { x: 0, y: 0 };

        MouseTracker.linkToEvents(this, canvas);
    }

    static linkToEvents(mouse, canvas) {

        //link the mouse to canvas events
        canvas.addEventListener('mousemove', (event) => {
            var rect = canvas.getBoundingClientRect();
            mouse.x = (event.pageX - rect.x) * canvas.width / rect.width;
            mouse.y = (event.pageY - rect.y) * canvas.height / rect.height;
        });
        canvas.addEventListener('mousedown', (event) => {
            if (event.button == 0) mouse.left.down = true;
            if (event.button == 1) mouse.middle.down = true;
            if (event.button == 2) mouse.right.down = true;
        });
        canvas.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                mouse.left.down = false;
                mouse.left.click = true;
            }
            if (event.button === 1) {
                mouse.middle.down = false;
                mouse.middle.click = true;
            }
            if (event.button === 2) {
                mouse.right.down = false;
                mouse.right.click = true;
            }
        });
        canvas.addEventListener('wheel', (event) => {
            mouse.scroll.x = event.deltaX;
            mouse.scroll.y = event.deltaY;
        });

        //prevent default actions
        canvas.oncontextmenu = function (event) {
            event.preventDefault();
        }
        canvas.onwheel = function (event) {
            event.preventDefault();
        }
    }

    inBox(x, y, w, h) {
        return this.x > x && this.x < x + w && this.y > y && this.y < y + h;
    }

    clear() {
        this.left.click = false;
        this.middle.click = false;
        this.right.click = false;
        
        this.scroll.x = 0;
        this.scroll.y = 0;
    }
}