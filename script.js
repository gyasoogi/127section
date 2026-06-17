gsap.to(".radar-1", {
  rotation: 360,
  duration: 30,
  repeat: -1,
  ease: "none"
});

gsap.to(".radar-2", {
  rotation: -360,
  duration: 20,
  repeat: -1,
  ease: "none"
});

gsap.to(".pulse", {
  scale: 2,
  opacity: 0,
  duration: 2,
  repeat: -1,
  stagger: .4,
  ease: "power1.out"
});

gsap.to(".scan-lines", {
  backgroundPositionY: "100px",
  duration: 6,
  repeat: -1,
  ease: "none"
});


/* ========================================================
   전달받은 자바스크립트 스크립트 연결 및 통합
======================================================== */
const config = {
  targetSelector: '.cursor-target',
  spinDuration: 2,
  hideDefaultCursor: true,
  hoverDuration: 0.2,
  parallaxOn: true
};

const constants = {
  borderWidth: 3,
  cornerSize: 12
};

const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

function initTargetCursor() {
  if (isMobileDevice()) {
    const cursor = document.getElementById('target-cursor');
    if (cursor) {
      cursor.style.display = 'none';
    }
    return;
  }

  const cursor = document.getElementById('target-cursor');
  if (!cursor) return;

  const rotator = cursor.querySelector('.cursor-rotator');
  const dot = cursor.querySelector('.target-cursor-dot');
  const corners = Array.from(cursor.querySelectorAll('.target-cursor-corner'));

  let spinTl = null;
  let activeTarget = null;

  document.body.style.cursor = 'none';

  /* 초기 위치 */
  gsap.set(cursor, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  /* 회전 애니메이션 생성 함수 */
  const createSpin = () => {
    if (spinTl) {
      spinTl.kill();
    }
    spinTl = gsap.timeline({ repeat: -1 });
    spinTl.to(rotator, {
      rotation: '+=360',
      duration: config.spinDuration,
      ease: 'none'
    });
  };

  createSpin();

  /* 커서 이동 */
  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: 'power3.out'
    });
  });

  /* 클릭 애니메이션 */
  window.addEventListener('mousedown', () => {
    gsap.to(dot, { scale: 0.6, duration: 0.2 });
    gsap.to(cursor, { scale: 0.9, duration: 0.2 });
  });

  window.addEventListener('mouseup', () => {
    gsap.to(dot, { scale: 1, duration: 0.2 });
    gsap.to(cursor, { scale: 1, duration: 0.2 });
  });

  /* hover 추적 */
  const tickerFn = () => {
    if (!activeTarget) return;

    const rect = activeTarget.getBoundingClientRect();
    const cursorX = gsap.getProperty(cursor, 'x');
    const cursorY = gsap.getProperty(cursor, 'y');

    const targetCornerPositions = [
      { x: rect.left - constants.borderWidth, y: rect.top - constants.borderWidth },
      { x: rect.right + constants.borderWidth - constants.cornerSize, y: rect.top - constants.borderWidth },
      { x: rect.right + constants.borderWidth - constants.cornerSize, y: rect.bottom + constants.borderWidth - constants.cornerSize },
      { x: rect.left - constants.borderWidth, y: rect.bottom + constants.borderWidth - constants.cornerSize }
    ];

    corners.forEach((corner, i) => {
      const targetX = targetCornerPositions[i].x - cursorX;
      const targetY = targetCornerPositions[i].y - cursorY;

      gsap.to(corner, {
        x: targetX,
        y: targetY,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: true
      });
    });
  };

  /* hover 시작 */
  window.addEventListener('mouseover', (e) => {
    const target = e.target.closest(config.targetSelector);
    if (!target) return;
    if (activeTarget === target) return;

    activeTarget = target;
    gsap.ticker.add(tickerFn);

    /* 회전 정지 */
    if (spinTl) {
      spinTl.kill();
      spinTl = null;
    }

    /* hover 시 정방향으로 복귀 */
    gsap.to(rotator, {
      rotation: 0,
      duration: 0.25,
      ease: 'power2.out'
    });

    /* hover 해제 */
    target.addEventListener('mouseleave', () => {
      activeTarget = null;
      gsap.ticker.remove(tickerFn);

      /* 코너 원위치 (기본 사각형 형태 배치) */
      const positions = [
        { x: -18, y: -18 },
        { x: 6, y: -18 },
        { x: 6, y: 6 },
        { x: -18, y: 6 }
      ];

      corners.forEach((corner, index) => {
        gsap.to(corner, {
          x: positions[index].x,
          y: positions[index].y,
          duration: 0.3,
          ease: 'power3.out'
        });
      });

      /* 회전값 유지 */
      const currentRotation = gsap.getProperty(rotator, 'rotation');
      gsap.set(rotator, {
        rotation: currentRotation % 360
      });

      /* 회전 재시작 */
      createSpin();
    }, { once: true });
  });
}

