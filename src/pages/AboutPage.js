import React from 'react';


const AboutPage = ({ content }) => (
<div className="container mx-auto px-6 py-12 max-w-4xl">
<h1 className="text-3xl font-bold mb-4">About</h1>
<p className="text-slate-600 mb-6">We built TrackSphere to simplify cybersecurity for growing businesses. Below are our core values.</p>
<div className="grid md:grid-cols-3 gap-4">
{content.cards.map((c,i)=> (
<div key={i} className="bg-white p-6 rounded shadow">
<h3 className="font-bold mb-2">{c.title}</h3>
<p className="text-sm text-slate-600">{c.desc}</p>
</div>
))}
</div>
</div>
);


export default AboutPage;