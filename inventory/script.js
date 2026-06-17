const DOM = {
    wrapper: document.getElementById('ui-scale-wrapper'),
    leftPage: document.getElementById('left-page'),
    rightPage: document.getElementById('right-page'),
    sidebarFileNo: document.getElementById('sidebar-file-no'),
    sidebarIcons: document.getElementById('sidebar-icons'),
    badgeName: document.getElementById('badge-name'),
    codeShort: document.getElementById('info-code-short'),
    codeFull: document.getElementById('info-code-full'),
    affiliationTag: document.getElementById('info-affiliation-tag'),
    nameCn: document.getElementById('info-name-cn'),
    nameEn: document.getElementById('info-name-en'),
    subLabel: document.getElementById('info-sub-label'),
    statHeight: document.getElementById('stat-height'),
    statPosition: document.getElementById('stat-position'),
    infoNotes: document.getElementById('info-notes'),
    charImg: document.getElementById('character-image'),
    noImgPattern: document.getElementById('no-image-pattern'),
    noImgContent: document.getElementById('no-image-content'),
    missingText: document.getElementById('portrait-missing-text'),
    radarBg: document.getElementById('radar-bg-group'),
    radarData: document.getElementById('radar-data-group'),
    radarLabels: document.getElementById('radar-chart-labels'),
    skillsContainer: document.getElementById('skills-container')
};

/* 2. DYNAMIC SCREEN SCALING */
let resizeTimer;
function autoScaleUI() {
    if (!DOM.wrapper) return;
    const scaleX = window.innerWidth / 1450;
    const scaleY = window.innerHeight / 850;
    DOM.wrapper.style.transform = `translate(-50%, -50%) scale(${Math.min(scaleX, scaleY) * 0.95})`;
}
window.addEventListener('resize', () => {
    // 리사이징 최적화 (Debounce)
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(autoScaleUI, 16); // ~60fps
});
document.addEventListener('DOMContentLoaded', autoScaleUI);

