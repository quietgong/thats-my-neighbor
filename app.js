let map
const userMarkers = new Map()
let currentUser = null
let watchId = null
let isSharing = false
let updateInterval = null

const API_BASE_URL = "https://your-server.com/api" // 실제 서버 URL로 변경 필요
const USER_UPDATE_INTERVAL = 5000 // 5초마다 위치 업데이트

function initMap() {
  const centerLat = 37.4979
  const centerLng = 127.0276

  map = new window.google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: centerLat, lng: centerLng },
    mapTypeId: "roadmap",
  })

  currentUser = {
    id: "user-" + Math.random().toString(36).substr(2, 9),
    name: document.getElementById("username").value || "익명",
    lat: centerLat,
    lng: centerLng,
    accuracy: 0,
  }
}

async function fetchOtherUsersLocations() {
  try {
    const response = await fetch(`${API_BASE_URL}/locations`)
    if (!response.ok) throw new Error("Failed to fetch locations")

    const users = await response.json()
    console.log("[v0] Fetched users:", users)

    users.forEach((user) => {
      if (user.id !== currentUser.id) {
        updateUserMarker(user)
      }
    })
  } catch (error) {
    console.error("[v0] Error fetching user locations:", error)
  }
}

async function uploadCurrentLocation() {
  if (!isSharing || !currentUser) return

  try {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currentUser.id,
        name: currentUser.name,
        lat: currentUser.lat,
        lng: currentUser.lng,
        accuracy: currentUser.accuracy,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) throw new Error("Failed to upload location")
    console.log("[v0] Location uploaded successfully")
  } catch (error) {
    console.error("[v0] Error uploading location:", error)
  }
}

function updateUserMarker(user) {
  if (!map) return

  if (userMarkers.has(user.id)) {
    const marker = userMarkers.get(user.id)
    marker.marker.setPosition({ lat: user.lat, lng: user.lng })
    marker.circle.setCenter({ lat: user.lat, lng: user.lng })
  } else {
    const color = user.id === currentUser.id ? "#4285F4" : "#EA4335"

    const marker = new window.google.maps.Marker({
      position: { lat: user.lat, lng: user.lng },
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
      center: { lat: user.lat, lng: user.lng },
      radius: user.accuracy || 10,
      fillColor: color,
      fillOpacity: 0.1,
      strokeColor: color,
      strokeOpacity: 0.4,
      strokeWeight: 1,
    })

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="font-size: 12px; padding: 8px;">
          <strong>${user.name}</strong><br>
          위도: ${user.lat.toFixed(6)}<br>
          경도: ${user.lng.toFixed(6)}<br>
          정확도: ${Math.round(user.accuracy)}m
        </div>
      `,
    })

    marker.addListener("click", () => {
      infoWindow.open(map, marker)
    })

    userMarkers.set(user.id, { marker, circle, infoWindow })
  }
}

function startSharing() {
  isSharing = true
  document.getElementById("startBtn").style.display = "none"
  document.getElementById("stopBtn").style.display = "block"
  document.getElementById("status").style.display = "flex"

  if ("geolocation" in navigator) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        currentUser.lat = position.coords.latitude
        currentUser.lng = position.coords.longitude
        currentUser.accuracy = position.coords.accuracy
        currentUser.name = document.getElementById("username").value || "익명"

        document.getElementById("lat").textContent = currentUser.lat.toFixed(6)
        document.getElementById("lng").textContent = currentUser.lng.toFixed(6)
        document.getElementById("accuracy").textContent = Math.round(currentUser.accuracy) + "m"

        updateUserMarker(currentUser)
        map.panTo({ lat: currentUser.lat, lng: currentUser.lng })

        uploadCurrentLocation()
      },
      (error) => {
        console.error("위치 정보 오류:", error)
        alert("위치 정보를 가져올 수 없습니다.")
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
    )

    updateInterval = setInterval(fetchOtherUsersLocations, USER_UPDATE_INTERVAL)
  } else {
    alert("이 브라우저는 Geolocation을 지원하지 않습니다.")
  }
}

function stopSharing() {
  isSharing = false
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }

  if (updateInterval !== null) {
    clearInterval(updateInterval)
    updateInterval = null
  }

  document.getElementById("startBtn").style.display = "block"
  document.getElementById("stopBtn").style.display = "none"
  document.getElementById("status").style.display = "none"
}

function updateUserList() {
  const userList = document.getElementById("userList")
  userList.innerHTML = ""

  const allUsers = Array.from(userMarkers.values()).map((m) => {
    const position = m.marker.getPosition()
    return {
      id: Array.from(userMarkers.keys())[Array.from(userMarkers.values()).indexOf(m)],
      name: m.marker.getTitle(),
    }
  })

  allUsers.forEach((user) => {
    const userItem = document.createElement("div")
    userItem.className = "user-item"
    userItem.innerHTML = `
      <div class="user-name">${user.name}</div>
      <div class="user-status">${isSharing && user.id === currentUser.id ? "공유 중" : "대기 중"}</div>
    `
    userList.appendChild(userItem)
  })
}

document.getElementById("username").addEventListener("change", () => {
  currentUser.name = document.getElementById("username").value || "익명"
  updateUserMarker(currentUser)
  updateUserList()
})

document.getElementById("startBtn").addEventListener("click", startSharing)
document.getElementById("stopBtn").addEventListener("click", stopSharing)

document.addEventListener("DOMContentLoaded", () => {
  initMap()
  updateUserList()

  setInterval(updateUserList, 1000)
})
