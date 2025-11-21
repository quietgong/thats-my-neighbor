let map;
const userMarkers = new Map();
let currentUser = {
  id: getUserId(),
  lat: (GALLERY_BOUNDS.SW.lat + GALLERY_BOUNDS.NE.lat) / 2,
  lng: (GALLERY_BOUNDS.SW.lng + GALLERY_BOUNDS.NE.lng) / 2,
};

// DR 상태
let filteredHeading = 0;
let velocity = 0;
let stepStrength = 0;
let lastUpdateTime = Date.now();

// DR 파라미터
const SPEED_FACTOR = 0.0000008;
const DECAY = 0.6; // 빠른 감쇠로 가속 억제
const HEADING_FILTER = 0.15;

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
    position: CENTER_GALLERY_POSITION,
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
    position: CENTER_GALLERY_POSITION,
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
  // setInterval(uploadMyCurrentLocation, 1000);
  // setInterval(updateUsersLocation, 1000);
  requestAnimationFrame(tick);
}

function handleHeading(e) {
  if (typeof e.alpha !== "number") return;
  let heading;
  if (isIOS) {
    const orientation = window.screen.orientation?.angle || 0;
    heading = (e.alpha + orientation);
    heading = (360 - heading) % 360;
  } else {
    heading = (360 - e.alpha) % 360;
  }
  filteredHeading =
      filteredHeading * (1 - HEADING_FILTER) +
      heading * HEADING_FILTER;
}

function handleStep(e) {
  if (!e.accelerationIncludingGravity) return;

  const ax = e.accelerationIncludingGravity.x;
  const ay = e.accelerationIncludingGravity.y;
  const az = e.accelerationIncludingGravity.z;

  const mag = Math.sqrt(ax * ax + ay * ay + az * az);

  if (mag > 12) {
    stepStrength = 1;
  }
  // 🔍 디버깅용 (원하면 표시)
  console.log(`
  mag: ${mag.toFixed(1)}, 
  threshold: 12, 
  SPEED_FACTOR: ${SPEED_FACTOR},
  DECAY: ${DECAY},
  velocity: ${velocity.toFixed(1)}, 
  stepStrength: ${stepStrength.toFixed(1)}
  `);
}

function tick() {
  if (MODE === "DEAD_RECKONING") {
    const now = Date.now();
    const dt = (now - lastUpdateTime) / 1000;
    lastUpdateTime = now;

    if (stepStrength > 0) velocity += SPEED_FACTOR * stepStrength;
    velocity *= DECAY;
    stepStrength *= 0.5;

    const rad = filteredHeading * Math.PI / 180;

    currentUser.lat = currentUser.lat + Math.cos(rad) * velocity;
    currentUser.lng = currentUser.lng + Math.sin(rad) * velocity;

    const me = userMarkers.get("me");
    me.marker.setPosition(currentUser);
    me.arrow.setPosition(currentUser);
    me.arrow.setIcon({
      path: "M 0 -20 L 10 0 L -10 0 Z",
      fillColor: "#4285F4",
      fillOpacity: 1,
      scale: 1.3,
      rotation: filteredHeading,
    });
    requestAnimationFrame(tick);
  }
}

function handleGPS(pos) {
  if (pos.coords.accuracy <= 40) {
    const dist = getDistanceMeters(
        pos.coords.latitude,
        pos.coords.longitude,
        CENTER_GALLERY_POSITION.lat,
        CENTER_GALLERY_POSITION.lng
    );
    if (dist > MAX_DEAD_RECKONING_DISTANCE) {
      alert("GPS 모드로 전환합니다.");
      console.log(`GPS disatnce = ${dist}`);
      MODE = "GPS";
      currentUser.lat = pos.coords.latitude;
      currentUser.lng = pos.coords.longitude;
    } else {
      MODE = "DEAD_RECKONING";
    }
  }
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

function activateAr(objId) {
  const viewer = document.getElementById("hiddenViewer");
  viewer.src = `${SITE_URL}/assets/glb/${objId}.glb`;
  viewer.activateAR();
}

document.getElementById("startBtn").addEventListener("click", requestSensorPermissions);

// =============================
// 🧪 Dead-Reckoning 테스트 모드
// =============================
const debugBox = document.createElement("div");
debugBox.style.cssText = `
  position:fixed; bottom:0; left:0; right:0;
  max-height:200px; overflow:auto;
  background:rgba(0,0,0,0.7); color:#0f0;
  font-size:12px; padding:5px; z-index:999999;
`;
document.body.appendChild(debugBox);

// console.log 오버라이드
const originalLog = console.log;
console.log = function (...args) {
  originalLog.apply(console, args);
  debugBox.innerHTML += args.join(" ") + "<br>";
  debugBox.scrollTop = debugBox.scrollHeight;
};

document.addEventListener("keydown", (e) => {
  const moveStep = 0.0000008; // 이동량 (필요하면 조정)
  const rotStep = 5; // 회전량 (deg)

  switch (e.key.toLowerCase()) {
    case "w": // forward
      currentUser.lat += Math.cos(filteredHeading * Math.PI / 180) * moveStep;
      currentUser.lng += Math.sin(filteredHeading * Math.PI / 180) * moveStep;
      break;

    case "s": // backward
      currentUser.lat -= Math.cos(filteredHeading * Math.PI / 180) * moveStep;
      currentUser.lng -= Math.sin(filteredHeading * Math.PI / 180) * moveStep;
      break;

    case "a": // left move
      filteredHeading -= rotStep;
      break;

    case "d": // right move
      filteredHeading += rotStep;
      break;

    case "q": // rotate left
      filteredHeading -= rotStep;
      break;

    case "e": // rotate right
      filteredHeading += rotStep;
      break;
  }
});