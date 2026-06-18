/* =========================================
   [OPTIMIZATION] 전역 노드 및 템플릿 캐싱 & 객체 풀링
========================================= */
const DOM_NODES = {
  battlefield: null // init 이후에 할당
};

const ENTITY_TEMPLATE = document.createElement('div');
ENTITY_TEMPLATE.innerHTML = `
  <div class="hp-container"><div class="hp-bar"></div></div>
  <div class="sprite"></div>
  <div class="cooldown-container"><div class="cooldown-bar"></div></div>
`;

const entityPool = [];

function getEntityFromPool(side, type, isGoliath = false) {
  let el;
  if (entityPool.length > 0) {
    el = entityPool.pop();
    el.style.display = 'flex'; // entity의 기본 display(flex) 복원
  } else {
    el = document.createElement('div');
    el.appendChild(ENTITY_TEMPLATE.cloneNode(true));
    DOM_NODES.battlefield.appendChild(el); 
  }

  if (side === 'player') {
    el.className = `entity player ${type}`;
    el.querySelector('.hp-bar').style.background = 'var(--blue)';
  } else {
    el.className = `entity enemy ${isGoliath ? 'titan' : 'striker'}`;
    el.querySelector('.hp-bar').style.background = 'var(--red)';
  }

  const hpBar = el.querySelector('.hp-bar');
  const cdBar = el.querySelector('.cooldown-bar');
  if (hpBar) hpBar.style.transform = 'scaleX(1)';
  if (cdBar) cdBar.style.transform = 'scaleX(0)';
  
  const sprite = el.querySelector('.sprite');
  if (sprite) gsap.set(sprite, { x: 0 });

  return el;
}

function releaseEntityToPool(el) {
  el.style.display = 'none'; 
  entityPool.push(el);
}

let inventory = JSON.parse(localStorage.getItem('gachaInventory')) || {};
const savedConfig = JSON.parse(localStorage.getItem('tacticalConfig'));
const configState = savedConfig || { difficulty: 'easy', tokens: 1200, upgrades: { capital: 1, fortify: 1, weapon: 1 } };
const savedStats = JSON.parse(localStorage.getItem('tacticalStats'));
const gameStats = savedStats || { 
  protocolsExecuted: 0, alliesDestroyed: 0, enemiesDestroyed: 0, creditsUsed: 0, 
  ssr: 0, sr: 0, r: 0,
  totalSSR: 0, totalSR: 0, totalR: 0
};
const savedCleared = JSON.parse(localStorage.getItem('tacticalCleared'));
const clearedDiffs = savedCleared || { easy: false, normal: false, hard: false };

function saveData() {
  localStorage.setItem('gachaInventory', JSON.stringify(inventory));
  localStorage.setItem('tacticalConfig', JSON.stringify(configState));
  localStorage.setItem('tacticalStats', JSON.stringify(gameStats));
  localStorage.setItem('tacticalCleared', JSON.stringify(clearedDiffs));
}

const gameState = {
  credits: 0, maxCredits: 1200, creditRate: 0.22, creditLvl: 1,
  playerBaseHp: 1000, playerBaseMaxHp: 1000, enemyBaseHp: 1000, enemyBaseMaxHp: 1000,
  battlefieldWidth: 1280, playerUnits: [], enemyUnits: [], unitIdCounter: 0,
  enemySpawnTimer: 0, enemySpawnInterval: 180, isGameOver: false, loopId: null
};

let isStartingGame = false;
let lastFrameTime = 0;
const frameDelay = 1000 / 60; // 60FPS

const unitRarities = { bigsejin: 'ssr', chongwoo: 'ssr', minisejin: 'ssr', rabin: 'ssr', eugyin: 'ssr', moondae: 'ssr', ahyeon: 'ssr' };

const unitSpecs = {
  moondae:   { cost: 120, hp: 300,  attack: 15,  range: 70,  speed: 2.0, cooldown: 45,  type: 'moondae' },
  ahyeon:    { cost: 140, hp: 350,  attack: 10,  range: 45,  speed: 1.8, cooldown: 40,  type: 'ahyeon' },
  bigsejin:  { cost: 250, hp: 400, attack: 25,  range: 45,  speed: 1.2, cooldown: 50,  type: 'bigsejin' },
  minisejin: { cost: 190, hp: 280,  attack: 18,  range: 50,  speed: 1.6, cooldown: 45,  type: 'minisejin' },
  chongwoo:  { cost: 220, hp: 200,  attack: 150, range: 1000, speed: 1.0, cooldown: 150, type: 'chongwoo' },
  rabin:     { cost: 180, hp: 450,  attack: 70,  range: 50,  speed: 1.5, cooldown: 100, type: 'rabin' },
  eugyin:    { cost: 200, hp: 700,  attack: 12,  range: 40,  speed: 1.6, cooldown: 40,  type: 'eugyin' },
  p_drone:   { hp: 50,    attack: 15,  range: 80,  speed: 3.5, cooldown: 30,  type: 'p_drone' },
  e_drone:   { hp: 75,    attack: 12,  range: 50,  speed: 2.6, cooldown: 42,  type: 'e_drone' },     
  e_goliath: { hp: 550,   attack: 42,  range: 50,  speed: 0.9, cooldown: 55,  type: 'e_goliath' }   
};

