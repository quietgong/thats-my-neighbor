let map;
let MOCK_USERS = [
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: DEFAULT_CENTER_POSITION["lat"],
        lng: DEFAULT_CENTER_POSITION["lng"],
    },
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: DEFAULT_CENTER_POSITION["lat"],
        lng: DEFAULT_CENTER_POSITION["lng"],
    },
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: DEFAULT_CENTER_POSITION["lat"],
        lng: DEFAULT_CENTER_POSITION["lng"],
    },
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: DEFAULT_CENTER_POSITION["lat"],
        lng: DEFAULT_CENTER_POSITION["lng"],
    },
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: DEFAULT_CENTER_POSITION["lat"],
        lng: DEFAULT_CENTER_POSITION["lng"],
    }
];
const userMarkers = new Map();
const currentUser = {
    "id": "",
    "lat": DEFAULT_CENTER_POSITION["lat"],
    "lng": DEFAULT_CENTER_POSITION["lng"],
    "accuracy": 0
};

/**
 * APIs
 */
async function uploadMyCurrentLocation() {
    try {
        await axios.post(`${API_BASE_URL}/locations`, {userId: currentUser.id, latitude: currentUser.lat, longitude: currentUser.lng});
        console.log("나의 위치 정보 업로드 성공")
    } catch (error) {
        console.error("나의 위치 정보 업로드 실패:", error)
    }
}

async function updateUsersLocation() {
    // 다른 유저들의 GPS 정보를 가져오는 API 호출
    let users;
    try {
        if (USE_MOCK) {
            users = MOCK_USERS;
        } else {
            const response = await axios.get(`${API_BASE_URL}/locations/${currentUser["id"]}`);
            users = await response.data["data"] || [];
        }
        console.log("전체 유저 위치정보 조회 성공:", JSON.stringify(users, null, 2));

        // 내 데이터 & 타인 데이터 분리
        const me = users.find(u => u.id === currentUser.id) || null;
        const others = users.filter(u => u.id !== currentUser.id).slice(0, 10); // 혹시 서버가 10명 넘게 보내면 방어

        // 현재 표시해야 할 모든 userId 목록 (문자열로 통일)
        const activeIds = new Set([...(me ? [String(me.id)] : []), ...others.map(u => String(u.id))]);

        // 내 위치 업데이트
        if (me) {
            updateUserMarker(me);
        }

        // 타인 최대 10명 위치 업데이트
        others.forEach(user => {
            updateUserMarker(user)
        });

        // 기존 마커 중 이번 업데이트 목록에 없는 유저 제거
        for (const [userKey, {marker, circle}] of userMarkers.entries()) {
            if (!activeIds.has(userKey)) {
                marker.setMap(null);
                circle.setMap(null);
                userMarkers.delete(userKey);
            }
        }
    } catch (error) {
        console.error("전체 유저 위치정보 조회 실패:", error)
    }
}

function updateUserMarker(user) {
    // 지도가 존재하지 않으면 리턴
    if (!map) return

    const userKey = String(user.id);
    const position = {
        lat: user.lat,
        lng: user.lng
    };

    if (userMarkers.has(userKey)) {
        const {marker, circle} = userMarkers.get(userKey)
        const prevPos = marker.getPosition().toJSON();
        smoothMove(marker, "marker", prevPos, position, 800, "easeInOutCubic");
        smoothMove(circle, "circle", prevPos, position, 800, "easeInOutCubic");
        pulseCircle(circle, 700);
        return;
    }
    const isCurrent = currentUser && user.id === currentUser.id
    const color = isCurrent ? "#4285F4" : "#EA4335";

    // 중심 마커
    const marker = new google.maps.Marker({
        position,
        map,
        icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2
        }
    });
    // ⭐ 마커 클릭 → 좌표 표시
    marker.addListener("click", () => {
      const pos = marker.getPosition();
      alert(
        `📍 마커 좌표\n` +
        `Lat: ${pos.lat()}\n` +
        `Lng: ${pos.lng()}`
      );
    });

    // 마커를 둘러싼 원
    const circle = new google.maps.Circle({
        map,
        center: position,
        radius: 2,
        fillColor: color,
        fillOpacity: 0.1,
        strokeColor: color,
        strokeOpacity: 0.4,
        strokeWeight: 1
    });
    userMarkers.set(userKey, {marker, circle})
}

