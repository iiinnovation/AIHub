(function() {
    const messages = [];
    const allMessages = [];
    
    const humanMessages = document.querySelectorAll("[data-is-human-message='true'], .human-turn");
    const aiMessages = document.querySelectorAll("[data-is-human-message='false'], .ai-turn");
    
    humanMessages.forEach(el => {
        const contentEl = el.querySelector('.whitespace-pre-wrap') || el;
        const rect = el.getBoundingClientRect();
        allMessages.push({
            role: "user",
            content: contentEl.innerText.trim(),
            top: rect.top + window.scrollY
        });
    });
    
    aiMessages.forEach(el => {
        const contentEl = el.querySelector('.prose') || el.querySelector('.whitespace-pre-wrap') || el;
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