const difficultyData = {
  easy: { sector: "SEC-164: OUTSKIRTS", threat: "EASY // x 0 . 8", badgeClass: "easy", desc: "민가가 위치했던 164구역. 적 유닛의 체력과 공격력이 평균의 0.8배 수준으로 측정되어, 비교적 안전한 구역으로 평가됩니다.", bgImage: "background/easy.png" },
  normal: { sector: "SEC-45: VALLEY OUTPOST", threat: "NORMAL // x 1 . 0", badgeClass: "normal", desc: "붕괴한 전초기지가 위치한 45구역. 적 유닛의 체력과 공격력이 평균 수준으로 측정되어, 만반의 준비가 이루어져야 합니다.", bgImage: "background/normal.png" },
  hard: { sector: "SEC-9: CENTRAL CORE GATE", threat: "HARD // x 1 . 6", badgeClass: "hard", desc: "센터 구역이 위치한 9구역. 적 유닛의 체력과 데미지가 각각 평균의 1.6배 1.4배 수준으로 측정되어, 함부로 진입하면 돌아올 길이 없게 됩니다.", bgImage: "background/hard.png" }
};

const unitToSSRMap = {
  moondae: 'Drone Boy UNIT', eugyin: 'Clockwork Boy UNIT', rabin: 'Pit Boy UNIT', ahyeon: 'Water Man UNIT',
  chongwoo: 'Silent Sniper UNIT', bigsejin: 'Podium Man UNIT', minisejin: 'Secret Researcher UNIT'
};

function consumeItemsByRarity(rarity, count) {
  let remaining = count;
  for (const [itemName, itemData] of Object.entries(inventory)) {
    if (itemData.rarity === rarity && itemData.count > 0) {
      const toConsume = Math.min(itemData.count, remaining);
      inventory[itemName].count -= toConsume;
      remaining -= toConsume;
    }
    if (remaining <= 0) break;
  }
}

const uiCache = {};
const uiState = { credits: -1, playerHp: -1, enemyHp: -1 };

function initUICache() {
  uiCache.statCredits = document.getElementById('stat-credits');
  uiCache.statPlayerHp = document.getElementById('stat-player-hp');
  uiCache.playerBaseHp = document.getElementById('player-base-hp');
  uiCache.statEnemyHp = document.getElementById('stat-enemy-hp');
  uiCache.enemyBaseHp = document.getElementById('enemy-base-hp');
  
  uiCache.btns = {
    moondae: document.getElementById('btn-moondae'), ahyeon: document.getElementById('btn-ahyeon'),
    bigsejin: document.getElementById('btn-bigsejin'), minisejin: document.getElementById('btn-minisejin'),
    chongwoo: document.getElementById('btn-chongwoo'), rabin: document.getElementById('btn-rabin'),
    eugyin: document.getElementById('btn-eugyin')
  };
  DOM_NODES.battlefield = document.getElementById('battlefield');
}

/* LOBBY CONTROL */
function selectDifficulty(diff) {
  configState.difficulty = diff;
  if (diff === 'easy') configState.tokens = 1200;
  else if (diff === 'normal') configState.tokens = 600;
  else if (diff === 'hard') configState.tokens = 200;

  configState.upgrades = { capital: 1, fortify: 1, weapon: 1 };

  document.querySelectorAll('.tactical-node-card').forEach(node => node.classList.remove('active'));
  const selectedNode = document.getElementById(`node-${diff}`);
  if (selectedNode) selectedNode.classList.add('active');
  
  updateIntelBriefing(diff);
  updateLobbyUI(); 
  saveData(); 
}

function previewDifficulty(diff) { updateIntelBriefing(diff); }

function updateIntelBriefing(diff) {
  const data = difficultyData[diff];
  if (!data) return;
  document.getElementById('intel-sector').innerText = data.sector;
  const threatEl = document.getElementById('intel-threat');
  threatEl.innerText = data.threat; 
  threatEl.className = "brief-threat-badge " + data.badgeClass;
  document.getElementById('intel-desc').innerText = data.desc;
  const dynamicBg = document.getElementById('dynamic-bg');
  dynamicBg.style.backgroundImage = `radial-gradient(circle at center, rgba(255,255,255,.03), transparent 60%), url('${data.bgImage}')`;
}

document.querySelector('.tactical-world-grid').addEventListener('mouseleave', () => { updateIntelBriefing(configState.difficulty); });

function getUpgradeRequirement(currentLevel) {
  const tokenCost = Math.min(500, 200 + (currentLevel - 1) * 150);
  let reqRarity = null, reqCount = 0;

  if (currentLevel >= 16) { reqRarity = 'SSR'; reqCount = currentLevel - 15; } 
  else if (currentLevel >= 11) { reqRarity = 'SR'; reqCount = (currentLevel - 10) * 2; } 
  else if (currentLevel >= 5) { reqRarity = 'R'; reqCount = (currentLevel - 4) * 5; }

  return { tokenCost, reqRarity, reqCount };
}

function countAvailableRarity(rarity) {
  let count = 0;
  for (const key in inventory) { if (inventory[key].rarity === rarity) count += inventory[key].count; }
  return count;
}

function addConvertedUnits(rarity, count) {
  const dummyName = rarity === 'SR' ? 'RESEARCH FRAME' : 'COMMON SUIT'; 
  if (!inventory[dummyName]) inventory[dummyName] = { rarity: rarity, count: 0 };
  inventory[dummyName].count += count;
}

let modalContext = null;

