import React, { useState } from 'react';
import AssetCard from '../components/AssetCard';


const AssetsPage = ({ assets, setCurrentPage }) => {
const [query, setQuery] = useState('');
const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')||'[]'));


const filtered = assets.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));


const toggleFav = (name) => {
let next;
if (favorites.includes(name)) next = favorites.filter(f=>f!==name);
else next = [...favorites, name];
setFavorites(next); localStorage.setItem('favorites', JSON.stringify(next));
};


return (
<div className="container mx-auto px-6 py-12">
<div className="flex justify-between items-center mb-6">
<h1 className="text-2xl font-bold">Assets</h1>
<div className="flex gap-2">
<input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search assets..." className="border p-2 rounded" />
<button onClick={()=>setCurrentPage('add-asset')} className="bg-purple-600 text-white px-3 py-2 rounded">Add</button>
</div>
</div>


<div className="grid md:grid-cols-3 gap-4">
{filtered.map((a,i)=> (
<div key={i} className="relative">
<AssetCard asset={a} />
<button onClick={()=>toggleFav(a.name)} className={`absolute top-2 right-2 p-1 rounded ${favorites.includes(a.name)?'bg-yellow-300':'bg-white'}`}>★</button>
</div>
))}
</div>
</div>
);
};


export default AssetsPage;