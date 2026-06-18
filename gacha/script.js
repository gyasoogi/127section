/* ==========================================================================
   1. CONSTANTS & CACHED DATA (가독성 및 메모리 개선)
   ========================================================================== */

let skipNonSSR = false;

const STATE = {
    IDLE: "idle",
    RUNNING: "running",
    REVEALING: "revealing",
    FINISHED: "finished"
};

const iconMap = {
    "Drone Boy UNIT":"img/DRONE-thumb.png", "Clockwork Boy UNIT":"img/tiger-thumb.png", "Pit Boy UNIT":"img/rabin-thumb.png",
    "Water Man UNIT":"img/god-thumb.png", "Silent Sniper UNIT":"img/lead-thumb.png", "Podium Man UNIT":"img/bigbear-thumb.png", 
    "Secret Researcher UNIT":"img/ham-thumb.png", "ARCHIVE SCARF":"scarf", "RESEARCH FRAME":"fa-vial", "SIGNAL MASK":"fa-mask-face",
    "BROKEN SHIRT":"fa-shirt", "OLD FRAME":"fa-box-archive", "COMMON SUIT":"fa-user"
};

const itemPool = {
    SSR: ["Drone Boy UNIT", "Clockwork Boy UNIT", "Pit Boy UNIT", "Water Man UNIT", "Silent Sniper UNIT", "Podium Man UNIT", "Secret Researcher UNIT"],
    SR: ["ARCHIVE COAT", "RESEARCH FRAME", "SIGNAL MASK"],
    R: ["BROKEN SHIRT", "OLD FRAME", "COMMON SUIT"]
};

// [반영 완료] 유진(Clockwork Boy)과 래빈(Pit Boy)의 배너 설명에 새로운 능력을 명시했습니다.
const banners = [
    {name: "Drone Boy", pickup: "Drone Boy UNIT", image:'img/DRONE-back.png', desc: "도시 잔해 속에서 복구된 누군가의 아바타. 전술 드론 운용과 기동 보조에 특화된 유닛을 획득할 수 있다."},
    {name: "Clockwork Boy", pickup: "Clockwork Boy UNIT", image:'img/tiger-back.png', desc: "폭발흔이 남은 채 파편화된 누군가의 아바타. 광역 지속 피해 및 적 시스템 교란(디버프)에 특화된 유닛을 획득할 수 있다."},
    {name: "Pit Boy", pickup: "Pit Boy UNIT", image:'img/rabin-back.png', desc: "가늠할 수 없는 좌표계에서 발견된 누군가의 아바타. 초근접 타격 및 조건부 쿨타임 단축(버서커)에 특화된 유닛을 획득할 수 있다."},
    {name: "Water Man", pickup: "Water Man UNIT", image:'img/god-back.png', desc: "침수된 음성 모듈에서 추출된 누군가의 아바타. 구호에 특화된 유닛을 획득할 수 있다."},
    {name: "Silent Sniper", pickup: "Silent Sniper UNIT", image:'img/lead-back.png', desc: " 관통된 물리 코어 내부에서 확인된 누군가의 아바타. 원거리 강공격에 특화된 유닛을 획득할 수 있다."},
    {name: "Podium Man", pickup: "Podium Man UNIT", image:'img/bigbear-back.png', desc: "단상에 새겨진 채 발견된 누군가의 아바타. 적의 시선을 끄는 데에 특화된 유닛을 획득할 수 있다."},
    {name: "Secret Researcher", pickup: "Secret Researcher UNIT", image:'img/ham-back.png', desc: " 폐쇄된 연구실 너머에서 전송된 누군가의 아바타. 아군 강화에 특화된 유닛을 획득할 수 있다."}
];

