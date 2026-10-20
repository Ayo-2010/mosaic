const STORAGE_KEY = 'mosaic-layout-v1';
const TYPES = [
  { id: 'hero', label: 'Hero', icon: 'H', span: 8, rows: 2, color: 0 },
  { id: 'text', label: 'Text', icon: 'T', span: 4, rows: 1, color: 2 },
  { id: 'stat', label: 'Stat', icon: '#', span: 3, rows: 1, color: 3 },
  { id: 'quote', label: 'Quote', icon: '“', span: 5, rows: 1, color: 4 },
  { id: 'image', label: 'Image', icon: '▧', span: 4, rows: 2, color: 1 },
  { id: 'chart', label: 'Chart', icon: '▥', span: 6, rows: 1, color: 5 }
];
const COLORS = [
  { bg: '#d8ff3e', ink: '#141513' },
  { bg: '#2d5bff', ink: '#f6f6f0' },
  { bg: '#f4f1e8', ink: '#141513' },
  { bg: '#ff7557', ink: '#141513' },
  { bg: '#b5a2ff', ink: '#141513' },
  { bg: '#171816', ink: '#f6f6ed' }
];
const PRESETS = {
  editorial: {
    name: 'Editorial grid',
    blocks: [
      { type: 'hero', title: 'Build a page that feels designed.', body: 'A flexible bento system for portfolios, launches and product stories. Every block earns its place.', kicker: 'Mosaic studio', cta: 'See the system', span: 8, rows: 2, color: 0 },
      { type: 'image', title: 'Texture study 01', body: 'Linen and light', kicker: 'Image', span: 4, rows: 2, color: 1 },
      { type: 'stat', title: '48', body: 'layouts shipped this month', kicker: 'Output', span: 3, rows: 1, color: 2 },
      { type: 'quote', title: 'A grid is a promise about where attention should go.', body: 'Studio note', kicker: 'Field note', span: 5, rows: 1, color: 3 },
      { type: 'chart', title: 'Weekly rhythm', body: 'Seven-day output', kicker: 'Signals', span: 4, rows: 1, color: 5 }
    ]
  },
  dashboard: {
    name: 'Product dashboard',
    blocks: [
      { type: 'stat', title: '12.4k', body: 'active sessions', kicker: 'Live', span: 3, rows: 1, color: 0 },
      { type: 'stat', title: '98.2%', body: 'uptime this month', kicker: 'Reliability', span: 3, rows: 1, color: 2 },
      { type: 'chart', title: 'Traffic mix', body: 'Last seven days', kicker: 'Analytics', span: 6, rows: 2, color: 1 },
      { type: 'text', title: 'Everything important, above the fold.', body: 'A compact composition for teams that need the signal without the noise.', kicker: 'Overview', span: 4, rows: 1, color: 2 },
      { type: 'quote', title: 'Make the next action obvious.', body: 'Product principle', kicker: 'Note', span: 4, rows: 1, color: 3 },
      { type: 'stat', title: '3.1s', body: 'median response', kicker: 'Speed', span: 4, rows: 1, color: 4 }
    ]
  },
  portfolio: {
    name: 'Portfolio spread',
    blocks: [
      { type: 'hero', title: 'Designing the quiet parts of the web.', body: 'Selected work across interfaces, identity and editorial systems.', kicker: 'Independent designer', cta: 'View selected work', span: 6, rows: 2, color: 5 },
      { type: 'image', title: 'Project 01 / Fieldwork', body: 'Identity system', kicker: 'Selected', span: 6, rows: 2, color: 1 },
      { type: 'text', title: 'Method over decoration.', body: 'A practice built on observation, prototypes and the discipline of leaving things out.', kicker: 'About', span: 4, rows: 1, color: 2 },
      { type: 'quote', title: 'The work should feel inevitable, not embellished.', body: 'Working note', kicker: 'Approach', span: 4, rows: 1, color: 3 },
      { type: 'stat', title: '14', body: 'years of practice', kicker: 'Studio', span: 4, rows: 1, color: 0 }
    ]
  }
};

const state = {
  blocks: [],
  selected: null,
  columns: 12,
  gap: 10,
  surface: 'paper',
  gridLines: false,
  mode: 'desktop',
  name: 'Untitled layout',
  history: [],
  future: [],
  editSnapshot: null,
  dragId: null
};

