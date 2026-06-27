import{C as e,T as t,w as n}from"./index-COTgQzAq.js";var r=n();function i({code:n,title:i,description:a,accentClassName:o,src:s}){let{sesion:c,isAdmin:l}=e(),u=c?l?`/admin`:`/`:`/login`,d=c?`Volver al inicio`:`Iniciar sesión`;return(0,r.jsxs)(`div`,{className:`min-h-screen flex flex-col items-center justify-center p-8 select-none`,style:{background:`linear-gradient(155deg, #0f172a 0%, #042f1e 100%)`},children:[(0,r.jsx)(`style`,{children:`
        @keyframes nf-raise {
          0%   { transform: translateY(110px); opacity: 0; }
          55%  { opacity: 1; }
          100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
        @keyframes nf-sway {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(0) rotate(5deg); }
        }
        @keyframes nf-fade-up {
          0%   { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        .nf-arm {
          transform-origin: 50% 100%;
          animation:
            nf-raise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both,
            nf-sway  2.8s ease-in-out 1.2s infinite;
        }
        .nf-text-1 { animation: nf-fade-up 0.5s ease-out 1.0s both; }
        .nf-text-2 { animation: nf-fade-up 0.5s ease-out 1.2s both; }
        .nf-text-3 { animation: nf-fade-up 0.5s ease-out 1.35s both; }
        .nf-text-4 { animation: nf-fade-up 0.5s ease-out 1.5s both; }
      `}),(0,r.jsx)(`img`,{src:s,alt:`Tarjeta`,className:`nf-arm mb-8`,style:{width:500,height:`auto`}}),(0,r.jsx)(`p`,{className:`nf-text-1 text-[88px] font-black text-white leading-none tracking-tighter mb-1`,children:n}),(0,r.jsx)(`h1`,{className:`nf-text-2 text-2xl font-bold mb-3 ${o}`,children:i}),(0,r.jsx)(`p`,{className:`nf-text-3 text-slate-400 text-base text-center mb-8 max-w-xs leading-relaxed`,children:a}),(0,r.jsx)(`div`,{className:`nf-text-4`,children:(0,r.jsx)(t,{to:u,className:`inline-block bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-[15px]`,children:c?`← ${d}`:`${d} →`})})]})}export{i as t};