const ssrImageMap = {
    "Drone Boy UNIT": { silhouette: "img/DRONE-silhouette.png", reveal: "img/DRONE-full.png", thumb: "img/DRONE-thumb.png", masonry: [{img: "img-roll/01/07.jpg", height: 460}, {img: "img-roll/01/06.jpg", height: 380}, {img: "img-roll/01/08.jpg", height: 460}, {img: "img-roll/01/05.jpg", height: 720}, {img: "img-roll/01/02.jpg", height: 720}, {img: "img-roll/01/03.jpg", height: 720}, {img: "img-roll/01/01.jpg", height: 720}, {img: "img-roll/01/04.jpg", height: 460}] },
    "Clockwork Boy UNIT": { silhouette: "img/tiger-silhouette.png", reveal: "img/tiger-full.png", thumb: "img/tiger-thumb.png", masonry: [{img: "img-roll/02/07.jpg", height: 460}, {img: "img-roll/02/06.jpg", height: 380}, {img: "img-roll/02/05.jpg", height: 460}, {img: "img-roll/02/02.jpg", height: 720}, {img: "img-roll/02/04.jpg", height: 720}, {img: "img-roll/02/03.jpg", height: 720}, {img: "img-roll/02/01.jpg", height: 720}, {img: "img-roll/02/08.jpg", height: 460}] },
    "Pit Boy UNIT": { silhouette: "img/rabin-silhouette.png", reveal: "img/rabin-full.png", thumb: "img/rabin-thumb.png", masonry: [{img: "img-roll/03/07.jpg", height: 460}, {img: "img-roll/03/02.jpg", height: 280}, {img: "img-roll/03/01.jpg", height: 460}, {img: "img-roll/03/06.jpg", height: 720}, {img: "img-roll/03/05.jpg", height: 780}, {img: "img-roll/03/03.jpg", height: 720}, {img: "img-roll/03/04.jpg", height: 720}, {img: "img-roll/03/08.jpg", height: 460}] },
    "Water Man UNIT": { silhouette: "img/god-silhouette.png", reveal: "img/god-full.png", thumb: "img/god-thumb.png", masonry: [{img: "img-roll/04/07.jpg", height: 460}, {img: "img-roll/04/06.jpg", height: 380}, {img: "img-roll/04/05.jpg", height: 380}, {img: "img-roll/04/02.jpg", height: 720}, {img: "img-roll/04/04.jpg", height: 720}, {img: "img-roll/04/03.jpg", height: 720}, {img: "img-roll/04/01.jpg", height: 720}, {img: "img-roll/04/08.jpg", height: 460}] },
    "Silent Sniper UNIT": { silhouette: "img/lead-silhouette.png", reveal: "img/lead-full.png", thumb: "img/lead-thumb.png", masonry: [{img: "img-roll/05/07.jpg", height: 460}, {img: "img-roll/05/06.jpg", height: 380}, {img: "img-roll/05/05.jpg", height: 460}, {img: "img-roll/05/02.jpg", height: 720}, {img: "img-roll/05/04.jpg", height: 720}, {img: "img-roll/05/03.jpg", height: 720}, {img: "img-roll/05/01.jpg", height: 720}, {img: "img-roll/05/08.jpg", height: 460}] },
    "Podium Man UNIT": { silhouette: "img/bigbear-silhouette.png", reveal: "img/bigbear-full.png", thumb: "img/bigbear-thumb.png", masonry: [{img: "img-roll/06/07.jpg", height: 720}, {img: "img-roll/06/06.jpg", height: 380}, {img: "img-roll/06/05.jpg", height: 460}, {img: "img-roll/06/01.jpg", height: 480}, {img: "img-roll/06/04.jpg", height: 720}, {img: "img-roll/06/03.jpg", height: 720}, {img: "img-roll/06/02.jpg", height: 720}, {img: "img-roll/06/08.jpg", height: 480}] },
    "Secret Researcher UNIT": { silhouette: "img/ham-silhouette.png", reveal: "img/ham-full.png", thumb: "img/ham-thumb.png", masonry: [{img: "img-roll/07/07.jpg", height: 720}, {img: "img-roll/07/06.jpg", height: 380}, {img: "img-roll/07/05.jpg", height: 720}, {img: "img-roll/07/02.jpg", height: 460}, {img: "img-roll/07/04.jpg", height: 720}, {img: "img-roll/07/03.jpg", height: 720}, {img: "img-roll/07/08.jpg", height: 460}, {img: "img-roll/07/09.jpg", height: 380}, {img: "img-roll/07/10.jpg", height: 460}] }
};

