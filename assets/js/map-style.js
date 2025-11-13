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

const MAP_BOUNDS = {
  north: 38.6122429469,
  south: 34.3900458847,
  west: 126.117397903,
  east: 129.468304478,
};

const CENTER_LAT = 35.109331;
const CENTER_LNG = 128.942799;

// 35.109753, 128.942376 (좌상단)
// 35.109537, 128.943379 (우상단)
//
// 35.109331, 128.942799 (중앙)


const mapOptions = {
  center: { lat: CENTER_LAT, lng: CENTER_LNG }, // 기본 지도 위치
  zoom: 20, // 줌 레벨 설정
  styles: mapStyle,
  mapTypeControl: false, // Disable map type (map/satellite)
  fullscreenControl: false, // Disable full screen button
  zoomControl: false, // Disable zoom in and out buttons
  streetViewControl: false, // Disable Street View control
  // restriction: {
  //   latLngBounds: MAP_BOUNDS,
  //   strictBounds: false,
  // },
  // gestureHandling: "none", // 지도 화면 이동 및 확대/축소 기능 중지
};
