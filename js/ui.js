import { Api } from './api.js';
import { Store } from './store.js';

export const UI = {
    escapeHTML(str) { return str ? str.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[t])) : ''; },

    // THEME LOGIC
    setTheme(mode) {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Update Icon visibility
        const moons = document.querySelectorAll('.ph-moon, .lucide-moon');
        const suns = document.querySelectorAll('.ph-sun, .lucide-sun');
        
        if (mode === 'dark') {
            moons.forEach(el => el.classList.remove('hidden'));
            suns.forEach(el => el.classList.add('hidden'));
        } else {
            moons.forEach(el => el.classList.add('hidden'));
            suns.forEach(el => el.classList.remove('hidden'));
        }
    },

    openPreferences() { document.getElementById('pref-modal').classList.remove('hidden'); },
    closePreferences() { document.getElementById('pref-modal').classList.add('hidden'); },

    renderGrid(list, containerId='app-container') {
        const c = document.getElementById(containerId);
        c.innerHTML = `<div id="anime-grid" class="grid-clean"></div>`;
        const g = document.getElementById('anime-grid');
        if (!list?.length) { g.innerHTML = "No results"; return; }
        g.innerHTML = list.map(a => `
            <div class="group relative rounded-xl overflow-hidden bg-gray-800 cursor-pointer card-glow" onclick="window.router.go('/anime/${a.mal_id}')">
                <img src="${Api.getImgUrl(a.images.jpg.large_image_url)}" class="w-full h-64 object-cover transition-transform group-hover:scale-105">
                <div class="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black to-transparent">
                    <div class="text-white font-bold truncate">${a.title}</div>
                    <div class="text-xs text-gray-300 flex justify-between"><span>${a.year||'TBA'}</span><span>★ ${a.score||'-'}</span></div>
                </div>
            </div>
        `).join('');
    },

    renderSearchPage() {
        document.getElementById('app-container').innerHTML = `
            <h1 class="text-3xl font-bold dark:text-white mb-6">Search</h1>
            <div class="bg-gray-800 p-4 rounded-xl mb-8 flex gap-4">
                <input id="adv-search-input" placeholder="Title..." class="flex-1 bg-black/50 p-2 rounded text-white border border-gray-700">
                <select id="filter-status" class="bg-black/50 p-2 rounded text-white border border-gray-700"><option value="">All</option><option value="airing">Airing</option></select>
                <button id="btn-search-apply" class="bg-brand-600 px-6 rounded font-bold text-white">Search</button>
            </div>
            <div id="search-results-grid" class="grid-clean"></div>
        `;
    },

    updateSearchResults(list) {
        const grid = document.getElementById('search-results-grid');
        if (!list || list.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500">No results found.</div>`;
            return;
        }

        grid.innerHTML = list.map(anime => `
            <div class="group relative rounded-xl overflow-hidden bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-white/5 cursor-pointer card-glow transition-all hover:scale-105" onclick="window.router.go('/anime/${anime.mal_id}')">
                <div class="aspect-[2/3] relative overflow-hidden">
                    <img src="${Api.getImgUrl(anime.images.jpg.large_image_url)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy">
                    <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <div class="text-xs text-white font-bold truncate">${anime.title}</div>
                        <div class="flex justify-between text-[10px] text-gray-300">
                            <span>${anime.type || 'TV'}</span>
                            <span class="text-yellow-400">★ ${anime.score || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>`).join('');
    },

    renderArchive(data) {
        document.getElementById('app-container').innerHTML = `<h1 class="text-2xl font-bold mb-6 text-white">Seasonal Archive</h1><div class="space-y-6">${data.data.slice(0,10).map(y => `<div><h2 class="text-xl font-bold text-brand-500 mb-2">${y.year}</h2><div class="flex gap-2 flex-wrap">${y.seasons.map(s => `<button class="px-4 py-2 bg-gray-800 rounded text-white capitalize">${s}</button>`).join('')}</div></div>`).join('')}</div>`;
    },

    renderDetail(data) {
        const c = document.getElementById('app-container');
        const img = Api.getImgUrl(data.image);
        c.innerHTML = `
            <div class="animate-fade-in-up">
                <button onclick="window.router.back()" class="mb-4 text-gray-500 hover:text-primary flex items-center gap-2">Back</button>
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="w-full md:w-64 shrink-0"><img src="${img}" class="w-full rounded-lg shadow-2xl"><button id="lib-btn" class="w-full mt-4 py-3 bg-brand-600 rounded-lg text-white font-bold">Add to Library</button></div>
                    <div class="flex-1"><h1 class="text-4xl font-bold text-white mb-4">${data.title}</h1><p class="text-gray-300 leading-relaxed mb-6">${data.synopsis}</p></div>
                </div>
            </div>`;
        document.getElementById('lib-btn').onclick = () => Store.toggleLibrary(data);
    },
    
    renderVideoGrid(list) {
        const c = document.getElementById('app-container');
        if (!list || list.length === 0) {
            c.innerHTML = `<div class="p-20 text-center text-gray-500">No videos available.</div>`;
            return;
        }
        
        c.innerHTML = `
            <div class="animate-fade-in-up">
                <h1 class="text-3xl font-bold dark:text-white mb-8 flex items-center gap-3">
                    <i data-lucide="play-circle" class="text-red-500"></i> Latest Trailers
                </h1>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${list.map(v => `
                        <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 group cursor-pointer" 
                             onclick="window.open('https://youtube.com/watch?v=${v.video_id}', '_blank')">
                            <div class="relative aspect-video">
                                <img src="${v.thumbnail}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                <div class="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                    <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 transition-transform">
                                        <i data-lucide="play" class="w-6 h-6 ml-1"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4">
                                <h3 class="font-bold dark:text-white line-clamp-1">${v.title}</h3>
                                <p class="text-xs text-gray-500 mt-1">Watch Trailer</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        if(window.lucide) lucide.createIcons();
    },

    renderAIInsights(data) {
        // Implementation for AI Insights if needed, keeping placeholder to match signature
    }
};
window.ui = UI;
