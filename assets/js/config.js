const SITE_URL = window.location.protocol === "http:" ? window.location.origin : "https://quietgong.github.io/thats-my-neighbor";
console.log(`SITE_URL = ${SITE_URL}`)

let USE_MOCK = false; // GPS 모킹 테스트 모드 (true, false)
const VALID_GPS_ACCURACY = 40; // 업데이트할만한 GPS 정확도 기준
const API_BASE_URL = "https://rnd.api-plinqer.com/api" // 서버 API baseUrl
const UPDATE_INTERVAL = 3 * 1000 // 위치 업데이트 주기

// 구글맵 지도 범위 (을숙도)
const MAP_BOUNDS = {
    north: 35.124699,
    south: 35.068264,
    west: 128.919671,
    east: 128.957813,
};

// 미술관 지도 범위
const MUSEUM_BOUNDS = {
    north: 35.1102139,
    south: 35.1088968,
    west: 128.9421497,
    east: 128.9436165,
}

// 나선형 설치물 위치
const DEFAULT_CENTER_POSITION = {lat: 35.109331, lng: 128.94279};

// 전시장의 남서쪽 위치
const GALLERY_SOUTH_WEST_POSITION = {lat: 35.1094477, lng: 128.9426923};

// 전시장의 북동쪽 위치
const GALLERY_NORTH_EAST_POSITION = {lat: 35.1094847, lng: 128.9427893};

// 실제로 적용할 줌 레벨
const TARGET_ZOOM_LEVEL = 23;

// 마커 사이즈
const MARKER_SIZE = 36;

// 설치물 정보
const ART_WORKS = [
    {
        name: "조각 A",
        position: {
            lat: 35.109507561984636,
            lng: 128.94274269094618
        },
        imageUrl: `${SITE_URL}/assets/img/artwork.png`,
        description: "금속 재질의 현대 조각 작품입니다.",
    },
    {
        name: "회화 B",
        position: {
            lat: 35.10941610576727,
            lng: 128.94272896192697
        },
        imageUrl: `${SITE_URL}/assets/img/artwork.png`,
        description: "추상적인 색감의 회화 작품입니다.",
    },
];