/* ==========================================================================
   VARIABLES & DATA
   ========================================================================== */
let isSSRPlaying = false;
let currentBanner = 0;
let results = [];
let revealIndex = 0;
let inventory = {};
let totalPull = 0;
let pitySSR = 0;
let pitySR = 0;
let pityPickup = 0;
let state = "idle";
let isIntroPlaying = false;
let introTimeout = null;
let debugPickupMode = false;

const iconMap = {
    "HARMONY UNIT":"img/DRONE-thumb.png", "MIRROR SIGNAL":"fa-wave-square", "SYNTHESIS GIRL":"fa-microchip",
    "VOID ANALYZER":"fa-sliders", "NOISE DRIVER":"fa-headphones", "VECTOR DOLL":"fa-hexagon-nodes",
    "ARCHIVE COAT":"fa-shirt", "RESEARCH FRAME":"fa-vial", "SIGNAL MASK":"fa-mask-face",
    "BROKEN SHIRT":"fa-shirt", "OLD FRAME":"fa-box-archive", "COMMON SUIT":"fa-user"
};

const itemPool = {
    SSR: ["HARMONY UNIT", "MIRROR SIGNAL", "SYNTHESIS GIRL", "VOID ANALYZER", "NOISE DRIVER", "VECTOR DOLL", "HAMSTER ANALYZER"],
    SR: ["ARCHIVE COAT", "RESEARCH FRAME", "SIGNAL MASK"],
    R: ["BROKEN SHIRT", "OLD FRAME", "COMMON SUIT"]
};

