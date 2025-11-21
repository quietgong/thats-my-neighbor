const instructionModal = document.getElementById('instructionModal');
const infoModal = document.getElementById('infoModal');
const closeInfoBtn = document.getElementById('closeInfo');
const startBtn = document.getElementById('startBtn');
const infoBtn = document.getElementById('infoBtn');
let isInstructionModalShow = false;
let isInfoModalShow = false;

const INSTRUCTION_SEEN_KEY = 'visited'; // localStorage 키

function showGuideModal() {
    // if (!localStorage.getItem(INSTRUCTION_SEEN_KEY)) {
    //     instructionModal.classList.add('show');
    //     isInfoModalShow = true;
    // }
    instructionModal.classList.add('show');
    isInstructionModalShow = true;
    isInfoModalShow = false;
}

function closeGuideModal() {
    instructionModal.classList.remove('show');
    localStorage.setItem(INSTRUCTION_SEEN_KEY, 'true'); // 사용자가 안내를 봤음을 기억
    isInstructionModalShow = false;
}

function showInfoModal() {
    infoModal.classList.add('show');
    isInfoModalShow = true;
    isInstructionModalShow = false;
}

function closeInfoModal() {
    infoModal.classList.remove('show');
    isInfoModalShow = false;
}

function clickOutModal(event) {
    // 모달 배경을 클릭했을 때만 닫기 (콘텐츠 클릭 시 무시)
    if (event.target === event.currentTarget) {
        if (event.currentTarget === infoModal) {
            closeInfoModal();
        }
    }
}

const guideTextContent = {
    kr: [
        "안녕하세요. <댓츠 마이 네이버>에 오신 것을 환영합니다.",
        "지도를 따라 전시장을 자유롭게 거닐며 이웃들을 만나보세요.",
        "🔵 파란 점: 내 위치",
        "🔴 빨간 점: 함께 관람 중인 다른 이웃들",
        "위치정보 권한 허용을 클릭하시면 지도가 활성화됩니다.",
        "우측 상단의 ⓘ버튼을 눌러 작품 정보를 확인하세요."
    ],
    en: [
        "Welcome to That's My Neighbour.",
        "Feel free to wander through the exhibition following the map and meet our neighbours.",
        "🔵 Blue dot: Your location",
        "🔴 Red dots: Other neighbours viewing the exhibition",
        "The map will be activated once you allow location permissions.",
        "Press the ⓘ button in the top right corner to view artwork information."
    ]
};

