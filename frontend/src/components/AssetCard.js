import React from 'react';


const AssetCard = ({ asset }) => (
<div className="bg-white p-4 rounded shadow">
<h3 className="font-bold">{asset.name}</h3>
<p className="text-sm text-slate-600">{asset.category} — {asset.description}</p>
<div className="mt-2 text-xs font-semibold">
<span className={`px-2 py-1 rounded ${asset.securityTier.includes('Critical') ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{asset.securityTier}</span>
</div>
</div>
);


export default AssetCard;