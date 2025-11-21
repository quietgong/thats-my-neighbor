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
const TARGET_ZOOM_LEVEL = 22; // 실제로 적용할 줌 레벨
const USE_MOCK = true; // GPS 모킹 테스트 모드 (true, false)
const VALID_GPS_ACCURACY = 40; // 업데이트할만한 GPS 정확도 기준
const UPDATE_INTERVAL = 3 * 1000 // 위치 업데이트 주기

// 구글맵 지도 범위 (을숙도)
const MAP_BOUNDS = {
  north: 35.124699,
  south: 35.068264,
  west: 128.919671,
  east: 128.957813,
};

// 미술관 지도 범위 (부산현대미술관)
let MUSEUM_BOUNDS;

// 전시장 지도 범위 (부산현대미술관 2F)
let GALLERY_BOUNDS;

// 오버레이 이미지
const MUSEUM_IMAGE = `${SITE_URL}/assets/img/museum.png`;
const GALLERY_IMAGE = `${SITE_URL}/assets/img/gallery.png`;

const mode = "3";
// const mode = prompt("1:(미술관), 2:(청주), 3:(플링커)");
if (mode === "1") {
  MUSEUM_BOUNDS = {
    SW: {lat: 35.1088968, lng: 128.9421497},
    NE: {lat: 35.1102139, lng: 128.9436165},
  };
  GALLERY_BOUNDS = {
    SW: {lat: 35.1093710, lng: 128.9427137},
    NE: {lat: 35.1095148, lng: 128.9428891}
  };
}
if (mode === "2") {
  MUSEUM_BOUNDS = {
    SW: {lat: 36.6347369, lng: 127.4392633},
    NE: {lat: 36.6360540, lng: 127.4407301}
  };
  GALLERY_BOUNDS = {
    SW: {lat: 36.6352111, lng: 127.4398273},
    NE: {lat: 36.6353549, lng: 127.4400027}
  };
}
if (mode === "3") {
  MUSEUM_BOUNDS = {
    SW: {lat: 36.6400589, lng: 127.4395283},
    NE: {lat: 36.6413760, lng: 127.4409951}
  };
  GALLERY_BOUNDS = {
    SW: {lat: 36.6405331, lng: 127.4400923},
    NE: {lat: 36.6406769, lng: 127.4402677}
  };
}

// 전시장 가운데 위치
const CENTER_GALLERY_POSITION = {
  lat: (GALLERY_BOUNDS.SW.lat + GALLERY_BOUNDS.NE.lat) / 2,
  lng: (GALLERY_BOUNDS.SW.lng + GALLERY_BOUNDS.NE.lng) / 2,
}

// 지도 옵션
const MAP_OPTIONS = {
  center: CENTER_GALLERY_POSITION,
  zoom: 20, // 줌 레벨 설정
  styles: MAP_STYLE,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true,
  streetViewControl: false,
  gestureHandling: "greedy",
  // restriction: {
  //     latLngBounds: MAP_BOUNDS,
  //     strictBounds: false,
  // }
};

// 설치물 정보
const ART_WORKS = [
  {
    name: "조각 A",
    position: {lat: 35.109507561984636, lng: 128.94274269094618},
    size: {width: 120, height: 120},
    imageUrl: `${SITE_URL}/assets/img/artwork.png`,
  },
  {
    name: "회화 B",
    position: {lat: 35.10941610576727, lng: 128.94272896192697},
    size: {width: 120, height: 120},
    imageUrl: `${SITE_URL}/assets/img/artwork.png`,
  },
];