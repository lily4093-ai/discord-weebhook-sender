const { ipcRenderer } = require('electron');

let fields = [];

// 필드 추가
document.getElementById('addField').addEventListener('click', () => {
  const field = { name: '', value: '', inline: false };
  fields.push(field);
  renderFields();
  updatePreview();
});

// 필드 렌더링
function renderFields() {
  const container = document.getElementById('fieldsContainer');
  container.innerHTML = fields.map((field, index) => `
    <div class="field-item">
      <div class="field-header">
        <span>필드 ${index + 1}</span>
        <button class="btn-red" onclick="removeField(${index})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <input type="text" placeholder="필드 이름" value="${field.name}" onchange="updateField(${index}, 'name', this.value)">
      <input type="text" placeholder="필드 값" value="${field.value}" onchange="updateField(${index}, 'value', this.value)">
      <label>
        <input type="checkbox" ${field.inline ? 'checked' : ''} onchange="updateField(${index}, 'inline', this.checked)">
        인라인
      </label>
    </div>
  `).join('');
}

// 필드 제거
window.removeField = (index) => {
  fields = fields.filter((_, i) => i !== index);
  renderFields();
  updatePreview();
};

// 필드 업데이트
window.updateField = (index, key, value) => {
  fields[index][key] = value;
  updatePreview();
};

// 미리보기 업데이트
function updatePreview() {
  const username = document.getElementById('username').value;
  const avatarUrl = document.getElementById('avatarUrl').value;
  const content = document.getElementById('content').value;
  const embedTitle = document.getElementById('embedTitle').value;
  const embedUrl = document.getElementById('embedUrl').value;
  const embedDescription = document.getElementById('embedDescription').value;
  const embedColor = document.getElementById('embedColor').value;
  const imageUrl = document.getElementById('imageUrl').value;
  const thumbnailUrl = document.getElementById('thumbnailUrl').value;
  const authorName = document.getElementById('authorName').value;
  const authorUrl = document.getElementById('authorUrl').value;
  const authorIconUrl = document.getElementById('authorIconUrl').value;
  const footerText = document.getElementById('footerText').value;
  const footerIconUrl = document.getElementById('footerIconUrl').value;
  const timestamp = document.getElementById('timestamp').value;

  const preview = document.getElementById('preview');
  preview.querySelector('.preview-content').innerHTML = `
    ${username ? `
      <div class="preview-username">
        ${avatarUrl ? `<img src="${avatarUrl}" class="avatar-img" alt="Avatar">` : ''}
        ${username} <span style="color: #72767d">봇</span>
      </div>` : ''}
    ${content ? `<div class="preview-message">${content}</div>` : ''}
    ${(embedTitle || embedDescription || fields.length > 0 || imageUrl || thumbnailUrl || authorName || footerText) ? `
      <div class="preview-embed" style="border-color: ${embedColor}">
        ${authorName ? `
          <div class="preview-author">
            ${authorIconUrl ? `<img src="${authorIconUrl}" class="author-icon" alt="Author Icon">` : ''}
            ${authorUrl ? `<a href="${authorUrl}" target="_blank">${authorName}</a>` : authorName}
          </div>
        ` : ''}
        ${embedTitle ? `<div class="preview-title">${embedUrl ? `<a href="${embedUrl}" target="_blank">${embedTitle}</a>` : embedTitle}</div>` : ''}
        ${embedDescription ? `<div class="preview-description">${embedDescription}</div>` : ''}
        ${fields.length > 0 ? `
          <div class="preview-fields">
            ${fields.map(field => `
              <div class="preview-field ${field.inline ? 'inline' : ''}">
                ${field.name ? `<div class="field-name">${field.name}</div>` : ''}
                ${field.value ? `<div class="field-value">${field.value}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${imageUrl ? `<div class="preview-image"><img src="${imageUrl}" alt="Embed Image"></div>` : ''}
        ${thumbnailUrl ? `<div class="preview-thumbnail"><img src="${thumbnailUrl}" alt="Thumbnail"></div>` : ''}
        ${(footerText || timestamp) ? `
          <div class="preview-footer">
            ${footerIconUrl ? `<img src="${footerIconUrl}" class="footer-icon" alt="Footer Icon">` : ''}
            ${footerText}
            ${timestamp ? `<span class="preview-timestamp">${new Date(timestamp).toLocaleString()}</span>` : ''}
          </div>
        ` : ''}
      </div>
    ` : ''}
  `;
}

// 웹훅 전송
document.getElementById('sendWebhook').addEventListener('click', () => {
  const webhookUrl = document.getElementById('webhookUrl').value;
  const username = document.getElementById('username').value;
  const avatarUrl = document.getElementById('avatarUrl').value;
  const content = document.getElementById('content').value;
  const embedTitle = document.getElementById('embedTitle').value;
  const embedUrl = document.getElementById('embedUrl').value;
  const embedDescription = document.getElementById('embedDescription').value;
  const embedColor = document.getElementById('embedColor').value;
  const imageUrl = document.getElementById('imageUrl').value;
  const thumbnailUrl = document.getElementById('thumbnailUrl').value;
  const authorName = document.getElementById('authorName').value;
  const authorUrl = document.getElementById('authorUrl').value;
  const authorIconUrl = document.getElementById('authorIconUrl').value;
  const footerText = document.getElementById('footerText').value;
  const footerIconUrl = document.getElementById('footerIconUrl').value;
  const timestamp = document.getElementById('timestamp').value;

  ipcRenderer.send('send-webhook', {
    webhookUrl,
    username,
    avatarUrl,
    content,
    embed: {
      title: embedTitle,
      url: embedUrl,
      description: embedDescription,
      color: embedColor,
      fields,
      image: imageUrl,
      thumbnail: thumbnailUrl,
      author: authorName ? {
        name: authorName,
        url: authorUrl,
        icon_url: authorIconUrl
      } : undefined,
      footer: footerText ? {
        text: footerText,
        icon_url: footerIconUrl
      } : undefined,
      timestamp: timestamp || undefined
    }
  });
});

// 웹훅 응답 처리
ipcRenderer.on('webhook-response', (_, response) => {
  const status = document.getElementById('status');
  status.textContent = response.message;
  status.className = `status ${response.success ? 'success' : 'error'}`;
});

// 모든 입력 필드에 대해 미리보기 업데이트 이벤트 리스너 등록
document.querySelectorAll('input, textarea').forEach(element => {
  element.addEventListener('input', updatePreview);
});

// 초기 미리보기 업데이트
updatePreview();