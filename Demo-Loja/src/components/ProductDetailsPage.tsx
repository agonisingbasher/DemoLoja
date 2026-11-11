import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, BadgePercent, CheckCircle2, ChevronRight, Clock3, CreditCard, Heart, MapPin, PackageCheck, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react';
import type { Product } from '../lib/supabase';
import { Footer } from './Footer';
import { ProductCard } from './ProductCard';
import { installments, money } from '../lib/promotions';

export type LocalReview = { id: string; name: string; score: number; title: string; comment: string; date: string };
type Props = {
  product: Product; products: Product[];
  favorite: boolean; onToggleFavorite: (id:string)=>void; onBack:()=>void;
  onAddToCart:(id:string)=>void; onViewProduct:(id:string)=>void; onOpenCart:()=>void;
  onInfoClick:(topic:string)=>void;
};
function getReviews(productId:string):LocalReview[] {
  try {
    const v=JSON.parse(localStorage.getItem('techstore_reviews_v1_'+productId)||'[]');
    return Array.isArray(v)?v.filter((item:LocalReview)=>item.name&&item.comment):[];
  }catch{return [];}
}
const demoExamples:LocalReview[] = [
  {id:'sample-a',name:'Cliente exemplo • Camila',score:5,title:'Uma boa experiência de navegação',comment:'Avaliação fictícia para demonstrar como opiniões de compradores apareceriam nesta loja.',date:'2026-10-15'},
  {id:'sample-b',name:'Cliente exemplo • Rafael',score:4,title:'Gostei dos detalhes do produto',comment:'Comentário ilustrativo. Em uma operação real, esta seção teria avaliações verificadas.',date:'2026-10-04'}
];
export function ProductDetailsPage({product,products,favorite,onToggleFavorite,onBack,onAddToCart,onViewProduct,onOpenCart,onInfoClick}:Props) {
  const [cep,setCep]=useState('');
  const [shipping,setShipping]=useState(false);
  const [reviews,setReviews]=useState<LocalReview[]>(()=>getReviews(product.id));
  const [name,setName]=useState('');
  const [headline,setHeadline]=useState('');
  const [message,setMessage]=useState('');
  const [score,setScore]=useState(5);
  const [showAllReviews,setShowAllReviews]=useState(false);
  useEffect(()=>{setReviews(getReviews(product.id));setShipping(false);setCep('');window.scrollTo(0,0);},[product.id]);
  const recommendations=products.filter(p=>p.id!==product.id && p.stock>0).sort((a,b)=>Number(b.category_id===product.category_id)-Number(a.category_id===product.category_id) || b.rating-a.rating).slice(0,4);
  const discount=product.original_price?Math.round((1-product.price/product.original_price)*100):0;
  const reviewList=[...reviews,...demoExamples];
  const avg=reviewList.reduce((n,r)=>n+r.score,0)/reviewList.length;
  const submitReview=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!name.trim()||!message.trim())return;
    const review={id:'review-'+Date.now(),name:name.trim().slice(0,32),score,title:headline.trim().slice(0,80)||'Minha avaliação',comment:message.trim().slice(0,1000),date:new Date().toISOString()};
    const next=[review,...reviews];
    setReviews(next);localStorage.setItem('techstore_reviews_v1_'+product.id,JSON.stringify(next));
    setName('');setHeadline('');setMessage('');setScore(5);setShowAllReviews(true);
  };
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="border-b bg-slate-950 px-4 py-2 text-center text-xs font-medium text-white">TechStore • Loja demonstrativa · Preços e fretes ilustrativos · Nenhuma cobrança real</div>
    <header className="sticky top-0 z-30 border-b bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
        <button onClick={onBack} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"><ArrowLeft size={18}/> Voltar à loja</button>
        <button onClick={onBack} className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900"><span className="rounded-lg bg-orange-600 px-2.5 py-1.5 text-white">T</span> Tech<span className="text-orange-600">Store</span></button>
        <button onClick={onOpenCart} className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-100"><ShoppingCart size={19}/> Carrinho</button>
      </div>
    </header>
    <main>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-5">
        <nav aria-label="Caminho de navegação" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500"><button onClick={onBack} className="hover:text-orange-600">Início</button><ChevronRight size={13}/><span className="capitalize">{product.category_id}</span><ChevronRight size={13}/><strong className="text-slate-700">{product.name}</strong></nav>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[1.1fr_1fr_315px]">
          <section className="min-w-0">
            <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-3xl border bg-white p-6 shadow-sm sm:min-h-[475px]">
              {discount>0&&<span className="absolute left-5 top-5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white">-{discount}% OFF</span>}
              <img src={product.image_url} alt={product.name} className="max-h-[440px] w-full object-contain" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=import.meta.env.BASE_URL+'images/monitor.svg';}}/>
            </div>
            <div className="mt-3 flex gap-3">{[0,1,2].map(i=><div key={i} className="grid h-20 w-24 place-items-center rounded-xl border border-orange-200 bg-white p-2"><img src={product.image_url} alt="" className="h-full w-full object-contain"/></div>)}</div>
          </section>
          <section className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">TechStore Selection</span><span className="text-xs font-semibold text-slate-400">Cód: {product.id}</span></div>
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{product.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm"><div className="flex text-amber-500">{Array.from({length:5},(_,i)=><Star key={i} size={17} className={i<Math.round(avg)?'fill-current':''}/>)}</div><strong>{avg.toFixed(1)}</strong><a href="#avaliacoes" className="text-orange-600 hover:underline">{reviewList.length} avaliações demonstrativas</a><button onClick={()=>onToggleFavorite(product.id)} className="ml-auto flex items-center gap-1 font-bold text-slate-500 hover:text-rose-600"><Heart size={18} className={favorite?'fill-rose-500 text-rose-500':''}/> {favorite?'Salvo':'Favoritar'}</button></div>
            <div className="mt-7 rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-extrabold uppercase tracking-widest text-orange-600">Ficha técnica</p>
              <h2 className="mt-2 text-lg font-black">Especificações e recursos</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{product.details||product.description}</p>
              <dl className="mt-4 divide-y divide-slate-100">{[['Marca/modelo',product.name],['Categoria',product.category_id],['Referência',product.id],...(product.features||[]).map((f,i)=>['Característica '+String(i+1),f])].map(([key,value])=><div key={key} className="grid grid-cols-[125px_1fr] gap-3 py-3 text-sm sm:grid-cols-[145px_1fr]"><dt className="font-semibold text-slate-500">{key}</dt><dd className="font-medium text-slate-800">{value}</dd></div>)}</dl>
              <p className="mt-3 text-xs text-slate-400">Ficha ilustrativa de demonstração. Confirme especificações exatas com o fabricante.</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border bg-white p-4"><ShieldCheck size={21} className="shrink-0 text-emerald-600"/><div><p className="text-sm font-bold">Compra protegida</p><p className="text-xs text-slate-500">Fluxo simulado, sem cobrança</p></div></div>
              <div className="flex items-start gap-3 rounded-xl border bg-white p-4"><PackageCheck size={21} className="shrink-0 text-orange-600"/><div><p className="text-sm font-bold">Informações da entrega</p><p className="text-xs text-slate-500">Prazos fictícios para demonstração</p></div></div>
            </div>
          </section>
          <aside className="h-fit space-y-4 xl:sticky xl:top-24">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              {product.original_price&&<p className="text-sm text-slate-400 line-through">{money(product.original_price)}</p>}
              <p className="mt-1 text-3xl font-black text-orange-600">{money(product.price)}</p>
              <p className="mt-2 text-sm font-semibold text-emerald-700">No Pix demonstrativo: {money(product.price*0.95)} (5% OFF)</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-700"><CreditCard size={17}/> ou até <strong>10x de {installments(product.price)}</strong> sem juros*</p>
              <p className={'mt-4 text-sm font-bold '+(product.stock>0?'text-emerald-700':'text-rose-600')}>{product.stock>0?'● Em estoque: '+product.stock+' unidades':'● Esgotado'}</p>
              <button disabled={product.stock<=0} onClick={()=>onAddToCart(product.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-4 font-black text-white hover:bg-orange-700 disabled:bg-slate-300"><ShoppingCart size={19}/> Adicionar ao carrinho</button>
              <button onClick={()=>onToggleFavorite(product.id)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold text-slate-700 hover:border-rose-300"><Heart size={18} className={favorite?'fill-rose-500 text-rose-500':''}/> {favorite?'Remover favorito':'Salvar nos favoritos'}</button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-500">*Parcelas, descontos e preços apenas ilustrativos.</p>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-black"><Truck size={19} className="text-orange-600"/> Simular frete</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">Digite um CEP para visualizar opções simuladas. Nenhuma consulta externa será feita.</p>
              <div className="mt-3 flex gap-2"><input inputMode="numeric" aria-label="CEP" maxLength={9} value={cep} onChange={e=>{setCep(e.target.value.replace(/[^\d-]/g,''));setShipping(false);}} placeholder="00000-000" className="w-full min-w-0 rounded-xl border px-3 py-2.5 text-sm"/><button disabled={cep.replace(/\D/g,'').length!==8} onClick={()=>setShipping(true)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">Calcular</button></div>
              {shipping&&<div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-xs"><p className="flex items-center justify-between"><span>Entrega econômica · 7–10 dias úteis</span><b>{product.price>=499?'Grátis':money(19.9)}</b></p><p className="flex items-center justify-between"><span>Entrega expressa · 3–5 dias úteis</span><b>{money(34.9)}</b></p><p className="mt-2 text-slate-400">Prazos e valores fictícios; não há transportadora.</p></div>}
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><MapPin size={15}/> Entregas não realizadas nesta demonstração</p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4"><p className="flex items-center gap-2 font-black text-orange-800"><BadgePercent size={18}/> Tem cupom?</p><p className="mt-2 text-sm text-orange-900">Aplique códigos promocionais demonstrativos ao finalizar a compra.</p></div>
          </aside>
        </div>
      </div>
      <section className="border-y bg-white py-12" id="avaliacoes">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-orange-600">Comunidade</p><h2 className="mt-1 text-3xl font-black">Avaliações e comentários</h2><p className="mt-2 text-sm text-slate-500">Exemplos fictícios identificados + opiniões locais enviadas neste navegador. Não são compras verificadas.</p></div><div className="rounded-xl bg-slate-100 px-5 py-3"><p className="text-3xl font-black">{avg.toFixed(1)} <span className="text-base text-slate-500">/ 5</span></p><p className="text-xs text-slate-500">{reviewList.length} avaliações demonstrativas</p></div></div>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">{reviewList.slice(0,showAllReviews?undefined:3).map(r=><article key={r.id} className="rounded-2xl border p-5"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold">{r.name}</p><span className="flex gap-1 text-amber-500">{Array.from({length:5},(_,i)=><Star key={i} size={15} className={i<r.score?'fill-current':''}/>)}</span></div><p className="mt-2 font-black">{r.title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{r.comment}</p><div className="mt-3 flex items-center gap-1 text-xs text-slate-400"><Clock3 size={13}/>{new Date(r.date).toLocaleDateString('pt-BR')} · {r.id.startsWith('sample')?'Exemplo fictício':'Enviado neste navegador'}</div></article>)}<button onClick={()=>setShowAllReviews(v=>!v)} className="text-sm font-bold text-orange-700 hover:underline">{showAllReviews?'Mostrar menos':'Ver todos os comentários'} ({reviewList.length})</button></div>
            <form onSubmit={submitReview} className="h-fit rounded-2xl bg-slate-50 p-5"><h3 className="text-lg font-black">Escreva sua avaliação</h3><p className="mt-1 text-xs text-slate-500">Publicação local de demonstração, visível apenas neste navegador. Não use dados pessoais.</p><label className="mt-4 block text-sm font-semibold">Apelido<input maxLength={32} required value={name} onChange={e=>setName(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5" placeholder="Seu apelido"/></label><label className="mt-3 block text-sm font-semibold">Nota<select value={score} onChange={e=>setScore(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} estrela{n>1?'s':''}</option>)}</select></label><label className="mt-3 block text-sm font-semibold">Título<input maxLength={80} value={headline} onChange={e=>setHeadline(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5"/></label><label className="mt-3 block text-sm font-semibold">Comentário<textarea required maxLength={1000} rows={4} value={message} onChange={e=>setMessage(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5"/></label><button className="mt-4 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800">Publicar comentário local</button></form>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12"><div className="mb-7"><p className="text-xs font-black uppercase tracking-widest text-orange-600">Combine com seu setup</p><h2 className="mt-2 text-3xl font-black">Você também pode gostar</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recommendations.map(p=><ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onViewDetails={onViewProduct}/>)}</div></section>
    </main>
    <Footer onInfoClick={onInfoClick}/>
  </div>;
}
