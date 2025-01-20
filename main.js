const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('send-webhook', async (event, { webhookUrl, username, avatarUrl, content, embed }) => {
    try {
      // 임베드 데이터 준비
      let embedData = null;
      if (embed) {
        embedData = {
          title: embed.title || undefined,
          description: embed.description || undefined,
          color: embed.color ? parseInt(embed.color.replace('#', ''), 16) : undefined,
          fields: embed.fields?.length > 0 ? embed.fields : undefined,
          image: embed.image ? { url: embed.image } : undefined,
          thumbnail: embed.thumbnail ? { url: embed.thumbnail } : undefined,
          author: embed.author ? {
            name: embed.author.name,
            url: embed.author.url,
            icon_url: embed.author.icon_url
          } : undefined,
          footer: embed.footer ? {
            text: embed.footer.text,
            icon_url: embed.footer.icon_url
          } : undefined,
          timestamp: embed.timestamp || undefined,
          url: embed.url || undefined
        };

        // 빈 값 제거
        Object.keys(embedData).forEach(key => 
          embedData[key] === undefined && delete embedData[key]
        );
      }

      // 웹훅 데이터 준비
      const webhookData = {
        username: username || undefined,
        avatar_url: avatarUrl || undefined,
        content: content || undefined,
        embeds: embedData ? [embedData] : undefined,
        tts: embed.tts || false,
        allowed_mentions: embed.allowed_mentions || undefined
      };

      // 빈 값 제거
      Object.keys(webhookData).forEach(key => 
        webhookData[key] === undefined && delete webhookData[key]
      );

      const response = await axios.post(webhookUrl, webhookData);
      event.reply('webhook-response', { success: true, message: '웹훅 전송 성공!' });
    } catch (error) {
      event.reply('webhook-response', { 
        success: false, 
        message: '웹훅 전송 실패: ' + (error.response?.data?.message || error.message)
      });
    }
});