function buyPreUpgrade(type) {
  const currentLevel = configState.upgrades[type];
  const req = getUpgradeRequirement(currentLevel);

  if (configState.tokens < req.tokenCost) {
    alert(`[SYSTEM] TACTICAL TOKENS가 부족합니다. (필요: ${req.tokenCost} PT)`);
    return;
  }

  if (req.reqRarity) {
    const available = countAvailableRarity(req.reqRarity);
    if (available < req.reqCount) {
      if (req.reqRarity === 'R') {
        const deficit = req.reqCount - available;
        const neededSR = Math.ceil(deficit / 10);
        const availableSR = countAvailableRarity('SR');
        if (availableSR >= neededSR) {
          if (confirm(`R 등급 유닛이 ${deficit}개 부족합니다.\n보유 중인 SR 등급 유닛 ${neededSR}개를 소모하여 R 유닛 ${neededSR * 10}개로 변환하시겠습니까?`)) {
            consumeItemsByRarity('SR', neededSR);
            addConvertedUnits('R', neededSR * 10);
            consumeItemsByRarity('R', req.reqCount);
            completeUpgrade(type, req);
          }
        } else { alert(`R 등급 유닛이 부족합니다. (필요: ${req.reqCount}, 보유: ${available})\n변환에 필요한 SR 등급 유닛도 부족합니다.`); }
        return;
      } else if (req.reqRarity === 'SR') {
        const deficit = req.reqCount - available;
        const neededSSR = Math.ceil(deficit / 10);
        const availableSSR = countAvailableRarity('SSR');
        if (availableSSR >= neededSSR) { openSSRSelectModal('convert', neededSSR, type, req); } 
        else { alert(`SR 등급 유닛이 부족합니다. (필요: ${req.reqCount}, 보유: ${available})\n변환에 필요한 SSR 유닛도 부족합니다.`); }
        return;
      } else {
        alert(`SSR 유닛이 부족합니다. (필요: ${req.reqCount}, 보유: ${available})`); return;
      }
    }
    if (req.reqRarity === 'SSR') { openSSRSelectModal('consume', req.reqCount, type, req); return; } 
    else { consumeItemsByRarity(req.reqRarity, req.reqCount); completeUpgrade(type, req); }
  } else {
    completeUpgrade(type, req);
  }
}

function completeUpgrade(type, req) {
  configState.tokens -= req.tokenCost;
  configState.upgrades[type]++;
  saveData(); updateLobbyUI();
}

function updateLobbyUI() {
  document.getElementById('lobby-tokens').innerText = `${configState.tokens} PT`;
  const statsMapping = {
    capital: { el: 'lvl-txt-capital', text: '시작 자원', mult: 150 },
    fortify: { el: 'lvl-txt-fortify', text: '코어 체력', mult: 300 },
    weapon:  { el: 'lvl-txt-weapon',  text: '% 전력 강화', mult: 15 }
  };

  ['capital', 'fortify', 'weapon'].forEach(type => {
    const lvl = configState.upgrades[type];
    const statInfo = statsMapping[type];
    document.getElementById(statInfo.el).innerText = `현재: Lv.${lvl} (+ ${(lvl-1)*statInfo.mult}${statInfo.text})`;
    const req = getUpgradeRequirement(lvl);
    const btn = document.getElementById(`btn-pre-${type}`);
    if (btn) {
      btn.disabled = configState.tokens < req.tokenCost;
      btn.title = `비용: ${req.tokenCost} PT ${req.reqRarity ? `(+ ${req.reqRarity} ${req.reqCount}개)` : ''}`;
      btn.innerText = req.reqRarity ? `UPGRADE // ${req.tokenCost}PT + ${req.reqRarity} x${req.reqCount}` : `UPGRADE // ${req.tokenCost}PT`;
    }
  });

  const unitKeys = ['moondae', 'ahyeon', 'bigsejin', 'minisejin', 'chongwoo', 'rabin', 'eugyin'];
  unitKeys.forEach(key => {
    const mappedSSR = unitToSSRMap[key];
    const isOwned = (inventory[mappedSSR] && inventory[mappedSSR].count > 0) || (configState.unlockedUnits && configState.unlockedUnits.includes(key));
    const spawnBtn = document.getElementById(`btn-${key}`);
    if (spawnBtn) {
      const parentCard = spawnBtn.closest('.unit-spawn-card');
      if (parentCard) parentCard.style.display = isOwned ? 'flex' : 'none';
      else spawnBtn.style.display = isOwned ? 'flex' : 'none';
    }
    const lobbyCard = document.getElementById(`lobby-card-${key}`);
    if (lobbyCard) lobbyCard.style.display = isOwned ? 'flex' : 'none';
  });
}

function openSSRSelectModal(mode, requiredCount, type, req) {
  modalContext = { mode, requiredCount, type, req, selected: {} };
  const overlay = document.getElementById('material-modal-overlay');
  const title = document.getElementById('material-modal-title');
  const desc = document.getElementById('material-modal-desc');
  const list = document.getElementById('material-modal-list');
  const confirmBtn = document.getElementById('material-modal-confirm');

  title.innerText = mode === 'convert' ? 'SSR 유닛 변환 절차' : 'SSR 유닛 소모 절차';
  desc.innerHTML = mode === 'convert' ? `SR 재화 충당을 위해 소모할 SSR 유닛 <b>${requiredCount}개</b>를 선택하십시오.<br>(SSR 1개당 SR 10개로 변환 처리됩니다)` : `해당 레벨의 업그레이드를 위해 희생할 SSR 유닛 <b>${requiredCount}개</b>를 선택하십시오.`;
  list.innerHTML = ''; confirmBtn.disabled = true;

  let hasSSR = false;
  for (const [key, data] of Object.entries(inventory)) {
    if (data.rarity === 'SSR' && data.count > 0) {
      hasSSR = true; modalContext.selected[key] = 0;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'material-item';
      itemDiv.innerHTML = `
        <div style="font-family:'Orbitron', sans-serif; font-size:0.95rem;">${key} <br><span style="font-size:0.8rem; color:var(--sub);">잔여 수량: <span id="mat-avail-${key}">${data.count}</span></span></div>
        <div class="mat-controls">
          <button class="mat-btn cursor-target" onclick="updateSSRSelection('${key}', -1)">-</button>
          <span id="mat-sel-${key}" style="width:20px; text-align:center; font-family:'Orbitron'; font-weight:700;">0</span>
          <button class="mat-btn cursor-target" onclick="updateSSRSelection('${key}', 1)">+</button>
        </div>
      `;
      list.appendChild(itemDiv);
    }
  }
  if(!hasSSR) desc.innerText = "경고: 보관함 내에 접근 가능한 SSR 유닛이 존재하지 않습니다.";
  overlay.style.display = 'flex'; confirmBtn.onclick = confirmSSRSelection;
}

