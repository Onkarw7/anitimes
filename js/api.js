// UPDATE THIS URL
const WORKER_URL = "https://api.anitime.site"; 

export const Api = {
    async fetch(endpoint, options = {}) {
        try {
            const res = await fetch(`${WORKER_URL}${endpoint}`, options);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) { return null; }
    },
    getImgUrl(url) {
        if (!url) return 'https://placehold.co/400x600/1f2937/9ca3af?text=No+Img';
        return `${WORKER_URL}/image?url=${encodeURIComponent(url)}`;
    },
    async getList(type, page=1) {
        const map = { 'now': '/jikan/seasons/now', 'upcoming': '/jikan/seasons/upcoming', 'top': '/jikan/top/anime' };
        return await Api.fetch(`${map[type] || map['now']}?page=${page}`);
    },
    async getDetails(id) { return await Api.fetch(`/meta/${id}`); },
    async search(q, filters) { 
        let u = `/jikan/anime?q=${encodeURIComponent(q)}&sfw=true`;
        if(filters?.status) u+=`&status=${filters.status}`;
        return (await Api.fetch(u))?.data || []; 
    },
    async getLatestVideos() { return await Api.fetch('/videos/latest'); },
    async getSeasonList() { return await Api.fetch('/jikan/seasons'); },
    async getEpisode(id) { return await Api.fetch(`/api/episode/latest/${id}`); }
};
