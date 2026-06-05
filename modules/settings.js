import { getApariencia, loadAparienciaForm, updateThemeCards } from './apariencia.js';

export function renderSettings(){
  loadAparienciaForm();
  const saved=getApariencia();
  const activePreset=saved?._preset||'dark';
  updateThemeCards(activePreset);
}
