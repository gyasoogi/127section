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

  if (typeof window === 'undefined') return false;

  const hasTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;

  return hasTouch || window.innerWidth <= 768;

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