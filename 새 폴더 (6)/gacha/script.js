/* ================= VARIABLES, CONSTANTS & DATA ================= */

/* ================= VARIABLES, CONSTANTS & DATA ================= */

(function() {
    document.addEventListener("DOMContentLoaded", () => {
        // 들어올 때 페이드 인 효과
        const entryOverlay = document.getElementById("entry-fade-overlay");
        if (entryOverlay) {
            requestAnimationFrame(() => {
                entryOverlay.style.opacity = "0";
                setTimeout(() => entryOverlay.remove(), 1300);
            });
        }

        // 클릭 시 나가는 페이드 아웃 + 1초 대기 효과
        const backBtn = document.getElementById("back-to-main");
        const exitOverlay = document.getElementById("exit-fade-overlay");

        if (backBtn && exitOverlay) {
            backBtn.addEventListener("click", (e) => {
                e.preventDefault(); // 즉시 이동 차단
                
                exitOverlay.style.opacity = "1"; // 화면 암전 (0.5초 소요)
                
                setTimeout(() => {
                    // 버튼의 href 경로(../index.html)를 읽어와 1.5초 뒤 안전하게 이동
                    window.location.href = backBtn.getAttribute("href");
                }, 1500); 
            });
        }
    });
})();
/* ================= VARIABLES, CONSTANTS & DATA ================= */
let state = "idle";
let isSSRPlaying = false, isIntroPlaying = false;
let currentBanner = 0, revealIndex = 0, totalPull = 0;
let pitySSR = 0, pitySR = 0, pityPickup = 0;
let results = [], inventory = {};
let introTimeout = null, activeBg = 1, debugPickupMode = false;

const iconMap = {
    "DRONE COSTUME":"fa-scale-balanced",
    "TEDDY COSTUME":"fa-wave-square",
    "WATER COSTUME":"fa-water",
    "VOID COSTUME":"fa-sliders",
    "AWL COSTUME":"fa-screwdriver",
    "RIFLE COSTUME":"fa-crosshairs",

    "기록관 코트":"fa-shirt",
    "분석 프레임":"fa-vial",
    "신호 마스크":"fa-mask-face",
    "전술 베일":"fa-user-ninja",
    "정전기 글러브":"fa-hand",
    "회로 로브":"fa-microchip",
    "암호 태그":"fa-tag",
    "방진 바이저":"fa-glasses",
    "제어 부츠":"fa-shoe-prints",
    "메아리 망토":"fa-wind",

    "찢어진 셔츠":"fa-shirt",
    "낡은 프레임":"fa-box-archive",
    "일반 제복":"fa-user",
    "녹슨 배지":"fa-id-badge",
    "저가형 바이저":"fa-glasses",
    "플라스틱 링":"fa-ring",
    "헤진 후드":"fa-user-secret",
    "낡은 장갑":"fa-mitten",
    "저사양 칩":"fa-memory",
    "손상된 마스크":"fa-masks-theater",
    "고철 코트":"fa-shirt",
    "훈련용 벨트":"fa-bandage",
    "기본형 부츠":"fa-shoe-prints",
    "확성 마이크":"fa-microphone",
    "무딘 헬멧":"fa-helmet-safety",
    "빈 파일":"fa-folder-open"
};

const itemPool = {
    SSR: [
        "DRONE COSTUME",
        "TEDDY COSTUME",
        "WATER COSTUME",
        "VOID COSTUME",
        "AWL COSTUME",
        "RIFLE COSTUME"
    ],

    SR: [
        "기록관 코트",
        "분석 프레임",
        "신호 마스크",
        "전술 베일",
        "정전기 글러브",
        "회로 로브",
        "암호 태그",
        "방진 바이저",
        "제어 부츠",
        "메아리 망토"
    ],

    R: [
        "찢어진 셔츠",
        "낡은 프레임",
        "일반 제복",
        "녹슨 배지",
        "저가형 바이저",
        "플라스틱 링",
        "헤진 후드",
        "낡은 장갑",
        "저사양 칩",
        "손상된 마스크",
        "고철 코트",
        "훈련용 벨트",
        "기본형 부츠",
        "확성 마이크",
        "무딘 헬멧",
        "빈 파일"
    ]
};

