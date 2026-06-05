import { sN } from '../ui/notif.js';

const PRESETS={
  dark:  {ac:'#00e5a0',bg:'#0a0a0f',tx:'#e8e8f0',tx2:'#8888a0',s1:'#111118',br:'#2a2a3a',theme:'dark'},
  light: {ac:'#00c888',bg:'#f0f0f5',tx:'#111118',tx2:'#44445a',s1:'#ffffff', br:'#c8c8d8',theme:'light'},
  blue:  {ac:'#4488ff',bg:'#080c18',tx:'#ddeeff',tx2:'#6688aa',s1:'#0e1428', br:'#1a2a44',theme:'dark'},
  red:   {ac:'#ff4455',bg:'#0f0808',tx:'#f0e0e0',tx2:'#aa7070',s1:'#1a0e0e', br:'#3a1a1a',theme:'dark'},
  purple:{ac:'#b066ff',bg:'#0a080f',tx:'#e8e0f0',tx2:'#9977bb',s1:'#130e1a', br:'#2a1a3a',theme:'dark'},
  modern:{ac:'#f5a623',bg:'#050a0e',tx:'#e2f0fa',tx2:'#6b8fa8',s1:'#0d1e2d', br:'#1a3a52',theme:'modern'},
};

export function getApariencia(){
  try{const r=localStorage.getItem('me_apariencia');return r?JSON.parse(r):null;}catch(e){return null;}
}
export function saveApariencia(a){localStorage.setItem('me_apariencia',JSON.stringify(a));}

