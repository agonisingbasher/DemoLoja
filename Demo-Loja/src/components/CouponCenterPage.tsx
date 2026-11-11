import { useState } from 'react';
import { ArrowLeft, ArrowRight, BadgePercent, Check, ChevronDown, Clipboard, Gift, HelpCircle, ShoppingCart, Sparkles, TicketPercent, X } from 'lucide-react';
import { coupons, money } from '../lib/promotions';
import type { CouponBanner } from '../lib/couponBanner';
import { Footer } from './Footer';

type Props = {
  banner: CouponBanner;
  cartCount: number;
  onBack: () => void;
  onSelect: (code: string) => void;
  onInfoClick: (topic: string) => void;
};
const questions = [
  {q:'Como utilizar um cupom TechStore?',a:'Selecione o cupom nesta página, adicione um produto elegível ao carrinho e aplique o código na etapa de Carrinho ou Revisão do checkout simulado.'},
  {q:'Posso combinar vários cupons?',a:'Nesta demonstração, apenas um cupom pode ser aplicado por pedido. O desconto Pix ilustrativo pode ser exibido separadamente.'},
  {q:'Por que o meu cupom não funcionou?',a:'Verifique o valor mínimo, a categoria elegível e o conteúdo do carrinho. Os cupons funcionam apenas na TechStore demonstrativa.'},
  {q:'O desconto vale para o frete?',a:'Não. Cupons de produtos são calculados sobre os itens elegíveis, sem reduzir o frete ilustrativo.'},
  {q:'Receberei produtos ou um pagamento será cobrado?',a:'Não. A TechStore é um projeto de portfólio; preços, pedidos, fretes e cupons são simulações educacionais.'},
];
export function CouponCenterPage({banner,cartCount,onBack,onSelect,onInfoClick}:Props) {
  const [copied,setCopied] = useState('');
  const [faq,setFaq] = useState<number|null>(0);
  const [showEnded,setShowEnded] = useState(false);
  const copy=async(code:string)=>{
    try{await navigator.clipboard.writeText(code);setCopied(code);}
    catch{setCopied('');}
  };
  return <div className="min-h-screen bg-[#f2f5fa] text-slate-900">
    <div className="bg-[#08152e] py-2 text-center text-xs font-semibold text-slate-200">TechStore Demo · Cupons ilustrativos. Não há compras nem descontos comerciais reais.</div>
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0e2858] text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold hover:bg-white/10"><ArrowLeft size={19}/> Voltar à loja</button>
        <button onClick={onBack} className="text-xl font-black tracking-tight">Tech<span className="text-orange-400">Store</span></button>
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold hover:bg-orange-500"><ShoppingCart size={18}/><span className="hidden sm:inline">Carrinho</span> ({cartCount})</button>
      </div>
    </header>
    <main>
      <section className="relative isolate overflow-hidden bg-gradient-to-r from-[#0c2d75] via-[#102b67] to-[#06172f] text-white" style={banner.imageUrl ? {backgroundImage:'linear-gradient(90deg,rgba(6,21,51,.97),rgba(7,34,87,.82)),url("'+banner.imageUrl+'")',backgroundSize:'cover',backgroundPosition:'center'}:undefined}>
        <div className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl"/>
        <div className="absolute bottom-0 left-1/4 -z-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"/>
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-[1fr_0.7fr] md:py-20">
          <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-orange-300"><Sparkles size={16}/> {banner.eyebrow}</p><h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">{banner.title} <span className="text-orange-400">{banner.highlight}</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-300">{banner.description}</p><a href="#cupons" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-lg hover:bg-orange-500">Ver cupons disponíveis <ArrowRight size={18}/></a></div>
          <div aria-hidden="true" className="relative flex min-h-52 items-center justify-center">
            <div className="absolute h-64 w-64 rounded-full border-[26px] border-orange-500/20"/>
            <div className="relative rotate-[-11deg] rounded-3xl border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-500 to-orange-600 px-12 py-10 shadow-2xl shadow-black/40"><div className="flex items-center gap-3 text-white"><TicketPercent size={61}/><div><p className="text-5xl font-black">OFF</p><p className="text-xs font-bold tracking-widest">TECHSTORE</p></div></div></div>
            <div className="absolute bottom-0 right-[12%] rotate-[14deg] rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur"><Gift size={39}/></div>
          </div>
        </div>
      </section>
      <section id="cupons" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-7"><p className="text-xs font-black uppercase tracking-widest text-orange-600">Economize na simulação</p><h2 className="mt-2 text-3xl font-black">Cupons disponíveis</h2><p className="mt-2 text-sm text-slate-500">Selecione seu cupom para usar no checkout. As condições ficam visíveis em cada cartão.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{coupons.map((coupon,i)=><article key={coupon.code} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex min-h-48 gap-4 p-5">
            <div className="grid w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0e2f74] to-[#071a40] text-white sm:w-28"><div className="text-center"><BadgePercent size={32} className="mx-auto text-orange-400"/><p className="mt-2 text-xs font-bold">TECHSTORE</p></div></div>
            <div className="min-w-0 flex-1"><p className="text-xs font-black uppercase text-slate-500">{coupon.label}</p><p className="mt-2 text-2xl font-black text-emerald-700">{coupon.type==='percent'?coupon.value+'% OFF':money(coupon.value)+' OFF'}</p><p className="mt-2 text-sm leading-6 text-slate-600">{coupon.description}</p><p className="mt-2 text-xs font-semibold text-slate-500">Pedido mínimo {money(coupon.minSubtotal)}{coupon.category?' · categoria elegível':''}</p></div>
          </div>
          <div className="border-t border-dashed p-4">
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2"><code className="min-w-0 flex-1 truncate px-2 text-sm font-black tracking-wide text-[#0e2f74]">{coupon.code}</code><button onClick={()=>copy(coupon.code)} aria-label={'Copiar código '+coupon.code} className="rounded-md bg-[#0b347f] px-3 py-2 text-white hover:bg-[#1648a2]">{copied===coupon.code?<Check size={17}/>:<Clipboard size={17}/>}</button></div>
            <button onClick={()=>onSelect(coupon.code)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white hover:bg-orange-500">Selecionar cupom <ArrowRight size={17}/></button>
            <p className="mt-2 text-center text-[11px] text-slate-400">Oferta fictícia nº {String(i+1).padStart(2,'0')} · 1 cupom por pedido</p>
          </div>
        </article>)}</div>
      </section>
      <section className="bg-[#0e2e70] py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 lg:grid-cols-[.65fr_1.35fr]">
          <div><p className="text-xs font-black uppercase tracking-widest text-orange-300">Fácil de usar</p><h2 className="mt-2 text-3xl font-black">Como utilizar seu cupom?</h2><p className="mt-3 text-sm leading-7 text-blue-100">Três etapas para testar os descontos da TechStore.</p></div>
          <div className="grid gap-3 sm:grid-cols-3">{[['01','Escolha o código','Copie ou selecione um dos cupons acima.'],['02','Monte seu carrinho','Adicione um produto que atenda às condições.'],['03','Aplique no checkout','Confira o desconto na revisão do pedido.']].map(([n,title,desc])=><div key={n} className="rounded-2xl bg-[#081d4e] p-5"><p className="text-3xl font-black text-orange-400">{n}</p><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-xs leading-6 text-blue-100">{desc}</p></div>)}</div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <button onClick={()=>setShowEnded(v=>!v)} aria-expanded={showEnded} className="flex w-full items-center justify-between rounded-xl bg-[#0e2e70] px-5 py-4 text-left font-black text-white"><span>Cupons encerrados</span>{showEnded?<X size={18}/>:<ChevronDown size={18}/>}</button>
        {showEnded&&<p className="mt-3 rounded-xl border bg-white p-6 text-sm text-slate-500">Não há campanhas encerradas nesta versão demonstrativa.</p>}
        <h2 className="mt-12 flex items-center gap-2 text-2xl font-black"><HelpCircle className="text-orange-600"/> Perguntas frequentes</h2>
        <div className="mt-5 space-y-2">{questions.map((item,i)=><div key={item.q} className="overflow-hidden rounded-xl border bg-white"><button onClick={()=>setFaq(faq===i?null:i)} aria-expanded={faq===i} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-bold hover:text-orange-700">{item.q}<ChevronDown size={18} className={faq===i?'rotate-180':''}/></button>{faq===i&&<p className="border-t px-5 py-4 text-sm leading-6 text-slate-600">{item.a}</p>}</div>)}</div>
      </section>
    </main>
    <Footer onInfoClick={onInfoClick}/>
  </div>;
}
