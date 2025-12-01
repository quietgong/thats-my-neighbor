const SITE_URL = window.location.protocol === "http:" ? window.location.origin : "https://quietgong.github.io/thats-my-neighbor";
const API_BASE_URL = "https://rnd.api-plinqer.com/api" // 서버 API baseUrl
const MAP_STYLE = [
  {featureType: "poi", stylers: [{visibility: "off"}]},
  {featureType: "transit", stylers: [{visibility: "off"}]},
  {featureType: "road", stylers: [{visibility: "off"}]},
  {featureType: "landscape", stylers: [{visibility: "simplified"}]},
  {
    "featureType": "administrative",
    "elementType": "all",
    "stylers": [
      {
        "saturation": "-100"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [
      {
        "saturation": -100
      },
      {
        "lightness": 65
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      {
        "saturation": -100
      },
      {
        "lightness": "50"
      },
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [
      {
        "saturation": "-100"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "all",
    "stylers": [
      {
        "lightness": "30"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "all",
    "stylers": [
      {
        "lightness": "40"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
      {
        "saturation": -100
      },
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "hue": "#ffff00"
      },
      {
        "lightness": -25
      },
      {
        "saturation": -97
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      {
        "lightness": -25
      },
      {
        "saturation": -100
      }
    ]
  }
];
const TARGET_ZOOM_LEVEL = 20; // 실제로 적용할 줌 레벨
const MIN_ZOOM_LEVEL = 17;
const GALLERY_SCALE = 2;
const IS_SERVER_ON = true; // DB 사용: true, JSON 사용: false
const USE_MOCK = false; // GPS 모킹 테스트 모드 (true, false)
let IS_GPS_INITIALIZED = false;
const VALID_GPS_DISTANCE = 10; // 업데이트할만한 이전, 현재 GPS 거리 차이 기준
const UPDATE_INTERVAL = 3 * 1000 // 위치 업데이트 주기

const AR_MARKER_SIZE = 160;
let IS_AR_INITIALIZED = false;

// 구글맵 지도 범위 (을숙도)
const MAP_BOUNDS = {
  north: 35.124699,
  south: 35.068264,
  west: 128.919671,
  east: 128.957813,
};

let MUSEUM_BOUNDS; // 미술관 지도 범위 (부산현대미술관)
const MUSEUM_IMAGE = `${SITE_URL}/assets/img/museum.png`; // 미술관 오버레이 이미지
let GALLERY_BOUNDS; // 전시장 지도 범위 (부산현대미술관 2F)
const GALLERY_IMAGE = `${SITE_URL}/assets/img/gallery.png`; // 전시장 오버레이 이미지

const urlSearchParams = new URLSearchParams(window.location.search);
const place = urlSearchParams.get("place");
if (place === "home") {
  console.log(`설정된 장소는 우리집입니다.`);
  MUSEUM_BOUNDS = {
    SW: {lat: 36.6347369, lng: 127.4392633},
    NE: {lat: 36.6360540, lng: 127.4407301}
  };
  GALLERY_BOUNDS = {
    SW: {lat: 36.6352111, lng: 127.4398273},
    NE: {lat: 36.6353549, lng: 127.4400027}
  };
} else if (place === "plinqer") {
  console.log(`설정된 장소는 플링커입니다.`);
  MUSEUM_BOUNDS = {
    SW: {lat: 36.6400589, lng: 127.4395283},
    NE: {lat: 36.6413760, lng: 127.4409951}
  };
  GALLERY_BOUNDS = {
    SW: {lat: 36.6405331, lng: 127.4400923},
    NE: {lat: 36.6406769, lng: 127.4402677}
  };
} else if (place === "gumi"){
  console.log(`설정된 장소는 구미입니다.`);
  MUSEUM_BOUNDS = {
    SW: {lat: 36.1498519, lng: 128.3317133 },
    NE: {lat: 36.1511690, lng: 128.3331801 }
  };
  GALLERY_BOUNDS = {
    SW: {lat: 36.1503261, lng: 128.3322773 },
    NE: {lat: 36.1504699, lng: 128.3324527 }
  };
} else {
  console.log(`설정된 장소는 을숙도입니다.`);
  MUSEUM_BOUNDS = {
    SW: {lat: 35.107652, lng: 128.941041},
    NE: {lat: 35.110951, lng: 128.945074}
  };
  GALLERY_BOUNDS = {
    SW: {lat: 35.10928655, lng: 128.94263734},
    NE: {lat: 35.10946673, lng: 128.94286114}
  };
  GALLERY_BOUNDS = scaleBounds(GALLERY_BOUNDS);
}

// 전시장 가운데 위치
const CENTER_MUSEUM_POSITION = {
  lat: (MUSEUM_BOUNDS.SW.lat + MUSEUM_BOUNDS.NE.lat) / 2,
  lng: (MUSEUM_BOUNDS.SW.lng + MUSEUM_BOUNDS.NE.lng) / 2,
}

// 전시장 가운데 위치
const CENTER_GALLERY_POSITION = {
  lat: (GALLERY_BOUNDS.SW.lat + GALLERY_BOUNDS.NE.lat) / 2,
  lng: (GALLERY_BOUNDS.SW.lng + GALLERY_BOUNDS.NE.lng) / 2,
}

// 지도 옵션
const MAP_OPTIONS = {
  center: CENTER_GALLERY_POSITION,
  zoom: 18, // 줌 레벨 설정
  styles: MAP_STYLE,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: false,
  minZoom: MIN_ZOOM_LEVEL,
  streetViewControl: false,
  gestureHandling: "greedy",
  disableDefaultUI: true,
  restriction: {
      latLngBounds: MAP_BOUNDS,
      strictBounds: false,
  }
};

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const toRad = x => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function scaleBounds(bounds) {
  const centerLat = (bounds.SW.lat + bounds.NE.lat) / 2;
  const centerLng = (bounds.SW.lng + bounds.NE.lng) / 2;

  const halfLat = (bounds.NE.lat - bounds.SW.lat) / 2;
  const halfLng = (bounds.NE.lng - bounds.SW.lng) / 2;

  const newHalfLat = halfLat * GALLERY_SCALE;
  const newHalfLng = halfLng * GALLERY_SCALE;

  return {
    SW: {
      lat: centerLat - newHalfLat,
      lng: centerLng - newHalfLng
    },
    NE: {
      lat: centerLat + newHalfLat,
      lng: centerLng + newHalfLng
    }
  };
}

const ART_WORKS = [
  // 설치물 정보
  {
    name: "1-1",
    objId: "obj1",
    scale: 0.1,
    position: {lat: 35.10924721955687, lng: 128.9425949498616}
  },
  {
    name: "1-2",
    objId: "obj1",
    scale: 0.1,
    position: {lat: 35.110270589026314, lng: 128.94222227635723}
  },
  {
    name: "2-1",
    objId: "obj2",
    scale: 1,
    position: {lat: 35.109516418938135, lng: 128.9426413835281}
  },
  {
    name: "2-2",
    objId: "obj2",
    scale: 1,
    position: {lat: 35.10945522118586, lng: 128.94384858658117}
  },
  {
    name: "3-1",
    objId: "obj3",
    scale: 1,
    position: {lat: 35.109354918272466, lng: 128.94293666827707}
  },
  {
    name: "3-2",
    objId: "obj3",
    scale: 1,
    position: {lat: 35.10900130097335, lng: 128.9420814374489}
  },
];
