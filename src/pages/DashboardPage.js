import React, { useEffect, useState } from 'react';
import { fetchPosts, fetchWeather } from '../services/api';


const DashboardPage = ({ assets }) => {
const [posts, setPosts] = useState([]);
const [weather, setWeather] = useState(null);
const [loading, setLoading] = useState(true);


useEffect(() => {
let mounted = true;
Promise.all([fetchPosts(), fetchWeather()])
.then(([p,w]) => { if (!mounted) return; setPosts(p); setWeather(w); setLoading(false); })
.catch(() => setLoading(false));
return () => { mounted = false; };
}, []);


return (
<div className="container mx-auto px-6 py-12">
<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
<div className="grid md:grid-cols-3 gap-4 mb-6">
<div className="bg-white p-4 rounded shadow">Total Assets<br/><strong>{assets.length}</strong></div>
<div className="bg-white p-4 rounded shadow">System Status<br/><strong>Online</strong></div>
<div className="bg-white p-4 rounded shadow">Weather Sample<br/><strong>{loading? '...': (weather?.hourly?.temperature_2m?.slice(0,1)[0] ?? 'n/a')}</strong></div>
</div>


<h2 className="text-xl font-bold mb-2">Recent Posts (from JSONPlaceholder)</h2>
<div className="grid md:grid-cols-3 gap-4">
{posts.map(p => (
<div key={p.id} className="bg-white p-4 rounded shadow">
<h3 className="font-bold text-sm">{p.title}</h3>
<p className="text-xs text-slate-600 mt-2">{p.body.slice(0,100)}...</p>
</div>
))}
</div>
</div>
);
};


export default DashboardPage;