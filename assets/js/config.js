let USE_MOCK = false; // GPS 모킹 테스트 모드 (true, false)
const VALID_GPS_ACCURACY = 40; // 업데이트할만한 GPS 정확도 기준
const API_BASE_URL = "https://rnd.api-plinqer.com/api" // 서버 API baseUrl
const AR_BASE_URL = "https://quietgong.github.io/thats-my-neighbor-ar";
const UPDATE_INTERVAL = 3 * 1000 // 위치 업데이트 주기

// 구글맵 지도 범위 (을숙도)
const MAP_BOUNDS = {
    north: 35.124699,
    south: 35.068264,
    west: 128.919671,
    east: 128.957813,
};

// 나선형 설치물 위치
const DEFAULT_CENTER_POSITION =
    {
        lat: 35.109331,
        lng: 128.942799
    };

// 전시장의 남서쪽 위치
const GALLERY_SOUTH_WEST_POSITION =
    {
        lat: 35.109113,
        lng: 128.942246
    };

// 전시장의 북동쪽 위치
const GALLERY_NORTH_EAST_POSITION =
    {
        lat: 35.109255,
        lng: 128.942564
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