document.addEventListener('DOMContentLoaded', initTargetCursor);

/* SCREEN TRANSITION */
document.addEventListener('DOMContentLoaded', () => {
  const transitionEl = document.querySelector('.screen-transition');
  const startButtons = document.querySelectorAll('.start-button');

  /* 페이지 진입 */
  window.addEventListener('load', () => {
    if (!transitionEl) return;
    transitionEl.classList.add('reveal');
  });

  /* 페이지 이동 및 인벤토리 검사 */
  startButtons.forEach(btn => {
    if (transitionEl) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // START OPERATION 버튼 클릭 시에만 SSR 보유 여부 확인
        if (btn.id === 'btn-start-operation') {
           const inventory = JSON.parse(localStorage.getItem('gachaInventory')) || {};
           let hasSSR = false;
           
           for (const key in inventory) {
               if (inventory[key].rarity === 'SSR' && inventory[key].count > 0) {
                   hasSSR = true;
                   break;
               }
           }
           
           // SSR이 하나도 없다면 경고창 출력 후 이동 중단
           if (!hasSSR) {
               alert("해금되지 않은 기능입니다. \nCHARACTER PICKUP 메뉴에서 SSR 유닛을 먼저 확보해 주십시오.");
               return; 
           }
        }

        const targetUrl = btn.getAttribute('href');
        transitionEl.classList.remove('reveal');
        transitionEl.classList.add('active');

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 700);
      });
    }
  });
});

/* DYNAMIC SCREEN SCALING */
function autoScaleUI() {
  const wrapper = document.getElementById('ui-scale-wrapper');
  if (!wrapper) return;

  const baseWidth = 1920;
  const baseHeight = 1080;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const scaleX = windowWidth / baseWidth;
  const scaleY = windowHeight / baseHeight;
  const CSSscale = Math.min(scaleX, scaleY);

  gsap.set(wrapper, {
    xPercent: -50,
    yPercent: -50,
    scale: CSSscale
  });
}

window.addEventListener('resize', autoScaleUI);
document.addEventListener('DOMContentLoaded', autoScaleUI);

document.addEventListener('DOMContentLoaded', () => {
  const diffOverlay = document.getElementById('difficulty-overlay');
  const diffCards = document.querySelectorAll('.diff-card');
  const hudDiffValue = document.getElementById('hud-difficulty');

  // 로컬 스토리지에서 기존 설정값 확인
  let savedDiff = localStorage.getItem('gameDifficulty');

  if (!savedDiff) {
    // ✨ [최초 접속] 난이도 저장 데이터가 없을 때만 알림창을 순서대로 띄웁니다.
    alert('이제 당신은 홀로');
    alert('127섹션을 헤쳐나가야 합니다.');

    // 알림창을 다 닫으면 그제서야 난이도 선택 화면이 나타납니다.
    if (diffOverlay) diffOverlay.style.display = 'flex';
  } else {
    // [재접속] 이미 난이도를 고른 유저에게는 알림창과 난이도창을 모두 건너뛰고 튜토리얼로 이동합니다.
    if (diffOverlay) diffOverlay.style.display = 'none';
    updateDifficultyHUD(savedDiff);
    initTutorial(); 
  }

  // 난이도 카드 클릭 이벤트
  diffCards.forEach(card => {
    card.addEventListener('click', () => {
      const diff = card.getAttribute('data-diff');
      const maxPulls = card.getAttribute('data-pulls');

      // 로컬 스토리지에 영구 저장
      localStorage.setItem('gameDifficulty', diff);
      localStorage.setItem('gachaMaxPulls', maxPulls);

      // 난이도 선택창 페이드 아웃 연출
      gsap.to(diffOverlay, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          diffOverlay.style.display = 'none';
          updateDifficultyHUD(diff);
          
          // 난이도 창이 닫힌 후 튜토리얼 체크
          initTutorial();
        }
      });
    });
  });

  // HUD 텍스트 및 색상 업데이트 함수
  function updateDifficultyHUD(diff) {
    if (!hudDiffValue) return;
    hudDiffValue.innerText = diff;
    
    if (diff === 'EASY') hudDiffValue.style.color = '#8cff8c';
    else if (diff === 'NORMAL') hudDiffValue.style.color = '#4da6ff';
    else if (diff === 'HARD') hudDiffValue.style.color = 'var(--red)';
  }
});

