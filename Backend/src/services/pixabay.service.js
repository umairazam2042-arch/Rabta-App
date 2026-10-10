const BASE_URL = "https://pixabay.com/api/videos/";

const TOPICS = [
  "nature", "ocean", "city", "travel", "food", "sunset", "mountains",
  "flowers", "animals", "street", "rain", "sky", "waterfall", "coffee",
  "fitness", "technology", "forest", "night", "beach", "snow",
];

// Pixabay rule: results 24 ghante cache honay chahiye
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const fetchSearch = async (query, page, perPage = 40) => {
  const key = `${query}:${page}:${perPage}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const url = new URL(BASE_URL);
  url.searchParams.set("key", process.env.PIXABAY_API_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("safesearch", "true");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay error ${res.status}`);
  const json = await res.json();
  const data = json.hits || [];
  cache.set(key, { at: Date.now(), data });
  return data;
};

// Behtareen file: small/medium (mobile ke liye halki), warna jo mile
const pickFile = (videos = {}) =>
  videos.small?.url ? videos.small : videos.medium?.url ? videos.medium : videos.tiny;

const toShot = (v) => {
  const file = pickFile(v.videos);
  if (!file?.url) return null;
  return {
    id: `pixabay-${v.id}`,
    source: "pixabay",
    externalId: String(v.id),
    videoUrl: file.url,
    posterUrl: file.thumbnail || "",
    pageUrl: v.pageURL,
    duration: v.duration || 0,
    isPortrait: file.height > file.width,
    credit: { name: v.user || "Pixabay", url: v.pageURL },
  };
};

const getRandomShots = async (count = 6) => {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const page = 1 + Math.floor(Math.random() * 3);

  let hits = await fetchSearch(topic, page);
  if (!hits.length && page > 1) hits = await fetchSearch(topic, 1);

  const shots = hits.map(toShot).filter(Boolean);
  // Portrait pehle, baqi landscape bhi (frontend object-cover se crop kar dega)
  const portrait = shuffle(shots.filter((s) => s.isPortrait));
  const others = shuffle(shots.filter((s) => !s.isPortrait));

  return [...portrait, ...others]
    .slice(0, count)
    .map(({ isPortrait, ...rest }) => rest);
};

module.exports = { getRandomShots };