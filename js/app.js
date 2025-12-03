import { Api } from './api.js';
import { Store } from './store.js';
import { UI } from './ui.js';

const App = {
    init() {
        App.setupTheme();
        App.setupRouter();
        App.setupSearch();
        App.handleRoute(window.location.pathname);
    },

    setupTheme() {
        // 1. Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        UI.setTheme(savedTheme);

        // 2. Bind Toggle Button
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                const newTheme = current === 'dark' ? 'light' : 'dark';
                UI.setTheme(newTheme);
                localStorage.setItem('theme', newTheme);
            };
        }
    },

    setupSearch() {
        const modal = document.getElementById('search-modal');
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        const closeBtn = document.getElementById('close-search');
        const triggers = document.querySelectorAll('#search-trigger'); // Handle desktop & mobile

        const toggleModal = (show) => {
            if (show) {
                modal.classList.remove('hidden');
                setTimeout(() => input.focus(), 50); // Focus delay for animation
            } else {
                modal.classList.add('hidden');
                input.value = ''; // Clear input
                results.innerHTML = ''; // Clear results
            }
        };

        // Bind Open Triggers
        triggers.forEach(btn => btn.onclick = () => toggleModal(true));
        
        // Bind Close Triggers
        if (closeBtn) closeBtn.onclick = () => toggleModal(false);
        
        // Close on Click Outside
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) toggleModal(false);
            };
        }

        // Live Search Logic
        let debounce;
        if (input) {
            input.oninput = (e) => {
                clearTimeout(debounce);
                const q = e.target.value.trim();
                
                if (q.length < 3) {
                    results.innerHTML = '<div class="text-center text-gray-500 p-4">Type at least 3 characters</div>';
                    return;
                }

                results.innerHTML = '<div class="text-center p-4"><i class="ph-bold ph-spinner animate-spin"></i></div>';

                debounce = setTimeout(async () => {
                    const list = await Api.search(q);
                    if (list && list.length > 0) {
                        results.innerHTML = list.map(a => `
                            <div class="flex gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors" onclick="window.router.go('/anime/${a.mal_id}'); document.getElementById('search-modal').classList.add('hidden')">
                                <img src="${a.images.jpg.small_image_url}" class="w-12 h-16 object-cover rounded-lg bg-gray-800">
                                <div>
                                    <h4 class="font-bold dark:text-white text-sm line-clamp-1">${a.title}</h4>
                                    <div class="text-xs text-gray-500 mt-1">${a.type || 'TV'} • ${a.year || '?'}</div>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        results.innerHTML = '<div class="text-center text-gray-500 p-4">No results found.</div>';
                    }
                }, 500);
            };
        }
    },

    setupRouter() {
        window.router = {
            go: (path) => {
                window.history.pushState({}, "", path);
                App.handleRoute(path);
            },
            back: () => {
                if(window.history.length > 1) window.history.back();
                else window.router.go('/');
            }
        };
        window.onpopstate = () => App.handleRoute(window.location.pathname);

        // Global Event Delegation for Links
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-route]');
            if (btn) {
                e.preventDefault();
                const route = btn.dataset.route;
                App.loadPage(route);
            }
        });
    },

    handleRoute(path) {
        path = path.replace(/\/$/, ""); 
        if (path === '' || path === '/') return App.loadPage('now');
        
        // Handle routes
        if (path.startsWith('/anime/')) {
            const id = path.split('/')[2];
            return App.loadAnime(id);
        }
        if (path === '/search') return App.loadPage('search');
        if (path === '/news') { window.location.href = '/news'; return; } // Handled by News SPA
        
        // Fallback
        App.loadPage('now');
    },

    async loadPage(type) {
        // Clear Intervals
        if (UI.timerInterval) clearInterval(UI.timerInterval);

        // Show Loader
        document.getElementById('app-container').innerHTML = `<div class="p-20 text-center"><i class="ph-bold ph-spinner animate-spin text-4xl text-primary"></i></div>`;
        
        // Routing Logic
        if (type === 'videos') {
            const res = await Api.getLatestVideos();
            if (res?.data) UI.renderVideoGrid(res.data);
            else document.getElementById('app-container').innerHTML = "Failed to load videos.";
            return;
        }

        if (type === 'archive') {
            const res = await Api.getSeasonList();
            UI.renderArchive(res);
            return;
        }

        if (type === 'library') {
            UI.renderGrid(Store.getLibraryArray());
            return;
        }

        if (type === 'search') {
            UI.renderSearchPage();
            App.bindSearchPageEvents();
            return;
        }

        // Default List (Now, Upcoming, Top)
        const res = await Api.getList(type);
        UI.renderGrid(res?.data || []);
        
        // Re-init Icons
        if(window.lucide) lucide.createIcons();
    },

    async loadAnime(id) {
        if (UI.timerInterval) clearInterval(UI.timerInterval);
        document.getElementById('app-container').innerHTML = `<div class="p-20 text-center"><i class="ph-bold ph-spinner animate-spin text-4xl text-primary"></i></div>`;
        
        const res = await Api.getDetails(id);
        if (res?.core) {
            UI.renderDetail(res.core);
            if(res.analysis) UI.renderAIInsights(res.analysis);
            
            // Check for Episode Data (Async)
            Api.getEpisode(id).then(ep => {
                // Logic to update episode card would go here if UI supports it
            });
        } else {
            document.getElementById('app-container').innerHTML = "Anime not found.";
        }
        if(window.lucide) lucide.createIcons();
    },

    bindSearchPageEvents() {
        const btn = document.getElementById('btn-search-apply');
        const input = document.getElementById('adv-search-input');
        
        const run = async () => {
            const q = input.value;
            const filters = {
                status: document.getElementById('filter-status')?.value,
                type: document.getElementById('filter-type')?.value,
                order_by: document.getElementById('filter-sort')?.value
            };
            
            document.getElementById('search-results-grid').innerHTML = `<div class="col-span-full text-center py-20"><i class="ph-bold ph-spinner animate-spin text-4xl text-brand-500"></i></div>`;
            const results = await Api.search(q, filters);
            UI.updateSearchResults(results);
        };

        if(btn) btn.onclick = run;
        if(input) input.onkeypress = (e) => { if (e.key === 'Enter') run(); };
    }
};

document.addEventListener('DOMContentLoaded', App.init);
