const instructionModal = document.getElementById('instructionModal');
const infoModal = document.getElementById('infoModal');
const closeInfoBtn = document.getElementById('closeInfo');
const startBtn = document.getElementById('startBtn');
const infoBtn = document.getElementById('infoBtn');

const INSTRUCTION_SEEN_KEY = 'visited'; // localStorage 키


function showGuideModal() {
  if (!localStorage.getItem(INSTRUCTION_SEEN_KEY)) {
    instructionModal.classList.add('show');
  }
}

function closeGuideModal() {
  instructionModal.classList.remove('show');
  localStorage.setItem(INSTRUCTION_SEEN_KEY, 'true'); // 사용자가 안내를 봤음을 기억
}

function showInfoModal() {
  infoModal.classList.add('show');
}

function closeInfoModal() {
  infoModal.classList.remove('show');
}

function clickOutModal(event) {
  // 모달 배경을 클릭했을 때만 닫기 (콘텐츠 클릭 시 무시)
  if (event.target === event.currentTarget) {
    if (event.currentTarget === infoModal) {
      closeInfoModal();
    }
  }
}

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
})
