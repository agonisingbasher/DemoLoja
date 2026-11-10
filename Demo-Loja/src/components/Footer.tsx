import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone, ShieldCheck, Youtube } from 'lucide-react';

interface FooterProps {
  onInfoClick: (topic: string) => void;
}

const groups = [
  { title: 'Institucional', links: ['Sobre Nós', 'Trabalhe Conosco', 'Política de Privacidade', 'Termos de Uso'] },
  { title: 'Atendimento', links: ['Central de Ajuda', 'Trocas e Devoluções', 'Rastreamento', 'FAQ'] },
];

export const Footer = ({ onInfoClick }: FooterProps) => (
  <footer id="contato" className="bg-[#0b1220] text-slate-300">
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8">
      <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.35fr_1fr_1fr_1.1fr]">
        <div>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-3 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-950/30">T</span>
            <span><span className="block text-xl font-black tracking-tight text-white">tech<span className="text-orange-400">store</span></span><span className="block text-[10px] font-semibold uppercase tracking-[.22em] text-slate-500">Tecnologia & lifestyle</span></span>
          </button>
          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">Seu próximo upgrade começa aqui. Explore produtos, compare opções e monte um setup com a sua identidade.</p>
          <div className="mt-6 flex gap-2">
            {[
              { label: 'Facebook', Icon: Facebook },
              { label: 'Instagram', Icon: Instagram },
              { label: 'YouTube', Icon: Youtube },
            ].map(({ label, Icon }) => <button key={label} type="button" aria-label={label} onClick={() => onInfoClick('Redes sociais')} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:border-orange-400/50 hover:bg-orange-500/10 hover:text-orange-300"><Icon size={17}/></button>)}
          </div>
        </div>
        {groups.map(group => <div key={group.title}>
          <h3 className="text-sm font-extrabold uppercase tracking-[.16em] text-white">{group.title}</h3>
          <ul className="mt-5 space-y-3.5">
            {group.links.map(link => <li key={link}><button type="button" onClick={() => onInfoClick(link)} className="group inline-flex items-center gap-1 text-left text-sm text-slate-400 transition hover:text-orange-300">{link}<ArrowUpRight size={13} className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"/></button></li>)}
          </ul>
        </div>)}
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-[.16em] text-white">Fale com a gente</h3>
          <p className="mt-5 text-sm leading-6 text-slate-400">Precisa de ajuda para navegar pela loja demonstrativa? Consulte nossa central de ajuda.</p>
          <button type="button" onClick={() => onInfoClick('Central de Ajuda')} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400">Acessar atendimento <ArrowUpRight size={16}/></button>
          <div className="mt-5 space-y-3 text-xs text-slate-500">
            <p className="flex items-center gap-2"><Mail size={14}/> contato@techstore.example</p>
            <p className="flex items-center gap-2"><MapPin size={14}/> São Paulo, Brasil</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} TechStore. Todos os direitos reservados.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400"/> Ambiente de demonstração</span><button onClick={() => onInfoClick('Política de Privacidade')} className="hover:text-orange-300">Privacidade</button><button onClick={() => onInfoClick('Termos de Uso')} className="hover:text-orange-300">Termos</button></div>
      </div>
      <p className="mt-5 text-center text-[11px] leading-5 text-slate-600">Projeto educacional de e-commerce. Não representa uma operação comercial real; pedidos e informações são apenas demonstrativos.</p>
    </div>
  </footer>
);
