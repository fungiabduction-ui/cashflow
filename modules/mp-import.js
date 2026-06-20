import { ld, sd, gE } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, d2s, d2m, addMon } from '../core/formatters.js';
import { ghAutoPush } from './github.js';

// ── Parser ──────────────────────────────────────────────────────────────
function parseMPCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headerIdx = lines.findIndex(l => l.startsWith('RELEASE_DATE'));
  if (headerIdx < 0) return null;
  const result = [];
  for (const line of lines.slice(headerIdx + 1)) {
    if (!line.trim()) continue;
    const parts = line.split(';');
    if (parts.length < 4) continue;
    const [fechaRaw, tipo, refId, montoRaw] = parts;
    const montoStr = montoRaw.replace(/\./g, '').replace(',', '.');
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto >= 0) continue;
    const [dd, mm, yyyy] = fechaRaw.split('-');
    const fecha = `${yyyy}-${mm}-${dd}`;
    result.push({ fecha, concepto: tipo.trim(), monto: Math.abs(monto), refId: refId.trim() });
  }
  return result;
}

// ── ID generator para batch (opera sobre d.egresos en memoria) ──────────
function _nEIdLocal(d, mes) {
  const dm = (d.egresos || []).filter(e => e.id && e.id.substring(2, 8) === mes);
  if (!dm.length) return `E-${mes}-0001`;
  const mx = Math.max(...dm.map(e => parseInt(e.id.substring(9))));
  return `E-${mes}-${String(mx + 1).padStart(4, '0')}`;
}

// ── State ────────────────────────────────────────────────────────────────
let _mpFilas = [];

// ── Helpers del modal ────────────────────────────────────────────────────
function cerrarMPModal() {
  const el = document.getElementById('mp-modal');
  if (el) el.remove();
}

function _mpHandleDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) _mpHandleFile(file);
}

function _mpHandleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => _mpLoadCsv(ev.target.result);
  reader.readAsText(file, 'UTF-8');
}

function _mpLoadCsv(text) {
  const filas = parseMPCsv(text);
  if (!filas) { sN('Archivo inválido: no es un CSV de MercadoPago', true); return; }
  if (!filas.length) { sN('No se encontraron egresos en el archivo', true); return; }
  _mpFilas = filas;
  const body = document.getElementById('mp-body');
  if (body) { body.innerHTML = _mpPreviewHTML(filas); _mpUpdateFooter(); }
}

function _mpUpdateFooter() {
  const tbody = document.getElementById('mp-rows');
  if (!tbody) return;
  const checks = [...tbody.querySelectorAll('input[type=checkbox]:not([disabled])')];
  const sel = checks.filter(c => c.checked).length;
  const info = document.getElementById('mp-footer-info');
  const btn = document.getElementById('mp-import-btn');
  if (info) info.textContent = `${sel} seleccionado(s)`;
  if (btn) btn.textContent = `Importar ${sel} egreso${sel !== 1 ? 's' : ''} →`;
}

function _mpToggleRow() { _mpUpdateFooter(); }

function _mpEditConcepto(idx, val) { _mpFilas[idx].concepto = val; }

function _mpSelAll(sel) {
  const checks = document.querySelectorAll('#mp-rows input[type=checkbox]:not([disabled])');
  checks.forEach(c => { c.checked = sel; });
  _mpUpdateFooter();
}

function _mpConfirmar() {
  const tbody = document.getElementById('mp-rows');
  if (!tbody) return;
  const checks = [...tbody.querySelectorAll('input[type=checkbox]:not([disabled])')];
  const selIndices = checks.map((c, i) => c.checked ? i : -1).filter(i => i >= 0);
  if (!selIndices.length) { sN('Seleccioná al menos un egreso', true); return; }

  const d = ld();
  if (!d.egresos) d.egresos = [];

  selIndices.forEach(idx => {
    const f = _mpFilas[idx];
    const mes = d2m(f.fecha);
    const id = _nEIdLocal(d, mes);
    const fd = d2s(f.fecha);
    const tk = `📅 Fecha: ${fd}\nID Egreso: ${id}\n\n📉 Egreso:\nConcepto: ${f.concepto}\nMonto: ${fv(f.monto)}\nMedio de pago: Mercado Pago\n\n━━━━━━━━━━━━━━━━━━━━━\n💰 Impacto en caja: -${fv(f.monto)}`;
    d.egresos.push({
      id, fecha: f.fecha, fechaDisplay: fd, mesActual: mes,
      concepto: f.concepto, montoTotal: f.monto,
      cuotaBase: f.monto, ultimaCuota: f.monto,
      impactoCaja: f.monto, cuotasTotales: 1, cuotasRestantes: 0,
      finaliza: addMon(mes, 0), medio: 'Mercado Pago',
      obs: null, mpRefId: f.refId, ticketText: tk
    });
  });

  sd(d);
  ghAutoPush();
  window.rfM?.();
  window.rEH?.();
  window.rES?.();
  window.renderDash?.();
  window.uhd?.();
  cerrarMPModal();
  sN(`✓ ${selIndices.length} egreso(s) importados desde MercadoPago`);
}

