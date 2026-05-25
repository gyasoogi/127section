const banners = [
  {
    name:'DRONE',
    pickup:'DRONE COSTUME',
    image:'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop',
    desc:'폐허 도시 내부에서 발견된 전술 프로토콜. 교란형 코스튬 및 제어 장비를 획득할 수 있습니다.'
  },
  {
    name:'TEDDY',
    pickup:'TEDDY COSTUME',
    image:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop',
    desc:'강습형 전술 코어에서 추출된 공격 프로토콜. 강습형 장비를 획득할 수 있습니다.'
  },
  {
    name:'VOID',
    pickup:'VOID COSTUME',
    image:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1400&auto=format&fit=crop',
    desc:'심층 구역에서 발견된 미확인 신호. 공명 장비 및 특수 코스튬을 획득할 수 있습니다.'
  },
  {
    name:'REVENANT',
    pickup:'REVENANT SUIT',
    image:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop',
    desc:'침투형 특수 병기 데이터를 기반으로 생성된 전술 장비 배너입니다.'
  },
  {
    name:'SPECTRA',
    pickup:'SPECTRA ARMOR',
    image:'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1400&auto=format&fit=crop',
    desc:'스펙트럼 간섭 기술을 적용한 실험형 장비를 획득할 수 있습니다.'
  },
  {
    name:'DELTA',
    pickup:'DELTA FRAME',
    image:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1400&auto=format&fit=crop',
    desc:'구형 군용 프레임을 기반으로 복원된 전술 프레임 패키지입니다.'
  },
  {
    name:'HALO',
    pickup:'HALO DEVICE',
    image:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1400&auto=format&fit=crop',
    desc:'초고밀도 광학 장비 및 특수 신호 증폭기를 획득할 수 있습니다.'
  }
];

let currentBanner = 0;
let totalPull = 0;
let credits = 27614;

const SINGLE_COST = 160;
const MULTI_COST = 1600;
let pitySSR = 80;
let pitySR = 10;
let pityPickup = 150;

const inventory = {};

const rewards = {
  SSR:['DRONE COSTUME','VOID COSTUME','TEDDY COSTUME'],
  SR:['TACTICAL MASK','SIGNAL GLOVE','FRAME DEVICE'],
  R:['OLD CHIP','BASIC VISOR','BROKEN TAG']
};

function init(){
  renderBannerButtons();
  switchBanner(0);
  animateHUD();
  setupCursor();
}

function renderBannerButtons(){
  const list = document.getElementById('banner-list');

  banners.forEach((banner,index)=>{
    const button = document.createElement('button');

    button.className = 'banner-button';

    if(index===0) button.classList.add('active');

    button.innerText = banner.name;

    button.onclick = ()=>switchBanner(index);

    list.appendChild(button);
  });
}

function switchBanner(index){
  currentBanner = index;

  const data = banners[index];

  document.getElementById('banner-title').innerText = data.name;
  document.getElementById('pickup-title').innerText = data.pickup;
  document.getElementById('banner-desc').innerText = data.desc;
  document.getElementById('banner-image').src = data.image;
  document.getElementById('panel-no').innerText = String(index+1).padStart(2,'0');

  document.querySelectorAll('.banner-button').forEach((button,i)=>{
    button.classList.toggle('active',i===index);
  });
}

function runGacha(count){

  const cost = count === 1 ? SINGLE_COST : MULTI_COST;

  if(credits < cost){
    alert('CREDIT 부족');
    return;
  }

  credits -= cost;

  document.getElementById('credit-count').innerText = credits;

  const results = [];

  startSummonSequence(count);

  totalPull += count;

  document.getElementById('total-count').innerText = totalPull;

  for(let i=0;i<count;i++){

    pitySSR--;
    pitySR--;
    pityPickup--;

    let rarity = 'R';

    const random = Math.random()*100;

    if(random < 1 || pitySSR <= 0){
      rarity = 'SSR';
      pitySSR = 80;
    }
    else if(random < 14 || pitySR <= 0){
      rarity = 'SR';
      pitySR = 10;
    }

    const item = rewards[rarity][Math.floor(Math.random()*rewards[rarity].length)];

    results.push({
      rarity,
      item,
      image:banners[currentBanner].image
    });

    if(!inventory[item]){
      inventory[item] = {
        rarity,
        count:0,
        image:banners[currentBanner].image
      };
    }

    inventory[item].count++;
  }

  updatePity();
  renderResult(results);
}

