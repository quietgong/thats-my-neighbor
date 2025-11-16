const Easing = {
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
};

function smoothMove(object, type, fromPos, toPos, duration = 700, easing = "easeInOutCubic") {
    const start = performance.now();

    function animate(time) {
        const elapsed = time - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = Easing[easing](t);

        const lat = fromPos.lat + (toPos.lat - fromPos.lat) * eased;
        const lng = fromPos.lng + (toPos.lng - fromPos.lng) * eased;

        if (type === "marker") {
            object.setPosition({lat, lng});
        }
        if (type === "circle") {
            object.setCenter({lat, lng});
        }

        if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function pulseCircle(circle, duration = 500) {
    const start = performance.now();
    const baseRadius = 2;     // 기존 원 크기
    const pulseSize = 3;      // 최대 커질 크기

    function animate(time) {
        const elapsed = time - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = Easing.easeInOutCubic(t);

        // 2 → 4 → 2 (왕복)
        const radius =
            t < 0.5
                ? baseRadius + (pulseSize - baseRadius) * (eased * 2)
                : pulseSize - (pulseSize - baseRadius) * ((eased - 0.5) * 2);

        circle.setRadius(radius);

        if (t < 1) requestAnimationFrame(animate);
        else circle.setRadius(baseRadius);
    }

    requestAnimationFrame(animate);
}