export function applyApariencia(a){
  if(!a)return;
  const root=document.documentElement;
  // Apply theme attribute first (enables modern CSS)
  if(a.theme){
    if(a.theme==='modern'){
      document.body.setAttribute('data-theme','modern');
    } else if(a.theme==='light'){
      document.body.setAttribute('data-theme','light');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }
  if(a.ac)root.style.setProperty('--ac',a.ac);
  if(a.bg)root.style.setProperty('--bg',a.bg);
  if(a.tx)root.style.setProperty('--tx',a.tx);
  if(a.tx2){root.style.setProperty('--tx2',a.tx2);root.style.setProperty('--tx3',lighten(a.tx2,-20));}
  if(a.s1){
    root.style.setProperty('--s1',a.s1);
    root.style.setProperty('--s2',lighten(a.s1,8));
    root.style.setProperty('--s3',lighten(a.s1,15));
  }
  if(a.br)root.style.setProperty('--br',a.br);
  if(a.nombre){
    const h1=document.querySelector('.logo h1');
    if(h1){
      const parts=(a.nombre||'MOTOR EDGE').split(' ');
      const last=parts.length>1?parts.pop():'';
      h1.innerHTML=`${parts.join(' ')} <span>${last}</span>`;
    }
  }
  if(a.version){const lb=document.querySelector('.lb');if(lb)lb.textContent='V'+a.version;}
  if(a.nombre||a.version){document.title=(a.nombre||'MOTOR EDGE')+' '+(a.version||'3.9-E');}
}

export function lighten(hex,amount){
  try{
    hex=hex.replace('#','');
    const r=Math.min(255,Math.max(0,parseInt(hex.substring(0,2),16)+amount));
    const g=Math.min(255,Math.max(0,parseInt(hex.substring(2,4),16)+amount));
    const b=Math.min(255,Math.max(0,parseInt(hex.substring(4,6),16)+amount));
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }catch(e){return '#'+hex;}
}

export function loadAparienciaForm(){
  const root=document.documentElement;
  function getVar(v){return getComputedStyle(root).getPropertyValue(v).trim();}
  const fields=[
    ['ap-ac','ap-ac-hex','--ac','#00e5a0'],
    ['ap-bg','ap-bg-hex','--bg','#0a0a0f'],
    ['ap-tx','ap-tx-hex','--tx','#e8e8f0'],
    ['ap-tx2','ap-tx2-hex','--tx2','#8888a0'],
    ['ap-s1','ap-s1-hex','--s1','#111118'],
    ['ap-br','ap-br-hex','--br','#2a2a3a'],
  ];
  fields.forEach(([pickId,hexId,cssVar,fallback])=>{
    const val=(getVar(cssVar)||fallback).trim();
    const picker=document.getElementById(pickId);
    const hexEl=document.getElementById(hexId);
    if(picker){picker.value=val;picker.oninput=()=>{const v=picker.value;if(hexEl)hexEl.value=v;const key=pickId.replace('ap-','');const saved=getApariencia()||{};applyApariencia({[key]:v,theme:saved.theme||'dark'});};}
    if(hexEl)hexEl.value=val;
  });
  const saved=getApariencia();
  const nom=document.getElementById('ap-nombre');if(nom)nom.value=saved?.nombre||'';
  const ver=document.getElementById('ap-version');if(ver)ver.value=saved?.version||'';
}

export function syncColorFromHex(pickerId,hexId){
  const hex=document.getElementById(hexId)?.value.trim();
  const picker=document.getElementById(pickerId);
  if(!hex||!picker)return;
  if(/^#[0-9a-fA-F]{6}$/.test(hex)){
    picker.value=hex;
    const key=pickerId.replace('ap-','');
    const saved=getApariencia()||{};
    applyApariencia({[key]:hex,theme:saved.theme||'dark'});
  }
}

export function applyPreset(name){
  const p=PRESETS[name];if(!p)return;
  applyApariencia(p);
  // Save theme name so it persists
  const saved=getApariencia()||{};
  saveApariencia({...saved,...p,_preset:name});
  loadAparienciaForm();
  updateThemeCards(name);
  sN('Tema "'+name+'" aplicado');
}

export function updateThemeCards(activeName){
  const names=['dark','modern','light','blue','red','purple'];
  names.forEach(n=>{
    const card=document.getElementById('tc-'+n);
    const badge=document.getElementById('tc-'+n+'-badge');
    if(!card)return;
    const isActive=n===activeName;
    const accentColors={dark:'#00e5a0',modern:'#f5a623',light:'#00c888',blue:'#4488ff',red:'#ff4455',purple:'#b066ff'};
    const ac=accentColors[n]||'#00e5a0';
    card.style.borderColor=isActive?ac:'var(--br)';
    card.style.boxShadow=isActive?`0 0 0 1px ${ac}33`:'none';
    if(badge)badge.style.display=isActive?'inline':'none';
  });
}

export function toggleAparienciaAvanzada(){
  const body=document.getElementById('ap-avanzada');
  const icon=document.getElementById('ap-adv-icon');
  if(!body)return;
  const open=body.style.display==='none'||!body.style.display;
  body.style.display=open?'block':'none';
  if(icon)icon.textContent=open?'▴':'▼';
  if(open)loadAparienciaForm();
}

export function guardarApariencia(){
  const get=id=>document.getElementById(id)?.value||'';
  const saved=getApariencia()||{};
  const a={
    ac:get('ap-ac'),bg:get('ap-bg'),tx:get('ap-tx'),tx2:get('ap-tx2'),
    s1:get('ap-s1'),br:get('ap-br'),
    nombre:get('ap-nombre').trim(),
    version:get('ap-version').trim(),
    theme:saved.theme||'dark',
    _preset:saved._preset||'dark',
  };
  saveApariencia(a);applyApariencia(a);
  const res=document.getElementById('apRes');
  if(res)res.innerHTML=`<span style="color:var(--ac)">✓ Apariencia guardada</span>`;
  sN('Apariencia guardada');
}

export function resetApariencia(){
  if(!confirm('¿Restaurar apariencia por defecto?'))return;
  localStorage.removeItem('me_apariencia');
  const root=document.documentElement;
  ['--ac','--bg','--tx','--tx2','--tx3','--s1','--s2','--s3','--br'].forEach(v=>root.style.removeProperty(v));
  const h1=document.querySelector('.logo h1');if(h1)h1.innerHTML='MOTOR <span>EDGE</span>';
  const lb=document.querySelector('.lb');if(lb)lb.textContent='V3.9-E';
  document.title='MOTOR EDGE 3.9-E';
  loadAparienciaForm();
  sN('Apariencia restaurada');
}