/* 3. CHARACTER DATA */
const CHARACTERS = [
    {
    code: "027", codeStr: "MD_001", name: "B11", englishName: "Drone Boy", UnknownName: "M̷O̸0N̸D̷■̸Ξ",
    height: "178cm", affiliation: "UNDETECTED", position: "전술 보조",
    icon: "activity", imageUrl: "img/01.png",
    notes: "전장의 흐름을 읽고 통제하는 사령탑. 높은 기동력으로 전장을 누비며 아군 전체의 행동 반경을 넓힌다.",
    stats: [
        { label: '전투력', sub: 'COMBAT', value: 55, grade: 'C' }, { label: '기동력', sub: 'MOBILITY', value: 85, grade: 'A' },
        { label: '체력', sub: 'VITALITY', value: 25, grade: 'D' }, { label: '정신력', sub: 'MENTAL', value: 75, grade: 'B' },
        { label: '잠재력', sub: 'POTENTIAL', value: 85, grade: 'A' }, { label: '판단력', sub: 'CONTROL', value: 85, grade: 'A' }
    ],
    skills: [
        { icon: 'radio', name: '전술 지휘', desc: '아군 전체의 기동 속도를 대폭 보조하여 전술 우위를 점한다.', level: 3 },
        { icon: 'cpu', name: '드론 사격 개시', desc: '드론으로 타깃이 된 적에게 지속적인 보조 사격을 가한다.', level: 2 }
    ]
    },
    {
    code: "009", codeStr: "EJ_002", name: "■■■", englishName: "Clockwork Boy", UnknownName: "ΞU̷G■̷N̸Ξ",
    height: "182cm", affiliation: "UNDETECTED", position: "광역 제압",
    icon: "wind", imageUrl: "img/02.png",
    notes: "적의 진형을 천천히 갉아먹는 유격수. 적의 시선을 끌어모아 강력한 넉백으로 진형 무너뜨린다.",
    stats: [
        { label: '전투력', sub: 'COMBAT', value: 85, grade: 'A' }, { label: '기동력', sub: 'MOBILITY', value: 70, grade: 'B' },
        { label: '체력', sub: 'VITALITY', value: 70, grade: 'B' }, { label: '정신력', sub: 'MENTAL', value: 70, grade: 'B' },
        { label: '잠재력', sub: 'POTENTIAL', value: 45, grade: 'C' }, { label: '판단력', sub: 'CONTROL', value: 75, grade: 'B' }
    ],
    skills: [
        { icon: 'target', name: '시선 집중', desc: '적의 모든 공격을 자신에게 우선적으로 향하게 한다.', level: 3 },
        { icon: 'clock', name: '태엽 과부하', desc: '공격 시 15%의 확률로 3초간 적의 공격 및 이동 속도를 35% 감소시킨다.', level: 2 }
    ]
    },
    {
    code: "022", codeStr: "RB_003", name: "■■■", englishName: "Pit Boy", UnknownName: "R̷A̸▓̸IN̸",
    height: "180cm", affiliation: "UNDETECTED", position: "근접 타격",
    icon: "hexagon", imageUrl: "img/03.jpg",
    notes: "적진을 돌파하는 근접 전투의 스페셜리스트. 초근접전에서 파괴적인 타격을 가한다.",
    stats: [
        { label: '전투력', sub: 'COMBAT', value: 85, grade: 'A' }, { label: '기동력', sub: 'MOBILITY', value: 70, grade: 'B' },
        { label: '체력', sub: 'VITALITY', value: 70, grade: 'B' }, { label: '정신력', sub: 'MENTAL', value: 45, grade: 'C' },
        { label: '잠재력', sub: 'POTENTIAL', value: 85, grade: 'A' }, { label: '판단력', sub: 'CONTROL', value: 45, grade: 'C' }
    ],
    skills: [
        { icon: 'zap', name: '초근접 한방 타격', desc: '가까이 접근한 적군에게 강력하고 치명적인 단일 타격을 입힌다.', level: 3 },
        { icon: 'trending-up', name: '아드레날린 코어', desc: '체력이 20% 이하로 떨어지면 공격 쿨타임이 50% 단축된다.', level: 2 }
    ]
    },
    {
    code: "012", codeStr: "AH_004", name: "■■■", englishName: "Water Man", UnknownName: "Λ̷H̸Y̷Ξ■̷N̸",
    height: "183cm", affiliation: "UNDETECTED", position: "의무 지원",
    icon: "heart", imageUrl: "img/04.jpg",
    notes: "위급 상황에서 진가를 발휘하는 전장의 구호자. 피해를 입은 아군을 신속하게 회복시킨다.",
    stats: [
        { label: '전투력', sub: 'COMBAT', value: 25, grade: 'D' }, { label: '기동력', sub: 'MOBILITY', value: 45, grade: 'C' },
        { label: '체력', sub: 'VITALITY', value: 75, grade: 'B' }, { label: '정신력', sub: 'MENTAL', value: 95, grade: 'S' },
        { label: '잠재력', sub: 'POTENTIAL', value: 75, grade: 'B' }, { label: '판단력', sub: 'CONTROL', value: 85, grade: 'A' }
    ],
    skills: [
        { icon: 'shield', name: '성역 형성', desc: '접근하는 적을 뒤로 밀어내어 안전 거리를 확보한다.', level: 2 },
        { icon: 'activity', name: '긴급 구호', desc: '체력이 낮은 위급한 아군을 즉시 회복시킨다.', level: 3 }
    ]
    },
    {
    code: "038", codeStr: "CW_005", name: "■■■", englishName: "Silent Sniper", UnknownName: "■̸H̷Ξ̸O̷N̸G̷W̸▓0",
    height: "185cm", affiliation: "UNDETECTED", position: "관통 저격수",
    icon: "crosshair", imageUrl: "img/05.jpg",
    notes: "압도적인 사거리를 지닌 스나이퍼. 최후방에서 적의 방어선을 꿰뚫는 치명적인 관통상을 입힌다.",
    stats: [
        { label: '전투력', sub: 'COMBAT', value: 85, grade: 'A' }, { label: '기동력', sub: 'MOBILITY', value: 45, grade: 'C' },
        { label: '체력', sub: 'VITALITY', value: 95, grade: 'S' }, { label: '정신력', sub: 'MENTAL', value: 85, grade: 'A' },
        { label: '잠재력', sub: 'POTENTIAL', value: 45, grade: 'C' }, { label: '판단력', sub: 'CONTROL', value: 75, grade: 'B' }
    ],
    skills: [
        { icon: 'shield', name: '기지 방어', desc: '거점에 고정하여 방어 모드에 돌입한다.', level: 2 },
        { icon: 'target', name: '장거리 관통 저격', desc: '초장거리에서 적을 꿰뚫는 고화력 저격을 수행한다.', level: 3 }
    ]
    },
    {
    code: "019", codeStr: "LS_006", name: "■■■", englishName: "Podium Man", UnknownName: "L̸ΞΞS̷■̸J̷I̸N̷",
    height: "187cm", affiliation: "UNDETECTED", position: "전선 방위",
    icon: "shield", imageUrl: "img/06.jpg",
    notes: "준수한 육각형 스텟의 유닛. 광범위한 적에게 지속 피해를 입혀 다대일 전투에서 탁월한 성능을 보인다.",
    stats: [
        { label: '전투력', sub: 'COMBAT', value: 70, grade: 'B' }, { label: '기동력', sub: 'MOBILITY', value: 45, grade: 'C' },
        { label: '체력', sub: 'VITALITY', value: 70, grade: 'B' }, { label: '정신력', sub: 'MENTAL', value: 70, grade: 'B' },
        { label: '잠재력', sub: 'POTENTIAL', value: 90, grade: 'S' }, { label: '판단력', sub: 'CONTROL', value: 85, grade: 'A' }
    ],
    skills: [
        { icon: 'activity', name: '광역 도트 피해', desc: '공격 시 범위 내의 적들에게 지속 피해를 부여한다.', level: 3 },
        { icon: 'zap', name: '강력 넉백', desc: '전방의 적들에게 묵직한 일격을 가해 크게 밀쳐낸다.', level: 3 }
    ]
    },
    {
    code: "029", codeStr: "BS_007", name: "박사", englishName: "Secret Researcher", UnknownName: "B̸A̷E̸■̷ΞJ̸I̷N",
    height: "177cm", affiliation: "UNDETECTED", position: "화력 지원",
    icon: "arrow-up", imageUrl: "img/07.png",
    notes: "아군의 화력을 극대화하는 전장의 기폭제. 뛰어난 효율로 팀 전체의 파괴력을 상승시킨다.",
    stats: [
        { label: '전투력', sub: 'COMBAT', value: 45, grade: 'C' }, { label: '기동력', sub: 'MOBILITY', value: 70, grade: 'B' },
        { label: '체력', sub: 'VITALITY', value: 15, grade: 'E' }, { label: '정신력', sub: 'MENTAL', value: 95, grade: 'S' },
        { label: '잠재력', sub: 'POTENTIAL', value: 85, grade: 'A' }, { label: '판단력', sub: 'CONTROL', value: 70, grade: 'B' }
    ],
    skills: [
        { icon: 'flame', name: '화력 증폭', desc: '모든 아군 개체를 보조하여 아군 전체의 파괴력을 상승시킨다.', level: 3 },
        { icon: 'refresh-ccw', name: '피해 반사', desc: '자신에게 피해를 입힌 적에게 받은 공격의 10%를 반사합니다.', level: 2 }
    ]
    }
];