function updateSSRSelection(key, delta) {
  const available = inventory[key].count;
  const currentSelected = modalContext.selected[key];
  let newSelected = Math.max(0, Math.min(available, currentSelected + delta));

  let totalSelected = 0;
  for(let k in modalContext.selected) { totalSelected += (k === key) ? newSelected : modalContext.selected[k]; }
  if (totalSelected > modalContext.requiredCount) return;

  modalContext.selected[key] = newSelected;
  document.getElementById(`mat-sel-${key}`).innerText = newSelected;
  document.getElementById(`mat-avail-${key}`).innerText = available - newSelected;
  document.getElementById('material-modal-confirm').disabled = totalSelected !== modalContext.requiredCount;
}

function confirmSSRSelection() {
  for (const [key, count] of Object.entries(modalContext.selected)) { if (count > 0) inventory[key].count -= count; }
  const { mode, requiredCount, type, req } = modalContext;
  closeMaterialModal();
  if (mode === 'convert') { addConvertedUnits('SR', requiredCount * 10); consumeItemsByRarity('SR', req.reqCount); completeUpgrade(type, req); } 
  else if (mode === 'consume') { completeUpgrade(type, req); }
}

function closeMaterialModal() { document.getElementById('material-modal-overlay').style.display = 'none'; modalContext = null; }

function engageSystem() {
  if (isStartingGame) return; 
  isStartingGame = true;
  if (gameState.loopId) cancelAnimationFrame(gameState.loopId);
  gameStats.protocolsExecuted++; saveData(); 
  
  const transitionOverlay = document.getElementById('screen-transition');
  const typeTarget = document.getElementById('transition-typing-text');
  
  transitionOverlay.classList.remove('exit'); transitionOverlay.classList.add('active'); 
  typeTarget.style.display = 'block'; typeTarget.innerText = '';
  
  const fullText = "127SECTION_            PROTOCOL";
  let charIndex = 0;

  setTimeout(() => {
    const typeInterval = setInterval(() => {
      if (charIndex < fullText.length) { typeTarget.innerText += fullText.charAt(charIndex); charIndex++; } 
      else {
        clearInterval(typeInterval);
        setTimeout(() => {
          document.getElementById('lobby-screen').style.display = 'none';
          document.getElementById('battle-screen').style.display = 'grid';
          document.getElementById('top-battle-stats').style.visibility = 'visible';
          initBattleData();
          
          typeTarget.style.display = 'none';
          transitionOverlay.classList.remove('active'); transitionOverlay.classList.add('exit'); 
          gameState.isGameOver = false; lastFrameTime = performance.now();
          gameState.loopId = requestAnimationFrame(gameLoop);

          setTimeout(() => {
             transitionOverlay.style.transition = 'none'; transitionOverlay.classList.remove('exit'); void transitionOverlay.offsetWidth; 
             transitionOverlay.style.transition = 'top 0.5s cubic-bezier(0.77, 0, 0.175, 1)';
             isStartingGame = false; 
          }, 500);
        }, 2500);
      }
    }, 100);
  }, 600);
}

function initBattleData() {
  gameState.credits = 100 + (configState.upgrades.capital - 1) * 150;
  const baseHpBuff = (configState.upgrades.fortify - 1) * 300;
  gameState.playerBaseMaxHp = 1000 + baseHpBuff; gameState.playerBaseHp = gameState.playerBaseMaxHp;
  
  let diffMult = 1.0; let intervalSet = 180;
  if (configState.difficulty === 'easy') { diffMult = 0.8; intervalSet = 210; }
  else if (configState.difficulty === 'hard') { diffMult = 1.6; intervalSet = 140; }
  
  gameState.enemyBaseMaxHp = Math.floor(1000 * diffMult); gameState.enemyBaseHp = gameState.enemyBaseMaxHp;
  gameState.enemySpawnInterval = intervalSet; gameState.enemySpawnTimer = 0; gameState.creditLvl = 1;
  
  // 기존 DOM 초기화 및 엔티티 풀 정비
  gameState.playerUnits.forEach(u => releaseEntityToPool(u.el));
  gameState.enemyUnits.forEach(e => releaseEntityToPool(e.el));
  gameState.playerUnits = []; gameState.enemyUnits = [];
  
  uiState.credits = -1; uiState.playerHp = -1; uiState.enemyHp = -1;
  updateUI();
}

