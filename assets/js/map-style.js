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

// 구글맵 지도 범위 (을숙도)
const MAP_BOUNDS = {
  north: 35.122864,
  south: 35.072120,
  west: 128.952498,
  east: 128.929832,
};

// 나선형 설치물 위치
const DEFAULT_CENTER_POSITION = {lat: 35.109331, lng: 128.942799};

// 전시장의 남서쪽 위치
const GALLERY_SOUTH_WEST_POSITION = {lat: 35.109113, lng: 128.942246};

// 전시장의 북동쪽 위치
const GALLERY_NORTH_EAST_POSITION = {lat: 35.109255, lng: 128.942564};

const mapOptions = {
  center: DEFAULT_CENTER_POSITION, // 기본 지도 위치
  zoom: 20, // 줌 레벨 설정
  styles: mapStyle,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true,
  streetViewControl: false,
  // restriction: {
  //   latLngBounds: MAP_BOUNDS,
  //   strictBounds: false,
  // }
};

// 일반 설치물 정보
const normalArtworks = [
    {
      name: "조각 A",
      position: {lat: 35.109113, lng: 128.942246},
      imageUrl: "assets/img/artwork.png",
      description: "금속 재질의 현대 조각 작품입니다.",
    },
  ];

const arBaseUrl = "https://quietgong.github.io/thats-my-neighbor-ar";
// AR 설치물 정보
const arArtworks = [
    {
      name: "회화 B",
      position: {lat: 35.109255, lng: 128.942564},
      imageUrl: "assets/img/artwork.png",
      description: "추상적인 색감의 회화 작품입니다.",
      arUrl: `${arBaseUrl}/ar2`
    },
  ];