let currentIdx = 0;
let isScrollThrottled = false;

// 바코드 렌더링 (초기 1회)
const barcodeWidths = [1, 3, 1, 1, 4, 1, 2, 1, 1, 2, 3, 1, 2, 1];
document.getElementById('barcode').innerHTML = barcodeWidths.map(w => 
    `<div class="bg-black h-full" style="width: ${w * 2}px"></div>`
).join('');

/* 4. RADAR CHART PRE-CALCULATION (수학 연산 최적화) */
const RADAR = {
    size: 340,
    center: 170,
    maxRadius: 85,
    levels: 4,
    angles: [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, 5 * Math.PI / 6, 7 * Math.PI / 6],
    getPoint: (angle, radius) => ({
    x: 170 + radius * Math.cos(angle),
    y: 170 + radius * Math.sin(angle)
    })
};

// 정적 레이더 배경 1회 렌더링 (DOM 조작 최소화)
function initRadarBase() {
    let bgSvg = '';
    for (let i = RADAR.levels; i >= 1; i--) {
    const r = (RADAR.maxRadius / RADAR.levels) * i;
    const points = RADAR.angles.map(a => `${RADAR.getPoint(a, r).x},${RADAR.getPoint(a, r).y}`).join(' ');
    bgSvg += `<polygon points="${points}" fill="transparent" stroke="rgba(0,0,0,0.15)" stroke-width="1" />`;
    }
    RADAR.angles.forEach(angle => {
    const pt = RADAR.getPoint(angle, RADAR.maxRadius);
    bgSvg += `<line x1="${RADAR.center}" y1="${RADAR.center}" x2="${pt.x}" y2="${pt.y}" stroke="rgba(0,0,0,0.15)" stroke-width="1" />`;
    });
    DOM.radarBg.innerHTML = bgSvg;
}