const banners = [
    {
    name: "DRONE",
    pickup: "DRONE COSTUME",
    pickupText: "아련한 기억을 불러일으키는 누군가의 코스튬. 한때 당신을 지켰었다",
    desc: `
        도시 잔해 속에서 복구된 MANDATE 프로토콜
        교란형 전술 코스튬 및 제어 장비를 획득할 수 있다.
    `
},
{
    name: "TEDDY",
    pickup: "TEDDY COSTUME",
    pickupText: "아련한 기억을 불러일으키는 누군가의 코스튬. 한때 당신을 지켰었다",
    desc: `
        폭발흔이 남은 채 파편화된 CHARGE 코어
        강습형 전술 코스튬 및 추적 장비를 획득할 수 있다.
    `
},
{
    name: "WATER",
    pickup: "WATER COSTUME",
    pickupText: "아련한 기억을 불러일으키는 누군가의 코스튬. 한때 당신을 지켰었다",
    desc: `
        침수된 음성 모듈에서 추출된 SIREN 파형.
        내충격 코스튬 및 중화 장비를 획득할 수 있다.
    `
},
{
    name: "AWL",
    pickup: "AWL COSTUME",
    pickupText: "아련한 기억을 불러일으키는 누군가의 코스튬. 한때 당신을 지켰었다",
    desc: `
        높이를 가늠할 수 없는 좌표계의 REVEAL 코어.
        위장형 코스튬 및 추적 장비를 획득할 수 있다.
    `
},
{
    name: "RIFLE",
    pickup: "RIFLE COSTUME",
    pickupText: "아련한 기억을 불러일으키는 누군가의 코스튬. 한때 당신을 지켰었다",
    desc: `
        관통된 물리 코어 내부에서 발견된 RIGID 로직.
        강습형 코스튬 및 공명 장비를 획득할 수 있다.
    `
},
{
    name: "MIC",
    pickup: "VOID COSTUME",
    pickupText: "아련한 기억을 불러일으키는 누군가의 코스튬. 한때 당신을 지켰었다",
    desc: `
        스포트라이트 뒤편, 단상에 각인된 SEIZE 프로토콜.
        교란형 코스튬 및 공명 장비를 획득할 수 있다.
    `
},
{
    name: "BEAKER",
    pickup: "DRONE COSTUME",
    pickupText: "아련한 기억을 불러일으키는 누군가의 코스튬. 한때 당신을 지켰었다",
    desc: `
        영구 폐쇄된 연구실 너머에서 전송된 BARRIER 로직.
        내충격 코스튬 및 제어 장비를 획득할 수 있다..
    `
}
];

