import React, { useState, useEffect } from 'react';
import { getAssetsFromDB, deleteAssetFromDB } from '../services/firebase';

const AssetsPage = ({ assets, setCurrentPage }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbAssets, setDbAssets] = useState([]); // Assets fetched from Firestore

  // 1. Fetch Assets on load (Read operation)
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const data = await getAssetsFromDB();
        setDbAssets(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // 2. Delete Operation
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete asset: ${name}?`)) return;
    
    try {
      await deleteAssetFromDB(id);
      // Remove asset from local state immediately
      setDbAssets(dbAssets.filter(asset => asset.id !== id));
    } catch (error) {
      alert("Error deleting asset: " + error.message);
    }
  };

  const filtered = dbAssets.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase()) || 
    a.type.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return <div className="p-12 text-center text-[#340158] font-semibold">Loading Asset Inventory...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#340158]">Asset Inventory</h1>
        
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search assets..." 
            className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]" 
          />
          <button 
            onClick={() => setCurrentPage('add-asset')} 
            className="bg-[#7e3ff2] hover:bg-[#4B0082] text-white px-4 py-2 rounded-lg font-bold shadow-md transition"
          >
            Add New Asset
          </button>
        </div>
      </div>

      {/* Asset Table - Mimics old assignment CSS table style */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse table-auto">
            <thead className="bg-[#4B0082] text-white uppercase text-sm font-bold">
              <tr>
                <th className="p-4">Asset Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">No matching assets found.</td></tr>
              ) : (
                filtered.map((a, i) => (
                  <tr key={a.id} className="hover:bg-purple-50 transition">
                    <td className="p-4 font-medium text-[#340158]">{a.name}</td>
                    <td className="p-4 text-gray-600">{a.type}</td>
                    <td className="p-4 text-gray-600">{a.location}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold 
                          ${a.status === 'Active' ? 'bg-green-100 text-green-700' : 
                            a.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {/* You would add Edit here if needed, but for now, just Delete */}
                      <button 
                        onClick={() => handleDelete(a.id, a.name)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;