/* Portrety przeciwników: pobierz i zdekoduj przed walką.
   Jedna obietnica na grafikę zapobiega powielaniu żądań i mignięciu inicjału. */
const PortraitCache = (() => {
    const cache = new Map();

    function preload(path) {
        if (!path) return Promise.resolve(false);
        const existing = cache.get(path);
        if (existing) return existing.promise;

        const image = new Image();
        image.decoding = 'async';
        const entry = { image, ready: false, promise: null };
        entry.promise = new Promise(resolve => {
            const complete = () => {
                entry.ready = image.naturalWidth > 0;
                if (!entry.ready && cache.get(path) === entry) cache.delete(path);
                resolve(entry.ready);
            };
            image.onload = () => {
                try {
                    const decoding = typeof image.decode === 'function' ? image.decode() : undefined;
                    Promise.resolve(decoding).then(complete, complete);
                } catch (_) {
                    complete();
                }
            };
            image.onerror = () => {
                if (cache.get(path) === entry) cache.delete(path);
                resolve(false);
            };
        });
        cache.set(path, entry);
        image.src = path;
        return entry.promise;
    }

    // Przygotuj obrazki z aktualnego piętra jeszcze podczas przeglądania mapy.
    function preloadFloor(floor) {
        if (!floor) return;
        const paths = new Set();
        for (const node of floor.nodes || []) {
            if (node.enemy && node.enemy.portrait) paths.add(node.enemy.portrait);
        }
        if (floor.boss && floor.boss.portrait) paths.add(floor.boss.portrait);
        for (const path of paths) void preload(path);
    }

    // Resztę niewielkiego zestawu (24 WebP, łącznie około 1,6 MiB)
    // pobierz w wolnej chwili, żeby testowe walki też miały gotowe portrety.
    function preloadRoster(enemies) {
        for (const enemy of enemies || []) {
            if (enemy && enemy.portrait) void preload(enemy.portrait);
        }
    }

    function show(enemy, portrait, fallback) {
        const path = enemy && enemy.portrait || '';
        fallback.textContent = enemy ? enemy.name.charAt(0).toUpperCase() : '⚔';
        portrait.alt = enemy ? 'Portret: ' + enemy.name : '';

        if (portrait.dataset.portrait === path) return;
        portrait.dataset.portrait = path;
        portrait.hidden = true;
        fallback.hidden = false;
        portrait.onerror = null;
        portrait.removeAttribute('src');
        if (!path) return;

        portrait.onerror = () => {
            if (portrait.dataset.portrait !== path) return;
            portrait.hidden = true;
            fallback.hidden = false;
        };

        const reveal = () => {
            // Gdy gracz zdążył już zmienić przeciwnika, nie pokazuj starej twarzy.
            if (portrait.dataset.portrait !== path) return;
            portrait.src = path;
            portrait.hidden = false;
            fallback.hidden = true;
        };

        if (cache.get(path)?.ready) {
            reveal();
        } else {
            void preload(path).then(loaded => {
                if (loaded) reveal();
            });
        }
    }

    return { preload, preloadFloor, preloadRoster, show };
})();
