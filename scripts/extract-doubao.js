(function() {
    const messages = [];
    const allMessages = [];
    
    const chatContainer = document.querySelector('[class*="chat-message-list"], [class*="chat"], main');
    if (!chatContainer) {
        return JSON.stringify([]);
    }
    
    const userMessages = chatContainer.querySelectorAll('[class*="user"], [class*="human"], [class*="fui-message--mine"]');
    const assistantMessages = chatContainer.querySelectorAll('[class*="assistant"], [class*="bot"], [class*="fui-message--ai"]');
    
    userMessages.forEach(el => {
        const contentEl = el.querySelector('[class*="content"]') || el;
        const rect = el.getBoundingClientRect();
        allMessages.push({
            role: "user",
            content: contentEl.innerText.trim(),
            top: rect.top + window.scrollY
        });
    });
    
    assistantMessages.forEach(el => {
        const contentEl = el.querySelector('[class*="content"]') || el.querySelector('[class*="markdown"]') || el;
        const rect = el.getBoundingClientRect();
        allMessages.push({
            role: "assistant",
            content: contentEl.innerText.trim(),
            top: rect.top + window.scrollY
        });
    });
    
    allMessages.sort((a, b) => a.top - b.top);
    
    return JSON.stringify(allMessages.map(m => ({
        role: m.role,
        content: m.content
    })));
})();
