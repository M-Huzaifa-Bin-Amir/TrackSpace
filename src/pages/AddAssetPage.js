import React, { useState } from 'react';


const AddAssetPage = ({ setCurrentPage, onAddAsset }) => {
const [form, setForm] = useState({ name: '', category: 'Network', tier: 'Perimeter Defense', description: '' });


const submit = (e) => { e.preventDefault(); onAddAsset(form); setCurrentPage('assets'); };


return (
<div className="container mx-auto px-6 py-12 max-w-lg">
<h1 className="text-2xl font-bold mb-4">Add Asset</h1>
<form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-4">
<input required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Name" className="w-full border p-2 rounded" />
<input value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} placeholder="Description" className="w-full border p-2 rounded" />
<select value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} className="w-full border p-2 rounded">
<option>Network</option><option>Database</option><option>Endpoint</option>
</select>
<select value={form.tier} onChange={(e)=>setForm({...form, tier: e.target.value})} className="w-full border p-2 rounded">
<option>Perimeter Defense</option><option>Critical Infrastructure</option><option>Endpoint Defense</option>
</select>
<div className="flex gap-2">
<button className="bg-purple-600 text-white px-4 py-2 rounded">Save</button>
<button type="button" onClick={()=>setCurrentPage('assets')} className="px-4 py-2 border rounded">Cancel</button>
</div>
</form>
</div>
);
};


export default AddAssetPage;