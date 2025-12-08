// Provides simple wrapper for public APIs used in the app.
export async function fetchPosts() {
// JSONPlaceholder: free public test API
const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6');
if (!res.ok) throw new Error('Failed to fetch posts');
return res.json();
}


export async function fetchWeather(city) {
// Note: Replace with your own API key if needed.
// This example uses the Open-Meteo (no-key) as simple demo
const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=24.86&longitude=67.01&hourly=temperature_2m`);
if (!res.ok) throw new Error('Weather fetch failed');
return res.json();
}