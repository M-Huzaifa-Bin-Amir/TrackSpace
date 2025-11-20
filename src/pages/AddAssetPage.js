import React, { useState } from 'react';
import { addAssetToDB } from '../services/firebase';

const AddAssetPage = ({ setCurrentPage, setAssets }) => {
  const [form, setForm] = useState({ name: '', type: 'Laptop', status: 'Active', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Use the Firebase function to save the asset
      const newAssetWithId = await addAssetToDB(form);
      
      // Update the parent's asset list so the Dashboard sees the new asset immediately (without full refresh)
      // This requires passing the 'setAssets' prop from App.js down to DashboardPage/AssetsPage or using a global state solution.
      
      alert(`Asset "${form.name}" added successfully!`);
      setCurrentPage('dashboard'); // Redirect to dashboard/assets list
    } catch (err) {
      setError("Failed to save asset. Check console for details.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#340158] mb-6">Add New Asset</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg flex flex-col gap-5">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="font-semibold text-gray-700 mb-1 block">Asset Name</label>
          <input 
            required 
            className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]" 
            placeholder="e.g. Server Rack #42"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-semibold text-gray-700 mb-1 block">Type</label>
            <select 
              className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
            >
              <option value="Laptop">Laptop</option>
              <option value="Mobile">Mobile</option>
              <option value="Furniture">Furniture</option>
              <option value="Vehicle">Vehicle</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="font-semibold text-gray-700 mb-1 block">Status</label>
            <select 
              className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              value={form.status}
              onChange={(e) => setForm({...form, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-semibold text-gray-700 mb-1 block">Location</label>
          <input 
            required 
            className="w-full border border-purple-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]" 
            placeholder="e.g. Warehouse A"
            value={form.location}
            onChange={(e) => setForm({...form, location: e.target.value})}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            type="submit"
            disabled={loading} 
            className="flex-1 bg-[#4B0082] hover:bg-[#340158] text-white py-3 rounded-lg font-bold transition disabled:opacity-50 shadow-md"
          >
            {loading ? "Saving..." : "Save Asset"}
          </button>
          <button 
            type="button" 
            onClick={() => setCurrentPage('dashboard')} 
            className="px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssetPage;