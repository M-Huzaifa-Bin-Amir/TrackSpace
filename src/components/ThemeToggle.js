import React from 'react';


const ThemeToggle = ({ theme, setTheme }) => {
const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
return (
<button onClick={toggle} className="px-3 py-1 rounded bg-slate-200 text-slate-800">{theme === 'light' ? '🌞' : '🌙'}</button>
);
};


export default ThemeToggle;