function updatePity(){
  document.getElementById('pity-ssr').innerText = pitySSR;
  document.getElementById('pity-sr').innerText = pitySR;
  document.getElementById('pity-pickup').innerText = pityPickup;
}

function startSummonSequence(count){

  const overlay = document.createElement('div');

  overlay.id = 'summon-sequence';

  overlay.innerHTML = `
    <div class="sequence-core"></div>
    <div class="sequence-ring"></div>
    <div class="sequence-flash"></div>
    <div class="sequence-text">
      SIGNAL LINK ACTIVE
    </div>
  `;

  document.body.appendChild(overlay);

  gsap.fromTo('.sequence-ring',{
    scale:.4,
    opacity:0
  },{
    scale:2,
    opacity:1,
    duration:1.2,
    ease:'power3.out'
  });

  gsap.fromTo('.sequence-core',{
    scale:0
  },{
    scale:1,
    duration:.8,
    ease:'back.out(2)'
  });

  gsap.to('.sequence-flash',{
    opacity:1,
    duration:.2,
    repeat:3,
    yoyo:true
  });

  setTimeout(()=>{
    overlay.remove();
  },1800);
}

function renderResult(results){
  const screen = document.getElementById('result-screen');
  const grid = document.getElementById('result-grid');

  grid.innerHTML = '';

  results.forEach(result=>{

    const card = document.createElement('div');

    card.className = 'result-card';

    card.innerHTML = `
      <img src="${result.image}">

      <div class="card-info">
        <div class="card-rarity">${result.rarity}</div>
        <div class="card-name">${result.item}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  screen.style.display = 'flex';
}

function closeResult(){
  document.getElementById('result-screen').style.display = 'none';
}

function toggleInventory(show){
  document.getElementById('inventory-overlay').style.display = show ? 'block' : 'none';

  if(show){
    renderInventory();
  }
}

function renderInventory(){

  const grid = document.getElementById('inventory-grid');

  grid.innerHTML = '';

  const sort = document.getElementById('sort-select').value;

  const rarityOrder = {
    SSR:0,
    SR:1,
    R:2
  };

  const entries = Object.entries(inventory);

  entries.sort((a,b)=>{

    if(sort==='count'){
      return b[1].count - a[1].count;
    }

    return rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity];
  });

  entries.forEach(([name,data])=>{

    const card = document.createElement('div');

    card.className = 'inventory-card';

    card.innerHTML = `
      <img src="${data.image}">

      <div class="card-info">
        <div class="card-rarity">${data.rarity}</div>
        <div class="card-name">${name} x${data.count}</div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function setupCursor(){
  const cursor = document.getElementById('target-cursor');

  window.addEventListener('mousemove',(e)=>{
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
}

function animateHUD(){

  gsap.to('.radar-1',{
    rotation:360,
    duration:30,
    repeat:-1,
    ease:'none'
  });

  gsap.to('.radar-2',{
    rotation:-360,
    duration:20,
    repeat:-1,
    ease:'none'
  });

  gsap.to('.scan-lines',{
    backgroundPositionY:'100px',
    duration:6,
    repeat:-1,
    ease:'none'
  });

  gsap.from('.banner-panel',{
    opacity:0,
    y:60,
    duration:1.2,
    ease:'power3.out'
  });

  gsap.from('.command-card',{
    opacity:0,
    x:40,
    stagger:.12,
    duration:1,
    ease:'power3.out'
  });
}

init();