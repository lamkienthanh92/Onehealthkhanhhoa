// Loads the One Health environmental grids from 13 SEPARATE files
// (public/data/grid_<layer>.json) instead of 1 combined grids.json —
// chia nho vi GitHub's web upload UI chi cho phep toi da 25MB/file, va
// grids.json gop chung nang ~52MB (Khanh Hoa rong hon HCMC nhieu).
// Moi file rieng deu duoi 11MB. Ket qua sau khi tai xong duoc gop lai
// thanh CUNG MOT cau truc { no2: {...}, so2: {...}, ... } nhu ban goc,
// nen moi noi khac goi loadGrids()/getGrids() (oneHealthGrids.js,
// populationStats.js, MapView.jsx) KHONG can doi gi ca.

const LAYER_KEYS = [
  "no2", "so2", "co", "o3", "lst", "nightlights",
  "builtup", "water", "population", "elevation",
  "landcover", "treecover", "forestloss",
];

let _grids = null;
let _loadPromise = null;
let _error = null;

export function loadGrids() {
  if (_loadPromise) return _loadPromise;
  const base = process.env.PUBLIC_URL || "";

  _loadPromise = Promise.all(
    LAYER_KEYS.map((key) =>
      fetch(`${base}/data/grid_${key}.json`).then((res) => {
        if (!res.ok) {
          throw new Error(`grid_${key}.json fetch failed: HTTP ${res.status}`);
        }
        return res.json().then((data) => [key, data]);
      })
    )
  )
    .then((entries) => {
      const merged = {};
      for (const [key, data] of entries) merged[key] = data;
      _grids = merged;
      return merged;
    })
    .catch((err) => {
      _error = err;
      throw err;
    });

  return _loadPromise;
}

// Synchronous accessor -- returns null until loadGrids() has resolved.
// Callers that run after the app-level loading gate (see App.jsx) can
// treat this as always-populated; anything that might run earlier must
// handle null.
export function getGrids() {
  return _grids;
}

export function getGridsError() {
  return _error;
}

export function isGridsLoaded() {
  return _grids !== null;
}
