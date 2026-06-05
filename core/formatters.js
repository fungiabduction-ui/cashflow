export function gtr(tb,q){if(q<=0)return null;let p=tb[0].p,t=tb[0].t;for(let i=0;i<tb.length;i++){if(q>=tb[i].t){p=tb[i].p;t=tb[i].t;}}return{p,t};}
export function fi(n){return Math.round(n).toLocaleString('en-US').replace(/\./g,',');}
export function fv(n){return '$ '+fi(n);}
export function fu(n){return parseFloat(n.toFixed(2)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
export function hoy(){return new Date().toISOString().split('T')[0];}
export function d2s(iso){if(!iso)return'';const[y,m,d]=iso.split('-');return`${d}/${m}/${y}`;}
export function d2m(iso){if(!iso)return'';const[y,m]=iso.split('-');return`${y}${m}`;}
export function mL(mm){const ms=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];return`${ms[parseInt(mm.substring(4,6))-1]} ${mm.substring(0,4)}`;}
export function mLong(mm){const ms=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];return`${ms[parseInt(mm.substring(4,6))-1]} ${mm.substring(0,4)}`;}
export function trunc(n){return Math.trunc(n);}
export function addMon(aaaamm,n){const y=parseInt(aaaamm.substring(0,4));const m=parseInt(aaaamm.substring(4,6))-1;const dt=new Date(y,m+n,1);return`${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;}
export function pn(v){if(v==null||v==='')return 0;const s=String(v).replace(/[$\s]/g,'').replace(/[.,](?=\d{3}(?:[.,]|$))/g,'').replace(',','.');return parseFloat(s)||0;}
export function parseDate(v){
  if(!v)return null;
  if(v instanceof Date){const y=v.getFullYear();const m=String(v.getMonth()+1).padStart(2,'0');const d=String(v.getDate()).padStart(2,'0');return`${y}-${m}-${d}`;}
  const s=String(v).trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
  const p=s.split(/[\/\-]/);
  if(p.length===3){
    if(p[2]&&p[2].length===4)return`${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
    if(p[0]&&p[0].length===4)return`${p[0]}-${p[1].padStart(2,'0')}-${p[2].padStart(2,'0')}`;
  }
  return null;
}
export function uid(){return 'p-'+Math.random().toString(36).substring(2,9);}
