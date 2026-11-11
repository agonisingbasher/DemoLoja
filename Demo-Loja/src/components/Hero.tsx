import { ArrowRight, BadgePercent, Gamepad2, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export const Hero = () => <section className="relative isolate overflow-hidden bg-[#0c1424] text-white">
  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.22),transparent_42%),radial-gradient(circle_at_5%_90%,rgba(59,130,246,0.12),transparent_35%)]"/>
  <div className="absolute left-1/2 top-10 -z-10 h-96 w-96 rounded-full border border-white/5"/>
  <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.06fr_0.94fr] lg:py-20">
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-200"><Zap size={15}/> Universo gamer · Seleção TechStore</div>
      <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">O seu próximo <span className="text-orange-400">upgrade</span> começa aqui.</h1>
      <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">Consoles, periféricos, peças de PC e acessórios com uma experiência feita para quem respira tecnologia. Explore ofertas, compare detalhes e monte o seu setup.</p>
      <div className="mt-8 flex flex-wrap gap-3"><a href="#ofertas" className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-900/30 hover:bg-orange-500">Aproveitar ofertas <ArrowRight size={18}/></a><a href="#catalogo" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-4 text-sm font-black text-white hover:bg-white/10">Explorar catálogo <Gamepad2 size={19}/></a></div>
      <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-slate-400"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-400"/> Simulador sem cobrança</span><span className="flex items-center gap-2"><BadgePercent size={16} className="text-orange-400"/> Cupons demonstrativos</span><span className="flex items-center gap-2"><Sparkles size={16} className="text-cyan-400"/> Monte seu PC</span></div>
    </div>
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-5 rounded-full bg-orange-500/10 blur-3xl"/>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-slate-800 to-slate-950 p-6 shadow-2xl sm:p-9">
        <div className="mb-4 flex justify-between"><span className="rounded-full bg-orange-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider">Em destaque</span><span className="text-xs font-bold tracking-widest text-slate-400">TECHSTORE / 2026</span></div>
        <img src={import.meta.env.BASE_URL+'images/switch2.svg'} alt="Ilustração demonstrativa de console portátil para jogos" className="mx-auto h-56 w-full rounded-2xl object-contain shadow-xl sm:h-64"/>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-orange-400">Nova geração no catálogo</p><p className="mt-1 text-2xl font-black">Explore o universo Switch 2</p><p className="mt-1 text-xs text-slate-400">Console, controles e acessórios · Promoções ilustrativas</p></div><a href="#catalogo" className="rounded-xl bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/20">Ver produtos →</a></div>
      </div>
      
    </div>
  </div>
</section>;
