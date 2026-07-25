const setup = {
    initialize: function (title, dimensions, canvas, ctx) {
        document.title = title;

        this.patchMath();
        this.setupCSS(canvas);
        this.fitCanvas(dimensions, canvas);
        this.patchCtx(ctx);
    },
    patchMath() {
        for (const [key, value] of Object.entries(mathPatch)) {
            Math[key] = value;
        }
    },
    setupCSS(canvas) {
        document.body.style.backgroundColor = "rgb(50,50,50)";
        document.body.style.margin = 0;

        canvas.style.backgroundColor = 'rgb(255,255,255)';
        canvas.style.margin = 0;
        canvas.style.position = "absolute";
        canvas.style.top = "50%";
        canvas.style.left = "50%";
        canvas.style["-ms-transform"] = "translate(-50%,-50%)";
        canvas.style.transform = "translate(-50%,-50%)";

    },
    fitCanvas(dimensions, canvas) {
        // fit the canvas to the display (keep as much on the screen as possible)
        const ratio = dimensions.width / dimensions.height;

        const widthSize = ratio >= 1
            ? `calc(min(${100 / ratio}vw, 100vh) * ${ratio})`
            : `min(100vw, ${100 * ratio}vh)`;

        const heightSize = ratio >= 1
            ? `min(${100 / ratio}vw, 100vh)`
            : `calc(min(100vw, ${100 * ratio}vh) * ${1 / ratio})`;

        canvas.style.width = widthSize;
        canvas.style.height = heightSize;

        //set the dimensions
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
    },
    patchCtx(ctx) {
        ctx.corneredRect = function (x, y, w, h, r) {
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.lineTo(x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.lineTo(x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.lineTo(x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.lineTo(x + r, y);
        }

        ctx.fillCorneredRect = function (x, y, w, h, r) {
            ctx.beginPath();
            ctx.corneredRect(x, y, w, h, r);
            ctx.fill();
        }

        ctx.strokeCorneredRect = function (x, y, w, h, r) {
            ctx.beginPath();
            ctx.corneredRect(x, y, w, h, r);
            ctx.stroke();
        }

        ctx.line = function (x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        ctx.fillCirc = function(x, y, r) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.strokeCirc = function(x, y, r) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.f = function (size) {
            ctx.font = `${size}px super-crawler`;
        }

        ctx.regularPolygon = function (x, y, s, r, a = 0) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(a * Math.PI / 180);
            ctx.moveTo(0, -r);
            for (let n = 0; n < s; n++) {
                ctx.rotate(Math.PI * 2 / s);
                ctx.lineTo(0, -r);
            }
            ctx.closePath();
            ctx.restore();
        }

        ctx.fillRegularPolygon = function (x, y, s, r, a = 0) {
            ctx.beginPath();
            ctx.regularPolygon(x, y, s, r, a);
            ctx.fill();
        }

        ctx.strokeRegularPolygon = function (x, y, s, r, a = 0) {
            ctx.beginPath();
            ctx.regularPolygon(x, y, s, r, a);
            ctx.stroke();
        }
    },
}