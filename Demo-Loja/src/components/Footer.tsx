import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone, ShieldCheck, Truck, CreditCard, Headphones, Youtube } from 'lucide-react';

interface FooterProps {
  onInfoClick: (topic: string) => void;
}

const institutional = ['Sobre Nós', 'Trabalhe Conosco', 'Política de Privacidade', 'Termos de Uso'];
const support = ['Central de Ajuda', 'Trocas e Devoluções', 'Rastreamento', 'FAQ'];

export const Footer = ({ onInfoClick }: FooterProps) => {
  const linkClass = 'group inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white';
  const socialClass = 'grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:-translate-y-0.5 hover:border-orange-400/50 hover:bg-orange-500 hover:text-white';

  return (
    <footer id="contato" className="bg-[#080f1d] text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:grid-cols-3 lg:px-8">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-orange-400"><ShieldCheck size={21}/></span><div><p className="text-sm font-bold">Ambiente demonstrativo</p><p className="mt-0.5 text-xs text-slate-400">Experimente sem cobranças reais</p></div></div>
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-orange-400"><Truck size={21}/></span><div><p className="text-sm font-bold">Fluxo de pedidos simulado</p><p className="mt-0.5 text-xs text-slate-400">Sem envio ou entrega de produtos</p></div></div>
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-orange-400"><Headphones size={21}/></span><div><p className="text-sm font-bold">Central de informações</p><p className="mt-0.5 text-xs text-slate-400">Orientações sobre os recursos da loja</p></div></div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:px-8 lg:py-16">
        <div>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white"><CreditCard size={20}/></span>
            <span className="text-2xl font-black tracking-tight">Tech<span className="text-orange-400">Store</span></span>
          </button>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">Tecnologia, games e acessórios para inspirar seu próximo setup. Explore uma experiência de e-commerce criada para demonstração.</p>
          <div className="mt-6 flex gap-2">
            <button type="button" aria-label="Facebook" onClick={() => onInfoClick('Redes sociais')} className={socialClass}><Facebook size={18}/></button>
            <button type="button" aria-label="Instagram" onClick={() => onInfoClick('Redes sociais')} className={socialClass}><Instagram size={18}/></button>
            <button type="button" aria-label="YouTube" onClick={() => onInfoClick('Redes sociais')} className={socialClass}><Youtube size={18}/></button>
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-extrabold uppercase tracking-[0.14em] text-white">Institucional</h3>
          <ul className="space-y-3">{institutional.map(topic => <li key={topic}><button type="button" onClick={() => onInfoClick(topic)} className={linkClass}>{topic}<ArrowUpRight size={13} className="opacity-0 transition group-hover:opacity-100"/></button></li>)}</ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-extrabold uppercase tracking-[0.14em] text-white">Ajuda e suporte</h3>
          <ul className="space-y-3">{support.map(topic => <li key={topic}><button type="button" onClick={() => onInfoClick(topic)} className={linkClass}>{topic}<ArrowUpRight size={13} className="opacity-0 transition group-hover:opacity-100"/></button></li>)}</ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-extrabold uppercase tracking-[0.14em] text-white">Fale com a gente</h3>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-orange-400"/><span><strong className="block font-semibold text-slate-200">E-mail</strong>contato@techstore.example</span></li>
            <li className="flex items-start gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-orange-400"/><span><strong className="block font-semibold text-slate-200">Telefone</strong>(11) 99999-9999</span></li>
            <li className="flex items-start gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-orange-400"/><span><strong className="block font-semibold text-slate-200">Localização</strong>São Paulo, SP · Brasil</span></li>
          </ul>
          <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-5 text-slate-500">Informações de contato ilustrativas. Os canais ainda não recebem mensagens reais.</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} TechStore. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><button type="button" onClick={() => onInfoClick('Política de Privacidade')} className="transition hover:text-white">Privacidade</button><button type="button" onClick={() => onInfoClick('Termos de Uso')} className="transition hover:text-white">Termos de uso</button><span>Projeto demonstrativo · Sem transações reais</span></div>
        </div>
      </div>
    </footer>
  );
};