const defaultSSRImages = [
    { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80", height: 400 },
    { img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80", height: 250 },
    { img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80", height: 500 },
    { img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80", height: 350 },
    { img: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=80", height: 450 }
];

const ssrImageMap = {
    "DRONE COSTUME": {
        silhouette: "silhouette-DRONE.png", reveal: "DRONE-full.png", thumb: "DRONE-thumb.png",
        masonry: [
            {img: "DRONE-1.png", height: 420},
            {img: "DRONE-2.png", height: 300},
            {img: "DRONE-3.png", height: 520}
        ]
    },
    "TEDDY COSTUME": {
        silhouette: "img/TEDDY-silhouette.png", reveal: "img/TEDDY-full.png", thumb: "img/TEDDY-thumb.png",
        masonry: [
            {img: "img-roll/02/07.jpg", height: 460},
            {img: "img-roll/02/06.jpg", height: 380},
            {img: "img-roll/02/05.jpg", height: 460},
            {img: "img-roll/02/02.jpg", height: 720},
            {img: "img-roll/02/04.jpg", height: 720},
            {img: "img-roll/02/03.jpg", height: 720},
            {img: "img-roll/02/01.jpg", height: 720},
            {img: "img-roll/02/08.jpg", height: 460}
        ]
    }
};

/* ================= INITIALIZATION & EVENTS ================= */
window.addEventListener('load', () => {
    setTimeout(() => { document.body.classList.add('loaded'); }, 1500);
});

function init() {
    const sidebar = document.getElementById('sidebar');
    banners.forEach((banner, i) => {
        const tab = document.createElement('div');
        tab.className = `banner-tab ${i === 0 ? 'active' : ''}`;
        tab.innerText = banner.name;
        tab.onclick = (e) => { e.stopPropagation(); switchBanner(i); };
        sidebar.appendChild(tab);
    });
    switchBanner(0);
    updatePity();
}

document.addEventListener('click', (e) => {
    const invPanel = document.getElementById('inv-panel');
    
    // 인벤토리 바깥 클릭 시 닫기
    if (invPanel.classList.contains('open') && !e.target.closest('#inv-panel') && !e.target.closest('.inventory-btn')) {
        toggleInventory(false);
        return;
    }
    if (e.target.closest('.ui-btn') || e.target.closest('.banner-tab') || e.target.closest('.rate-box')) return;
    handleGlobalClick();
});

function handleGlobalClick() {
    if (isSSRPlaying) return;
    if (isIntroPlaying) {
        finishIntro(true);
        return;
    }
    if (state === "revealing") {
        revealIndex++;
        if (revealIndex >= results.length) {
            showResult();
            return;
        }
        checkAndRenderReveal();
    }
}

init();

/* ================= GACHA CORE LOGIC ================= */
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function runGacha(count) {
    if (state !== "idle") return;
    state = "running";
    results = [];
    revealIndex = 0;
    totalPull += count;
    document.getElementById('total-count').innerText = totalPull;

    let highest = "R";
    const current = banners[currentBanner];

    for (let i = 0; i < count; i++) {
        pitySSR++; pitySR++; pityPickup++;
        let rarity = "R", name = "";
        const r = Math.random() * 100;

        if (debugPickupMode || r < 1 || pitySSR >= 80) {
            rarity = "SSR";
            pitySSR = 0;
            if (debugPickupMode || Math.random() < 0.5 || pityPickup >= 150) {
                name = current.pickup;
                pityPickup = 0;
            } else {
                const nonPickupSSR = itemPool.SSR.filter(ssr => ssr !== current.pickup);
                name = getRandomItem(nonPickupSSR);
            }
        } else if (r < 14 || pitySR >= 10) {
            rarity = "SR";
            pitySR = 0;
            name = getRandomItem(itemPool.SR);
        } else {
            name = getRandomItem(itemPool.R);
        }

        if (rarity === "SSR") highest = "SSR";
        else if (rarity === "SR" && highest !== "SSR") highest = "SR";

        results.push({ rarity, name });
        addInventory(name, rarity);
    }
    updatePity();
    playAnimation(highest);
}

function updatePity() {
    document.getElementById('pity-ssr').innerHTML = `SSR 확정까지 : <b>${80 - pitySSR}</b>회`;
    document.getElementById('pity-sr').innerHTML = `SR 확정까지 : <b>${10 - pitySR}</b>회`;
    document.getElementById('pity-pickup').innerHTML = `픽업 확정까지 : <b>${150 - pityPickup}</b>회`;
}

function toggleDebugPickup() {
    debugPickupMode = !debugPickupMode;
    const btn = document.getElementById('debug-pickup-btn');
    btn.classList.toggle('active', debugPickupMode);
    btn.innerText = debugPickupMode ? 'DEBUG PICKUP : ON' : 'DEBUG PICKUP : OFF';
}

/* ================= UI & INVENTORY ================= */
function switchBanner(i) {
    currentBanner = i;
    const data = banners[i];
    const oldPanel = document.querySelector('.banner-panel');
    const newPanel = oldPanel.cloneNode(true);
    
    newPanel.classList.remove('switching');
    oldPanel.parentNode.replaceChild(newPanel, oldPanel);
    void newPanel.offsetWidth; // Reflow
    newPanel.classList.add('switching');

    newPanel.querySelector('#banner-title').innerText = data.name;
    newPanel.querySelector('.system-no').innerText = String(i + 1).padStart(2, '0');
    newPanel.querySelector('#pickup-text').innerText = data.pickupText;
    newPanel.querySelector('#banner-desc').innerText = data.desc;

    document.querySelectorAll('.banner-tab').forEach((el, idx) => el.classList.toggle('active', idx === i));
    setTimeout(() => newPanel.classList.remove('switching'), 600);
}

function addInventory(name, rarity) {
    if (inventory[name]) inventory[name].count++;
    else inventory[name] = { rarity, count: 1 };
}

function toggleInventory(show) {
    document.getElementById('inv-overlay').style.display = show ? 'block' : 'none';
    document.getElementById('inv-panel').classList.toggle('open', show);
    if (show) renderInventory();
}

function renderInventory() {
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';
    const sortType = document.getElementById('inv-sort')?.value || 'rarity';
    const rarityOrder = { SSR: 0, SR: 1, R: 2 };
    const items = Object.entries(inventory);

    items.sort((a, b) => sortType === 'rarity' 
        ? rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity] 
        : b[1].count - a[1].count
    );

    items.forEach(([name, data]) => {
        const card = document.createElement('div');
        card.className = `inv-card ${data.rarity}`;
        
        if (data.rarity === 'SSR') {
            card.style.cursor = 'pointer';
            card.onclick = () => toggleSSRPreview(name);
        }

        const hasThumb = ssrImageMap[name]?.thumb;

        card.innerHTML = `
            <div class="inv-count">x${data.count}</div>

            <div class="inv-visual">
                ${
                    hasThumb
                    ? `
                    <div
                        class="inv-thumb"
                        style="
                            background-image:url('${ssrImageMap[name].thumb}');
                        "
                    ></div>
                    `
                    : `
                    <i class="fa-solid ${iconMap[name]} inv-icon"></i>
                    `
                }
            </div>

            <div class="inv-name">
                ${name}
            </div>
        `;
        grid.appendChild(card);
    });
}

function toggleSSRPreview(name){
    const preview = document.getElementById('ssr-preview');
    if(name === false) {
        preview.style.display = 'none';
        return;
    }
    const data = ssrImageMap[name];
    const image = data?.reveal || defaultSSRImages[0].img;
    document.getElementById('ssr-preview-image').style.backgroundImage = `url('${image}')`;
    preview.style.display = 'flex';
}

function toggleRate(show) {
    document.getElementById('rate-popup').style.display = show ? 'flex' : 'none';
}

function showResult() {
    state = "finished";
    document.getElementById('single-reveal').style.display = 'none';
    document.getElementById('result-screen').style.display = 'flex';
    const grid = document.getElementById('result-grid');
    grid.innerHTML = '';

    results.forEach(item => {
        const card = document.createElement('div');
        card.className = `card ${item.rarity}`;

        const hasThumb = ssrImageMap[item.name]?.thumb;

        card.innerHTML = `
            <div class="card-visual">
                ${
                    hasThumb
                    ? `
                    <div
                        class="card-thumb full"
                        style="
                            background-image:url('${ssrImageMap[item.name].thumb}');
                        "
                    ></div>
                    `
                    : `
                    <i class="fa-solid ${iconMap[item.name]} card-icon"></i>
                    `
                }
            </div>

            <div class="card-name">
                ${item.name}
            </div>
        `;

        grid.appendChild(card);
    });
}

function closeResult() {
    document.getElementById('result-screen').style.display = 'none';
    state = "idle";
}

/* ================= ANIMATION & REVEAL ================= */
function playAnimation(highest) {
    document.body.classList.add('glitch');
    setTimeout(() => { document.body.classList.remove('glitch'); }, 450);

    const overlay = document.getElementById('gacha-overlay');
    const ring = document.querySelector('.scan-ring');
    const flash = document.querySelector('.flash-text');

    flash.style.color = highest === "SSR" ? "#111" : highest === "SR" ? "#555" : "#888";
    ring.style.setProperty('--ring-color', highest === "SSR" ? '#ffcc00' : highest === "SR" ? '#a330ff' : '#000000');

    isIntroPlaying = true;
    overlay.style.display = 'block';
    overlay.classList.remove('active');
    void overlay.offsetWidth; // Reflow
    overlay.classList.add('active');
    
    // 💡 [수정] 인트로가 완전히 끝나는 타이밍 설정
    introTimeout = setTimeout(() => { finishIntro(); }, 2200);

    setTimeout(() => {
        if (state === "running") { 
            // 가림막 뒤에서 안전하게 연출 데이터 세팅 시작
            state = "revealing";
            document.getElementById('single-reveal').style.display = 'flex';
            checkAndRenderReveal(); 
        }
    }, 450); // CSS의 .screen-transition / wipeIn 속도에 맞춰 400~500ms 사이로 조절
}

function finishIntro(skipAll = false) {
    if (!isIntroPlaying) return;
    isIntroPlaying = false;
    clearTimeout(introTimeout);
    document.getElementById('gacha-overlay').style.display = 'none';

    if (skipAll) {
        const hasSSR = results.some(item => item.rarity === "SSR");
        if (hasSSR) {
            results.forEach(item => { if (item.rarity === "SSR") item.isMasonryPlayed = true; });
            playSSRMasonry(() => { startReveal(); });
        } else {
            showResult();
        }
        return;
    }
    
    // 💡 [수정] 이미 450ms 시점에 state가 바뀌어 렌더링 중이므로 
    // 상태가 아직 idle이거나 running일 때만 안전장치로 호출되도록 변경
    if (state === "running" || state === "idle") {
        startReveal();
    }
}

function startReveal() {
    state = "revealing";
    document.getElementById('single-reveal').style.display = 'flex';
    checkAndRenderReveal();
}

function checkAndRenderReveal() {
    const item = results[revealIndex];
    if (!item) {
        showResult();
        return;
    }
    if (item.rarity === "SSR" && !item.isMasonryPlayed) {
        item.isMasonryPlayed = true;
        playSSRMasonry(() => { renderReveal(); });
        return;
    }
    renderReveal();
}

function renderReveal() {
    const item = results[revealIndex];
    if (item.rarity === "SSR") {
        renderSSRReveal(item);
        return;
    }

    const color = item.rarity === "SSR" ? "var(--ssr)" : item.rarity === "SR" ? "var(--sr)" : "var(--r)";
    document.getElementById('reveal-content').innerHTML = `
        <div class="reveal-box">
            <div class="reveal-subtitle">SYNTHETIC RESULT</div>
            <i class="fa-solid ${iconMap[item.name]} reveal-icon" style="color:${color};"></i>
            <h1 class="reveal-name" style="color:${color}">${item.name}</h1>
        </div>
    `;
}

function renderSSRReveal(item) {
    const data = ssrImageMap[item.name];
    const silhouette = data?.silhouette || defaultSSRImages[0].img;
    const revealImage = data?.reveal || defaultSSRImages[0].img;

    document.getElementById('reveal-content').innerHTML = `
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
}

function typeSSRText(text) {
    const target = document.getElementById('type-target');
    if (!target) return;
    target.innerText = '';
    
    let i = 0;
    const interval = setInterval(() => {
        if (i >= text.length) {
            clearInterval(interval);
            setTimeout(() => document.querySelector('.ssr-cinematic')?.classList.add('reveal'), 500);
            setTimeout(() => document.querySelector('.ssr-silhouette')?.remove(), 1400);
            return;
        }
        target.innerText += text.charAt(i++);
    }, 120);
}

function playSSRMasonry(onComplete) {
    isSSRPlaying = true;
    const overlay = document.getElementById('ssr-masonry-overlay');
    const listContainer = document.getElementById('masonry-list');
    const pulledSSRs = results.filter(item => item.rarity === "SSR");
    let currentMasonryItems = defaultSSRImages;

    if (pulledSSRs.length > 0) {
        const ssrName = pulledSSRs[0].name;
        if (ssrImageMap[ssrName]?.masonry) {
            currentMasonryItems = ssrImageMap[ssrName].masonry;
        }
    }

    overlay.style.display = 'block';
    listContainer.innerHTML = '';

    const width = window.innerWidth;
    let columns = width >= 1500 ? 5 : width >= 1000 ? 4 : width >= 600 ? 3 : width >= 400 ? 2 : 1;
    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    const grid = currentMasonryItems.map(child => {
        const col = colHeights.indexOf(Math.min(...colHeights));
        const x = columnWidth * col;
        const h = child.height;
        const y = colHeights[col];
        colHeights[col] += h;
        return { ...child, x, y, w: columnWidth, h: h };
    });

    grid.forEach((item, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'masonry-item-wrapper';
        wrapper.innerHTML = `<div class="masonry-item-img" style="background-image: url('${item.img}')"></div>`;
        listContainer.appendChild(wrapper);
        
        const initialY = window.innerHeight + 200;
        gsap.fromTo(wrapper, 
            { opacity: 0, x: item.x, y: initialY, width: item.w, height: item.h, filter: 'blur(10px)' },
            { opacity: 1, y: item.y, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out', delay: index * 0.12 }
        );
    });

    setTimeout(() => {
        gsap.to(listContainer.children, {
            opacity: 0, y: -200, filter: 'blur(10px)', duration: 0.6, stagger: 0.03, ease: 'power2.in',
            onComplete: () => {
                overlay.style.display = 'none';
                isSSRPlaying = false;
                if (onComplete) onComplete();
            }
        });
    }, 4200);
}

function updateScale(){

    const baseW = 1536;
    const baseH = 864;

    const scale = Math.min(
        window.innerWidth / baseW,
        window.innerHeight / baseH
    );

    const stage = document.getElementById("stage");

    stage.style.transform =
        `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener("resize", updateScale);

updateScale();

window.addEventListener('load', () => {
    const transitionEl = document.querySelector('.screen-transition');
    if (!transitionEl) return;

    // 💡 페이지 로딩이 완전히 끝나도 '무조건 0.1초(100ms)' 동안 검은 화면을 유지
    setTimeout(() => {
        transitionEl.classList.add('reveal');
    }, 100); 
});