/* ========================================================
   [OPTIMIZATION] CORE BATTLE RUNTIME LOOP
======================================================== */
function gameLoop(currentTime) {
  if (gameState.isGameOver) return;
  gameState.loopId = requestAnimationFrame(gameLoop);

  if (!currentTime) currentTime = performance.now();
  const deltaTime = currentTime - lastFrameTime;

  if (deltaTime >= frameDelay) {
    lastFrameTime = currentTime - (deltaTime % frameDelay);

    // 자원 회복
    if (gameState.credits < gameState.maxCredits) {
      gameState.credits = Math.min(gameState.maxCredits, gameState.credits + gameState.creditRate * (1 + gameState.creditLvl * 0.35));
    }
    updateUI();
    
    // 글로벌 버프 체크
    let hasMoondae = false, hasMinisejin = false;
    for (let i = 0; i < gameState.playerUnits.length; i++) {
        if (gameState.playerUnits[i].type === 'moondae') hasMoondae = true;
        if (gameState.playerUnits[i].type === 'minisejin') hasMinisejin = true;
    }
    const dmgMultiplier = hasMinisejin ? 1.35 : 1.0; 

    // 아군 행동 로직
    gameState.playerUnits.forEach((unit) => {
      // 박문대 스킬 처리
      if (unit.type === 'moondae') {
        if (!unit.lastDroneSpawnTime) unit.lastDroneSpawnTime = currentTime;
        if (currentTime - unit.lastDroneSpawnTime >= 10000) {
          unit.lastDroneSpawnTime = currentTime; 
          if (unitSpecs.p_drone) spawnPlayerUnitFromSkill('p_drone', unit.x);
        }
      }

      let closestEnemy = getClosestEnemy(unit, gameState.enemyUnits);
      let isBlocked = false; let isAttacking = false;
      let currentSpeed = unit.speed + (hasMoondae && unit.type !== 'moondae' ? 1.0 : 0);
      
      // 아현 스킬 (힐링)
      if (unit.type === 'ahyeon') {
        if (!unit.healTimer) unit.healTimer = 600;
        if (--unit.healTimer <= 0) {
          gameState.playerUnits.forEach(ally => {
            if (ally.hp > 0 && ally.hp < ally.maxHp * 0.2) {
              ally.hp = Math.min(ally.maxHp, ally.hp + (ally.maxHp * 0.05));
              if (ally.hpBar) ally.hpBar.style.transform = `scaleX(${ally.hp / ally.maxHp})`;
            }
          });
          unit.healTimer = 600;
        }
      }
      
      if (unit.type === 'chongwoo' && unit.x >= 300) currentSpeed = 0;

      // 거리 계산 및 행동 판별
      if (closestEnemy) {
        let dist = closestEnemy.x - unit.x;
        if (dist <= unit.range) { isAttacking = true; attackTarget(unit, closestEnemy, dmgMultiplier); } 
        else if (dist <= 45) { isBlocked = true; }
      } else {
        let distToEnemyBase = (gameState.battlefieldWidth - 110) - unit.x;
        if (distToEnemyBase <= unit.range) { isAttacking = true; attackBase(unit, 'enemy', dmgMultiplier); } 
        else if (distToEnemyBase <= 45) { isBlocked = true; }
      }
      
      // 이동 처리
      if (!isBlocked && !isAttacking) unit.x += currentSpeed;
      unit.el.style.transform = `translate3d(${unit.x}px, 0, 0)`;

      // 쿨타임 업데이트
      if (unit.atkCooldown > 0) unit.atkCooldown--; 
      if (unit.cdBar) unit.cdBar.style.transform = `scaleX(${Math.max(0, Math.min(1, (unit.maxCooldown - unit.atkCooldown) / unit.maxCooldown))})`;
    });

    const eugyinTarget = gameState.playerUnits.find(u => u.type === 'eugyin' && u.hp > 0);

    // 적군 행동 로직
    gameState.enemyUnits.forEach((enemy) => {
      if (enemy.atkCooldown > 0) enemy.atkCooldown--; 
      
      // 도트 데미지 로직
      if (enemy.dotTimer && enemy.dotTimer > 0) {
         enemy.dotTimer--; 
         if (--enemy.dotTick <= 0) {
             enemy.hp -= enemy.dotDmg;
             if (enemy.hpBar) enemy.hpBar.style.transform = `scaleX(${Math.max(0, enemy.hp / enemy.maxHp)})`;
             enemy.dotTick = 30;
         }
      }
      
      // 타겟 지정 우선순위
      let closestPlayer = (eugyinTarget && (enemy.x - eugyinTarget.x > 0)) ? eugyinTarget : getClosestEnemy(enemy, gameState.playerUnits);
      let isBlocked = false; let isAttacking = false;
      
      if (closestPlayer) {
        let dist = enemy.x - closestPlayer.x;
        if (dist <= enemy.range) { isAttacking = true; attackTarget(enemy, closestPlayer, 1.0); } 
        else {
          let frontBlocker = getClosestEnemy(enemy, gameState.playerUnits);
          if (frontBlocker && (enemy.x - frontBlocker.x <= 45)) isBlocked = true;
        }
      } else {
        const playerBaseCenter = 95;
        let distToPlayerBase = enemy.x - playerBaseCenter;
        if (distToPlayerBase <= enemy.range) { isAttacking = true; attackBase(enemy, 'player', 1.0); } 
        else if (distToPlayerBase <= 45) { isBlocked = true; }
      }
      
      // 이동 처리
      if (!isBlocked && !isAttacking) enemy.x -= enemy.speed;
      enemy.el.style.transform = `translate3d(${enemy.x}px, 0, 0)`;

      // 쿨타임 업데이트
      if (enemy.cdBar) enemy.cdBar.style.transform = `scaleX(${Math.max(0, Math.min(1, (enemy.maxCooldown - enemy.atkCooldown) / enemy.maxCooldown))})`;
    });

    cleanDeadEntities();
    
    if (++gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
      gameState.enemySpawnTimer = 0; spawnEnemyAI();
    }
  }
}

function spawnPlayerUnitFromSkill(type, spawnX) {
  gameState.unitIdCounter++;
  const id = 'p_skill_unit_' + gameState.unitIdCounter;
  const spec = unitSpecs[type];
  if (!spec || !DOM_NODES.battlefield) return;

  const unitEl = getEntityFromPool('player', type);
  unitEl.id = id;
  
  const randomBottom = 90 + Math.floor(Math.random() * 120);
  unitEl.style.bottom = randomBottom + 'px';
  unitEl.style.transform = `translate3d(${spawnX}px, 0, 0)`;

  let upgradeAtkBonus = 1.0 + (configState.upgrades?.weapon ? (configState.upgrades.weapon - 1) * 0.15 : 0);
  
  gameState.playerUnits.push({
    id: id, el: unitEl, x: spawnX, hp: spec.hp, maxHp: spec.hp, attack: Math.floor(spec.attack * upgradeAtkBonus),
    range: spec.range, speed: spec.speed, side: 'player', type: type, atkCooldown: 0, maxCooldown: spec.cooldown || 42,
    hpBar: unitEl.querySelector('.hp-bar'), cdBar: unitEl.querySelector('.cooldown-bar')
  });
}