const defaultSSRImages = [
    { img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', height: 320 },
    { img: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600', height: 460 },
    { img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600', height: 350 },
    { img: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=600', height: 510 },
    { img: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=600', height: 390 }
];

/* ==========================================================================
   2. VARIABLES & CACHED DOM ELEMENTS
   ========================================================================== */
let isSSRPlaying = false;
let currentBanner = 0;
let results = [];
let revealIndex = 0;

let inventory = JSON.parse(localStorage.getItem('gachaInventory')) || {};
let totalPull = parseInt(localStorage.getItem('gachaTotalPull')) || 0;
const maxPullsAllowed = parseInt(localStorage.getItem('gachaMaxPulls')) || 350;

let pitySSR = 0, pitySR = 0, pityPickup = 0;
let guaranteedPickup = JSON.parse(localStorage.getItem('gachaGuaranteed')) || false; // 반천장 실패 기록
let state = STATE.IDLE;
let isIntroPlaying = false;
let introTimeout = null;
let debugPickupMode = false;
let typeInterval = null;

// [최적화] DOM 탐색 최소화를 위한 캐싱
const DOM = {};

/* ==========================================================================
   3. LOADING & INIT
   ========================================================================== */
window.addEventListener('load', () => {
    // 렌더링 파이프라인 지연 방지를 위한 requestAnimationFrame 사용
    requestAnimationFrame(() => document.body.classList.add('loaded'));
    
});

function init() {
    // DOM 요소 캐싱
    DOM.totalCount = document.getElementById('total-count');
    DOM.bannerTitle = document.getElementById('banner-title');
    DOM.panelNo = document.querySelector('.system-no');
    DOM.pickupText = document.getElementById('pickup-text');
    DOM.bannerImage = document.getElementById('banner-image');
    DOM.bannerDesc = document.getElementById('banner-desc');
    DOM.bannerPanel = document.querySelector('.banner-panel');
    DOM.pitySSR = document.getElementById('pity-ssr');
    DOM.pitySR = document.getElementById('pity-sr');
    DOM.pityPickup = document.getElementById('pity-pickup');
    DOM.invGrid = document.getElementById('inv-grid');
    DOM.resultGrid = document.getElementById('result-grid');
    DOM.revealContent = document.getElementById('reveal-content');

    const sidebar = document.getElementById('sidebar');
    const fragment = document.createDocumentFragment(); // [최적화] 리플로우 방지

    banners.forEach((banner, i) => {
        const tab = document.createElement('button');
        tab.className = `banner-button cursor-target ${i === 0 ? 'active' : ''}`;
        tab.innerText = banner.name;
        tab.onclick = (e) => { e.stopPropagation(); switchBanner(i); };
        fragment.appendChild(tab);
    });
    sidebar.appendChild(fragment);
    
    if(DOM.totalCount) DOM.totalCount.innerText = Math.max(0, maxPullsAllowed - totalPull);

    switchBanner(0);
    updatePity();
    animateHUD();
    initTutorial();
}

function switchBanner(i) {
    currentBanner = i;
    const data = banners[i];
    
    DOM.bannerPanel.classList.remove('swipe-anim');
    void DOM.bannerPanel.offsetWidth; // Reflow 트리거로 애니메이션 리셋
    
    DOM.bannerTitle.innerText = data.name;
    DOM.panelNo.innerText = String(i + 1).padStart(2, '0');
    DOM.pickupText.innerText = `PICK UP : ${data.pickup}`;
    DOM.bannerImage.src = data.image;
    if (DOM.bannerDesc && data.desc) DOM.bannerDesc.innerText = data.desc;

    document.querySelectorAll('.banner-button').forEach((el, idx) => {
        el.classList.toggle('active', idx === i);
    });

    DOM.bannerPanel.classList.add('swipe-anim');
}

function updatePity() {
    DOM.pitySSR.innerHTML = `<span>SSR PITY</span><b>${80 - pitySSR}</b>`;
    DOM.pitySR.innerHTML = `<span>SR PITY</span><b>${10 - pitySR}</b>`;
    DOM.pityPickup.innerHTML = `<span>PICKUP PITY</span><b>${150 - pityPickup}</b>`;
}

/* ==========================================================================
   4. GACHA & INVENTORY LOGIC
   ========================================================================== */
/* ==========================================================================
   4. GACHA & INVENTORY LOGIC
   ========================================================================== */
function runGacha(count) {
    if (state !== STATE.IDLE) return;

    if (totalPull + count > maxPullsAllowed) {
        alert(`SYSTEM WARNING: 최대 획득 가능 횟수(${maxPullsAllowed}회)를 초과하여 더 이상 호출할 수 없습니다.`);
        return;
    }

    state = STATE.RUNNING;
    results = [];
    revealIndex = 0;
    skipNonSSR = false;
    
    totalPull += count;
    DOM.totalCount.innerText = Math.max(0, maxPullsAllowed - totalPull);
    localStorage.setItem('gachaTotalPull', totalPull);

    // [추가된 로직] 1. 전투/엔딩씬에서 사용할 누적 통계 데이터를 불러옵니다.
    let tacticalStats = JSON.parse(localStorage.getItem('tacticalStats')) || {};
    tacticalStats.totalSSR = tacticalStats.totalSSR || 0;
    tacticalStats.totalSR = tacticalStats.totalSR || 0;
    tacticalStats.totalR = tacticalStats.totalR || 0;

    let highest = "R";
    const current = banners[currentBanner];

    for (let i = 0; i < count; i++) {
        pitySSR++; pitySR++; pityPickup++;
        let rarity = "R"; let name = "";
        const r = Math.random() * 100;

        if (debugPickupMode || r < 1 || pitySSR >= 80) {
            rarity = "SSR"; pitySSR = 0;

            if (debugPickupMode || guaranteedPickup || Math.random() < 0.5 || pityPickup >= 150) {
                name = current.pickup; 
                pityPickup = 0;
                guaranteedPickup = false;
            } else {
                const nonPickupSSR = itemPool.SSR.filter(ssr => ssr !== current.pickup);
                name = nonPickupSSR[Math.floor(Math.random() * nonPickupSSR.length)];
                guaranteedPickup = true;
            }
            localStorage.setItem('gachaGuaranteed', JSON.stringify(guaranteedPickup));
            
        } else if (r < 14 || pitySR >= 10) {
            rarity = "SR"; pitySR = 0;
            name = itemPool.SR[Math.floor(Math.random() * itemPool.SR.length)];
        } else {
            name = itemPool.R[Math.floor(Math.random() * itemPool.R.length)];
        }

        if (rarity === "SSR") highest = "SSR";
        else if (rarity === "SR" && highest !== "SSR") highest = "SR";

        results.push({ rarity, name, image: current.image });
        
        if (inventory[name]) inventory[name].count++;
        else inventory[name] = { rarity, count: 1, image: current.image };

        if (rarity === "SSR") tacticalStats.totalSSR++;
        else if (rarity === "SR") tacticalStats.totalSR++;
        else if (rarity === "R") tacticalStats.totalR++;
    }
    
    localStorage.setItem('gachaInventory', JSON.stringify(inventory));
    localStorage.setItem('tacticalStats', JSON.stringify(tacticalStats));

    updatePity();
    playAnimation(highest);
}

function toggleInventory(show) {
    document.getElementById('inv-overlay').style.display = show ? 'block' : 'none';
    document.getElementById('inv-panel').classList.toggle('open', show);
    if (show) renderInventory();
}

function renderInventory() {
    DOM.invGrid.innerHTML = '';
    const filterType = document.getElementById('inv-filter')?.value || 'all';
    
    // [최적화] 루프 내 DOM 조작 최소화를 위한 DocumentFragment 사용
    const fragment = document.createDocumentFragment();

    const items = Object.entries(inventory).filter(([name, data]) => {
        return (filterType === 'all' || data.rarity === filterType) && data.count > 0; 
    });

    items.forEach(([name, data]) => {
        const card = document.createElement('div');
        const isSSR = data.rarity === 'SSR';
        card.className = `grid-item rarity-${data.rarity.toLowerCase()}`;
        
        if (isSSR) {
            card.style.cursor = 'pointer';
            card.setAttribute('onclick', `event.stopPropagation(); toggleSSRPreview('${name}');`);
        } else {
            card.style.cursor = 'default';
        }

        const imgContent = (isSSR && ssrImageMap[name]?.thumb) 
            ? `<img src="${ssrImageMap[name].thumb}" loading="lazy">` 
            : `<div style="display:flex; height:100%; align-items:center; justify-content:center; font-size:4rem; color:var(--text); opacity:0.3;"><i class="fa-solid ${iconMap[name]}"></i></div>`;

        card.innerHTML = `
            <div class="item-inner">
                <div class="image-holder">
                    ${imgContent}
                    <div class="scan-bar"></div>
                </div>
                <div class="item-details">
                    <div class="rarity-badge">${data.rarity} PROTOCOL</div>
                    <div class="item-name">${name} (x${data.count})</div>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });
    
    DOM.invGrid.appendChild(fragment);
}

function toggleRate(show) { document.getElementById('rate-popup').style.display = show ? 'flex' : 'none'; }

/* ==========================================================================
   5. GACHA CORE ANIMATION LOGIC & REVEAL FLOW CONTROL
   ========================================================================== */
function playAnimation(highest) {
    document.body.classList.add('glitch');
    setTimeout(() => document.body.classList.remove('glitch'), 450);

    const overlay = document.getElementById('gacha-overlay');
    const ring = document.querySelector('.scan-ring');
    const flash = document.querySelector('.flash-text');

    if (flash && ring) {
        flash.style.color = highest === "SSR" ? "#f6ff00" : "#ffffff";
        ring.style.setProperty('--ring-color', highest === "SSR" ? '#ffcc00' : highest === "SR" ? '#a330ff' : '#ffffff');
    }

    isIntroPlaying = true;
    overlay.style.display = 'block';
    overlay.classList.remove('active');
    void overlay.offsetWidth; 
    overlay.classList.add('active');

    introTimeout = setTimeout(() => finishIntro(false), 2200);
}

// [수정] 인트로 중 터치 시 호출되는 스킵 로직 분기
function finishIntro(skipped = false) {
    if (!isIntroPlaying) return;
    isIntroPlaying = false;
    clearTimeout(introTimeout);
    document.getElementById('gacha-overlay').style.display = 'none';
    
    if (skipped) {
        skipNonSSR = true;
    }
    
    startReveal();
}

function startReveal() {
    state = STATE.REVEALING;
    checkAndRenderReveal();
}

function checkAndRenderReveal() {
    let item = results[revealIndex];

    if (skipNonSSR) {
        while (item && item.rarity !== "SSR") {
            revealIndex++;
            item = results[revealIndex];
        }
    }

    if (!item) { showResult(); return; }
    
    if (item.rarity === "SSR" && !item.isMasonryPlayed) {
        item.isMasonryPlayed = true;
        document.getElementById('single-reveal').style.display = 'none';
        
        playSSRMasonry(item, () => { 
            document.getElementById('single-reveal').style.display = 'flex';
            renderReveal(); 
        });
        return;
    }
    
    document.getElementById('single-reveal').style.display = 'flex';
    renderReveal();
}

// [수정] 메이슨리 스킵 제어를 위해 GSAP 트윈 타임라인 캐싱 변수 추가
let masonryTimeline = null;
let masonryTimeout = null;

function playSSRMasonry(item, onComplete) {
    isSSRPlaying = true;
    const overlay = document.getElementById('ssr-masonry-overlay');
    const listContainer = document.getElementById('masonry-list');
    
    Object.assign(overlay.style, {
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', overflow: 'hidden', zIndex: '400', display: 'block'
    } );

    Object.assign(listContainer.style, {
        position: 'relative', width: '100%', height: '100%', overflow: 'hidden'
    } );

    const currentMasonryItems = (item && ssrImageMap[item.name]?.masonry) ? ssrImageMap[item.name].masonry : defaultSSRImages;

    listContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const baseHeight = 1080;
    const columns = 4;
    const colHeights = new Array(columns).fill(0);
    const columnWidth = 1920 / columns; 

    // GSAP 애니메이션 제어를 위해 독립된 타임라인 생성
    masonryTimeline = gsap.timeline();

    currentMasonryItems.forEach((masonryItem, index) => {
        const col = colHeights.indexOf(Math.min(...colHeights));
        const x = columnWidth * col; 
        const y = colHeights[col];
        const h = masonryItem.height; 
        colHeights[col] += h;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'masonry-item-wrapper';
        wrapper.style.cssText = `position: absolute; overflow: hidden;`;
        wrapper.innerHTML = `<div class="masonry-item-img" style="background-image: url('${masonryItem.img}'); width: 100%; height: 100%; background-size: cover; background-position: center;"></div>`;
        
        fragment.appendChild(wrapper);

        // 타임라인에 트윈 등록
        masonryTimeline.fromTo(wrapper, 
            { opacity: 0, x: x, y: baseHeight + 200, width: columnWidth + 0.5, height: h, filter: 'blur(10px)' },
            { opacity: 1, y: y, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out' },
            index * 0.12
        );
    });

    listContainer.appendChild(fragment);

    // [기능 추가] 이미 보유 중인 SSR인지 확인 (인벤토리 카운트가 1보다 크면 중복 획득)
    const isOwnedSSR = inventory[item.name] && inventory[item.name].count > 1;
    overlay.setAttribute('data-skippable', isOwnedSSR ? 'true' : 'false');
    overlay.onCompleteCallback = onComplete; // 스킵 처리를 위해 콜백 함수 바인딩

    // 아웃트로 연출 타이머 관리
    masonryTimeout = setTimeout(() => {
        if (!isSSRPlaying) return;
        fadeOutMasonry(onComplete);
    }, 4200);
}

// [기능 추가] 메이슨리 연출 안전 종료 및 트윈 정리 함수
function fadeOutMasonry(onComplete) {
    const overlay = document.getElementById('ssr-masonry-overlay');
    const listContainer = document.getElementById('masonry-list');
    
    clearTimeout(masonryTimeout);
    if (masonryTimeline) {
        masonryTimeline.kill();
        masonryTimeline = null;
    }

    gsap.to(listContainer.children, {
        opacity: 0, y: -200, filter: 'blur(10px)', duration: 0.6, stagger: 0.03, ease: 'power2.in',
        onComplete: () => { 
            overlay.style.display = 'none'; 
            isSSRPlaying = false; 
            if (onComplete) onComplete(); 
        }
    });
}

function typeSSRText(text) {
    const target = document.getElementById('type-target');
    if (!target) return;
    target.innerText = '';
    
    if (typeInterval) clearInterval(typeInterval); 
    
    let i = 0;
    typeInterval = setInterval(() => {
        if (i >= text.length) {
            clearInterval(typeInterval);
            setTimeout(() => document.querySelector('.ssr-cinematic')?.classList.add('reveal'), 500);
            return;
        }
        target.innerText += text.charAt(i++);
    }, 120);
}

function renderReveal() {
    const item = results[revealIndex];
    if (!item) return;

    if (item.rarity === "SSR") {
        const data = ssrImageMap[item.name];
        const silhouette = data?.silhouette || defaultSSRImages[0].img;
        const revealImage = data?.reveal || defaultSSRImages[0].img;

        DOM.revealContent.innerHTML = `
            <div class="ssr-cinematic">
                <div class="ssr-silhouette" style="background-image:url('${silhouette}');"></div>
                <div class="ssr-type"><span id="type-target"></span></div>
                <div class="ssr-image" style="background-image:url('${revealImage}');"></div>
                <div class="ssr-ui">
                    <div class="ssr-rank">SSR</div>
                    <div class="ssr-name">${item.name}</div>
                </div>
            </div>
        `;
        requestAnimationFrame(() => typeSSRText(item.name));
        return;
    }

    const color = item.rarity === "SR" ? "var(--color-sr)" : "var(--color-r)";
    DOM.revealContent.innerHTML = `
        <div class="reveal-box tactical-reveal" style="border-color:${color}; pointer-events: auto;">
            <div class="reveal-subtitle">SYNTHETIC RESULT</div>
            <i class="fa-solid ${iconMap[item.name] || 'fa-cube'} reveal-icon" style="color:${color};"></i>
            <h1 class="reveal-name" style="color:${color}">${item.name}</h1>
        </div>
    `;
}

function showResult() {
    state = STATE.FINISHED;
    document.getElementById('single-reveal').style.display = 'none';
    document.getElementById('ssr-masonry-overlay').style.display = 'none';
    document.getElementById('result-screen').style.display = 'flex';
    
    DOM.resultGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    results.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = `grid-item rarity-${item.rarity.toLowerCase()}`;
        card.style.animationDelay = `${idx * 0.08}s`;
        
        const isSSR = item.rarity === "SSR";
        const imgContent = isSSR 
            ? `<img src="${iconMap[item.name]}" loading="lazy" style="width:100%; height:100%; object-fit:cover; border-radius: 4px;">`
            : `<div style="display:flex; height:100%; align-items:center; justify-content:center; font-size:4rem; color:var(--text); opacity:0.3; background:#111;"><i class="fa-solid ${iconMap[item.name] || 'fa-cube'}"></i></div>`;

        card.innerHTML = `
            <div class="item-inner">
                <div class="image-holder">${imgContent}</div>
                <div class="item-details">
                    <div class="item-name" style="font-size: 1rem;">${item.name}</div>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });
    DOM.resultGrid.appendChild(fragment);
}

function closeResult() { document.getElementById('result-screen').style.display = 'none'; state = STATE.IDLE; }

/* ==========================================================================
   6. GLOBAL EVENTS & EFFECTS
   ========================================================================== */
document.addEventListener('click', (e) => {
    if (e.target.closest('.ui-btn, .banner-button, #inv-panel, .rate-box, #inv-overlay, #ssr-preview')) return;
    
    // 1. 인트로 재생 중 터치 시 스킵 분기 처리
    if (isIntroPlaying) { 
        finishIntro(true); 
        return; 
    }
    
    // 2. MASONRY 연출 중 터치 시 처리
    if (isSSRPlaying) {
        const overlay = document.getElementById('ssr-masonry-overlay');
        // 엘리먼트 속성에 마킹해 둔 중복 여부(data-skippable) 확인
        if (overlay && overlay.getAttribute('data-skippable') === 'true') {
            fadeOutMasonry(overlay.onCompleteCallback);
        }
        return; 
    }
    
    // 3. 개별 결과 노출(REVEALING) 상태 제어
    if (state === STATE.REVEALING) {
        revealIndex++;
        if (revealIndex >= results.length) { showResult(); return; }
        checkAndRenderReveal();
    }
});

function toggleSSRPreview(name){
    const preview = document.getElementById('ssr-preview');
    const imgElement = document.getElementById('ssr-preview-image');

    if(!name || name === 'false'){ 
        gsap.to(preview, { opacity: 0, duration: 0.3, onComplete: () => preview.style.display = 'none' });
        return; 
    }
    
    Object.assign(preview.style, {
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        zIndex: '999999', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex',
        justifyContent: 'center', alignItems: 'center'
    });
    
    let image = ssrImageMap[name]?.reveal || (iconMap[name]?.includes('img/') ? iconMap[name] : defaultSSRImages[0].img);
    
    if (imgElement) {
        Object.assign(imgElement.style, {
            backgroundImage: `url('${image}')`, backgroundSize: 'contain', 
            backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            width: '100%', height: '100%'
        });

        gsap.killTweensOf([preview, imgElement]);
        gsap.fromTo(preview, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(imgElement,
            { filter: 'blur(15px)', scale: 1.05, opacity: 0 },
            { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.05 }
        );
    }
}

function animateHUD(){
    gsap.to('.radar-1', { rotation:360, duration:30, repeat:-1, ease:'none' });
    gsap.to('.radar-2', { rotation:-360, duration:20, repeat:-1, ease:'none' });
    gsap.to('.scan-lines', { backgroundPositionY:'100px', duration:6, repeat:-1, ease:'none' });
}

(function initInteractiveDots() {
    const canvas = document.getElementById('interactive-dots-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true }); // [최적화] alpha 블렌딩 명시
    let dots = []; let time = 0;
    
    const config = { r: 255, g: 255, b: 255, spacing: 50, speed: 0.005, maxRad: 150, maxRadSq: 22500, baseSize: 1.8 };
    const mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr; 
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        dots = [];
        for (let x = config.spacing / 2; x < window.innerWidth; x += config.spacing) {
            for (let y = config.spacing / 2; y < window.innerHeight; y += config.spacing) {
                dots.push({ x, y, phase: Math.random() * Math.PI * 2 });
            }
        }
    }

    function animate() {
        time += config.speed;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // [최적화] fillStyle 변경 최소화를 위해 공통 투명도 계산
        ctx.fillStyle = `rgba(${config.r}, ${config.g}, ${config.b}, 0.15)`;
        ctx.beginPath();

        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            // [최적화] Math.pow 및 Math.sqrt 제거 (거리의 제곱으로 비교 연산 대체)
            const dx = dot.x - mouse.x;
            const dy = dot.y - mouse.y;
            const distSq = dx * dx + dy * dy;
            
            let mouseInfluence = 0;
            if (distSq < config.maxRadSq) {
                mouseInfluence = 1 - (Math.sqrt(distSq) / config.maxRad);
            }
            
            let dotSize = config.baseSize - (mouseInfluence * 2.0) + (Math.sin(time + dot.phase) * 0.3);
            if (dotSize > 0) {
                // 개별 투명도 대신 크기와 위상만으로 그리기 일괄 처리 (성능 향상)
                ctx.moveTo(dot.x + dotSize, dot.y);
                ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
            }
        }
        ctx.fill();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', () => { mouse.x = -1000; mouse.y = -1000; });
    resizeCanvas(); 
    requestAnimationFrame(animate);
})();

function autoScaleUI() {
    const wrapper = document.getElementById('ui-scale-wrapper');
    function resize() {
        const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    window.addEventListener('resize', resize);
    resize();
}

function initTargetCursor() {
  const config = {
    targetSelector: '.cursor-target, button, select, .grid-item', // 타겟팅할 요소들 확장
    spinDuration: 2,
    hideDefaultCursor: true,
    hoverDuration: 0.2,
    parallaxOn: true,
    borderWidth: 3,
    cornerSize: 12
  };

  const isMobile = (() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  })();

  const cursor = document.getElementById('target-cursor');
  if (isMobile) {
    if (cursor) cursor.remove();
    document.body.style.cursor = 'auto';
    return;
  }

  if (!cursor) return;

  const dot = cursor.querySelector('.target-cursor-dot');
  const corners = Array.from(cursor.querySelectorAll('.target-cursor-corner'));

  let spinTl = null;
  let containingBlock = null;
  let activeTarget = null;
  let currentLeaveHandler = null;
  let resumeTimeout = null;
  let targetCornerPositions = null;
  let isActive = false;
  let activeStrength = { current: 0 };

  const getContainingBlock = element => {
    let node = element?.parentElement;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      if (
        style.transform !== 'none' ||
        style.perspective !== 'none' ||
        style.filter !== 'none' ||
        style.willChange.includes('transform') ||
        style.willChange.includes('perspective') ||
        style.willChange.includes('filter') ||
        /paint|layout|strict|content/.test(style.contain)
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  };

  const getContainingBlockOffset = block => {
    if (!block) return { x: 0, y: 0 };
    const rect = block.getBoundingClientRect();
    return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
  };

  const moveCursor = (x, y) => {
    const { x: offsetX, y: offsetY } = getContainingBlockOffset(containingBlock);
    gsap.to(cursor, {
      x: x - offsetX,
      y: y - offsetY,
      duration: 0.1,
      ease: 'power3.out'
    });
  };

  containingBlock = getContainingBlock(cursor);
  const initialOffset = getContainingBlockOffset(containingBlock);
  
  gsap.set(cursor, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2 - initialOffset.x,
    y: window.innerHeight / 2 - initialOffset.y
  });

  const createSpinTimeline = () => {
    if (spinTl) spinTl.kill();
    spinTl = gsap.timeline({ repeat: -1 })
      .to(cursor, { rotation: '+=360', duration: config.spinDuration, ease: 'none' });
  };

  createSpinTimeline();

  const tickerFn = () => {
    if (!targetCornerPositions || !isActive) return;

    const strength = activeStrength.current;
    if (strength === 0) return;

    const cursorX = gsap.getProperty(cursor, 'x');
    const cursorY = gsap.getProperty(cursor, 'y');

    corners.forEach((corner, i) => {
      const currentX = gsap.getProperty(corner, 'x');
      const currentY = gsap.getProperty(corner, 'y');

      const targetX = targetCornerPositions[i].x - cursorX;
      const targetY = targetCornerPositions[i].y - cursorY;

      const finalX = currentX + (targetX - currentX) * strength;
      const finalY = currentY + (targetY - currentY) * strength;

      const duration = strength >= 0.99 ? (config.parallaxOn ? 0.2 : 0) : 0.05;

      gsap.to(corner, {
        x: finalX,
        y: finalY,
        duration: duration,
        ease: duration === 0 ? 'none' : 'power1.out',
        overwrite: 'auto'
      });
    });
  };

  const moveHandler = e => moveCursor(e.clientX, e.clientY);
  
  const scrollHandler = () => {
    if (!activeTarget) return;
    const { x: offsetX, y: offsetY } = getContainingBlockOffset(containingBlock);
    const mouseX = gsap.getProperty(cursor, 'x') + offsetX;
    const mouseY = gsap.getProperty(cursor, 'y') + offsetY;
    const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
    const isStillOverTarget =
      elementUnderMouse &&
      (elementUnderMouse === activeTarget || elementUnderMouse.closest(config.targetSelector) === activeTarget);
    if (!isStillOverTarget && currentLeaveHandler) {
      currentLeaveHandler();
    }
  };

  const mouseDownHandler = () => {
    gsap.to(dot, { scale: 0.7, duration: 0.3 });
    gsap.to(cursor, { scale: 0.9, duration: 0.2 });
  };

  const mouseUpHandler = () => {
    gsap.to(dot, { scale: 1, duration: 0.3 });
    gsap.to(cursor, { scale: 1, duration: 0.2 });
  };

  const cleanupTarget = target => {
    if (currentLeaveHandler) {
      target.removeEventListener('mouseleave', currentLeaveHandler);
    }
    currentLeaveHandler = null;
  };

  const enterHandler = e => {
    const directTarget = e.target;
    let current = directTarget;
    let target = null;
    
    while (current && current !== document.body) {
      if (current.matches(config.targetSelector)) {
        target = current;
        break;
      }
      current = current.parentElement;
    }

    if (!target) return;
    if (activeTarget === target) return;
    
    if (activeTarget) cleanupTarget(activeTarget);
    if (resumeTimeout) {
      clearTimeout(resumeTimeout);
      resumeTimeout = null;
    }

    activeTarget = target;
    corners.forEach(corner => gsap.killTweensOf(corner));

    gsap.killTweensOf(cursor, 'rotation');
    if (spinTl) spinTl.pause();
    gsap.set(cursor, { rotation: 0 });

    const rect = target.getBoundingClientRect();
    const { borderWidth, cornerSize } = config;
    const { x: offsetX, y: offsetY } = getContainingBlockOffset(containingBlock);
    const cursorX = gsap.getProperty(cursor, 'x');
    const cursorY = gsap.getProperty(cursor, 'y');

    targetCornerPositions = [
      { x: rect.left - borderWidth - offsetX, y: rect.top - borderWidth - offsetY },
      { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.top - borderWidth - offsetY },
      { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY },
      { x: rect.left - borderWidth - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY }
    ];

    isActive = true;
    gsap.ticker.add(tickerFn);

    gsap.to(activeStrength, {
      current: 1,
      duration: config.hoverDuration,
      ease: 'power2.out'
    });

    corners.forEach((corner, i) => {
      gsap.to(corner, {
        x: targetCornerPositions[i].x - cursorX,
        y: targetCornerPositions[i].y - cursorY,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    const leaveHandler = () => {
      gsap.ticker.remove(tickerFn);
      isActive = false;
      targetCornerPositions = null;
      gsap.set(activeStrength, { current: 0, overwrite: true });
      activeTarget = null;

      gsap.killTweensOf(corners);
      const { cornerSize } = config;
      const positions = [
        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: cornerSize * 0.5 },
        { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
      ];
      
      const tl = gsap.timeline();
      corners.forEach((corner, index) => {
        tl.to(corner, {
          x: positions[index].x,
          y: positions[index].y,
          duration: 0.3,
          ease: 'power3.out'
        }, 0);
      });

      resumeTimeout = setTimeout(() => {
        if (!activeTarget && spinTl) {
          const currentRotation = gsap.getProperty(cursor, 'rotation');
          const normalizedRotation = currentRotation % 360;
          spinTl.kill();
          spinTl = gsap.timeline({ repeat: -1 })
            .to(cursor, { rotation: '+=360', duration: config.spinDuration, ease: 'none' });
            
          gsap.to(cursor, {
            rotation: normalizedRotation + 360,
            duration: config.spinDuration * (1 - normalizedRotation / 360),
            ease: 'none',
            onComplete: () => {
              if(spinTl) spinTl.restart();
            }
          });
        }
        resumeTimeout = null;
      }, 50);

      cleanupTarget(target);
    };

    currentLeaveHandler = leaveHandler;
    target.addEventListener('mouseleave', leaveHandler);
  };

  const resizeHandler = () => {
    containingBlock = getContainingBlock(cursor);
  };

  window.addEventListener('mousemove', moveHandler);
  // 이벤트 위임을 사용하여 동적으로 생성되는 요소(인벤토리 등)에도 작동하도록 설정
  document.body.addEventListener('mouseover', enterHandler, { passive: true });
  window.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('mousedown', mouseDownHandler);
  window.addEventListener('mouseup', mouseUpHandler);
}

window.addEventListener('DOMContentLoaded', () => {
    autoScaleUI();
    initTargetCursor();
    
    const invOverlay = document.getElementById('inv-overlay');
    if (invOverlay) invOverlay.addEventListener('click', () => toggleInventory(false));

    const ssrPreview = document.getElementById('ssr-preview');
    if (ssrPreview) ssrPreview.addEventListener('click', () => toggleSSRPreview(false));
});

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.querySelector('.btn-back-main');
    
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault(); // 기본 링크 이동 방지
            const targetUrl = backBtn.getAttribute('href');

            // 1. 전환용 검은 화면 엘리먼트 생성
            const transitionScreen = document.createElement('div');
            transitionScreen.style.position = 'fixed';
            transitionScreen.style.top = '100%'; /* 화면 아래에 대기 */
            transitionScreen.style.left = '0';
            transitionScreen.style.width = '100vw';
            transitionScreen.style.height = '100vh';
            transitionScreen.style.backgroundColor = '#000';
            transitionScreen.style.zIndex = '999999';
            transitionScreen.style.transition = 'top 0.7s cubic-bezier(0.76, 0, 0.24, 1)';
            
            document.body.appendChild(transitionScreen);

            // 2. 렌더링 사이클 대기 후 애니메이션 실행 (아래에서 위로)
            requestAnimationFrame(() => {
                transitionScreen.style.top = '0';
            });

            // 3. 애니메이션이 완전히 끝난 후 페이지 이동
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 700); // transition 시간과 동일하게 설정
        });
    }
});

init();

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

initTutorial();