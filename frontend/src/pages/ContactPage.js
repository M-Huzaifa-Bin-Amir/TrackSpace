import React, { useState } from 'react';
// 1. REMOVED the import line for saveContactForm

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    // 2. REMOVED the actual Firebase call
    // We just pretend it worked for now so the app doesn't crash
    console.log("Form Data:", form); 
    setStatus('Feature coming soon! (Backend not connected yet)');
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-lg">
      <h1 className="text-2xl font-bold mb-4 text-[#340158]">Contact Support</h1>
      <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input 
          value={form.name} 
          onChange={e=>setForm({...form, name: e.target.value})} 
          placeholder="Name" 
          className="w-full border border-purple-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]" 
        />
        <input 
          value={form.email} 
          onChange={e=>setForm({...form, email: e.target.value})} 
          placeholder="Email" 
          className="w-full border border-purple-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]" 
        />
        <textarea 
          value={form.message} 
          onChange={e=>setForm({...form, message: e.target.value})} 
          placeholder="Message" 
          className="w-full border border-purple-200 p-3 rounded h-32 focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]" 
        />
        <button className="w-full bg-[#7e3ff2] hover:bg-[#4b0082] text-white font-bold px-4 py-3 rounded transition-colors">
          Send Message
        </button>
      </form>
      {status && <p className="mt-4 text-center text-gray-600">{status}</p>}
    </div>
  );
};

export default ContactPage;