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
let isGpsInitialized = false;
const userMarkers = new Map();
const currentUser = {id: "", lat: CENTER_GALLERY_POSITION["lat"], lng: CENTER_GALLERY_POSITION["lng"]};

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
    new google.maps.GroundOverlay(overlay[type]["image"], new google.maps.LatLngBounds(overlay[type]["bounds"]["SW"], overlay[type]["bounds"]["NE"]), {opacity: 1}).setMap(map);
}

async function initMap() {
    // map 객체 설정
    map = new google.maps.Map(document.getElementById("map"), MAP_OPTIONS);

    // 구글맵 이미지 오버레이
    mapImageOverlay("MUSEUM");
    mapImageOverlay("GALLERY");

    // 초기 줌 우회 적용
    google.maps.event.addListenerOnce(map, "idle", () => {
        map.setZoom(TARGET_ZOOM_LEVEL)
    });

    // 마커 생성
    drawArtworkMarkers()

    console.log(`initMap 완료`)
}

function trackingGps() {
    console.log(`GPS 시작`)
    isGpsInitialized = true;
    // GPS 추적
    navigator.geolocation.watchPosition(handleGPS, () => {
    }, {enableHighAccuracy: true});

    currentUser.id = getUserIdFromLocalStorage();
    if (USE_MOCK) {
        MOCK_USERS.push({id: currentUser["id"], lat: CENTER_GALLERY_POSITION["lat"], lng: CENTER_GALLERY_POSITION["lng"]});
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
    if (isGpsInitialized && position.coords.accuracy <= VALID_GPS_ACCURACY) {
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

function createArtworkMarker(item) {
    const markerSize = 120;
    const originalWidth = 1920;
    const originalHeight = 1080;
    const aspectRatio = originalHeight / originalWidth;
    const scaledWidth = markerSize;
    const scaledHeight = markerSize * aspectRatio;

    const marker = new google.maps.Marker({
        position: item.position,
        map,
        title: item.name,
        icon: {
            url: `${SITE_URL}/assets/marker/AR_Marker_${item.name}.png`,
            scaledSize: new google.maps.Size(scaledWidth, scaledHeight),
            anchor: new google.maps.Point(scaledWidth / 2, scaledHeight / 2)
        }
    });

    // 🔥 클릭 시 AR 실행
    marker.addListener("click", () => {
        alert(`model id = ${item.objId}`);
        viewer.src = `${SITE_URL}/assets/glb/${item.objId}.glb`;
        viewer.scale = `${item.scale} ${item.scale} ${item.scale}`;
        viewer.activateAR();
    });

    return marker;
}

function drawArtworkMarkers() {
    // 설치물 마커 표시
    ART_WORKS.forEach(item => {
        createArtworkMarker(item);
    });
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

const viewer = document.getElementById('mainViewer');

let loadedCount = 0;
const preloadIds = ['preload1', 'preload2', 'preload3'];
document.addEventListener('DOMContentLoaded', () => {
    preloadIds.forEach((id, i) => {
        document.getElementById(id).preload = true;
    });
    preloadIds.forEach(id => {
      const viewer = document.getElementById(id);
      viewer.addEventListener('load', () => {
        loadedCount++;
        console.log(`✅ ${viewer.src} preload 완료 (${loadedCount}/${preloadIds.length})`);
        if (loadedCount === preloadIds.length) {
          console.log('🎉 모든 GLB preload 완료!');
            alert('🎉 모든 GLB preload 완료!');
        }
      });

      // 혹시 로드 실패할 경우 대비
      viewer.addEventListener('error', (e) => {
        console.warn(`⚠️ ${viewer.src} preload 실패`, e);
      });
    });
});