const infoTextContent = {
    kr: [
        "더 파일룸의 ⟨댓츠 마이 네이버⟩에 오신 것을 환영합니다. ⟨댓츠 마이 네이버⟩는 부산 영도에서 만날 수 있는 진정한 '이웃'을 찾아 떠나는 여정이 담긴 작품입니다. 이곳에서는 사람뿐 아니라 녹슨 철근, 담벼락의 이끼, 하구의 작은 생명체들까지 모두가 소중한 이웃입니다.",
        "●	설치",
        "크기도 모양도 제각각인 문들. 이 각기 다른 문은 영도에 모여든 사람들의 서로 다른 삶과 역사를 담고 있습니다. 그 안에 놓여있는 나선형 구조물은 끝없이 이어지는 순환과 시간의 흐름. 쇠퇴와 재생을 반복하며 살아가는 생태계의 리듬을 상징합니다.",
        "●	AR (증강현실)",
        "움직이는 아이콘을 클릭해보세요. 스크린 위로 조선소의 철근과 담벼락 이끼, 해안가 생물 등 쉽게 눈에 보이지 않던 이웃들의 세계가 펼쳐집니다.",
        "●	책자",
        "나선형 구조물 위에는 책자가 놓여 있어요. 영도 리서치부터 작품 제작, 전시에 이르는 전 과정을 한 권에 담았습니다.",
        "●	사운드 / 진동",
        "대평동 공장에서 배를 고치며 나는 깡깡이 소리, 을숙도 늪지대를 스치는 바람과 새소리가 공간을 채웁니다. 바닥에 깔린 모래의 촉감과 진동은 영도 바닷가의 기억을 몸으로 불러옵니다. 천천히 둘러보며 영도를 온몸의 감각으로 경험해보세요.",
        "●	영상",
        "폐조선소 철근 틈새로 자라나는 풀, 빈집에 들어선 작은 생명들, 하구에서 끊임없이 순환하는 자연의 움직임은 사람이 떠난 자리에서도 생명은 계속되고, 쇠퇴 속에서도 새로운 공존의 가능성이 싹튼다는 것을 보여줍니다.",
        "●	물건",
        "깡깡이 예술마을을 아시나요? 산업유산에서 문화예술도시로 발돋움한 이곳, 배를 고치고 철을 다루며 살아온 주민들의 이야기가 낡은 어구와 선박 장비비 하나하나에 스며들어 있습니다. 전시장 곳곳을 거닐며 지도에는 숨겨진 물건들을 직접 만나보세요.",
        "도움주신 분들",
        "●	작품 제작 지원",
        "기술지원(AR, 웹): 오준호, 정수봉",
        "3D 모델링 및 애니메이션: 우수빈",
        "구조물 제작 및 설치: 임기혁, 장승우",
        "",
        "●	출판물",
        "글: 박은지, 신하라, 유리진",
        "그래픽 디자인: 케빈 호프만",
        "사진 제공: 아카이브 영도(ydmemory.com), 깡깡이예술마을사업",
        "인쇄 및 제본: 연일 인쇄소",
        "",
        "감사한 분들",
        "자료제공: (사)대평동 마을회(회장: 박기영, 부회장: 박영오)",
        "인터뷰: 이완택",
        "",
        "이 웹은 《나의 집이 나》(부산현대미술관, 2025. 11. 29. – 2026. 3. 22.) 의 참여 작품 ⟨댓츠 마이 네이버⟩(2025)의 일부로 제작되었습니다. 전시 기간 중 미술관 2층 전시장, 카페, 엘리베이터, 계단, 야외 조각공원, 주차장 등에 부착된 QR 코드를 통해서 자유롭게 관람하실 수 있습니다.",
        "",
        "© 2025 더 파일룸",
        "이 웹에 실린 글과 이미지의 저작권은 더 파일룸에게 있습니다. 저작권법에 의해 보호를 받는 창작물이므로 무단 복제, 변형, 송신을 금합니다.",
    ],
    en: [
        "Welcome to The File Room's That's My Neighbour. That's My Neighbour is a work that captures a journey in search of the true 'neighbours' one can encounter in Yeongdo, Busan. Here, not only people but also rusted rebar, moss on walls, and tiny creatures in the estuary are all precious neighbours.",
        "●	Installation",
        "Doors of various sizes and shapes. Each different door contains the diverse lives and histories of people who have gathered in Yeongdo. The spiral structures placed within them symbolise endless cycles and the flow of time—the rhythm of an ecosystem that lives through repeated decline and regeneration.",
        "",
        "●	AR",
        "Click on the moving icon. The world of neighbours that were previously invisible unfolds on your screen: rebar from shipyards, moss on walls, and coastal organisms.",
        "",
        "●	Booklet",
        "A booklet rests atop the spiral structure. It documents the entire process from Yeongdo research through artwork production to the exhibition in a single volume.",
        "",
        "●	Sound / Vibration",
        "The ‘Kangkangee’ sounds of ships being repaired in Daepyeong-dong factories, and the wind and birdsong sweeping across Eulsukdo wetlands fill the space. The texture and vibration of the sand on the floor evoke bodily memories of Yeongdo's seashore. Take your time looking round and experience Yeongdo through all your senses.",
        "",
        "●	Video",
        "Grass growing through the cracks in abandoned shipyard rebar, small creatures settling in empty houses, and nature's constant circulation in the estuary demonstrate that life continues even where people have left, and that new possibilities for coexistence emerge even amidst decline.",
        "",
        "●	Objects",
        "Have you heard of Kangkangee Art Village? In this place that has evolved from industrial heritage to a cultural and artistic hub, the stories of residents who have lived by repairing ships and working with metal are embedded in every worn fishing tool and piece of ship equipment. Wander throughout the exhibition space and discover the hidden objects on the map for yourself.",
        "",
        "Acknowledgements",
        "●	Artwork Production Support",
        "Technical support (AR, web): Oh Jun-ho, Jung Su-bong",
        "3D modelling and animation: Woo Su-bin",
        "Structure fabrication and installation: Lim Keehyuk, Chang Seungwoo",
        "",
        "●	Publication",
        "Text: Park Eunji, Shin Hara, Yoo Rijin",
        "Graphic design: Kevin Hofmann",
        "Photography provided by: Archive Yeongdo (ydmemory.com), Kkangkkang-i Art Village Project",
        "Printing and binding: Yeonil Printing",
        "",
        "With Thanks To",
        "Material provision: Daepyeong-dong Community Association (Chairman: Park Ki-young, Vice-chairman: Park Young-oh)",
        "Interview: Lee Wan-taek",
        "This website was created as part of That's My Neighbour (2025), a participating work in the exhibition Call Me by My Home (Museum of Contemporary Art Busan, 29 November 2025 – 22 March 2026). During the exhibition period, you may view it freely via QR codes displayed in the museum's 2nd floor exhibition hall, café, lifts, staircases, outdoor sculpture park, car park, and other locations.",
        "© 2025 The File Room The copyright of the text and images on this website belongs to The File Room. As creative works protected by copyright law, unauthorised reproduction, modification, and transmission are prohibited.",
    ]
}

