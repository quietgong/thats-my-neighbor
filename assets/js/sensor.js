/******************************************************
 * SENSOR — Dead-Reckoning + GPS + 위치 공유 완전체
 ******************************************************/

let map;
const userMarkers = new Map();
let currentUser = {id: "", lat: 0, lng: 0};

// DR 상태
let filteredHeading = 0;
let velocity = 0;
let stepStrength = 0;

// 튜닝 값
let stepMultiplier = 1.0;
let speedMultiplier = 1.0;
let headingOffset = 0;

// DR 파라미터
const BASE_SPEED = 0.0000006; // 기존보다 4~5배 줄임
const DECAY = 0.85;
const FILTER = 0.15;

// GPS/DR 모드
let MODE = "DEAD_RECKONING";
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

function mapImageOverlay(type) {
  let image, bounds;

  if (type === "MUSEUM") {
    image = MUSEUM_IMAGE;
    bounds = MUSEUM_BOUNDS;
  }
  if (type === "GALLERY") {
    image = GALLERY_IMAGE;
    bounds = GALLERY_BOUNDS;
  }

  new google.maps.GroundOverlay(
      image,
      new google.maps.LatLngBounds(bounds.SW, bounds.NE),
      {opacity: 1}
  ).setMap(map);
}

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), MAP_OPTIONS);

  mapImageOverlay("MUSEUM");
  mapImageOverlay("GALLERY");

  google.maps.event.addListenerOnce(map, "idle", () => {
    map.setZoom(TARGET_ZOOM_LEVEL);
  });

  /** 내 마커 등록 (중요!) */
  const myMarker = new google.maps.Marker({
    map,
    position: {lat: currentUser.lat, lng: currentUser.lng},
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 2
    }
  });

  const myArrow = new google.maps.Marker({
    map,
    position: {lat: currentUser.lat, lng: currentUser.lng},
    icon: {
      path: "M 0 -20 L 10 0 L -10 0 Z",
      scale: 1.3,
      fillColor: "#4285F4",
      fillOpacity: 0.9,
      strokeColor: "#fff",
      strokeWeight: 1
    }
  });

  userMarkers.set("me", {marker: myMarker, arrow: myArrow});
}

async function requestSensorPermissions() {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    const r1 = await DeviceMotionEvent.requestPermission();
    const r2 = await DeviceOrientationEvent.requestPermission();
    if (r1 !== "granted" || r2 !== "granted") {
      alert("센서 권한이 필요합니다.");
      return;
    }
  }
  window.addEventListener("deviceorientation", handleHeading);
  window.addEventListener("devicemotion", handleStep);
  navigator.geolocation.watchPosition(handleGPS, () => {
  }, {enableHighAccuracy: true});
  // 위치 공유 루프
  setInterval(uploadMyCurrentLocation, 1000);
  setInterval(updateUsersLocation, 1000);
  requestAnimationFrame(tick);
}

function handleHeading(e) {
  if (typeof e.alpha !== "number") return;
  let h;
  if (isIOS) {
    const orientation = window.screen.orientation?.angle || 0;
    h = (e.alpha + orientation);
    h = (360 - h) % 360;
  } else {
    h = (360 - e.alpha) % 360;
  }
  h += headingOffset;
  filteredHeading = filteredHeading * (1 - FILTER) + h * FILTER;
}

function handleStep(e) {
  if (!e.accelerationIncludingGravity) return;
  const ax = e.accelerationIncludingGravity.x;
  const ay = e.accelerationIncludingGravity.y;
  const az = e.accelerationIncludingGravity.z;
  const mag = Math.sqrt(ax * ax + ay * ay + az * az);
  if (mag > 15) stepStrength = 1;
}

function handleGPS(pos) {
  const cLat = (GALLERY_BOUNDS.SW.lat + GALLERY_BOUNDS.NE.lat) / 2;
  const cLng = (GALLERY_BOUNDS.SW.lng + GALLERY_BOUNDS.NE.lng) / 2;
  const dist = getDistanceMeters(pos.coords.latitude, pos.coords.longitude, cLat, cLng);
  if (dist > MAX_DEAD_RECKONING_DISTANCE) {
    MODE = "GPS";
    currentUser.lat = pos.coords.latitude;
    currentUser.lng = pos.coords.longitude;
  } else {
    MODE = "DEAD_RECKONING";
  }
}