// ── HTML builders ─────────────────────────────────────────────────────────
function _mpDropZoneHTML() {
  return `
    <div id="mp-dropzone"
         style="border:2px dashed var(--er);border-radius:6px;padding:40px;text-align:center;cursor:pointer"
         onclick="document.getElementById('mp-file-input').click()"
         ondragover="event.preventDefault()"
         ondrop="_mpHandleDrop(event)">
      <div style="font-size:28px;margin-bottom:8px;color:var(--er)">⬆</div>
      <div style="font-family:var(--mo);font-size:12px;color:var(--tx)">Arrastrá el CSV de MercadoPago acá</div>
      <div style="font-family:var(--mo);font-size:10px;color:var(--tx3);margin:4px 0 12px">o hacé click para seleccionar</div>
      <span style="font-family:var(--mo);font-size:10px;background:var(--s2);border:1px solid var(--br);padding:4px 14px;border-radius:3px">Seleccionar archivo</span>
    </div>
    <input type="file" id="mp-file-input" accept=".csv" style="display:none" onchange="_mpHandleFile(this.files[0])">
    <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);text-align:center;margin-top:10px">
      MercadoPago → Actividad → Exportar → CSV
    </div>`;
}

function _mpPreviewHTML(filas) {
  const importados = new Set(gE().filter(e => e.mpRefId).map(e => e.mpRefId));
  const total = filas.reduce((a, f) => a + f.monto, 0);
  let rows = '';
  filas.forEach((f, i) => {
    const ya = importados.has(f.refId);
    const badge = ya ? `<span style="font-family:var(--mo);font-size:8px;background:var(--s2);color:var(--tx3);padding:1px 5px;border-radius:2px;margin-left:4px">ya importado</span>` : '';
    const inputStyle = ya
      ? 'background:var(--s2);color:var(--tx3);border-color:var(--br);'
      : 'background:var(--bg);color:var(--tx);border-color:var(--br);';
    rows += `
      <tr style="${ya ? 'opacity:0.45' : ''};border-bottom:1px solid var(--br)">
        <td style="padding:6px 4px;text-align:center">
          <input type="checkbox" ${ya ? 'disabled' : `checked onchange="_mpToggleRow()"`} style="accent-color:var(--er)">
        </td>
        <td style="padding:6px 4px;font-family:var(--mo);font-size:10px;color:var(--tx3);white-space:nowrap">${d2s(f.fecha).slice(0,5)}</td>
        <td style="padding:6px 4px">${badge}<input type="text" value="${f.concepto.replace(/"/g, '&quot;')}" ${ya ? 'disabled' : `onchange="_mpEditConcepto(${i},this.value)"`} style="font-family:var(--mo);font-size:10px;padding:2px 6px;width:90%;border:1px solid;border-radius:2px;outline:none;${inputStyle}"></td>
        <td style="padding:6px 4px;font-family:var(--mo);font-size:10px;color:var(--er);text-align:right;white-space:nowrap">-${fv(f.monto)}</td>
      </tr>`;
  });
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-family:var(--mo);font-size:10px;color:var(--tx3)">${filas.length} egresos · ${fv(total)} ARS</span>
      <span>
        <span style="font-family:var(--mo);font-size:10px;color:var(--er);cursor:pointer;margin-right:8px" onclick="_mpSelAll(true)">☑ todos</span>
        <span style="font-family:var(--mo);font-size:10px;color:var(--tx3);cursor:pointer" onclick="_mpSelAll(false)">☐ ninguno</span>
      </span>
    </div>
    <div style="overflow-x:auto;max-height:50vh;overflow-y:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead style="position:sticky;top:0;background:var(--bg)">
          <tr style="font-family:var(--mo);font-size:9px;color:var(--tx3);border-bottom:1px solid var(--br)">
            <th style="padding:4px;width:30px">☑</th>
            <th style="padding:4px;text-align:left">FECHA</th>
            <th style="padding:4px;text-align:left">CONCEPTO</th>
            <th style="padding:4px;text-align:right">MONTO</th>
          </tr>
        </thead>
        <tbody id="mp-rows">${rows}</tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid var(--br)">
      <span id="mp-footer-info" style="font-family:var(--mo);font-size:9px;color:var(--tx3)"></span>
      <button id="mp-import-btn" onclick="_mpConfirmar()" style="font-family:var(--mo);font-size:10px;background:var(--er);color:#fff;border:none;padding:6px 16px;border-radius:3px;cursor:pointer">Importar — egresos →</button>
    </div>`;
}

// ── Export público ────────────────────────────────────────────────────────
export function renderMPImportModal() {
  // Exponer helpers a window para que funcionen en bundle Y en ES module mode
  Object.assign(window, {
    cerrarMPModal, _mpHandleDrop, _mpHandleFile,
    _mpToggleRow, _mpEditConcepto, _mpSelAll, _mpConfirmar
  });

  const existing = document.getElementById('mp-modal');
  if (existing) existing.remove();
  _mpFilas = [];

  const div = document.createElement('div');
  div.id = 'mp-modal';
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  div.onclick = e => { if (e.target === div) cerrarMPModal(); };
  div.innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--er);max-width:640px;width:100%;max-height:90vh;overflow-y:auto;border-radius:4px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--br)">
        <span style="font-family:var(--mo);font-size:12px;font-weight:700;color:var(--er)">⬆ Importar desde MercadoPago</span>
        <button onclick="cerrarMPModal()" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:18px;line-height:1">✕</button>
      </div>
      <div id="mp-body" style="padding:16px">${_mpDropZoneHTML()}</div>
    </div>`;
  document.body.appendChild(div);
}