async function initMap() {
    // map 객체 설정
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    const overlay = new google.maps.GroundOverlay(
        `${SITE_URL}/assets/img/map.png`,
        new google.maps.LatLngBounds(GALLERY_SOUTH_WEST_POSITION, GALLERY_NORTH_EAST_POSITION),
        {opacity: 1}
    );
    overlay.setMap(map);

    // fitBounds 적용
    map.fitBounds(new google.maps.LatLngBounds(
        GALLERY_SOUTH_WEST_POSITION, GALLERY_NORTH_EAST_POSITION
    ));

    // 초기 줌 우회 적용
    google.maps.event.addListenerOnce(map, "idle", () => {
        map.setZoom(TARGET_ZOOM_LEVEL);
        map.panTo(new google.maps.LatLngBounds(GALLERY_SOUTH_WEST_POSITION, GALLERY_NORTH_EAST_POSITION).getCenter());
    });

    // 마커 생성
    drawArtworkMarkers()

    // GPS 추적
    navigator.geolocation.watchPosition(handlePosition, handleError, {enableHighAccuracy: true});
}

async function handlePosition(position) {
    const gpsAccuracy = position.coords.accuracy;
    if (gpsAccuracy <= VALID_GPS_ACCURACY) {
        // 현재 나의 위치 정보 얻기
        currentUser.lat = position.coords.latitude;
        currentUser.lng = position.coords.longitude;
        console.log(`현재 나의 위치: ${JSON.stringify(currentUser, null, 2)}`);

        // 나의 위치 마커 업데이트
        updateUserMarker(currentUser);

        // 나의 위치 DB 업로드
        await uploadMyCurrentLocation();
    }
}

function handleError(error) {
    console.error("위치 정보를 가져오는 데 실패했습니다.", error);
}

function drawArtworkMarkers() {
    // 일반 설치물 마커 표시
    ART_WORKS.forEach((item) => {
        const marker = new google.maps.Marker({
            position: item.position,
            map,
            draggable: true, // 드래그 가능하게
            title: item.name,
            icon: {
                url: item.imageUrl,
                size: new google.maps.Size(MARKER_SIZE, MARKER_SIZE),
            },
        });
        const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${item.name}</h3><p>${item.description}</p>`,
        });
        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });
        marker.addListener("dragend", (event) => {
            const expandedPos = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            };

            const originalPos = toOriginal(expandedPos);

            console.log("📍 Expanded 좌표:", expandedPos);
            console.log("📌 Raw Original GPS:", originalPos);
        });
    });
}

function toOriginal(pos) {
    const {SW: oldSW, NE: oldNE} = GlobalBounds.old;
    const {SW: newSW, NE: newNE} = GlobalBounds.expanded;

    const tLat = (pos.lat - newSW.lat) / (newNE.lat - newSW.lat);
    const tLng = (pos.lng - newSW.lng) / (newNE.lng - newSW.lng);

    return {
        lat: oldSW.lat + (oldNE.lat - oldSW.lat) * tLat,
        lng: oldSW.lng + (oldNE.lng - oldSW.lng) * tLng
    };
}

function getUserId() {
    const data = JSON.parse(localStorage.getItem("userId"));
    if (data) {
        return data.value;
    } else {
        const userId = "user-" + Math.random().toString(36).substr(2, 9);
        const expire = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem("userId", JSON.stringify({value: userId, expire: expire}));
    }
}

function activateAr(objId) {
    const viewer = document.getElementById("hiddenViewer");
    viewer.src = `${SITE_URL}/assets/glb/${objId}.glb`;
    viewer.activateAR();
}

document.addEventListener("DOMContentLoaded", () => {
    // AR 버튼 이벤트 적용
    document.getElementById("ar1")
    currentUser["id"] = getUserId();
    if (USE_MOCK) {
        MOCK_USERS.push({id: currentUser["id"], lat: DEFAULT_CENTER_POSITION["lat"], lng: DEFAULT_CENTER_POSITION["lng"]});
        setInterval(async () => {
            moveAllMockUsers();
            await updateUsersLocation();
        }, UPDATE_INTERVAL);

    } else {
        setInterval(async () => {
            await updateUsersLocation();
        }, UPDATE_INTERVAL);
    }
});