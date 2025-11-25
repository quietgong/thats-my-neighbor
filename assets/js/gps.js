let map;
let MOCK_USERS = [
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: CENTER_GALLERY_POSITION["lat"],
        lng: CENTER_GALLERY_POSITION["lng"],
    },
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: CENTER_GALLERY_POSITION["lat"],
        lng: CENTER_GALLERY_POSITION["lng"],
    },
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: CENTER_GALLERY_POSITION["lat"],
        lng: CENTER_GALLERY_POSITION["lng"],
    },
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: CENTER_GALLERY_POSITION["lat"],
        lng: CENTER_GALLERY_POSITION["lng"],
    },
    {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        lat: CENTER_GALLERY_POSITION["lat"],
        lng: CENTER_GALLERY_POSITION["lng"],
    }
];
const userMarkers = new Map();
const currentUser = {id: "", lat: CENTER_GALLERY_POSITION["lat"], lng: CENTER_GALLERY_POSITION["lng"]};
const artworkMarkers = new Map(); // AR 작품 마커 저장용

// APIs
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
    const position = {lat: user.lat, lng: user.lng};

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

function mapImageOverlay(type) {
    const overlay = {
        "MUSEUM": {"image": MUSEUM_IMAGE, "bounds": MUSEUM_BOUNDS},
        "GALLERY": {"image": GALLERY_IMAGE, "bounds": GALLERY_BOUNDS},
    };
    new google.maps.GroundOverlay(
        overlay[type]["image"],
        new google.maps.LatLngBounds(overlay[type]["bounds"]["SW"], overlay[type]["bounds"]["NE"]),
        {opacity: 1, clickable: false}
    ).setMap(map);
}

async function initMap() {
    // map 객체 설정
    map = new google.maps.Map(document.getElementById("map"), MAP_OPTIONS);

    // 구글맵 이미지 오버레이
    mapImageOverlay("MUSEUM");
    mapImageOverlay("GALLERY");

    google.maps.event.addListenerOnce(map, "idle", () => {
        map.setZoom(TARGET_ZOOM_LEVEL)
    });

    google.maps.event.addListener(map, "zoom_changed", () => {
        const zoom = map.getZoom();
        console.log(`줌 레벨: ${zoom}`);
        const scaleFactor = Math.pow(0.8, TARGET_ZOOM_LEVEL - zoom);
        artworkMarkers.forEach((data, key) => {
            const {marker, aspectRatio} = data;
            if (marker.title === "1-1" || marker.title === "2-1" || marker.title === "3-1") {
                const base = AR_MARKER_SIZE;
                const newWidth = base * scaleFactor;
                const newHeight = base * aspectRatio * scaleFactor;

                marker.setIcon({
                    url: `${SITE_URL}/assets/marker/AR_Marker_${key}.png`,
                    scaledSize: new google.maps.Size(newWidth, newHeight),
                    anchor: new google.maps.Point(newWidth / 2, newHeight / 2)
                });
            }
        });
    });

    google.maps.event.addListener(map, "click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        console.log("클릭한 위치 좌표:", lat, lng);
    });

    createArtworkMarker();

    console.log(`initMap 완료`)
}

function trackingGps() {
    console.log(`GPS 시작`)
    currentUser.id = getUserIdFromLocalStorage();
    currentUser.lat = CENTER_GALLERY_POSITION.lat
    currentUser.lng = CENTER_GALLERY_POSITION.lng
    updateUserMarker(currentUser);

    // GPS 추적
    navigator.geolocation.watchPosition(handleGPS, () => {
    }, {enableHighAccuracy: true});

    if (USE_MOCK) {
        MOCK_USERS.push({id: currentUser["id"], lat: CENTER_GALLERY_POSITION.lat, lng: CENTER_GALLERY_POSITION.lng});
        setInterval(async () => {
            moveAllMockUsers();
            await updateUsersLocation();
        }, UPDATE_INTERVAL);
    } else {
        setInterval(async () => {
            await updateUsersLocation();
        }, UPDATE_INTERVAL);
    }
}

async function handleGPS(position) {
    const {latitude, longitude, accuracy} = position.coords;

    // 첫 GPS는 jump 체크 없이 바로 반영한다
    if (!IS_GPS_INITIALIZED) {
        IS_GPS_INITIALIZED = true;
        currentUser.lat = latitude;
        currentUser.lng = longitude;
        // printGPSDebug({latitude, longitude, accuracy, distance: 0});
        return;
    }

    // 거리 계산
    const distance = getDistanceMeters(currentUser.lat, currentUser.lng, latitude, longitude);

    // jump 필터
    if (distance > VALID_GPS_DISTANCE) {
        console.warn(`GPS jump detected: ${distance.toFixed(1)}m → ignored`);
        return;
    }

    // 정상 업데이트
    currentUser.lat = latitude;
    currentUser.lng = longitude;
    updateUserMarker(currentUser);
    await uploadMyCurrentLocation();
}

function createArtworkMarker() {
    const originalWidth = 1920;
    const originalHeight = 1080;
    const aspectRatio = originalHeight / originalWidth;

    ART_WORKS.forEach(item => {
        const baseSize = AR_MARKER_SIZE;
        const scaledWidth = baseSize;
        const scaledHeight = baseSize * aspectRatio;

        const marker = new google.maps.Marker({
            position: item.position,
            map,
            title: item.name,
            draggable: true,
            icon: {
                url: `${SITE_URL}/assets/marker/AR_Marker_${item.name}.png`,
                scaledSize: new google.maps.Size(scaledWidth, scaledHeight),
                anchor: new google.maps.Point(scaledWidth / 2, scaledHeight / 2)
            }
        });

        // 🔥 aspectRatio를 포함하여 저장해야 함
        artworkMarkers.set(item.name, {
            marker: marker,
            aspectRatio: aspectRatio
        });

        marker.addListener("click", () =>
            activateAr(item)
        );
    });
}

async function activateAr(item) {
    const iosLink = document.getElementById("ar-ios-link");
    const viewer = document.getElementById("mainViewer");

    const usdzUrl = `${SITE_URL}/assets/usdz/${item.objId}.usdz`;
    const glbUrl = `${SITE_URL}/assets/glb/${item.objId}.glb`;

    if (isIOS()) {
        // iOS: Quick Look 가장 안정적
        iosLink.href = usdzUrl;
        iosLink.click();
    } else {
        // Android/PC: model-viewer activateAR
        viewer.src = glbUrl;
        viewer.activateAR();
        if (IS_AR_INITIALIZED) {
            IS_GPS_INITIALIZED = true;
            viewer.activateAR();
        }
    }
}

function getUserIdFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("userId"));
    if (data) return data.value;
    else {
        const userId = "user-" + Math.random().toString(36).substr(2, 9);
        const expire = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem("userId", JSON.stringify({value: userId, expire: expire}));
    }
}

document.getElementById("startBtn").addEventListener("click", trackingGps);