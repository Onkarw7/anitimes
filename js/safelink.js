(function() {
    const DOMAIN = "https://anitime.site/s/";
    const EXCLUDED = ["anitime.site", "news.anitime.site", "api.anitime.site", "google.com"];
    
    document.addEventListener('DOMContentLoaded', () => {
        const links = document.getElementsByTagName('a');
        for(let a of links) {
            const h = a.getAttribute('href');
            if(!h || h.startsWith('#') || h.startsWith('javascript:')) continue;
            try {
                const url = new URL(h, window.location.origin);
                if(!EXCLUDED.some(d => url.hostname.endsWith(d))) {
                    a.setAttribute('href', `${DOMAIN}${btoa(h)}`);
                    a.setAttribute('target', '_blank');
                    a.setAttribute('rel', 'nofollow noopener noreferrer');
                }
            } catch(e){}
        }
    });
})();
