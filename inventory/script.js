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
  return /Android|iPhone|iPad|iPod/i.test(
    navigator.userAgent
  );
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

  const corners = Array.from(
    cursor.querySelectorAll('.target-cursor-corner')
  );

  let spinTl = null;
  let activeTarget = null;

  document.body.style.cursor = 'none';

  /* =========================================
     초기 위치
  ========================================= */

  gsap.set(cursor, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  /* =========================================
     회전 애니메이션 생성 함수
  ========================================= */

  const createSpin = () => {

    if (spinTl) {
      spinTl.kill();
    }

    spinTl = gsap.timeline({
      repeat: -1
    });

    spinTl.to(rotator, {
      rotation: '+=360',
      duration: config.spinDuration,
      ease: 'none'
    });

  };

  createSpin();

  /* =========================================
     커서 이동
  ========================================= */

  window.addEventListener('mousemove', (e) => {

    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: 'power3.out'
    });

  });

  /* =========================================
     클릭 애니메이션
  ========================================= */

  window.addEventListener('mousedown', () => {

    gsap.to(dot, {
      scale: 0.6,
      duration: 0.2
    });

    gsap.to(cursor, {
      scale: 0.9,
      duration: 0.2
    });

  });

  window.addEventListener('mouseup', () => {

    gsap.to(dot, {
      scale: 1,
      duration: 0.2
    });

    gsap.to(cursor, {
      scale: 1,
      duration: 0.2
    });

  });

  /* =========================================
     hover 추적
  ========================================= */

  const tickerFn = () => {

    if (!activeTarget) return;

    const rect = activeTarget.getBoundingClientRect();

    const cursorX = gsap.getProperty(cursor, 'x');
    const cursorY = gsap.getProperty(cursor, 'y');

    const targetCornerPositions = [

      {
        x: rect.left - constants.borderWidth,
        y: rect.top - constants.borderWidth
      },

      {
        x: rect.right + constants.borderWidth - constants.cornerSize,
        y: rect.top - constants.borderWidth
      },

      {
        x: rect.right + constants.borderWidth - constants.cornerSize,
        y: rect.bottom + constants.borderWidth - constants.cornerSize
      },

      {
        x: rect.left - constants.borderWidth,
        y: rect.bottom + constants.borderWidth - constants.cornerSize
      }

    ];

    corners.forEach((corner, i) => {

      const targetX =
        targetCornerPositions[i].x - cursorX;

      const targetY =
        targetCornerPositions[i].y - cursorY;

      gsap.to(corner, {
        x: targetX,
        y: targetY,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: true
      });

    });

  };

  /* =========================================
     hover 시작
  ========================================= */

  window.addEventListener('mouseover', (e) => {

    const target = e.target.closest(config.targetSelector);

    if (!target) return;

    if (activeTarget === target) return;

    activeTarget = target;

    gsap.ticker.add(tickerFn);

    /* 회전 멈춤 */
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

      /* 코너 원위치 */

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

      const currentRotation =
        gsap.getProperty(rotator, 'rotation');

      gsap.set(rotator, {
        rotation: currentRotation % 360
      });

      /* 회전 재시작 */

      createSpin();

    }, { once: true });

  });

}

/* =========================================
   INIT
========================================= */

document.addEventListener(
  'DOMContentLoaded',
  initTargetCursor
);


/* =========================================
   SCREEN TRANSITION
========================================= */

document.addEventListener('DOMContentLoaded', () => {

  const transitionEl =
    document.querySelector('.screen-transition');

  const startButton =
    document.querySelector('.start-button');

  /* 페이지 진입 */

  window.addEventListener('load', () => {

    if (!transitionEl) return;

    transitionEl.classList.add('reveal');

  });

  /* 페이지 이동 */

  if (startButton && transitionEl) {

    startButton.addEventListener('click', (e) => {

      e.preventDefault();

      const targetUrl =
        startButton.getAttribute('href');

      transitionEl.classList.remove('reveal');

      transitionEl.classList.add('active');

      setTimeout(() => {

        window.location.href = targetUrl;

      }, 700);

    });

  }

});


/* ========================================================
   DYNAMIC SCREEN SCALING (전체 화면비 동적 스케일링 설정)
======================================================== */
function autoScaleUI() {
  const wrapper = document.getElementById('ui-scale-wrapper');
  if (!wrapper) return;

  // 기획 및 디자인 기준 해상도 (CSS에 설정한 값과 일치해야 합니다)
  const baseWidth = 1920;
  const baseHeight = 1080;

  // 현재 브라우저 창 크기
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // 가로/세로 축소·확대 비율 계산
  const scaleX = windowWidth / baseWidth;
  const scaleY = windowHeight / baseHeight;

  // 화면 왜곡을 막기 위해 가로/세로 비율 중 더 작은 값에 맞춤 (Letterbox / Pillarbox 방식)
  const CSSscale = Math.min(scaleX, scaleY);

  // GSAP를 이용해 wrapper를 중앙에 두고 정비율 스케일링 적용
  gsap.set(wrapper, {
    xPercent: -50,
    yPercent: -50,
    scale: CSSscale
  });
}

// 초기 로드 시 및 창 크기가 변경될 때마다 실행되도록 이벤트 리스너 등록
window.addEventListener('resize', autoScaleUI);
document.addEventListener('DOMContentLoaded', autoScaleUI);