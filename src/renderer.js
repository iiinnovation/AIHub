let providers = [];
let currentProvider = null;
let templates = [];
let editingTemplateId = null;

async function init() {
  const data = await window.electronAPI.getProviders();
  providers = data.providers || [];
  
  const lastProvider = await window.electronAPI.getLastProvider();
  templates = await window.electronAPI.getTemplates() || [];
  
  renderProviderList();
  
  const defaultProvider = providers.find(p => p.id === lastProvider) || providers[0];
  if (defaultProvider) {
    selectProvider(defaultProvider.id);
  }
  
  setupEventListeners();
}

function renderProviderList() {
  const list = document.getElementById('providerList');
  list.innerHTML = providers.map(p => `
    <div class="provider-item" data-id="${p.id}">
      <span class="icon">${getProviderIcon(p.id)}</span>
      <span class="name">${p.name}</span>
    </div>
  `).join('');
  
  list.querySelectorAll('.provider-item').forEach(item => {
    item.addEventListener('click', () => selectProvider(item.dataset.id));
  });
}

function getProviderIcon(id) {
  const icons = {
    chatgpt: '🟢',
    claude: '🟠',
    gemini: '🔵',
    qwen: '🟣',
    deepseek: '⚫',
    doubao: '🟤'
  };
  return icons[id] || '⚪';
}

function selectProvider(id) {
  const provider = providers.find(p => p.id === id);
  if (!provider) return;
  
  currentProvider = provider;
  window.electronAPI.saveLastProvider(id);
  
  document.querySelectorAll('.provider-item').forEach(item => {
    item.classList.toggle('active', item.dataset.id === id);
  });
  
  loadWebview(provider);
}

function loadWebview(provider) {
  const container = document.getElementById('webviewContainer');
  container.innerHTML = `
    <webview 
      id="aiWebview" 
      src="${provider.url}" 
      partition="persist:${provider.id}"
      allowpopups
    ></webview>
  `;
}

function getWebview() {
  return document.getElementById('aiWebview');
}

function setupEventListeners() {
  document.getElementById('btnExtract').addEventListener('click', handleExtract);
  document.getElementById('btnImport').addEventListener('click', () => showModal('importModal'));
  document.getElementById('btnCompress').addEventListener('click', () => showModal('compressModal'));
  document.getElementById('btnPrompt').addEventListener('click', handlePromptModal);
  
  setupModalCloseHandlers('extractModal', ['extractModalClose', 'extractClose']);
  document.getElementById('extractCopy').addEventListener('click', async () => {
    const content = document.getElementById('extractedContent').value;
    await window.electronAPI.clipboardWrite(content);
    document.getElementById('extractCopy').textContent = '已复制！';
    setTimeout(() => {
      document.getElementById('extractCopy').textContent = '复制到剪贴板';
    }, 2000);
  });
  
  setupModalCloseHandlers('importModal', ['importModalClose', 'importCancel']);
  document.getElementById('importConfirm').addEventListener('click', handleImport);
  
  setupModalCloseHandlers('compressModal', ['compressModalClose', 'compressCancel']);
  document.getElementById('compressConfirm').addEventListener('click', handleCompress);
  
  setupModalCloseHandlers('promptModal', ['promptModalClose']);
  document.getElementById('templateNew').addEventListener('click', () => openTemplateEditor(null));
  document.getElementById('templateImport').addEventListener('click', handleTemplateImport);
  document.getElementById('templateExport').addEventListener('click', handleTemplateExport);
  
  setupModalCloseHandlers('templateEditModal', ['templateEditClose', 'templateEditCancel']);
  document.getElementById('templateEditSave').addEventListener('click', handleTemplateSave);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });
}

function setupModalCloseHandlers(modalId, buttonIds) {
  const modal = document.getElementById(modalId);
  buttonIds.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => modal.classList.remove('active'));
    }
  });
}

function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

async function handleExtract() {
  const webview = getWebview();
  if (!webview || !currentProvider) return;
  
  try {
    const script = await window.electronAPI.getExtractionScript(currentProvider.id);
    if (!script) {
      alert('未找到提取脚本');
      return;
    }
    
    const result = await webview.executeJavaScript(script);
    const messages = JSON.parse(result);
    
    const formatted = messages.map(m => 
      `[${m.role.toUpperCase()}]\n${m.content}`
    ).join('\n\n---\n\n');
    
    document.getElementById('extractedContent').value = formatted;
    showModal('extractModal');
  } catch (err) {
    console.error('提取失败:', err);
    alert('提取对话失败: ' + err.message);
  }
}

async function handleImport() {
  const webview = getWebview();
  const content = document.getElementById('importContent').value.trim();
  
  if (!webview || !content) return;
  
  try {
    const script = await window.electronAPI.getInjectScript();
    if (!script) {
      alert('未找到注入脚本');
      return;
    }
    
    const wrappedScript = `(${script})(\`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)`;
    const result = await webview.executeJavaScript(wrappedScript);
    
    if (result === 'Success') {
      hideModal('importModal');
      document.getElementById('importContent').value = '';
    } else {
      alert('导入失败: ' + result);
    }
  } catch (err) {
    console.error('导入失败:', err);
    alert('导入失败: ' + err.message);
  }
}