// 동적 데이터 부분만 업데이트
function updateRadarChart(statsData) {
    let dataSvg = '';
    const dataPoints = statsData.map((stat, i) => {
    const r = (stat.value / 100) * RADAR.maxRadius;
    return `${RADAR.getPoint(RADAR.angles[i], r).x},${RADAR.getPoint(RADAR.angles[i], r).y}`;
    }).join(' ');
    
    dataSvg += `<polygon points="${dataPoints}" fill="rgba(0,0,0,0.1)" stroke="#000" stroke-width="2" />`;
    
    statsData.forEach((stat, i) => {
    const r = (stat.value / 100) * RADAR.maxRadius;
    const pt = RADAR.getPoint(RADAR.angles[i], r);
    dataSvg += `<rect x="${pt.x - 3}" y="${pt.y - 3}" width="6" height="6" fill="#000" />`;
    });
    DOM.radarData.innerHTML = dataSvg;

    // 라벨 업데이트
    const labelRadius = RADAR.maxRadius + 22; 
    DOM.radarLabels.innerHTML = statsData.map((stat, i) => {
    let offsetX = 0, offsetY = 0;
    if (i === 0) offsetY = -14;
    else if (i === 1) { offsetX = 16; offsetY = -8; }
    else if (i === 2) { offsetX = 16; offsetY = 8; }
    else if (i === 3) offsetY = 14;
    else if (i === 4) { offsetX = -16; offsetY = 8; }
    else if (i === 5) { offsetX = -16; offsetY = -8; }

    const pt = RADAR.getPoint(RADAR.angles[i], labelRadius);
    return `
        <div class="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 w-[65px]" 
            style="left: ${pt.x + offsetX}px; top: ${pt.y + offsetY}px">
        <span class="text-black font-bold text-[11px] tracking-[1px] text-center">${stat.label}</span>
        <span class="text-[var(--sub)] text-[8px] tracking-[1px] scale-90 mt-0.5">${stat.sub}</span>
        <span class="text-xs font-orbitron font-bold mt-0.5 text-black">${stat.grade}</span>
        </div>
    `;
    }).join('');
}