// 통합된 배너 데이터 (이미지 포함)
const banners = [
    {name: "HARMONY", pickup: "HARMONY UNIT", image:'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop'},
    {name: "MIRROR", pickup: "MIRROR SIGNAL", image:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop' },
    {name: "SYNTHESIS", pickup: "SYNTHESIS GIRL", image:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1400&auto=format&fit=crop'},
    {name: "NOISE", pickup: "NOISE DRIVER", image:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop'},
    {name: "VECTOR", pickup: "VECTOR DOLL", image:'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1400&auto=format&fit=crop'},
    {name: "ANALYZER", pickup: "VOID ANALYZER", image:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1400&auto=format&fit=crop'},
    {name: "HAMSTER", pickup: "HAMSTER ANALYZER", image:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1400&auto=format&fit=crop'}
]; 

const ssrImageMap = {
    "HARMONY UNIT": { //완성 : 문대
        silhouette: "img/DRONE-silhouette.png", reveal: "img/DRONE-full.png", thumb: "img/DRONE-thumb.png",
        masonry: [
            {img: "img-roll/01/07.jpg", height: 460},
            {img: "img-roll/01/06.jpg", height: 380},
            {img: "img-roll/01/08.jpg", height: 460},
            {img: "img-roll/01/05.jpg", height: 720},
            {img: "img-roll/01/02.jpg", height: 720},
            {img: "img-roll/01/03.jpg", height: 720},
            {img: "img-roll/01/01.jpg", height: 720},
            {img: "img-roll/01/04.jpg", height: 460}
        ]
    },
    "MIRROR SIGNAL": { //완성 : 유진
        silhouette: "img/tiger-silhouette.png", reveal: "img/tiger-full.png", thumb: "img/tiger-thumb.png",
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
    },
    "MIRROR SIGNAL": {
        silhouette: "img/rabin-silhouette.png", reveal: "img/rabin-full.png", thumb: "img/rabin-thumb.png",
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
    },
    "MIRROR SIGNAL": {
        silhouette: "img/god-silhouette.png", reveal: "img/god-full.png", thumb: "img/god-thumb.png",
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
    },
    "MIRROR SIGNAL": {
        silhouette: "img/lead-silhouette.png", reveal: "img/lead-full.png", thumb: "img/lead-thumb.png",
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
    },
    "VOID ANALYZER": { //완성 : 큰세
        silhouette: "img/bigbear-silhouette.png", reveal: "img/bigbear-full.png", thumb: "img/bigbear-thumb.png",
        masonry: [
            {img: "img-roll/06/07.jpg", height: 720},
            {img: "img-roll/06/06.jpg", height: 380},
            {img: "img-roll/06/05.jpg", height: 460},
            {img: "img-roll/06/01.jpg", height: 480},
            {img: "img-roll/06/04.jpg", height: 720},
            {img: "img-roll/06/03.jpg", height: 720},
            {img: "img-roll/06/02.jpg", height: 720},
            {img: "img-roll/06/08.jpg", height: 480},
        ]
    },
    "HAMSTER ANALYZER": { //완성 : 배세
        silhouette: "img/ham-silhouette.png", reveal: "img/ham-full.png", thumb: "img/ham-thumb.png",
        masonry: [
            {img: "img-roll/07/07.jpg", height: 720},
            {img: "img-roll/07/06.jpg", height: 380},
            {img: "img-roll/07/05.jpg", height: 720},
            {img: "img-roll/07/02.jpg", height: 460},
            {img: "img-roll/07/04.jpg", height: 720},
            {img: "img-roll/07/03.jpg", height: 720},
            {img: "img-roll/07/08.jpg", height: 460},
            {img: "img-roll/07/09.jpg", height: 380},
            {img: "img-roll/07/10.jpg", height: 460}
        ]
    }
};

const defaultSSRImages = [
    { img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', height: 320 },
    { img: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600', height: 460 },
    { img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600', height: 350 },
    { img: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=600', height: 510 },
    { img: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=600', height: 390 }
];

/* ==========================================================================
   LOADING & INIT
   ========================================================================== */
window.addEventListener('load', () => {
    setTimeout(() => { document.body.classList.add('loaded'); }, 1500);
});

function init() {
    const sidebar = document.getElementById('sidebar');
    banners.forEach((banner, i) => {
        const tab = document.createElement('button');
        tab.className = `banner-button cursor-target ${i === 0 ? 'active' : ''}`;
        tab.innerText = banner.name;
        tab.onclick = (e) => { e.stopPropagation(); switchBanner(i); };
        sidebar.appendChild(tab);
    });
    switchBanner(0);
    updatePity();
    animateHUD();
}

function switchBanner(i) {
    currentBanner = i;
    const data = banners[i];
    
    document.getElementById('banner-title').innerText = data.name;
    document.querySelector('.system-no').innerText = String(i + 1).padStart(2, '0');
    document.getElementById('pickup-text').innerText = `PICK UP : ${data.pickup}`;
    document.getElementById('banner-image').src = data.image;

    document.querySelectorAll('.banner-button').forEach((el, idx) => {
        el.classList.toggle('active', idx === i);
    });
}

function updatePity() {
    document.getElementById('pity-ssr').innerHTML = `<span>SSR PITY</span><b>${80 - pitySSR}</b>`;
    document.getElementById('pity-sr').innerHTML = `<span>SR PITY</span><b>${10 - pitySR}</b>`;
    document.getElementById('pity-pickup').innerHTML = `<span>PICKUP PITY</span><b>${150 - pityPickup}</b>`;
}

/* ==========================================================================
   GACHA & INVENTORY LOGIC
   ========================================================================== */
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
        let rarity = "R"; let name = "";
        const r = Math.random() * 100;

        if (debugPickupMode || r < 1 || pitySSR >= 80) {
            rarity = "SSR"; pitySSR = 0;
            if (debugPickupMode || Math.random() < 0.5 || pityPickup >= 150) {
                name = current.pickup; pityPickup = 0;
            } else {
                const nonPickupSSR = itemPool.SSR.filter(ssr => ssr !== current.pickup);
                name = nonPickupSSR[Math.floor(Math.random() * nonPickupSSR.length)];
            }
        } else if (r < 14 || pitySR >= 10) {
            rarity = "SR"; pitySR = 0;
            name = itemPool.SR[Math.floor(Math.random() * itemPool.SR.length)];
        } else {
            name = itemPool.R[Math.floor(Math.random() * itemPool.R.length)];
        }

        if (rarity === "SSR") highest = "SSR";
        else if (rarity === "SR" && highest !== "SSR") highest = "SR";

        results.push({ rarity, name, image: current.image });
        addInventory(name, rarity, current.image);
    }
    updatePity();
    playAnimation(highest);
}

function addInventory(name, rarity, image) {
    if (inventory[name]) inventory[name].count++;
    else inventory[name] = { rarity, count: 1, image: image };
}

function toggleInventory(show) {
    document.getElementById('inv-overlay').style.display = show ? 'block' : 'none';
    document.getElementById('inv-panel').classList.toggle('open', show);
    if (show) renderInventory();
}

function renderInventory() {
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';
    const filterType = document.getElementById('inv-filter')?.value || 'all';

    const items = Object.entries(inventory).filter(([name, data]) => {
        return filterType === 'all' || data.rarity === filterType;
    });

    items.forEach(([name, data]) => {
        const card = document.createElement('div');
        card.className = `grid-item rarity-${data.rarity.toLowerCase()}`;
        if (data.rarity === 'SSR') {
            card.style.cursor = 'pointer';
            card.onclick = () => toggleSSRPreview(name);
        }

        card.innerHTML = `
            <div class="item-inner">
                <div class="image-holder">
                    ${ssrImageMap[name]?.thumb ? `<img src="${ssrImageMap[name].thumb}">` : `<div style="display:flex; height:100%; align-items:center; justify-content:center; font-size:4rem; color:var(--text); opacity:0.3;"><i class="fa-solid ${iconMap[name]}"></i></div>`}
                    <div class="scan-bar"></div>
                </div>
                <div class="item-details">
                    <div class="rarity-badge">${data.rarity} PROTOCOL</div>
                    <div class="item-name">${name} (x${data.count})</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function toggleRate(show) { document.getElementById('rate-popup').style.display = show ? 'flex' : 'none'; }
function toggleDebugPickup() {
    debugPickupMode = !debugPickupMode;
    const btn = document.getElementById('debug-pickup-btn');
    btn.classList.toggle('active', debugPickupMode);
    btn.querySelector('.command-sub').innerText = debugPickupMode ? 'PICKUP : ON' : 'PICKUP : OFF';
}

/* ==========================================================================
   GACHA CORE ANIMATION LOGIC & REVEAL FLOW CONTROL
   ========================================================================== */

/* 1. 가차 시작 도입부 연출 */
function playAnimation(highest) {
    document.body.classList.add('glitch');
    setTimeout(() => { document.body.classList.remove('glitch'); }, 450);

    const overlay = document.getElementById('gacha-overlay');
    const ring = document.querySelector('.scan-ring');
    const flash = document.querySelector('.flash-text');

    if (flash && ring) {
        flash.style.color = highest === "SSR" ? "#f6ff00" : highest === "SR" ? "#ffffff" : "#ffffff";
        ring.style.setProperty('--ring-color', highest === "SSR" ? '#ffcc00' : highest === "SR" ? '#a330ff' : '#ffffff');
    }

    isIntroPlaying = true;
    overlay.style.display = 'block';
    overlay.classList.remove('active');
    void overlay.offsetWidth; // 리플로우 트리거
    overlay.classList.add('active');

    introTimeout = setTimeout(() => { finishIntro(); }, 2200);
}

// 2. 도입부 스킵 로직 (인트로 종료 후 무조건 리빌 화면으로 직행하는 원형 로직)
function finishIntro() {
    if (!isIntroPlaying) return;
    isIntroPlaying = false;
    clearTimeout(introTimeout);
    document.getElementById('gacha-overlay').style.display = 'none';

    // 인트로가 끝나면 바로 개별 아이템 리빌 연출로 진입
    startReveal();
}

/* 3. 개별 연출 진입 제어 */
function startReveal() {
    state = "revealing";
    checkAndRenderReveal();
}

/* 4. 메이슨리 연출과 시네마틱 리빌 연출 순서 강제 정형화 */
function checkAndRenderReveal() {
    const item = results[revealIndex];
    if (!item) { showResult(); return; }
    
    if (item.rarity === "SSR" && !item.isMasonryPlayed) {
        item.isMasonryPlayed = true;
        
        // 메이슨리가 재생되는 동안 시네마틱 창(#single-reveal)이 위를 덮지 못하도록 완전히 숨김
        document.getElementById('single-reveal').style.display = 'none';
        
        // 메이슨리 연출이 콜백(onComplete)으로 완벽히 끝난 "직후"에만 시네마틱 리빌을 활성화
        playSSRMasonry(item, () => { 
            document.getElementById('single-reveal').style.display = 'flex';
            renderReveal(); 
        });
        return;
    }
    
    // SSR 메이슨리가 이미 끝났거나 R/SR 등급일 경우 즉시 출력
    document.getElementById('single-reveal').style.display = 'flex';
    renderReveal();
}

/* 5. 메이슨리 연출 함수 (#ui-scale-wrapper 1920x1080 내 배치 고정) - 4컬럼 버전 */
function playSSRMasonry(item, onComplete) {
    isSSRPlaying = true;
    const overlay = document.getElementById('ssr-masonry-overlay');
    const listContainer = document.getElementById('masonry-list');
    
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.overflow = 'hidden';
    overlay.style.zIndex = '400'; 

    listContainer.style.position = 'relative';
    listContainer.style.width = '100%';
    listContainer.style.height = '100%';
    listContainer.style.overflow = 'hidden';

    let currentMasonryItems = defaultSSRImages;
    if (item && ssrImageMap[item.name] && ssrImageMap[item.name].masonry) {
        currentMasonryItems = ssrImageMap[item.name].masonry;
    }

    overlay.style.display = 'block';
    listContainer.innerHTML = '';

    const baseWidth = 1920;
    const baseHeight = 1080;
    const columns = 4; // 5개에서 4개로 변경
    const colHeights = new Array(columns).fill(0);
    const columnWidth = baseWidth / columns; 

    currentMasonryItems.forEach((masonryItem, index) => {
        const col = colHeights.indexOf(Math.min(...colHeights));
        const x = columnWidth * col; 
        const y = colHeights[col];
        const h = masonryItem.height; 
        colHeights[col] += h;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'masonry-item-wrapper';
        wrapper.style.position = 'absolute';
        wrapper.style.overflow = 'hidden';
        wrapper.innerHTML = `
            <div class="masonry-item-img" style="
                background-image: url('${masonryItem.img}'); 
                width: 100%; height: 100%; 
                background-size: cover; background-position: center;
            "></div>
        `;
        listContainer.appendChild(wrapper);

        gsap.fromTo(wrapper, 
            { opacity: 0, x: x, y: baseHeight + 200, width: columnWidth + 0.5, height: h, filter: 'blur(10px)' },
            { opacity: 1, y: y, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out', delay: index * 0.12 }
        );
    });

    setTimeout(() => {
        gsap.to(listContainer.children, {
            opacity: 0, 
            y: -200, 
            filter: 'blur(10px)', 
            duration: 0.6, 
            stagger: 0.03, 
            ease: 'power2.in',
            onComplete: () => { 
                overlay.style.display = 'none'; 
                isSSRPlaying = false; 
                if (onComplete) onComplete(); 
            }
        });
    }, 4200);
}

/* 6. 타이핑 효과 */
let typeInterval = null; 
function typeSSRText(text) {
    const target = document.getElementById('type-target');
    if (!target) return;
    target.innerText = '';
    let i = 0;
    
    if (typeInterval) clearInterval(typeInterval); 
    
    typeInterval = setInterval(() => {
        if (i >= text.length) {
            clearInterval(typeInterval);
            setTimeout(() => { 
                document.querySelector('.ssr-cinematic')?.classList.add('reveal'); 
            }, 500);
            return;
        }
        target.innerText += text.charAt(i); 
        i++;
    }, 120);
}

/* 7. SSR 시네마틱 및 일반 아이템 바인딩 */
function renderReveal() {
    const item = results[revealIndex];
    if (!item) return;

    if (item.rarity === "SSR") {
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
        return;
    }

    const color = item.rarity === "SR" ? "var(--color-sr)" : "var(--color-r)";
    document.getElementById('reveal-content').innerHTML = `
        <div class="reveal-box tactical-reveal" style="border-color:${color}">
            <div class="reveal-subtitle">SYNTHETIC RESULT</div>
            <i class="fa-solid ${iconMap[item.name] || 'fa-cube'} reveal-icon" style="color:${color};"></i>
            <h1 class="reveal-name" style="color:${color}">${item.name}</h1>
        </div>
    `;
}

/* 8. 결과 창 출력 */
function showResult() {
    state = "finished";
    document.getElementById('single-reveal').style.display = 'none';
    document.getElementById('ssr-masonry-overlay').style.display = 'none';
    document.getElementById('result-screen').style.display = 'flex';
    const grid = document.getElementById('result-grid');
    grid.innerHTML = '';

    results.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = `grid-item rarity-${item.rarity.toLowerCase()}`;
        card.style.animationDelay = `${idx * 0.08}s`;
        
        card.innerHTML = `
            <div class="item-inner">
                <div class="image-holder">
                    <div style="display:flex; height:100%; align-items:center; justify-content:center; font-size:4rem; color:var(--text); opacity:0.3; background:#111;">
                        <i class="fa-solid ${iconMap[item.name]}"></i>
                    </div>
                </div>
                <div class="item-details">
                    <div class="item-name" style="font-size: 1rem;">${item.name}</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function closeResult() { document.getElementById('result-screen').style.display = 'none'; state = "idle"; }

/* ==========================================================================
   GLOBAL EVENTS & EFFECTS
   ========================================================================== */

document.addEventListener('click', (e) => {
    if (e.target.closest('.ui-btn') || e.target.closest('.banner-button') || e.target.closest('#inv-panel') || e.target.closest('.rate-box')) return;
    
    if (isSSRPlaying) return; 
    
    if (isIntroPlaying) { 
        finishIntro(true); 
        return; 
    }
    
    if (state === "revealing") {
        revealIndex++;
        if (revealIndex >= results.length) { showResult(); return; }
        checkAndRenderReveal();
    }
});

function toggleSSRPreview(name){
    const preview = document.getElementById('ssr-preview');
    if(name === false){ preview.style.display = 'none'; return; }
    const image = ssrImageMap[name]?.reveal || defaultSSRImages[0].img;
    document.getElementById('ssr-preview-image').style.backgroundImage = `url('${image}')`;
    preview.style.display = 'flex';
}

function animateHUD(){
    gsap.to('.radar-1',{ rotation:360, duration:30, repeat:-1, ease:'none' });
    gsap.to('.radar-2',{ rotation:-360, duration:20, repeat:-1, ease:'none' });
    gsap.to('.scan-lines',{ backgroundPositionY:'100px', duration:6, repeat:-1, ease:'none' });
}

(function initInteractiveDots() {
    const canvas = document.getElementById('interactive-dots-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dots = []; let time = 0;
    
    const config = { dotColor: { r: 255, g: 255, b: 255 }, gridSpacing: 50, animationSpeed: 0.005, maxInfluenceRadius: 150, baseSize: 1.8 };
    const mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        dots = [];
        for (let x = config.gridSpacing / 2; x < window.innerWidth; x += config.gridSpacing) {
            for (let y = config.gridSpacing / 2; y < window.innerHeight; y += config.gridSpacing) {
                dots.push({ x: x, y: y, originalX: x, originalY: y, phase: Math.random() * Math.PI * 2 });
            }
        }
    }

    function animate() {
        time += config.animationSpeed;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        dots.forEach(dot => {
            const dist = Math.sqrt(Math.pow(dot.originalX - mouse.x, 2) + Math.pow(dot.originalY - mouse.y, 2));
            const mouseInfluence = Math.max(0, 1 - dist / config.maxInfluenceRadius);
            let dotSize = (config.baseSize) - (mouseInfluence * 2.0) + (Math.sin(time + dot.phase) * 0.3);
            dotSize = Math.max(0, dotSize);
            const opacity = Math.max(0, 0.15 - (mouseInfluence * 0.1));

            if (dotSize > 0) {
                ctx.beginPath(); ctx.arc(dot.originalX, dot.originalY, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${config.dotColor.r}, ${config.dotColor.g}, ${config.dotColor.b}, ${opacity})`;
                ctx.fill();
            }
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', () => { mouse.x = -1000; mouse.y = -1000; });
    resizeCanvas(); animate();
})();

// UI 스케일링 & 타겟 커서 초기화
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
    const cursor = document.getElementById('target-cursor');
    if (!cursor) return;
    
    const box = cursor.querySelector('.cursor-box');

    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('button, select, .clickable, .grid-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            box.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            box.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1)';
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    autoScaleUI();
    initTargetCursor();
});

init();