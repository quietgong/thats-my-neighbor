let map;
const userMarkers = new Map();
const currentUser = {"id": "", "lat": CENTER_LAT, "lng": CENTER_LNG, "accuracy": 0};

const API_BASE_URL = "http://115.20.193.140:8888/api" // 실제 서버 URL로 변경 필요
const UPDATE_INTERVAL = 3000 // 3초마다 위치 업데이트

async function initMap() {
    currentUser.id = getUserId();
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    navigator.geolocation.watchPosition(handlePosition, handleError, {enableHighAccuracy: true});
}

async function handlePosition(position) {
    const gpsAccuracy = position.coords.accuracy;
    if (gpsAccuracy <= 40) {
        currentUser.lat = position.coords.latitude;
        currentUser.lng = position.coords.longitude;
        currentUser.accuracy = position.coords.accuracy;
        console.log(`현재 나의 위치: ${JSON.stringify(currentUser, null, 2)}`);
        document.getElementById("lat").textContent = currentUser.lat.toFixed(6)
        document.getElementById("lng").textContent = currentUser.lng.toFixed(6)
        document.getElementById("accuracy").textContent = Math.round(currentUser.accuracy) + "m"

        updateUserMarker(currentUser); // 나의 위치 마커 업데이트
        await uploadMyCurrentLocation(); // 나의 위치 DB 업로드
    }
}

function handleError(error) {
    console.error("위치 정보를 가져오는 데 실패했습니다.", error);
}

function getUserId() {
    const getUserId = JSON.parse(localStorage.getItem("userId"));
    if (getUserId) {
        return getUserId;
    } else {
        const userId = "user-" + Math.random().toString(36).substr(2, 9);
        const expire = Date.now() + 24 * 60 * 60 * 1000;
        window.localStorage.setItem("userId", JSON.stringify({value: userId, expire: expire}));
    }
}

function updateUserMarker(user) {
    if (!map) return

    if (userMarkers.has(user.id)) {
        const marker = userMarkers.get(user.id)
        marker.marker.setPosition({lat: user.lat, lng: user.lng})
        marker.circle.setCenter({lat: user.lat, lng: user.lng})
    } else {
        const color = user.id === currentUser.id ? "#4285F4" : "#EA4335"

        const marker = new window.google.maps.Marker({
            position: {lat: user.lat, lng: user.lng},
            map: map,
            title: user.name,
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
            },
        })

        const circle = new window.google.maps.Circle({
            map: map,
            center: {lat: user.lat, lng: user.lng},
            radius: 2,
            fillColor: color,
            fillOpacity: 0.1,
            strokeColor: color,
            strokeOpacity: 0.4,
            strokeWeight: 1,
        })
        userMarkers.set(user.id, {marker, circle})
    }
}


// APIs
async function fetchOtherUsersLocations() {
    // 다른 유저들의 GPS 정보를 가져오는 API 호출
    const users = [
        {
            "id": "a",
            "lat": 35.109753,
            "lng": 128.942376
        },
        {
            "id": "b",
            "lat": 35.109537,
            "lng": 128.943379
        },
    ];
    console.log("[v0] Fetched users:", users)

    users.forEach((user) => {
        if (user.id !== currentUser.id) {
            updateUserMarker(user);
        }
    });

    // try {
    //     const response = await axios.get(`${API_BASE_URL}/locations`);
    //     const users = await response.json()
    //     console.log("[v0] Fetched users:", users)
    //
    //     users.forEach((user) => {
    //         if (user.id !== currentUser.id) {
    //             updateUserMarker(user);
    //         }
    //     })
    // } catch (error) {
    //     console.error("[v0] Error fetching user locations:", error)
    // }
}

async function uploadMyCurrentLocation() {
    return null;
    // try {
    //     const url = "";
    //     const data = {
    //         id: currentUser.id,
    //         lat: currentUser.lat,
    //         lng: currentUser.lng,
    //         accuracy: currentUser.accuracy,
    //         timestamp: new Date().toISOString(),
    //     }
    //     await axios.post(url, data);
    //     console.log("[v0] Location uploaded successfully")
    // } catch (error) {
    //     console.error("[v0] Error uploading location:", error)
    // }
}

document.addEventListener("DOMContentLoaded", () => {
    setInterval(fetchOtherUsersLocations, UPDATE_INTERVAL);
})