const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const inspectorBody = $('inspector-body');

function makeId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createBlock(type, overrides = {}) {
  const definition = TYPES.find((item) => item.id === type) || TYPES[0];
  const defaults = {
    hero: { kicker: 'New section', title: 'A clear idea, well placed.', body: 'Add a short line of context here.', cta: 'Learn more' },
    text: { kicker: 'Note 01', title: 'A clear idea, well placed.', body: 'Use this block for a short piece of supporting copy.' },
    stat: { kicker: 'Metric', title: '42', body: 'the number that matters' },
    quote: { kicker: 'Field note', title: 'Make the next action obvious.', body: 'Studio note' },
    image: { kicker: 'Image', title: 'Texture study 02', body: 'Material detail' },
    chart: { kicker: 'Signals', title: 'Weekly rhythm', body: 'Seven-day output' }
  };
  return {
    id: makeId(),
    type,
    kicker: defaults[type].kicker,
    title: defaults[type].title,
    body: defaults[type].body,
    cta: defaults[type].cta || '',
    span: definition.span,
    rows: definition.rows,
    color: definition.color,
    align: 'left',
    ...overrides
  };
}

function presetBlocks(key) {
  return PRESETS[key].blocks.map((block) => createBlock(block.type, block));
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || !Array.isArray(stored.blocks)) return false;
    state.blocks = stored.blocks.map((block) => ({
      ...createBlock(block.type),
      ...block,
      id: block.id || makeId()
    }));
    state.columns = stored.columns === 8 ? 8 : 12;
    state.gap = Number.isFinite(stored.gap) ? stored.gap : 10;
    state.surface = ['paper', 'white', 'ink'].includes(stored.surface) ? stored.surface : 'paper';
    state.gridLines = Boolean(stored.gridLines);
    state.mode = ['desktop', 'tablet', 'mobile'].includes(stored.mode) ? stored.mode : 'desktop';
    state.name = stored.name || 'Untitled layout';
    return true;
  } catch (error) {
    return false;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    blocks: state.blocks,
    columns: state.columns,
    gap: state.gap,
    surface: state.surface,
    gridLines: state.gridLines,
    mode: state.mode,
    name: state.name
  }));
  $('status').textContent = 'Saved locally';
}

function snapshot() {
  return JSON.stringify(state.blocks);
}

function pushSnapshot(value) {
  state.history.push(value);
  if (state.history.length > 40) state.history.shift();
  state.future = [];
  renderHistory();
}

function record() {
  pushSnapshot(snapshot());
}

function undo() {
  if (!state.history.length) return;
  state.future.push(snapshot());
  state.blocks = JSON.parse(state.history.pop());
  state.selected = null;
  saveState();
  renderCanvas();
  renderInspector();
  renderHistory();
}

function redo() {
  if (!state.future.length) return;
  state.history.push(snapshot());
  state.blocks = JSON.parse(state.future.pop());
  state.selected = null;
  saveState();
  renderCanvas();
  renderInspector();
  renderHistory();
}

function renderHistory() {
  $('undo').disabled = state.history.length === 0;
  $('redo').disabled = state.future.length === 0;
}

