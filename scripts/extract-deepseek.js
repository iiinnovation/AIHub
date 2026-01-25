(function() {
    const messages = [];
    const allMessages = [];
    
    const chatContainer = document.querySelector('.chat-messages, [class*="chat"], [class*="conversation"]');
    if (!chatContainer) {
        const fallbackMessages = document.querySelectorAll('[class*="message"]');
        fallbackMessages.forEach((el, idx) => {
            allMessages.push({
                role: idx % 2 === 0 ? "user" : "assistant",
                content: el.innerText.trim(),
                top: idx
            });
        });
        return JSON.stringify(allMessages.map(m => ({ role: m.role, content: m.content })));
    }
    
    const userMessages = chatContainer.querySelectorAll('.user-message, [class*="user"], [class*="human"]');
    const assistantMessages = chatContainer.querySelectorAll('.assistant-message, [class*="assistant"], [class*="bot"]');
    
    userMessages.forEach(el => {
        const rect = el.getBoundingClientRect();
        allMessages.push({
            role: "user",
            content: el.innerText.trim(),
            top: rect.top + window.scrollY
        });
    });
    
    assistantMessages.forEach(el => {
        const rect = el.getBoundingClientRect();
        allMessages.push({
            role: "assistant",
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
