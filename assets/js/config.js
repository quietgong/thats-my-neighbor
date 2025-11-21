const SITE_URL = window.location.protocol === "http:" ? window.location.origin : "https://quietgong.github.io/thats-my-neighbor";
const API_BASE_URL = "https://rnd.api-plinqer.com/api";

// 2배 확장
const SCALE_FACTOR = 1;

// Dead-Reckoning, GPS 스위칭 범위
// 전시장 중심으로부터 40m 넘으면 GPS 모드 전환
const MAX_DEAD_RECKONING_DISTANCE = 40 * SCALE_FACTOR;

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

const TARGET_ZOOM_LEVEL = 22;

// 구글맵 지도 범위 (을숙도)
const MAP_BOUNDS = {
    north: 35.124699,
    south: 35.068264,
    west: 128.919671,
    east: 128.957813,
};

/******************************************************
 * CONFIG — 전체 좌표 / 확장 / 테스트 모드 / 변환 처리
 ******************************************************/

function computeBounds() {
    function applyScale(bounds, scale) {
        const north = bounds.NE.lat;
        const south = bounds.SW.lat;
        const east = bounds.NE.lng;
        const west = bounds.SW.lng;

        const centerLat = (north + south) / 2;
        const centerLng = (east + west) / 2;

        return {
            SW: {
                lat: centerLat + (south - centerLat) * scale,
                lng: centerLng + (west - centerLng) * scale
            },
            NE: {
                lat: centerLat + (north - centerLat) * scale,
                lng: centerLng + (east - centerLng) * scale
            }
        };
    }

    // 전역 Bounds 값 업데이트
    MUSEUM_BOUNDS.SW = applyScale(MUSEUM_BOUNDS, SCALE_FACTOR).SW;
    MUSEUM_BOUNDS.NE = applyScale(MUSEUM_BOUNDS, SCALE_FACTOR).NE;

    GALLERY_BOUNDS.SW = applyScale(GALLERY_BOUNDS, SCALE_FACTOR).SW;
    GALLERY_BOUNDS.NE = applyScale(GALLERY_BOUNDS, SCALE_FACTOR).NE;
}

const mode = prompt("A:(test), B:(미술관)");
let MUSEUM_BOUNDS;
let GALLERY_BOUNDS;
if (mode === "A") {
    MUSEUM_BOUNDS = {
        SW: {lat: 35.1088968, lng: 128.9421497},
        NE: {lat: 35.1102139, lng: 128.9436165},
    };
    GALLERY_BOUNDS = {
        SW: {lat: 35.1093710, lng: 128.9427137},
        NE: {lat: 35.1095148, lng: 128.9428891}
    };
}
if (mode === "B") {
    MUSEUM_BOUNDS = {
        SW: {lat: 36.6347369, lng: 127.4392633},
        NE: {lat: 36.6360540, lng: 127.4407301}
    };
    GALLERY_BOUNDS = {
        SW: {lat: 36.6352111, lng: 127.4398273},
        NE: {lat: 36.6353549, lng: 127.4400027}
    };
}

computeBounds();

// 지도 옵션
const MAP_OPTIONS = {
    center: {
        lat: (GALLERY_BOUNDS["SW"]["lat"] + GALLERY_BOUNDS["NE"]["lat"]) / 2,
        lng: (GALLERY_BOUNDS["SW"]["lng"] + GALLERY_BOUNDS["NE"]["lng"]) / 2
    },
    zoom: 20, // 줌 레벨 설정
    styles: MAP_STYLE,
    mapTypeControl: false,
    fullscreenControl: false,
    zoomControl: true,
    streetViewControl: false,
    gestureHandling: "greddy",
    // restriction: {
    //     latLngBounds: MAP_BOUNDS,
    //     strictBounds: false,
    // }
};

// 오버레이 이미지
const MUSEUM_IMAGE = `${SITE_URL}/assets/img/museum.png`;
const GALLERY_IMAGE = `${SITE_URL}/assets/img/gallery.png`;

// Dead-Reckoning과 GPS 간 거리 비교에 사용
function getDistanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