function effectiveColumns() {
  if (state.mode === 'mobile') return 2;
  if (state.mode === 'tablet') return 6;
  return state.columns;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function chartValues(block) {
  const seed = block.title.length + block.body.length + block.id.length;
  return [38, 61, 44, 82, 56, 75, 48].map((value, index) => (value + seed * (index + 2)) % 62 + 28);
}

function blockInner(block) {
  const hasHandle = '<span class="block-handle">⠿</span>';
  if (block.type === 'hero') {
    return `${hasHandle}<span class="block-kicker">${escapeHtml(block.kicker)}</span><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.body)}</p>${block.cta ? `<span class="block-cta">${escapeHtml(block.cta)}</span>` : ''}`;
  }
  if (block.type === 'text') {
    return `${hasHandle}<span class="block-kicker">${escapeHtml(block.kicker)}</span><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.body)}</p>`;
  }
  if (block.type === 'stat') {
    return `${hasHandle}<span class="block-kicker">${escapeHtml(block.kicker)}</span><span class="big">${escapeHtml(block.title)}</span><span class="stat-label">${escapeHtml(block.body)}</span>`;
  }
  if (block.type === 'quote') {
    return `${hasHandle}<span class="block-kicker">${escapeHtml(block.kicker)}</span><span class="quote-mark">“</span><h3>${escapeHtml(block.title)}</h3><span class="quote-author">${escapeHtml(block.body)}</span>`;
  }
  if (block.type === 'image') {
    return `${hasHandle}<span class="art"></span><span class="image-label">${escapeHtml(block.title)}</span>`;
  }
  const values = chartValues(block);
  return `${hasHandle}<span class="block-kicker">${escapeHtml(block.kicker)}</span><h2>${escapeHtml(block.title)}</h2><span class="chart">${values.map((value) => `<i style="height:${value}%"></i>`).join('')}</span><span class="chart-caption">${escapeHtml(block.body)}</span>`;
}

function blockElement(block, columns) {
  const colors = COLORS[block.color] || COLORS[2];
  const article = document.createElement('article');
  article.className = `block block-${block.type}${block.align === 'center' ? ' align-center' : ''}${state.selected === block.id ? ' selected' : ''}`;
  article.dataset.id = block.id;
  article.draggable = true;
  article.style.gridColumn = `span ${Math.min(block.span, columns)}`;
  article.style.gridRow = `span ${block.rows}`;
  article.style.setProperty('--block-bg', colors.bg);
  article.style.setProperty('--block-ink', colors.ink);
  article.innerHTML = blockInner(block);
  article.addEventListener('click', (event) => {
    event.stopPropagation();
    selectBlock(block.id);
  });
  article.addEventListener('dragstart', (event) => {
    state.dragId = block.id;
    article.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', block.id);
  });
  article.addEventListener('dragend', () => {
    state.dragId = null;
    document.querySelectorAll('.block').forEach((item) => item.classList.remove('dragging', 'drag-over'));
  });
  article.addEventListener('dragover', (event) => {
    if (!state.dragId || state.dragId === block.id) return;
    event.preventDefault();
    article.classList.add('drag-over');
  });
  article.addEventListener('dragleave', () => article.classList.remove('drag-over'));
  article.addEventListener('drop', (event) => {
    event.preventDefault();
    article.classList.remove('drag-over');
    if (!state.dragId || state.dragId === block.id) return;
    record();
    const sourceIndex = state.blocks.findIndex((item) => item.id === state.dragId);
    const targetIndex = state.blocks.findIndex((item) => item.id === block.id);
    const [moved] = state.blocks.splice(sourceIndex, 1);
    state.blocks.splice(targetIndex, 0, moved);
    state.dragId = null;
    saveState();
    renderCanvas();
    renderInspector();
    showToast('Block reordered');
  });
  return article;
}

function renderCanvas() {
  const columns = effectiveColumns();
  canvas.dataset.mode = state.mode;
  canvas.style.gap = `${state.gap}px`;
  canvas.innerHTML = '';
  $('canvas-empty').hidden = state.blocks.length > 0;
  $('canvas-shell').className = `canvas-shell surface-${state.surface}${state.gridLines ? ' grid-mode' : ''}`;
  state.blocks.forEach((block) => canvas.appendChild(blockElement(block, columns)));
  $('block-count').textContent = `${state.blocks.length} block${state.blocks.length === 1 ? '' : 's'}`;
  $('mode-label').textContent = `${state.mode === 'desktop' ? 'Desktop' : state.mode === 'tablet' ? 'Tablet' : 'Mobile'} · ${columns} columns`;
  $('stage-title').textContent = state.name;
}

function selectBlock(id) {
  state.selected = id;
  document.querySelectorAll('.block').forEach((block) => block.classList.toggle('selected', block.dataset.id === id));
  renderInspector();
}

function updateBlockDom(block) {
  const article = document.querySelector(`.block[data-id="${block.id}"]`);
  if (!article) return;
  const colors = COLORS[block.color] || COLORS[2];
  article.innerHTML = blockInner(block);
  article.classList.toggle('align-center', block.align === 'center');
  article.style.setProperty('--block-bg', colors.bg);
  article.style.setProperty('--block-ink', colors.ink);
}

function addBlock(type) {
  record();
  const block = createBlock(type);
  state.blocks.push(block);
  state.selected = block.id;
  state.name = 'Untitled layout';
  saveState();
  renderCanvas();
  renderInspector();
  showToast(`${type} block added`);
}

function deleteSelected() {
  if (!state.selected) return;
  record();
  state.blocks = state.blocks.filter((block) => block.id !== state.selected);
  state.selected = null;
  saveState();
  renderCanvas();
  renderInspector();
}

function duplicateSelected() {
  const block = state.blocks.find((item) => item.id === state.selected);
  if (!block) return;
  record();
  const copy = { ...block, id: makeId() };
  const index = state.blocks.findIndex((item) => item.id === block.id);
  state.blocks.splice(index + 1, 0, copy);
  state.selected = copy.id;
  saveState();
  renderCanvas();
  renderInspector();
}

function renderInspector() {
  const block = state.blocks.find((item) => item.id === state.selected);
  $('inspector-id').textContent = block ? String(state.blocks.indexOf(block) + 1).padStart(2, '0') : '—';
  if (!block) {
    inspectorBody.innerHTML = `<div class="inspector-empty"><b>Select a block to edit it.</b>Change the copy, width, height, alignment and colour. The canvas is the source of truth.<br><br>${state.blocks.length} blocks · ${state.columns} columns · ${state.gap}px gap</div>`;
    return;
  }
  const fieldLabels = {
    hero: ['Kicker', 'Headline', 'Body', 'Button label'],
    text: ['Kicker', 'Heading', 'Body'],
    stat: ['Kicker', 'Number', 'Label'],
    quote: ['Kicker', 'Quote', 'Attribution'],
    image: ['Kicker', 'Label', 'Caption'],
    chart: ['Kicker', 'Heading', 'Caption']
  }[block.type];
  inspectorBody.innerHTML = `
    <span class="type-chip">${block.type} block</span>
    <h3>Edit ${block.type}</h3>
    <label class="field">${fieldLabels[0]}<input type="text" data-field="kicker" value="${escapeHtml(block.kicker)}"></label>
    <label class="field">${fieldLabels[1]}<textarea data-field="title">${escapeHtml(block.title)}</textarea></label>
    <label class="field">${fieldLabels[2]}<textarea data-field="body">${escapeHtml(block.body)}</textarea></label>
    ${block.type === 'hero' ? `<label class="field">${fieldLabels[3]}<input type="text" data-field="cta" value="${escapeHtml(block.cta)}"></label>` : ''}
    <div class="inspector-row">
      <div><span class="field">Width</span><div class="size-choice" data-control="span">${[2, 3, 4, 5, 6, 8].map((span) => `<button type="button" data-span="${span}" class="${block.span === span ? 'active' : ''}">${span}</button>`).join('')}</div></div>
      <div><span class="field">Height</span><div class="size-choice" data-control="rows"><button type="button" data-rows="1" class="${block.rows === 1 ? 'active' : ''}">1</button><button type="button" data-rows="2" class="${block.rows === 2 ? 'active' : ''}">2</button></div></div>
    </div>
    <span class="field">Alignment</span>
    <div class="size-choice" data-control="align"><button type="button" data-align="left" class="${block.align === 'left' ? 'active' : ''}">Left</button><button type="button" data-align="center" class="${block.align === 'center' ? 'active' : ''}">Center</button></div>
    <span class="field">Colour</span>
    <div class="color-choice" data-control="color">${COLORS.map((color, index) => `<button type="button" data-color="${index}" class="${block.color === index ? 'active' : ''}" style="--c:${color.bg}" aria-label="Colour ${index + 1}"></button>`).join('')}</div>
    <div class="inspector-actions">
      <button type="button" id="duplicate-block">Duplicate</button>
      <button type="button" id="delete-block" class="danger">Delete</button>
    </div>
  `;
  $('duplicate-block').addEventListener('click', duplicateSelected);
  $('delete-block').addEventListener('click', deleteSelected);
}

function renderLibrary() {
  const addGrid = $('add-grid');
  addGrid.innerHTML = '';
  TYPES.forEach((type) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'add-button';
    button.innerHTML = `<span class="add-icon">${type.icon}</span><b>${type.label}</b>`;
    button.addEventListener('click', () => addBlock(type.id));
    addGrid.appendChild(button);
  });
  const presets = $('presets');
  presets.innerHTML = '';
  Object.entries(PRESETS).forEach(([key, preset]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-button';
    button.innerHTML = `<i><b></b><b></b><b></b><b></b></i><span>${preset.name}</span>`;
    button.addEventListener('click', () => {
      record();
      state.blocks = presetBlocks(key);
      state.name = preset.name;
      state.selected = null;
      saveState();
      renderCanvas();
      renderInspector();
      showToast(`${preset.name} loaded`);
    });
    presets.appendChild(button);
  });
}

