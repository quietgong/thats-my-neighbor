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
const TARGET_ZOOM_LEVEL = 21; // 실제로 적용할 줌 레벨
const MIN_ZOOM_LEVEL = 16;

const USE_MOCK = false; // GPS 모킹 테스트 모드 (true, false)
const VALID_GPS_ACCURACY = 30; // 업데이트할만한 GPS 정확도 기준
const VALID_GPS_DISTANCE = 10; // 업데이트할만한 이전, 현재 GPS 거리 차이 기준
const UPDATE_INTERVAL = 3 * 1000 // 위치 업데이트 주기
const AR_MARKER_SIZE = 160;
const IS_AR_INITIALIZED = false;

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

// const mode = prompt("1:(미술관), 2:(청주), 3:(플링커)");
const mode = "1";
if (mode === "1") {
    MUSEUM_BOUNDS = {
        SW: {lat: 35.107652, lng: 128.941041},
        NE: {lat: 35.110951, lng: 128.945074}
    };
    GALLERY_BOUNDS = {
        SW: {lat: 35.10928655, lng: 128.94263734},
        NE: {lat: 35.10946673, lng: 128.94286114}
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
    zoomControl: false,
    minZoom: MIN_ZOOM_LEVEL,
    streetViewControl: false,
    gestureHandling: "greedy",
    disableDefaultUI: true,
    // restriction: {
    //     latLngBounds: MAP_BOUNDS,
    //     strictBounds: false,
    // }
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

// 설치물 정보
const ART_WORKS = [
    {
        name: "1-1",
        objId: "obj1",
        scale: 0.1,
        position: {lat: 35.10942538491098, lng: 128.9427596832875}
    },
    {
        name: "1-2",
        objId: "obj1",
        scale: 0.1,
        position: {lat: 35.10916411166995, lng: 128.94228642839087}
    },
    {
        name: "2-1",
        objId: "obj2",
        scale: 1,
        position: {lat: 35.10934982638116, lng: 128.9428083730949}
    },
    {
        name: "2-2",
        objId: "obj2",
        scale: 1,
        position: {lat: 35.10916886696274, lng: 128.94351381603204}
    },
    {
        name: "3-1",
        objId: "obj3",
        scale: 1,
        position: {lat: 35.10936842508164, lng: 128.94265167295467}
    },
    {
        name: "3-2",
        objId: "obj3",
        scale: 1,
        position: {lat: 35.10900130097335, lng: 128.9420814374489}
    },
];