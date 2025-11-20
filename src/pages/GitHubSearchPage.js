import React, { useState } from 'react';


const GitHubSearchPage = () => {
const [username, setUsername] = useState('');
const [data, setData] = useState(null);
const [error, setError] = useState('');


const handleSearch = async (e) => {
e.preventDefault(); setError(''); setData(null);
try {
const res = await fetch(`https://api.github.com/users/${username}`);
if (!res.ok) throw new Error('User not found');
setData(await res.json());
} catch (err) { setError(err.message); }
};


return (
<div className="container mx-auto px-6 py-12 max-w-xl">
<h1 className="text-2xl font-bold mb-4">GitHub Search</h1>
<form onSubmit={handleSearch} className="flex gap-2 mb-4">
<input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username" className="flex-1 border p-2 rounded" />
<button className="bg-slate-900 text-white px-3 py-1 rounded">Search</button>
</form>
{error && <div className="text-red-600">{error}</div>}
{data && (
<div className="bg-white p-4 rounded shadow text-center">
<img src={data.avatar_url} alt="avatar" className="w-24 h-24 rounded-full mx-auto" />
<h3 className="font-bold mt-2">{data.name}</h3>
<p className="text-xs text-slate-600">@{data.login}</p>
<div className="grid grid-cols-3 gap-2 mt-4 text-sm">
<div className="bg-slate-50 p-2 rounded">Repos<br/>{data.public_repos}</div>
<div className="bg-slate-50 p-2 rounded">Followers<br/>{data.followers}</div>
<div className="bg-slate-50 p-2 rounded">Following<br/>{data.following}</div>
</div>
</div>
)}
</div>
);
};


export default GitHubSearchPage;