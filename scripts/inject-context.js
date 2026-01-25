function(context) {
    // 尝试找到输入框
    const inputSelectors = [
        '#prompt-textarea',            // ChatGPT
        'div[contenteditable="true"]', // Claude, Gemini
        'textarea[data-id]',           // Generic
        'textarea'                     // Fallback
    ];

    let input = null;
    for (const selector of inputSelectors) {
        // 必须是可见的输入框
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
            if (el.offsetParent !== null) {
                input = el;
                break;
            }
        }
        if (input) break;
    }

    if (!input) return "Error: No input field found";

    input.focus();

    // 策略 1: 如果是 contenteditable (如 Claude)
    if (input.getAttribute('contenteditable') === 'true') {
        input.innerText = ""; // 清空
        // 使用 execCommand 模拟真实输入，兼容性最好
        document.execCommand('insertText', false, context);
        
        // 如果 execCommand 没生效（某些浏览器限制），强制赋值
        if (input.innerText.trim() === "") {
            input.innerText = context;
        }
    } 
    // 策略 2: 普通 textarea (如 ChatGPT)
    else {
        input.value = context;
        // React 需要特殊的 value setter hack
        try {
            let lastValue = input.value;
            input.value = context;
            let event = new Event('input', { bubbles: true });
            // React 15/16 hack
            event.simulated = true;
            let tracker = input._valueTracker;
            if (tracker) {
                tracker.setValue(lastValue);
            }
            input.dispatchEvent(event);
        } catch (e) {
            console.error("React hack failed", e);
        }
    }

    // 触发一系列事件以唤醒 UI (发送按钮变亮)
    ['input', 'change', 'keydown', 'keyup', 'blur', 'focus'].forEach(eventType => {
        input.dispatchEvent(new Event(eventType, { bubbles: true }));
    });

    return "Success";
}