async function handleCompress() {
  const webview = getWebview();
  if (!webview || !currentProvider) return;
  
  try {
    const script = await window.electronAPI.getExtractionScript(currentProvider.id);
    const result = await webview.executeJavaScript(script);
    const messages = JSON.parse(result);
    
    if (messages.length === 0) {
      alert('没有可压缩的对话');
      return;
    }
    
    const ratio = parseFloat(document.getElementById('compressRatio').value);
    const prompt = generateCompressionPrompt(messages, ratio);
    
    await window.electronAPI.clipboardWrite(prompt);
    hideModal('compressModal');
    alert('压缩提示词已复制到剪贴板。请粘贴到新对话中。');
  } catch (err) {
    console.error('压缩失败:', err);
    alert('压缩失败: ' + err.message);
  }
}

function generateCompressionPrompt(messages, ratio) {
  const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);
  const targetLength = Math.floor(totalLength * ratio);
  
  const conversationText = messages.map(m => 
    `[${m.role.toUpperCase()}]: ${m.content}`
  ).join('\n\n');
  
  return `请压缩以下对话，保留关键信息。目标长度约 ${targetLength} 字符（原文的 ${Math.round(ratio * 100)}%）。

输出格式：JSON，结构为 {"compressed": "...", "keyPoints": ["...", "..."]}

对话内容：
${conversationText}`;
}

async function handlePromptModal() {
  templates = await window.electronAPI.getTemplates() || [];
  renderTemplateList();
  showModal('promptModal');
}

function renderTemplateList() {
  const list = document.getElementById('templateList');
  
  if (templates.length === 0) {
    list.innerHTML = '<div class="empty-state">暂无模板，点击新建创建一个！</div>';
    return;
  }
  
  list.innerHTML = templates.map(t => `
    <div class="template-item" data-id="${t.id}">
      <span class="template-name">${t.name}</span>
      <div class="template-actions">
        <button class="btn-icon" data-action="use" title="使用模板">✓</button>
        <button class="btn-icon" data-action="edit" title="编辑">✏️</button>
        <button class="btn-icon" data-action="delete" title="删除">🗑️</button>
      </div>
    </div>
  `).join('');
  
  list.querySelectorAll('.template-item').forEach(item => {
    item.querySelector('[data-action="use"]').addEventListener('click', (e) => {
      e.stopPropagation();
      useTemplate(item.dataset.id);
    });
    item.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
      e.stopPropagation();
      openTemplateEditor(item.dataset.id);
    });
    item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTemplate(item.dataset.id);
    });
  });
}

async function useTemplate(id) {
  const template = templates.find(t => t.id === id);
  if (!template) return;
  
  let content = template.content;
  
  if (content.includes('{clipboard}')) {
    const clipboardText = await window.electronAPI.clipboardRead();
    content = content.replace(/\{clipboard\}/g, clipboardText);
  }
  
  const webview = getWebview();
  if (!webview) return;
  
  try {
    const script = await window.electronAPI.getInjectScript();
    const wrappedScript = `(${script})(\`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)`;
    await webview.executeJavaScript(wrappedScript);
    hideModal('promptModal');
  } catch (err) {
    console.error('模板应用失败:', err);
    alert('应用模板失败: ' + err.message);
  }
}

function openTemplateEditor(id) {
  editingTemplateId = id;
  const template = id ? templates.find(t => t.id === id) : null;
  
  document.getElementById('templateEditTitle').textContent = template ? '编辑模板' : '新建模板';
  document.getElementById('templateName').value = template ? template.name : '';
  document.getElementById('templateContent').value = template ? template.content : '';
  
  showModal('templateEditModal');
}

async function handleTemplateSave() {
  const name = document.getElementById('templateName').value.trim();
  const content = document.getElementById('templateContent').value.trim();
  
  if (!name || !content) {
    alert('请填写名称和内容');
    return;
  }
  
  if (editingTemplateId) {
    const index = templates.findIndex(t => t.id === editingTemplateId);
    if (index !== -1) {
      templates[index] = { ...templates[index], name, content };
    }
  } else {
    templates.push({
      id: Date.now().toString(),
      name,
      content
    });
  }
  
  await window.electronAPI.saveTemplates(templates);
  hideModal('templateEditModal');
  renderTemplateList();
}

async function deleteTemplate(id) {
  if (!confirm('确定要删除这个模板吗？')) return;
  
  templates = templates.filter(t => t.id !== id);
  await window.electronAPI.saveTemplates(templates);
  renderTemplateList();
}

async function handleTemplateImport() {
  const imported = await window.electronAPI.importTemplates();
  if (imported && Array.isArray(imported)) {
    templates = [...templates, ...imported];
    await window.electronAPI.saveTemplates(templates);
    renderTemplateList();
  }
}

async function handleTemplateExport() {
  if (templates.length === 0) {
    alert('没有可导出的模板');
    return;
  }
  await window.electronAPI.exportTemplates(templates);
}

init();