function switchLanguage(lang) {
    let titleId, textId, contentSet;

    if (isInstructionModalShow) {
        titleId = "guide-title";
        textId = "guide-text";
        contentSet = guideTextContent;
    } else if (isInfoModalShow) {
        titleId = "info-title";
        textId = "info-text";
        contentSet = infoTextContent;
    }

    // 제목 변경
    const title = document.getElementById(titleId);
    title.textContent = title.dataset[lang];

    // 본문 변경
    const container = document.getElementById(textId);
    container.innerHTML = contentSet[lang]
        .map(text => `<p class="guide-line">${text}</p>`)
        .join("");
}

function initializeLanguage(){
    const sections = [
        {
            titleId: "guide-title",
            textId: "guide-text",
            contentSet: guideTextContent
        },
        {
            titleId: "info-title",
            textId: "info-text",
            contentSet: infoTextContent
        }
    ];

    for (const s of sections) {

        // 제목 변경
        const title = document.getElementById(s.titleId);
        if (title) {
            title.textContent = title.dataset.kr;
        }

        // 본문 변경
        const container = document.getElementById(s.textId);
        if (container) {
            container.innerHTML = s.contentSet.kr
                .map(text => `<p class="guide-line">${text}</p>`)
                .join("");
        }
    }
}

// 실제 운영
document.addEventListener("DOMContentLoaded", function () {
    // 안내 모달이 이전에 본 적이 없으면 표시
    showGuideModal();

    // 사용 안내 모달 이벤트
    startBtn.addEventListener('click', closeGuideModal);

    // INFO 모달 이벤트
    infoBtn.addEventListener('click', showInfoModal);
    closeInfoBtn.addEventListener('click', closeInfoModal);

    // INFO 모달 외부 클릭 시 닫기
    instructionModal.addEventListener('click', clickOutModal);
    infoModal.addEventListener('click', clickOutModal);

    initializeLanguage();
})

// 테스트
// document.addEventListener("DOMContentLoaded", function () {
//     // 안내 모달이 이전에 본 적이 없으면 표시
//     closeGuideModal();
//
//     // 사용 안내 모달 이벤트
//     startBtn.addEventListener('click', closeGuideModal);
//
//     // INFO 모달 이벤트
//     infoBtn.addEventListener('click', showInfoModal);
//     closeInfoBtn.addEventListener('click', closeInfoModal);
//
//     // INFO 모달 외부 클릭 시 닫기
//     instructionModal.addEventListener('click', clickOutModal);
//     infoModal.addEventListener('click', clickOutModal);
//
//     initializeLanguage();
//
//     showInfoModal();
// })