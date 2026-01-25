(function() {
    const messages = [];
    const allMessages = [];
    
    const chatContainer = document.querySelector('.chat-container, .conversation-container, [class*="chat"]');
    if (!chatContainer) {
        return JSON.stringify([]);
    }
    
    const messageBlocks = chatContainer.querySelectorAll('[class*="message"], [class*="bubble"]');
    
    messageBlocks.forEach(el => {
        const isUser = el.classList.toString().includes('user') || 
                       el.classList.toString().includes('human') ||
                       el.querySelector('[class*="user"]');
        
        const rect = el.getBoundingClientRect();
        allMessages.push({
            role: isUser ? "user" : "assistant",
            content: el.innerText.trim(),
            top: rect.top + window.scrollY
        });
    });
    
    allMessages.sort((a, b) => a.top - b.top);
    
    return JSON.stringify(allMessages.map(m => ({
        role: m.role,
        content: m.content
    })));
})();
