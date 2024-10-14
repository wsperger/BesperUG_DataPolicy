
// Wavy background effect
(function() {
    const canvas = document.getElementById('wavyCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    const density = 0.92;
    const curvature = -0.15;
    const numLines = 30;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function drawCurvePattern() {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(88, 151, 222, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= numLines; i++) {
            const t = i / numLines;
            const startX = t * width;
            const startY = height;
            const curveX = width * Math.pow(1 - t, 2) * curvature;
            const curveY = height * (1 - Math.pow(t, 2)) * curvature;
            const endX = curveX;
            const endY = startY - (1 - t) * startY + curveY;

            if (i % Math.round(1 / density) === 0) {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        }
    }

    function init() {
        resizeCanvas();
        drawCurvePattern();
    }

    window.addEventListener('resize', init);

    init();
})();