function getClosestEnemy(unit, enemyList) {
  let closest = null; let minAbsDist = Infinity;
  for (let i = 0; i < enemyList.length; i++) {
    const current = enemyList[i];
    const dist = current.x - unit.x;
    if ((unit.side === 'player' && dist > 0) || (unit.side === 'enemy' && dist < 0)) {
      const absDist = Math.abs(dist);
      if (absDist < minAbsDist) { minAbsDist = absDist; closest = current; }
    }
  }
  return closest;
}

function attackTarget(attacker, defender, multiplier = 1.0) {
  if (attacker.atkCooldown === undefined) attacker.atkCooldown = 0;
  if (attacker.atkCooldown <= 0) {
    let finalDamage = attacker.attack * multiplier;
    if (attacker.side === 'player') {
        if (attacker.type === 'chongwoo') {
            gameState.enemyUnits.forEach(enemy => {
                if (enemy.x > attacker.x && (enemy.x - attacker.x) <= attacker.range) applyDamage(enemy, finalDamage, attacker.side);
            });
        } else {
            applyDamage(defender, finalDamage, attacker.side);
            if (attacker.type === 'ahyeon' || attacker.type === 'eugyin') defender.x = Math.min(gameState.battlefieldWidth - 150, defender.x + 35);
            if (attacker.type === 'bigsejin') { defender.dotTimer = 180; defender.dotTick = 30; defender.dotDmg = finalDamage * 0.25; }
        }
    } else {
        applyDamage(defender, finalDamage, attacker.side);
        if (defender.type === 'minisejin' && attacker.hp > 0) applyDamage(attacker, finalDamage * 0.10, 'player');
    }
    
    attacker.atkCooldown = unitSpecs[attacker.type]?.cooldown || attacker.maxCooldown || 42; 
    if (attacker.cdBar) attacker.cdBar.style.transform = 'scaleX(0)';
  }
}

function applyDamage(target, dmg, attackerSide) {
    target.hp -= dmg;
    if (target.hpBar) target.hpBar.style.transform = `scaleX(${Math.max(0, target.hp / target.maxHp)})`;
    const spriteEl = target.el.querySelector('.sprite');
    if (spriteEl) {
        gsap.fromTo(spriteEl, { x: 0 }, { x: attackerSide === 'player' ? 6 : -6, duration: 0.05, yoyo: true, repeat: 1, overwrite: "auto" });
    }
}

function attackBase(attacker, targetSide, multiplier = 1.0) {
  if (attacker.atkCooldown === undefined) attacker.atkCooldown = 0;
  if (attacker.atkCooldown <= 0) {
    let finalDamage = attacker.attack * multiplier;
    if (targetSide === 'enemy') {
      gameState.enemyBaseHp = Math.max(0, gameState.enemyBaseHp - finalDamage);
      if (gameState.enemyBaseHp <= 0) triggerGameOver('VICTORY');
    } else {
      gameState.playerBaseHp = Math.max(0, gameState.playerBaseHp - finalDamage);
      if (gameState.playerBaseHp <= 0) triggerGameOver('DEFEAT');
    }
    attacker.atkCooldown = unitSpecs[attacker.type]?.cooldown || attacker.maxCooldown || 42;
    if (attacker.cdBar) attacker.cdBar.style.transform = 'scaleX(0)';
    updateUI(); 
  }
}

function cleanDeadEntities() {
  for (let i = gameState.playerUnits.length - 1; i >= 0; i--) {
    if (gameState.playerUnits[i].hp <= 0) {
      const deadUnit = gameState.playerUnits.splice(i, 1)[0];
      gameStats.alliesDestroyed++; 
      releaseEntityToPool(deadUnit.el);
    }
  }
  
  for (let i = gameState.enemyUnits.length - 1; i >= 0; i--) {
    if (gameState.enemyUnits[i].hp <= 0) {
      const deadEnemy = gameState.enemyUnits.splice(i, 1)[0];
      gameState.credits = Math.min(gameState.maxCredits, gameState.credits + (deadEnemy.maxHp * 0.25));
      gameStats.enemiesDestroyed++; 
      releaseEntityToPool(deadEnemy.el);
    }
  }
}

function spawnUnit(type) {
  const mappedSSR = unitToSSRMap[type];
  const isSSROwned = inventory[mappedSSR] && inventory[mappedSSR].count > 0;
  const spec = unitSpecs[type];
  if (gameState.credits < spec.cost || !isSSROwned || !DOM_NODES.battlefield) return;

  gameState.credits -= spec.cost;
  gameState.unitIdCounter++;
  gameStats.creditsUsed += spec.cost;
  gameStats[unitRarities[type]]++;

  const id = 'p_unit_' + gameState.unitIdCounter;
  const unitEl = getEntityFromPool('player', spec.type);
  unitEl.id = id; 
  
  const startX = 150;
  const startY = 50 + Math.floor(Math.random() * 200);
  unitEl.style.bottom = startY + 'px';
  unitEl.style.transform = `translate3d(${startX}px, 0, 0)`;
  
  gameState.playerUnits.push({
    id: id, el: unitEl, x: startX, hp: spec.hp, maxHp: spec.hp,
    attack: Math.floor(spec.attack * (1 + (configState.upgrades.weapon - 1) * 0.15)), 
    range: spec.range, speed: spec.speed, side: 'player', type: type,
    atkCooldown: 0, maxCooldown: spec.cooldown || 42,
    hpBar: unitEl.querySelector('.hp-bar'), cdBar: unitEl.querySelector('.cooldown-bar')
  });
}

