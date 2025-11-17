let USE_MOCK = false; // GPS 모킹 테스트 모드 (true, false)
const VALID_GPS_ACCURACY = 40; // 업데이트할만한 GPS 정확도 기준
const API_BASE_URL = "https://rnd.api-plinqer.com/api" // 서버 API baseUrl
const AR_BASE_URL = "https://quietgong.github.io/thats-my-neighbor-ar";
const UPDATE_INTERVAL = 3 * 1000 // 위치 업데이트 주기

// 구글맵 스타일 JSON
const mapStyle = [
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

// 직지스마트타워 중심 위치
const DEFAULT_CENTER_POSITION = {lat: 36.640606, lng: 127.440260};

// 직지스마트타워 남서쪽 위치
const GALLERY_SOUTH_WEST_POSITION = {lat: 36.640294, lng: 127.439798};

// 직지스마트타워 북동쪽 위치
const GALLERY_NORTH_EAST_POSITION = {lat: 36.640855, lng: 127.440609};

const mapOptions = {
  center: DEFAULT_CENTER_POSITION, // 기본 지도 위치
  zoom: 20, // 줌 레벨 설정
  styles: mapStyle,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true,
  streetViewControl: false,
};

// 실제로 적용할 줌 레벨
const TARGET_ZOOM_LEVEL = 21;

// 마커 사이즈
const MARKER_SIZE = 36;

// 일반 설치물 정보
const NORMAL_ART_WORKS = [
    {
        name: "조각 A",
        position: {lat: 35.109113, lng: 128.942246},
        imageUrl: "assets/img/artwork.png",
        description: "금속 재질의 현대 조각 작품입니다.",
    },
];

// AR 설치물 정보
const AR_ART_WORKS = [
    {
        name: "회화 B",
        position: {lat: 35.109255, lng: 128.942564},
        imageUrl: "assets/img/artwork.png",
        description: "추상적인 색감의 회화 작품입니다.",
        arUrl: `${AR_BASE_URL}/ar2`
    },
];