function tick() {
  if (MODE === "DEAD_RECKONING") {
    const speed = BASE_SPEED * speedMultiplier * SCALE_FACTOR;

    if (stepStrength > 0) velocity += speed;
    velocity *= DECAY;
    stepStrength *= 0.5;

    const rad = filteredHeading * Math.PI / 180;
    let nextLat = currentUser.lat + Math.cos(rad) * velocity;
    let nextLng = currentUser.lng + Math.sin(rad) * velocity;
    nextLat = Math.max(GALLERY_BOUNDS.SW.lat, Math.min(nextLat, GALLERY_BOUNDS.NE.lat));
    nextLng = Math.max(GALLERY_BOUNDS.SW.lng, Math.min(nextLng, GALLERY_BOUNDS.NE.lng));
    currentUser.lat = nextLat;
    currentUser.lng = nextLng;
  }
  updateMyMarkers();
  requestAnimationFrame(tick);
}

function updateMyMarkers() {
  const me = userMarkers.get("me");
  me.marker.setPosition({lat: currentUser.lat, lng: currentUser.lng});
  me.arrow.setPosition({lat: currentUser.lat, lng: currentUser.lng});
  me.arrow.setIcon({
    path: "M 0 -20 L 10 0 L -10 0 Z",
    scale: 1.3,
    rotation: filteredHeading,
    fillColor: "#4285F4",
    fillOpacity: 1
  });
}

async function uploadMyCurrentLocation() {
  try {
    await axios.post(`${API_BASE_URL}/locations`, {
      userId: currentUser.id,
      latitude: currentUser.lat,
      longitude: currentUser.lng,
      heading: filteredHeading
    });
  } catch (err) {
    console.error("내 위치 업로드 실패:", err);
  }
}

async function updateUsersLocation() {
  try {
    const res = await axios.get(`${API_BASE_URL}/locations/${currentUser.id}`);
    const users = res.data.data || [];

    const active = new Set(users.map(u => String(u.id)));

    users.forEach(updateUserMarker);
    cleanupOldUsers(active);

  } catch (err) {
    console.error("타인 위치 조회 실패:", err);
  }
}

function updateUserMarker(user) {
  const key = String(user.id);
  if (key === String(currentUser.id)) return;

  let entry = userMarkers.get(key);

  if (!entry) {
    const marker = new google.maps.Marker({
      map,
      position: {lat: user.lat, lng: user.lng},
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#FF5722",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2
      }
    });

    const arrow = new google.maps.Marker({
      map,
      position: {lat: user.lat, lng: user.lng},
      icon: {
        path: "M 0 -15 L 8 0 L -8 0 Z",
        scale: 1,
        rotation: user.heading || 0,
        fillColor: "#FF5722",
        fillOpacity: 1
      }
    });

    entry = {marker, arrow};
    userMarkers.set(key, entry);
  }

  entry.marker.setPosition({lat: user.lat, lng: user.lng});
  entry.arrow.setPosition({lat: user.lat, lng: user.lng});
}

function cleanupOldUsers(activeIds) {
  for (const key of userMarkers.keys()) {
    if (key === "me") continue;
    if (!activeIds.has(key)) {
      const entry = userMarkers.get(key);
      entry.marker.setMap(null);
      entry.arrow.setMap(null);
      userMarkers.delete(key);
    }
  }
}

function getUserId() {
  const data = JSON.parse(localStorage.getItem("userId"));
  if (data && data.value) return data.value;
  const newId = "user-" + Math.random().toString(36).substr(2, 9);
  const expire = Date.now() + 24 * 3600 * 1000;
  localStorage.setItem("userId", JSON.stringify({value: newId, expire}));
  return newId;
}

document.getElementById("startBtn").addEventListener("click", requestSensorPermissions);

document.addEventListener("DOMContentLoaded", () => {
  currentUser["id"] = getUserId();
  currentUser.lat = (GALLERY_BOUNDS.SW.lat + GALLERY_BOUNDS.NE.lat) / 2;
  currentUser.lng = (GALLERY_BOUNDS.SW.lng + GALLERY_BOUNDS.NE.lng) / 2;
  updateUserMarker(currentUser);
});