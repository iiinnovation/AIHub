const { app, BrowserWindow, ipcMain, clipboard, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store({
  defaults: {
    promptTemplates: [],
    lastProvider: 'chatgpt',
    windowBounds: { width: 1400, height: 900 }
  }
});

let mainWindow;

function createWindow() {
  const bounds = store.get('windowBounds');
  
  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    },
    icon: path.join(__dirname, 'resources/icon.png'),
    show: false
  });

  mainWindow.loadFile('src/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', { width: bounds.width, height: bounds.height });
  });

  createMenu();
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        { label: '退出', role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '刷新', role: 'reload' },
        { label: '开发者工具', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '重置缩放', role: 'resetZoom' },
        { label: '放大', role: 'zoomIn' },
        { label: '缩小', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

ipcMain.handle('get-providers', () => {
  const providersPath = path.join(__dirname, 'resources/ai-providers.json');
  try {
    const data = fs.readFileSync(providersPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('加载提供商失败:', err);
    return { providers: [] };
  }
});

ipcMain.handle('get-extraction-script', (event, providerId) => {
  const scriptPath = path.join(__dirname, 'scripts', `extract-${providerId}.js`);
  try {
    if (fs.existsSync(scriptPath)) {
      return fs.readFileSync(scriptPath, 'utf-8');
    }
    return fs.readFileSync(path.join(__dirname, 'scripts', 'extract-generic.js'), 'utf-8');
  } catch (err) {
    console.error('加载提取脚本失败:', err);
    return null;
  }
});

ipcMain.handle('get-inject-script', () => {
  try {
    return fs.readFileSync(path.join(__dirname, 'scripts', 'inject-context.js'), 'utf-8');
  } catch (err) {
    console.error('加载注入脚本失败:', err);
    return null;
  }
});

ipcMain.handle('clipboard-read', () => {
  return clipboard.readText();
});

ipcMain.handle('clipboard-write', (event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('templates-get-all', () => {
  return store.get('promptTemplates');
});

ipcMain.handle('templates-save', (event, templates) => {
  store.set('promptTemplates', templates);
  return true;
});

ipcMain.handle('templates-export', async (event, templates) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: '导出模板',
    defaultPath: 'prompt-templates.json',
    filters: [{ name: 'JSON 文件', extensions: ['json'] }]
  });
  
  if (filePath) {
    fs.writeFileSync(filePath, JSON.stringify(templates, null, 2));
    return true;
  }
  return false;
});

ipcMain.handle('templates-import', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: '导入模板',
    filters: [{ name: 'JSON 文件', extensions: ['json'] }],
    properties: ['openFile']
  });
  
  if (filePaths && filePaths.length > 0) {
    try {
      const data = fs.readFileSync(filePaths[0], 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('导入模板失败:', err);
      return null;
    }
  }
  return null;
});

ipcMain.handle('save-last-provider', (event, providerId) => {
  store.set('lastProvider', providerId);
  return true;
});

ipcMain.handle('get-last-provider', () => {
  return store.get('lastProvider');
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