function exportHTML() {
  const columns = state.columns;
  const surface = state.surface === 'white' ? '#ffffff' : state.surface === 'ink' ? '#171816' : '#fbfbf6';
  const bodyText = state.surface === 'ink' ? '#f6f6ed' : '#141513';
  const blocks = state.blocks.map((block) => {
    const colors = COLORS[block.color] || COLORS[2];
    const inner = blockInner(block).replace(/<span class="block-handle">.*?<\/span>/, '');
    return `<article class="block block-${block.type}${block.align === 'center' ? ' align-center' : ''}" style="grid-column:span ${Math.min(block.span, columns)};grid-row:span ${block.rows};--block-bg:${colors.bg};--block-ink:${colors.ink}">${inner}</article>`;
  }).join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(state.name)} — Mosaic</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:24px;background:#ecece6;color:#141513;font-family:"Space Grotesk",system-ui,sans-serif}
.page{max-width:1200px;margin:0 auto;padding:18px;border-radius:14px;background:${surface};color:${bodyText}}
.grid{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));grid-auto-rows:90px;gap:${state.gap}px}
.block{position:relative;display:flex;flex-direction:column;overflow:hidden;padding:16px;border-radius:12px;background:var(--block-bg);color:var(--block-ink)}
.kicker{font:700 8px "IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.12em;opacity:.6}
.block h2{margin:11px 0 7px;font-size:28px;line-height:.96;letter-spacing:-.055em}
.block p{margin:0;font-size:11px;line-height:1.55;opacity:.68}
.hero{justify-content:flex-end}.hero h2{font-size:48px;max-width:560px}.hero .kicker{margin-top:auto}
.cta{align-self:flex-start;margin-top:12px;padding:6px 10px;border-radius:20px;background:var(--block-ink);color:var(--block-bg);font:10px "IBM Plex Mono",monospace}
.stat .big{margin-top:auto;font-size:56px;font-weight:600;line-height:.85;letter-spacing:-.08em}.stat .label{margin-top:8px;font:9px "IBM Plex Mono",monospace;opacity:.6;text-transform:uppercase}
.quote{justify-content:center}.quote .mark{font-size:38px;line-height:.7;opacity:.3}.quote h3{margin:8px 0 8px;font-size:21px;line-height:1.16;letter-spacing:-.035em}.quote .author{font:9px "IBM Plex Mono",monospace;opacity:.55;text-transform:uppercase}
.image{padding:0}.image .art{position:absolute;inset:0;background:linear-gradient(140deg,var(--block-ink),var(--block-bg))}.image .art:before{content:"";position:absolute;width:60%;aspect-ratio:1;left:20%;top:10%;border:1px solid rgba(255,255,255,.45);border-radius:50%}.image .art:after{content:"";position:absolute;width:30%;aspect-ratio:1;right:12%;bottom:10%;background:rgba(255,255,255,.25);border-radius:50%}.image .label{position:absolute;left:16px;bottom:14px;color:#fff;font:9px "IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.1em}
.chart{justify-content:space-between}.chart .bars{display:flex;align-items:end;gap:4px;flex:1;min-height:60px;margin-top:10px}.chart .bars i{flex:1;background:var(--block-ink);opacity:.78;border-radius:3px 3px 0 0}.chart .caption{margin-top:8px;font:8px "IBM Plex Mono",monospace;opacity:.55}
.align-center{align-items:center;text-align:center}.align-center .block-cta{align-self:center}
@media(max-width:760px){.grid{grid-template-columns:1fr!important}.block{grid-column:span 1!important}.hero h2{font-size:34px}}
</style>
</head>
<body>
<main class="page"><div class="grid">
${blocks}
</div></main>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'mosaic-layout.html';
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('HTML exported');
}

function copyJSON() {
  const data = JSON.stringify({ name: state.name, columns: state.columns, gap: state.gap, blocks: state.blocks }, null, 2);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(data).then(() => showToast('JSON copied')).catch(() => showToast('Copy failed'));
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = data;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showToast('JSON copied');
  }
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function commitEdit() {
  if (!state.editSnapshot) return;
  if (state.editSnapshot !== snapshot()) {
    pushSnapshot(state.editSnapshot);
    saveState();
  }
  state.editSnapshot = null;
}

function init() {
  const loaded = loadState();
  if (!loaded) {
    state.blocks = presetBlocks('editorial');
    state.name = PRESETS.editorial.name;
  }
  renderLibrary();
  renderCanvas();
  renderInspector();
  renderHistory();
  $('columns').value = String(state.columns);
  $('gap').value = String(state.gap);
  $('gap-output').textContent = `${state.gap}px`;
  $('surface').value = state.surface;
  $('grid-lines').checked = state.gridLines;
  $('undo').addEventListener('click', undo);
  $('redo').addEventListener('click', redo);
  $('copy-json').addEventListener('click', copyJSON);
  $('export').addEventListener('click', exportHTML);
  $('clear').addEventListener('click', () => {
    if (!state.blocks.length) return;
    if (!window.confirm('Clear every block from the canvas?')) return;
    record();
    state.blocks = [];
    state.selected = null;
    state.name = 'Untitled layout';
    saveState();
    renderCanvas();
    renderInspector();
  });
  document.querySelectorAll('#mode button').forEach((button) => {
    button.addEventListener('click', () => {
      state.mode = button.dataset.mode;
      document.querySelectorAll('#mode button').forEach((item) => item.classList.toggle('active', item === button));
      saveState();
      renderCanvas();
    });
  });
  $('columns').addEventListener('change', (event) => {
    state.columns = Number(event.target.value);
    saveState();
    renderCanvas();
  });
  $('gap').addEventListener('input', (event) => {
    state.gap = Number(event.target.value);
    $('gap-output').textContent = `${state.gap}px`;
    canvas.style.gap = `${state.gap}px`;
    saveState();
  });
  $('surface').addEventListener('change', (event) => {
    state.surface = event.target.value;
    saveState();
    renderCanvas();
  });
  $('grid-lines').addEventListener('change', (event) => {
    state.gridLines = event.target.checked;
    saveState();
    renderCanvas();
  });
  canvas.addEventListener('click', (event) => {
    if (event.target === canvas) {
      state.selected = null;
      document.querySelectorAll('.block').forEach((block) => block.classList.remove('selected'));
      renderInspector();
    }
  });
  inspectorBody.addEventListener('focusin', (event) => {
    if (event.target.dataset.field) state.editSnapshot = snapshot();
  });
  inspectorBody.addEventListener('input', (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    const block = state.blocks.find((item) => item.id === state.selected);
    if (!block) return;
    block[field] = event.target.value;
    updateBlockDom(block);
    saveState();
  });
  inspectorBody.addEventListener('change', (event) => {
    if (event.target.dataset.field) commitEdit();
  });
  inspectorBody.addEventListener('click', (event) => {
    const block = state.blocks.find((item) => item.id === state.selected);
    if (!block) return;
    const spanButton = event.target.closest('[data-span]');
    const rowButton = event.target.closest('[data-rows]');
    const alignButton = event.target.closest('[data-align]');
    const colorButton = event.target.closest('[data-color]');
    if (spanButton) {
      record();
      block.span = Number(spanButton.dataset.span);
      saveState();
      renderCanvas();
      renderInspector();
    }
    if (rowButton) {
      record();
      block.rows = Number(rowButton.dataset.rows);
      saveState();
      renderCanvas();
      renderInspector();
    }
    if (alignButton) {
      record();
      block.align = alignButton.dataset.align;
      saveState();
      renderCanvas();
      renderInspector();
    }
    if (colorButton) {
      record();
      block.color = Number(colorButton.dataset.color);
      saveState();
      renderCanvas();
      renderInspector();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redo();
    }
  });
}

init();
