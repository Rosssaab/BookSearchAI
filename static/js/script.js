document.addEventListener('DOMContentLoaded', function() {
    const themeSelect = document.getElementById('theme-select');
    const themeStyleLink = document.getElementById('theme-style');
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        themeStyleLink.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.2.3/dist/${savedTheme}/bootstrap.min.css`;
        themeSelect.value = savedTheme;
    }

    themeSelect.addEventListener('change', function() {
        const selectedTheme = this.value;
        themeStyleLink.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.2.3/dist/${selectedTheme}/bootstrap.min.css`;
        localStorage.setItem('theme', selectedTheme);
    });
});