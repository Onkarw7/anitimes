export const Store = {
    state: { library: JSON.parse(localStorage.getItem('anitime_lib') || '{}') },
    save() { localStorage.setItem('anitime_lib', JSON.stringify(Store.state.library)); },
    toggleLibrary(anime) {
        const id = anime.id || anime.mal_id;
        if (Store.state.library[id]) delete Store.state.library[id];
        else Store.state.library[id] = { ...anime, dateAdded: Date.now() };
        Store.save();
    },
    getLibraryArray() { return Object.values(Store.state.library).sort((a,b) => b.dateAdded - a.dateAdded); },
    isInLibrary(id) { return !!Store.state.library[id]; }
};
