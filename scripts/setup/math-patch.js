const mathPatch = {
    normalize: function (v) {
        const len = Math.hypot(...v);
        return v.map(n => n / len);
    },
    cross: function (a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    },
    sub: function (a, b) {
        return a.map((v, i) => v - b[i]);
    },
    dot: function (a, b) {
        return a.reduce((sum, v, i) => sum + v * b[i], 0);
    },
    clamp: function (value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    clamp01: function (value) {
        return Math.clamp(value, 0, 1);
    },
    distTo: function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    dirTo: function (x1, y1, x2, y2) {
        return 90 + (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
    },
    distToMove: function (distance, direction) {
        return {
            x: distance * Math.sin(direction * Math.PI / 180),
            y: -distance * Math.cos(direction * Math.PI / 180)
        };
    },
    rotate: function (cx, cy, x, y, angle) {
        const rads = angle * Math.PI / 180;
        const cors = {
            x: (Math.cos(rads) * (x - cx)) + (Math.sin(rads) * (y - cy)) + cx,
            y: (Math.cos(rads) * (y - cy)) - (Math.sin(rads) * (x - cx)) + cy
        }
        
        return cors
    },
    modulo: function (a, n) {
        return ((a % n) + n) % n;
    },
    getSigmoid: function (a) {
        return 1 / (1 + Math.exp(-10 * a));
    },
    easeIn: function (a) {
        const s0 = Math.getSigmoid(-10);
        const s1 = Math.getSigmoid(0);
        return (Math.getSigmoid(a - 1) - s0) / (s1 - s0);
    },
    easeOut: function (a) {
        const s1 = Math.getSigmoid(0);
        return (Math.getSigmoid(a) - s1) / (1 - s1);
    },
    easeInOut: function (a) {
        const sMin = Math.getSigmoid(-5);
        const sMax = Math.getSigmoid(5);
        return (Math.getSigmoid(a - 0.5) - sMin) / (sMax - sMin);
    },
    lerp: function (a, b, t) {
        return a + (b - a) * t;
    },
    turn: function (angle, targetAngle) {
        angle = Math.modulo(angle, 360);
        targetAngle = Math.modulo(targetAngle, 360);

        let turnRight = targetAngle - angle;
        let turnLeft = (targetAngle - angle) + 360 * (turnRight < 0 ? 1 : -1);

        const closestTurn = (Math.abs(turnRight) < Math.abs(turnLeft) ? turnRight : turnLeft);
        return closestTurn;
    },
    degToRad: function (degrees) {
        return degrees * Math.PI / 180;
    },
    radToDeg: function (radians) {
        return radians * 180 / Math.PI;
    },
    generateRandomString: function (length) {
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
        var result = [];
        for (var i = 0; i < length; i++) {
            var index = Math.floor(Math.random() * characters.length);
            result.push(characters.charAt(index));
        }
        return result.join('');
    }
}