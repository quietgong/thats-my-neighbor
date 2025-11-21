function moveAllMockUsers() {
    MOCK_USERS = MOCK_USERS.map(user => {
        let newPos = getRandomNearbyPosition(user, 3); // 3m 정도 이동
        newPos = clampPositionToBounds(newPos, MUSEUM_BOUNDS);

        return {
            ...user,
            lat: newPos.lat,
            lng: newPos.lng,
        };
    });
}

function getRandomNearbyPosition(current, maxMoveMeters = 3) {
    const meterToDegree = 1 / 111320; // 1m를 위도 경도로 변환
    const randomLat = current.lat + (Math.random() - 0.5) * (maxMoveMeters * meterToDegree);
    const randomLng = current.lng + (Math.random() - 0.5) * (maxMoveMeters * meterToDegree);
    return {lat: randomLat, lng: randomLng};
}

function clampPositionToBounds(pos, bounds) {
    return {
        lat: Math.min(bounds.NE.lat, Math.max(bounds.SW.lat, pos.lat)),
        lng: Math.min(bounds.NE.lng, Math.max(bounds.SW.lng, pos.lng)),
    };
}