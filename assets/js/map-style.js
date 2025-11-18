// 구글맵 스타일 JSON
const mapStyle = [
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

const GALLERY_BOUNDS = {
  north: GALLERY_NORTH_EAST_POSITION["lat"],
  south: GALLERY_SOUTH_WEST_POSITION["lat"],
  west: GALLERY_SOUTH_WEST_POSITION["lng"],
  east: GALLERY_NORTH_EAST_POSITION["lng"],
}

// 지도 렌더링 옵션
const mapOptions = {
  center: DEFAULT_CENTER_POSITION, // 기본 지도 위치
  zoom: 20, // 줌 레벨 설정
  styles: mapStyle,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true,
  streetViewControl: false,
  restriction: {
    latLngBounds: MAP_BOUNDS,
    strictBounds: false,
  }
};