(function(context, submitSelector) {
    // 1. 填入文本 (复用逻辑)
    const inputSelectors = [
        '#prompt-textarea',
        'textarea[placeholder]',
        'div[contenteditable="true"]',
        'textarea',
        '[role="textbox"]'
    ];
    
    let input = null;
    for (const selector of inputSelectors) {
        input = document.querySelector(selector);
        if (input) break;
    }
    
    if (!input) {
        return JSON.stringify({ success: false, error: "Input element not found" });
    }
    
    if (input.tagName === 'TEXTAREA') {
        input.value = context;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (input.contentEditable === 'true') {
        input.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = context;
        input.appendChild(p);
        input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    } else {
        input.textContent = context;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // 2. 尝试发送
    setTimeout(() => {
        // 尝试按回车 (对于大多数现代聊天输入框)
        const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true, cancelable: true, keyCode: 13, key: 'Enter', code: 'Enter'
        });
        input.dispatchEvent(enterEvent);
        
        // 同时也尝试点击发送按钮 (作为备份)
        if (submitSelector) {
            const btn = document.querySelector(submitSelector);
            if (btn) {
                btn.click();
            }
        }
    }, 100);
    
    return JSON.stringify({ success: true, element: input.tagName });
})
