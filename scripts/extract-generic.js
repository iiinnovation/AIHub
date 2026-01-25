(function() {
    const messages = [];
    const allMessages = [];
    
    const messageElements = document.querySelectorAll('[class*="message"], [class*="bubble"], [class*="chat"]');
    
    messageElements.forEach((el, idx) => {
        const text = el.innerText.trim();
        if (text.length < 5) return;
        
        const isUser = el.className.includes('user') || 
                      el.className.includes('human') || 
                      el.className.includes('sent') ||
                      el.closest('[class*="user"]') !== null;
        
        const rect = el.getBoundingClientRect();
        allMessages.push({
            role: isUser ? "user" : "assistant",
            content: text,
            top: rect.top + window.scrollY
        });
    });
    
    allMessages.sort((a, b) => a.top - b.top);
    
    const uniqueMessages = [];
    let lastContent = '';
    allMessages.forEach(m => {
        if (m.content !== lastContent) {
            uniqueMessages.push({ role: m.role, content: m.content });
            lastContent = m.content;
        }
    });
    
    return JSON.stringify(uniqueMessages);
})();