/* =========================================
   INFORM POPUP LOGIC
========================================= */
function toggleInform(show) {
  const overlay = document.getElementById('inform-overlay');
  const box = overlay.querySelector('.inform-box');
  
  if (show) {
    // 팝업 열기
    overlay.style.display = 'flex';
    
    // 진행 중인 애니메이션 초기화
    gsap.killTweensOf([overlay, box]);
    
    // 배경 오버레이 페이드 인
    gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    
    // 팝업 박스 애니메이션 (아래에서 위로 올라오며 약간 커지는 텐션 효과)
    gsap.fromTo(box, 
      { y: 40, scale: 0.95, opacity: 0 }, 
      { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)', delay: 0.05 }
    );
  } else {
    // 팝업 닫기
    gsap.killTweensOf([overlay, box]);
    
    // 팝업 박스 먼저 살짝 아래로 내려가며 사라짐
    gsap.to(box, { y: 20, scale: 0.95, opacity: 0, duration: 0.25, ease: 'power2.in' });
    
    // 배경 오버레이 페이드 아웃
    gsap.to(overlay, { 
      opacity: 0, 
      duration: 0.3, 
      ease: 'power2.in', 
      delay: 0.1, 
      onComplete: () => {
        overlay.style.display = 'none';
      }
    });
  }
}

function hardResetSystem() {
  // 사용자의 실수를 방지하기 위한 이중 확인창
  const isConfirm = confirm("치명적인 작업입니다.\n보유 중인 유닛, 크레딧, 진행 상황 등 모든 로컬 데이터가 영구적으로 삭제됩니다.\n\n정말 모든 시스템 데이터를 초기화하시겠습니까?");
  
  if (isConfirm) {
    // 웹 브라우저에 저장된 해당 도메인의 모든 localStorage 데이터 삭제
    localStorage.clear(); 
    alert("모든 데이터가 성공적으로 파기되었습니다. 시스템을 재부팅합니다.");
    location.reload(); // 페이지 새로고침으로 초기 상태 복귀
  }
}

// [기능] 처음에만 뜨는 2장짜리 화면 가득한 튜토리얼 시스템
function initTutorial() {
  const tutorialModal = document.getElementById('tutorial-modal');
  const tutorialImg = document.getElementById('tutorial-img');
  const closeBtn = document.getElementById('close-tutorial');
  
  if (!tutorialModal || !tutorialImg || !closeBtn) return;

  // 사용할 이미지 파일명 배열 (경로에 맞게 수정하여 사용)
  const tutorialImages = ['tutorial_guide.png'];
  let currentStep = 0;

  // 로컬 스토리지를 확인하여 이미 본 이력이 있다면 모달을 켜지 않고 종료
  const hasSeenTutorial = localStorage.getItem('tutorialSeen');
  if (hasSeenTutorial) {
    tutorialModal.classList.add('hidden');
    return;
  }

  // 처음 들어온 유저에게만 모달 노출 및 첫 이미지 설정
  tutorialModal.classList.remove('hidden');
  tutorialImg.src = tutorialImages[currentStep];
  closeBtn.textContent = "NEXT";

  closeBtn.addEventListener('click', () => {
    // 다음 장의 이미지가 더 남아있는 경우
    if (currentStep < tutorialImages.length - 1) {
      currentStep++;
      tutorialImg.src = tutorialImages[currentStep];
      
      // 마지막 장에 도달했을 때 버튼 텍스트 변경
      if (currentStep === tutorialImages.length - 1) {
        closeBtn.textContent = "SYSTEM START";
      }
    } else {
      // 모든 이미지를 다 본 상태에서 클릭 시 (종료 연출)
      if (typeof gsap !== 'undefined') {
        // 프로젝트에 GSAP 라이브러리가 로드되어 있을 때 부드럽게 페이드아웃
        gsap.to(tutorialModal, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            tutorialModal.classList.add('hidden');
            localStorage.setItem('tutorialSeen', 'true'); // 스토리지에 기록 저장
          }
        });
      } else {
        // GSAP이 없는 일반 프로젝트일 경우 즉시 즉각 종료 처리
        tutorialModal.classList.add('hidden');
        localStorage.setItem('tutorialSeen', 'true');
      }
    }
  });
}
