(function() {
    const messages = [];
    const allMessages = [];
    
    const userQueries = document.querySelectorAll('user-query, .user-query');
    const modelResponses = document.querySelectorAll('model-response, .model-response');
    
    userQueries.forEach(el => {
        const rect = el.getBoundingClientRect();
        allMessages.push({
            role: "user",
            content: el.innerText.trim(),
            top: rect.top + window.scrollY
        });
    });
    
    modelResponses.forEach(el => {
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