function spawnEnemyAI() {
  if(!DOM_NODES.battlefield) return;
  gameState.unitIdCounter++;
  const id = 'e_unit_' + gameState.unitIdCounter;
  const isGoliath = Math.random() > 0.8;
  const spec = isGoliath ? unitSpecs.e_goliath : unitSpecs.e_drone;
  let diffMult = configState.difficulty === 'easy' ? 0.8 : (configState.difficulty === 'hard' ? 1.5 : 1.0);
  
  const finalHp = Math.floor(spec.hp * diffMult); 
  const finalAtk = Math.floor(spec.attack * diffMult);

  const enemyEl = getEntityFromPool('enemy', spec.type, isGoliath);
  enemyEl.id = id;
  
  const startX = gameState.battlefieldWidth - 150; 
  const startY = 50 + Math.floor(Math.random() * 200);
  enemyEl.style.bottom = startY + 'px';
  enemyEl.style.transform = `translate3d(${startX}px, 0, 0)`;
  
  gameState.enemyUnits.push({
    id: id, el: enemyEl, x: startX, hp: finalHp, maxHp: finalHp, attack: finalAtk, range: spec.range, speed: spec.speed, side: 'enemy', type: spec.type,
    atkCooldown: 0, maxCooldown: spec.cooldown || 42,
    hpBar: enemyEl.querySelector('.hp-bar'), cdBar: enemyEl.querySelector('.cooldown-bar')
  });
}

function updateUI() {
  const currentCredits = Math.floor(gameState.credits);
  
  if (currentCredits !== uiState.credits) {
    uiCache.statCredits.innerText = `$${currentCredits}`;
    uiState.credits = currentCredits;
    const keys = ['moondae', 'ahyeon', 'bigsejin', 'minisejin', 'chongwoo', 'rabin', 'eugyin'];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (uiCache.btns[key]) {
        const mappedSSR = unitToSSRMap[key];
        uiCache.btns[key].disabled = (currentCredits < unitSpecs[key].cost) || !(inventory[mappedSSR] && inventory[mappedSSR].count > 0);
      }
    }
  }

  if (gameState.playerBaseHp !== uiState.playerHp) {
    const pFormat = formatHp(gameState.playerBaseHp);
    uiCache.statPlayerHp.innerText = `${pFormat}/${formatHp(gameState.playerBaseMaxHp)}`;
    uiCache.playerBaseHp.innerText = pFormat;
    uiState.playerHp = gameState.playerBaseHp;
  }

  if (gameState.enemyBaseHp !== uiState.enemyHp) {
    const eFormat = formatHp(gameState.enemyBaseHp);
    uiCache.statEnemyHp.innerText = `${eFormat}/${formatHp(gameState.enemyBaseMaxHp)}`;
    uiCache.enemyBaseHp.innerText = eFormat;
    uiState.enemyHp = gameState.enemyBaseHp;
  }
}

function formatHp(v){ return Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }); }

function triggerGameOver(result) {
  gameState.isGameOver = true; cancelAnimationFrame(gameState.loopId);
  const overlay = document.getElementById('end-overlay');
  const title = document.getElementById('end-status-title');
  let diffMult = configState.difficulty === 'easy' ? 0.8 : (configState.difficulty === 'hard' ? 1.6 : 1.0);

  if (result === 'VICTORY') {
    clearedDiffs[configState.difficulty] = true;
    if (clearedDiffs.easy && clearedDiffs.normal && clearedDiffs.hard) {
      title.innerText = 'OPERATIONAL FULL CLEAR'; title.style.color = 'var(--yellow)';
      configState.tokens += Math.floor(400 * diffMult); saveData();
      setTimeout(() => showEndingCredits(), 1500); return; 
    } else {
      title.innerText = `${configState.difficulty.toUpperCase()} STAGE CLEAR`; title.style.color = 'var(--blue)';
      configState.tokens += Math.floor(400 * diffMult);
    }
  } else {
    title.innerText = 'CORE DEFECT // DEFEAT'; title.style.color = 'var(--red)';
    configState.tokens += Math.floor(100 * diffMult);
  }
  
  saveData(); overlay.style.display = 'flex'; 
}

function resetToLobby() {
  document.getElementById('end-overlay').style.display = 'none';
  document.getElementById('battle-screen').style.display = 'none';
  document.getElementById('top-battle-stats').style.visibility = 'hidden';
  document.getElementById('lobby-screen').style.display = 'block';
  updateLobbyUI();
}

function showEndingCredits() {
  document.getElementById('cs-proto').innerText = gameStats.protocolsExecuted + '회';
  document.getElementById('cs-ally').innerText = gameStats.alliesDestroyed + '기';
  document.getElementById('cs-enemy').innerText = gameStats.enemiesDestroyed + '기';
  document.getElementById('cs-cred').innerText = '$' + gameStats.creditsUsed;
  
  document.getElementById('cs-units').innerText = `SSR ${gameStats.totalSSR || 0} / SR ${gameStats.totalSR || 0} / R ${gameStats.totalR || 0}`;
  
  document.getElementById('end-overlay').style.display = 'none';
  document.getElementById('ending-credits-overlay').style.display = 'flex';
  ambientAnims.forEach(anim => anim.pause());
}

function continuePlaying() {
  document.getElementById('ending-credits-overlay').style.display = 'none';
  ambientAnims.forEach(anim => anim.play()); resetToLobby();
}

const ambientAnims = [];
function initAmbientAnimations() {
  ambientAnims.push(gsap.to(".radar-1", { rotation: 360, duration: 30, repeat: -1, ease: "none" }));
  ambientAnims.push(gsap.to(".radar-2", { rotation: -360, duration: 20, repeat: -1, ease: "none" }));
  ambientAnims.push(gsap.to(".node-pulse-halo", { scale: 1.8, opacity: 0, duration: 1.8, repeat: -1, stagger: .3, ease: "power1.out" }));
  ambientAnims.push(gsap.to(".scan-lines", { backgroundPositionY: "100px", duration: 6, repeat: -1, ease: "none" }));
}