/* 5. CHARACTER RENDER ENGINE */
function renderCharacter(index) {
    const data = CHARACTERS[index];
    
    // Sidebar Active State Update
    Array.from(DOM.sidebarIcons.children).forEach((node, idx) => {
    if(idx === index) {
        node.className = "sidebar-icon-btn w-14 h-14 bg-black text-white flex items-center justify-center shrink-0 cursor-pointer transition-all border border-black";
    } else {
        node.className = "sidebar-icon-btn w-12 h-12 bg-transparent text-[var(--sub)] hover:text-black flex items-center justify-center shrink-0 cursor-pointer transition-all border border-[var(--line)] hover:border-black";
    }
    });

    DOM.leftPage.classList.add('fade-out');
    DOM.rightPage.classList.add('fade-out');

    setTimeout(() => {
    DOM.sidebarFileNo.textContent = data.code;
    DOM.badgeName.textContent = data.englishName;
    DOM.codeShort.textContent = data.code;
    DOM.codeFull.textContent = data.codeStr;
    DOM.affiliationTag.textContent = data.affiliation;
    DOM.nameCn.textContent = data.name;
    DOM.nameEn.textContent = data.UnknownName;
    DOM.subLabel.textContent = data.affiliation;
    DOM.statHeight.textContent = data.height;
    DOM.statPosition.textContent = data.position;
    DOM.infoNotes.innerHTML = data.notes;

    if (data.imageUrl) {
        DOM.charImg.src = data.imageUrl;
        DOM.charImg.classList.remove('hidden');
        DOM.noImgPattern.classList.add('hidden');
        DOM.noImgContent.classList.add('hidden');
    } else {
        DOM.charImg.classList.add('hidden');
        DOM.noImgPattern.classList.remove('hidden');
        DOM.noImgContent.classList.remove('hidden');
        DOM.missingText.innerHTML = `NO IMAGE DATA<br><span class="text-xs tracking-[4px] mt-2 block opacity-50">[ ${data.codeStr} ]</span>`;
    }

    updateRadarChart(data.stats);

    // 스킬셋 문자열 빌드 최적화 (배열 join 사용)
    DOM.skillsContainer.innerHTML = data.skills.map(skill => {
        const indicators = Array.from({length: 3}, (_, i) => 
        `<div class="w-3 h-1 ${i < skill.level ? 'bg-black' : 'bg-[var(--line)]'}"></div>`
        ).join('');
        
        return `
        <div class="flex h-[70px] shrink-0 border border-[var(--line-strong)] bg-[rgba(255,255,255,0.4)] px-3 items-center hover:bg-white hover:border-black transition-colors group cursor-pointer relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-black scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
            <div class="w-12 h-12 border border-[var(--line)] bg-transparent text-black flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
            <i data-lucide="${skill.icon}" class="w-6 h-6"></i>
            </div>
            <div class="ml-5 flex-1">
            <h4 class="text-black font-bold text-sm tracking-[2px] uppercase">${skill.name}</h4>
            <p class="text-[var(--sub)] text-xs mt-1 tracking-[1px] font-medium">${skill.desc}</p>
            </div>
            <div class="flex gap-[2px] pr-2">${indicators}</div>
        </div>
        `;
    }).join('');

    // DOM 전체 스캔 방지 (성능 향상)
    lucide.createIcons({ root: DOM.skillsContainer });

    DOM.leftPage.classList.remove('fade-out');
    DOM.rightPage.classList.remove('fade-out');
    }, 250);
}

/* 6. INITIALIZATION & EVENT DELEGATION */
function init() {
    // 사이드바 아이콘 렌더링
    DOM.sidebarIcons.innerHTML = CHARACTERS.map((char, index) => `
    <div class="sidebar-icon-btn shrink-0" data-index="${index}" title="${char.name} (${char.englishName})">
        <i data-lucide="${char.icon}" class="w-6 h-6"></i>
    </div>
    `).join('');
    
    // 이벤트 위임 (Event Delegation)을 통한 리스너 최적화
    DOM.sidebarIcons.addEventListener('click', (e) => {
    const btn = e.target.closest('.sidebar-icon-btn');
    if (!btn) return;
    const targetIndex = parseInt(btn.getAttribute('data-index'));
    if (targetIndex !== currentIdx) {
        currentIdx = targetIndex;
        renderCharacter(currentIdx);
    }
    });

    initRadarBase(); // 정적 레이더 배경 그리기
    lucide.createIcons({ root: DOM.sidebarIcons }); // 사이드바 아이콘 렌더링
    renderCharacter(currentIdx); // 초기 캐릭터 렌더링
}

/* 7. SCROLL CONTROLLER */
window.addEventListener('wheel', (e) => {
    if (isScrollThrottled) return;
    
    let newIdx = currentIdx;
    if (e.deltaY > 20 && currentIdx < CHARACTERS.length - 1) newIdx++;
    else if (e.deltaY < -20 && currentIdx > 0) newIdx--;

    if (newIdx !== currentIdx) {
    isScrollThrottled = true;
    currentIdx = newIdx;
    renderCharacter(currentIdx);
    setTimeout(() => { isScrollThrottled = false; }, 600);
    }
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  const transitionOverlay = document.getElementById('page-transition-overlay');
  
  if (!transitionOverlay) return;

  requestAnimationFrame(() => {
    setTimeout(() => {
      transitionOverlay.classList.add('revealed');
    }, 100);
  });

  const anchorLinks = document.querySelectorAll('a');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.href;
      const targetAttr = link.getAttribute('target');

      if (targetAttr === '_blank' || targetUrl.includes('#')) return;

      e.preventDefault();

      transitionOverlay.style.pointerEvents = 'all'; 
      transitionOverlay.classList.remove('revealed');

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 1000); 
    });
  });
});
init();