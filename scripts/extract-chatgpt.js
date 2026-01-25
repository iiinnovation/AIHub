(function() {
    const messages = [];
    const container = document.querySelector("main div[class*='react-scroll-to-bottom']") || document.body;
    
    const userMessages = container.querySelectorAll("[data-message-author-role='user']");
    const assistantMessages = container.querySelectorAll("[data-message-author-role='assistant']");
    
    const allMessages = [];
    
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