const cursorConfig = { targetSelector: '.cursor-target', spinDuration: 2 };
const cursorConstants = { borderWidth: 3, cornerSize: 12.6 }; 

function initTargetCursor() {
  const cursor = document.getElementById('target-cursor');
  if (!cursor) return;
  const rotator = cursor.querySelector('.cursor-rotator');
  const dot = cursor.querySelector('.target-cursor-dot');
  const corners = Array.from(cursor.querySelectorAll('.target-cursor-corner'));
  let spinTl = null; let activeTarget = null;
  
  document.body.style.cursor = 'none';
  gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const createSpin = () => {
    if (spinTl) spinTl.kill();
    spinTl = gsap.timeline({ repeat: -1 });
    spinTl.to(rotator, { rotation: '+=360', duration: cursorConfig.spinDuration, ease: 'none' });
  };
  createSpin();

  window.addEventListener('mousemove', (e) => { gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'power3.out' }); });
  window.addEventListener('mousedown', () => { gsap.to([dot, cursor], { scale: 0.6, duration: 0.15 }); });
  window.addEventListener('mouseup', () => { gsap.to([dot, cursor], { scale: 1, duration: 0.15 }); });

  const tickerFn = () => {
    if (!activeTarget) return;
    const rect = activeTarget.getBoundingClientRect();
    const cursorX = gsap.getProperty(cursor, 'x'); 
    const cursorY = gsap.getProperty(cursor, 'y');
    const targetCornerPositions = [
      { x: rect.left - cursorConstants.borderWidth, y: rect.top - cursorConstants.borderWidth },
      { x: rect.right + cursorConstants.borderWidth - cursorConstants.cornerSize, y: rect.top - cursorConstants.borderWidth },
      { x: rect.right + cursorConstants.borderWidth - cursorConstants.cornerSize, y: rect.bottom + cursorConstants.borderWidth - cursorConstants.cornerSize },
      { x: rect.left - cursorConstants.borderWidth, y: rect.bottom + cursorConstants.borderWidth - cursorConstants.cornerSize }
    ];
    corners.forEach((corner, i) => { gsap.to(corner, { x: targetCornerPositions[i].x - cursorX, y: targetCornerPositions[i].y - cursorY, duration: 0.15, ease: 'power2.out', overwrite: true }); });
  };

  window.addEventListener('mouseover', (e) => {
    const target = e.target.closest(cursorConfig.targetSelector);
    if (!target || activeTarget === target) return;
    
    activeTarget = target; gsap.ticker.add(tickerFn);
    if (spinTl) { spinTl.kill(); spinTl = null; }
    gsap.to(rotator, { rotation: 0, duration: 0.2, ease: 'power2.out' });

    target.addEventListener('mouseleave', () => {
      activeTarget = null; gsap.ticker.remove(tickerFn);
      const positions = [ { x: -18.9, y: -18.9 }, { x: 6.3, y: -18.9 }, { x: 6.3, y: 6.3 }, { x: -18.9, y: 6.3 } ];
      corners.forEach((corner, index) => { gsap.to(corner, { x: positions[index].x, y: positions[index].y, duration: 0.25, ease: 'power3.out' }); });
      createSpin();
    }, { once: true });
  });
}

function autoScaleUI() {
  const wrapper = document.getElementById('ui-scale-wrapper');
  if (!wrapper) return;
  const CSSscale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  gsap.set(wrapper, { xPercent: -50, yPercent: -50, scale: CSSscale });
}

window.addEventListener('resize', autoScaleUI);
document.addEventListener('DOMContentLoaded', () => {
  initUICache(); initAmbientAnimations(); autoScaleUI(); updateLobbyUI(); initTargetCursor(); updateIntelBriefing(configState.difficulty);
  initTutorial();
  gsap.to("#page-transition", { yPercent: 100, duration: 1.2, ease: "power3.inOut" });
});

function playExitTransition(targetUrl) {
  gsap.fromTo(document.getElementById("page-transition"), 
    { yPercent: 100 }, 
    { yPercent: 0, duration: 1.2, ease: "power3.inOut", onComplete: () => { if (targetUrl) window.location.href = targetUrl; } }
  );
}

function initTutorial() {
  const tutorialModal = document.getElementById('tutorial-modal');
  const tutorialImg = document.getElementById('tutorial-img');
  const closeBtn = document.getElementById('close-tutorial');
  
  if (!tutorialModal || !tutorialImg || !closeBtn) return;

  const tutorialImages = ['tutorial_guide.png', 'tutorial_guide2.png'];
  let currentStep = 0;

  // 1. 로컬 스토리지를 확인하여 이미 본 적이 있다면 모달을 숨기고 함수를 종료합니다.
  const hasSeenTutorial = localStorage.getItem('tutorialSeen');
  if (hasSeenTutorial) {
    tutorialModal.classList.add('hidden');
    return;
  }

  // 2. 처음 방문한 경우에만 튜토리얼을 활성화합니다.
  tutorialModal.classList.remove('hidden');
  tutorialImg.src = tutorialImages[currentStep];
  closeBtn.textContent = "NEXT";

  closeBtn.addEventListener('click', () => {
    if (currentStep < tutorialImages.length - 1) {
      currentStep++;
      tutorialImg.src = tutorialImages[currentStep];
      
      if (currentStep === tutorialImages.length - 1) {
        closeBtn.textContent = "SYSTEM START";
      }
    } else {
      gsap.to(tutorialModal, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          tutorialModal.classList.add('hidden');
          // 3. 튜토리얼이 완전히 끝나면 로컬 스토리지에 기록을 남깁니다.
          localStorage.setItem('tutorialSeen', 'true');
        }
      });
    }
  });
}