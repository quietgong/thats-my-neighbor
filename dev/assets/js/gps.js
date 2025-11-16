let map;
const userMarkers = new Map();
const validGpsAccuracy = 40;
const currentUser = {
  "id": "",
  "lat": DEFAULT_CENTER_POSITION["lat"],
  "lng": DEFAULT_CENTER_POSITION["lng"],
  "accuracy": 0
};
const API_BASE_URL = "https://rnd.api-plinqer.com/api" // 실제 서버 URL로 변경 필요
const UPDATE_INTERVAL = 3000 // 3초마다 위치 업데이트

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
  try {
    const response = await axios.get(`${API_BASE_URL}/locations/${currentUser["id"]}`);
    const users = await response.data["data"] || [];
    console.log("전체 유저 위치정보 조회 성공:", JSON.stringify(users, null, 2));

    // 내 데이터 & 타인 데이터 분리
    const me = users.find(u => u.id === currentUser.id) || null;

    const others = users
        .filter(u => u.id !== currentUser.id)
        .slice(0, 10); // 혹시 서버가 10명 넘게 보내면 방어

    // 현재 표시해야 할 모든 userId 목록 (문자열로 통일)
    const activeIds = new Set([...(me ? [String(me.id)] : []), ...others.map(u => String(u.id))]);

    // 내 위치 업데이트
    if (me) updateUserMarker(me);

    // 타인 최대 10명 위치 업데이트
    others.forEach(user => updateUserMarker(user));

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
    marker.setPosition(position)
    circle.setCenter(position)
    return
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
    radius: 1,
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

  // 구글맵 이미지 오버레이
  const floorPlanBounds = new google.maps.LatLngBounds(GALLERY_SOUTH_WEST_POSITION, GALLERY_NORTH_EAST_POSITION);
  const floorPlanOverlay = new google.maps.GroundOverlay("assets/img/map.png", floorPlanBounds, {opacity: 0.3});
  floorPlanOverlay.setMap(map);
  map.fitBounds(floorPlanBounds);

  // 마커 생성
  drawArtworkMarkers()

  // GPS 추적
  navigator.geolocation.watchPosition(handlePosition, handleError, {enableHighAccuracy: true});
}

async function handlePosition(position) {
  const gpsAccuracy = position.coords.accuracy;
  if (gpsAccuracy <= validGpsAccuracy) {
    // 현재 나의 위치 정보 얻기
    currentUser.lat = position.coords.latitude;
    currentUser.lng = position.coords.longitude;
    currentUser.accuracy = position.coords.accuracy;
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
  // 일반 설치물 마커
  normalArtworks.forEach((item) => {
    const marker = new google.maps.Marker({
      position: item.position,
      map,
      title: item.name,
      icon: item.imageUrl,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `<h3>${item.name}</h3><p>${item.description}</p>`,
    });
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });

  // AR 설치물 마커
  arArtworks.forEach((item) => {
    const marker = new google.maps.Marker({
      position: item.position,
      map,
      title: item.name,
      icon: item.imageUrl,
      animation: google.maps.Animation.BOUNCE,
    });
    marker.addListener("click", () => {
      window.location.href = item.arUrl;
    });
  });
}

function getLocalStorage(key) {
  const data = JSON.parse(localStorage.getItem(key));
  return data ? data.value : null;
}

function getUserId() {
  const getUserId = getLocalStorage("userId");
  if (getUserId) {
    return getUserId;
  } else {
    const userId = "user-" + Math.random().toString(36).substr(2, 9);
    const expire = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("userId", JSON.stringify({value: userId, expire: expire}));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  currentUser["id"] = getUserId();
  setInterval(updateUsersLocation, UPDATE_INTERVAL);
})
