import React, { useState } from 'react';
import { PlusCircle, X, Image as ImageIcon } from 'lucide-react';

function App() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState({
    username: '',
    avatarUrl: '',
    content: '',
    embed: {
      title: '',
      description: '',
      color: '#5865F2',
      fields: []
    }
  });
  
  const [status, setStatus] = useState({ error: '', success: '' });

  // 필드 추가
  const addField = () => {
    setMessage(prev => ({
      ...prev,
      embed: {
        ...prev.embed,
        fields: [
          ...prev.embed.fields,
          { name: '', value: '', inline: false }
        ]
      }
    }));
  };

  // 필드 제거
  const removeField = (index) => {
    setMessage(prev => ({
      ...prev,
      embed: {
        ...prev.embed,
        fields: prev.embed.fields.filter((_, i) => i !== index)
      }
    }));
  };

  // 필드 업데이트
  const updateField = (index, key, value) => {
    setMessage(prev => ({
      ...prev,
      embed: {
        ...prev.embed,
        fields: prev.embed.fields.map((field, i) => 
          i === index ? { ...field, [key]: value } : field
        )
      }
    }));
  };

  // 웹훅 전송
  const sendWebhook = async () => {
    if (!webhookUrl) {
      setStatus({ error: '웹훅 URL을 입력해주세요', success: '' });
      return;
    }

    try {
      const payload = {
        username: message.username,
        avatar_url: message.avatarUrl,
        content: message.content,
        embeds: [{
          title: message.embed.title,
          description: message.embed.description,
          color: parseInt(message.embed.color.replace('#', ''), 16),
          fields: message.embed.fields
        }]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('웹훅 전송 실패');
      
      setStatus({ error: '', success: '웹훅 전송 성공!' });
    } catch (err) {
      setStatus({ error: err.message, success: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Webhook URL Input */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">웹훅 URL</label>
        <input
          type="text"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="Discord Webhook URL"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Message Form */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {/* Username & Content */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="사용자명"
            value={message.username}
            onChange={(e) => setMessage({...message, username: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="메시지 내용"
            value={message.content}
            onChange={(e) => setMessage({...message, content: e.target.value})}
            className="w-full h-24 p-2 border rounded"
          />
        </div>

        {/* Embed */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold">임베드</h3>
          
          <input
            type="text"
            placeholder="임베드 제목"
            value={message.embed.title}
            onChange={(e) => setMessage({
              ...message,
              embed: { ...message.embed, title: e.target.value }
            })}
            className="w-full p-2 border rounded"
          />

          <textarea
            placeholder="임베드 설명"
            value={message.embed.description}
            onChange={(e) => setMessage({
              ...message,
              embed: { ...message.embed, description: e.target.value }
            })}
            className="w-full h-24 p-2 border rounded"
          />

          <div>
            <label className="block text-sm font-medium mb-2">임베드 색상</label>
            <input
              type="color"
              value={message.embed.color}
              onChange={(e) => setMessage({
                ...message,
                embed: { ...message.embed, color: e.target.value }
              })}
              className="w-12 h-8"
            />
          </div>

          {/* Fields */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">필드</span>
              <button
                onClick={addField}
                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                필드 추가
              </button>
            </div>

            <div className="space-y-4">
              {message.embed.fields.map((field, index) => (
                <div key={index} className="p-3 border rounded space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">필드 {index + 1}</span>
                    <button
                      onClick={() => removeField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="필드 이름"
                    value={field.name}
                    onChange={(e) => updateField(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  
                  <input
                    type="text"
                    placeholder="필드 값"
                    value={field.value}
                    onChange={(e) => updateField(index, 'value', e.target.value)}
                    className="w-full p-2 border rounded"
                  />

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.inline}
                      onChange={(e) => updateField(index, 'inline', e.target.checked)}
                    />
                    <span>인라인</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">미리보기</h3>
        <div className="bg-gray-800 p-4 rounded">
          <div className="space-y-2">
            {message.username && (
              <div className="text-white font-medium">
                {message.username}
                <span className="text-gray-400 text-sm ml-2">봇</span>
              </div>
            )}
            
            {message.content && (
              <div className="text-gray-100">{message.content}</div>
            )}
            
            {(message.embed.title || message.embed.description || message.embed.fields.length > 0) && (
              <div 
                className="border-l-4 rounded p-3 bg-gray-700 space-y-2"
                style={{ borderColor: message.embed.color }}
              >
                {message.embed.title && (
                  <div className="font-semibold text-white">
                    {message.embed.title}
                  </div>
                )}
                
                {message.embed.description && (
                  <div className="text-gray-300">
                    {message.embed.description}
                  </div>
                )}
                
                {message.embed.fields.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {message.embed.fields.map((field, index) => (
                      <div key={index} className={field.inline ? 'col-span-1' : 'col-span-2'}>
                        <div className="font-semibold text-white">
                          {field.name}
                        </div>
                        <div className="text-gray-300">
                          {field.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {status.error}
        </div>
      )}
      
      {status.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {status.success}
        </div>
      )}

      {/* Send Button */}
      <button 
        onClick={sendWebhook}
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        웹훅 전송
      </button>
    </div>
  );
}

export default App;