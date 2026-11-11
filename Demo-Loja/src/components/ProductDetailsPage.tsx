import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, BadgePercent, CheckCircle2, ChevronRight, Clock3, CreditCard, Heart, MapPin, PackageCheck, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react';
import type { Product } from '../lib/supabase';
import { Footer } from './Footer';
import { ProductCard } from './ProductCard';
import { installments, money } from '../lib/promotions';
import type { DemoSale } from './AdminPanel';
import type { AccountProfile } from '../lib/customerAccount';
import { supabase } from '../lib/supabase';

export type LocalReview = { id: string; name: string; score: number; title: string; comment: string; date: string; accountId?:string; orderId?:string };
type Props = {
  product: Product; products: Product[]; orders:DemoSale[]; account:AccountProfile|null;
  favorite: boolean; onToggleFavorite: (id:string)=>void; onBack:()=>void;
  onAddToCart:(id:string)=>void; onViewProduct:(id:string)=>void; onOpenCart:()=>void;
  onInfoClick:(topic:string)=>void;
};
function getReviews(productId:string):LocalReview[] {
  try {
    const v=JSON.parse(localStorage.getItem('techstore_reviews_v1_'+productId)||'[]');
    return Array.isArray(v)?v.filter((item:LocalReview)=>item.name&&item.comment && Number.isFinite(new Date(item.date).getTime()) && Date.now()-new Date(item.date).getTime()<7*86400000):[];
  }catch{return [];}
}
// Reviews come from completed demo orders. No fabricated customer testimonials.
const demoExamples:LocalReview[] = [];
export function ProductDetailsPage({product,products,orders,account,favorite,onToggleFavorite,onBack,onAddToCart,onViewProduct,onOpenCart,onInfoClick}:Props) {
  const [cep,setCep]=useState('');
  const [shipping,setShipping]=useState(false);
  const [reviews,setReviews]=useState<LocalReview[]>(()=>getReviews(product.id));
  const [name,setName]=useState('');
  const [headline,setHeadline]=useState('');
  const [message,setMessage]=useState('');
  const [score,setScore]=useState(5);
  const [showAllReviews,setShowAllReviews]=useState(false);
  const [infoTab,setInfoTab]=useState<'description'|'specs'>('description');
  const [reviewError,setReviewError]=useState('');
  useEffect(()=>{
    setShipping(false);setCep('');window.scrollTo(0,0);
    let mounted=true;
    const load=async()=>{
      if(account?.demo){if(mounted)setReviews(getReviews(product.id));return;}
      if(supabase){
        const {data,error}=await supabase.from('store_reviews')
          .select('id,user_id,nickname,rating,title,comment,created_at')
          .eq('product_id',product.id).order('created_at',{ascending:false});
        if(!error && data){
          if(mounted)setReviews(data.map(row=>({
            id:row.id,name:row.nickname,accountId:row.user_id,score:row.rating,
            title:row.title,comment:row.comment,date:row.created_at
          })));
          return;
        }
      }
      if(mounted)setReviews(getReviews(product.id));
    };
    void load();
    return ()=>{mounted=false;};
  },[product.id,account?.demo]);
  const recommendations=products.filter(p=>p.id!==product.id && p.stock>0).sort((a,b)=>Number(b.category_id===product.category_id)-Number(a.category_id===product.category_id) || b.rating-a.rating).slice(0,4);
  const discount=product.original_price?Math.round((1-product.price/product.original_price)*100):0;
  const reviewList=[...reviews,...demoExamples];
  const eligibleOrder=account?orders.find(order=>(order.userId===account.id || (!order.userId && order.email.trim().toLowerCase()===account.email.trim().toLowerCase())) && order.status!=='Cancelado' && (account.demo || order.backendRecorded) && order.items.some(item=>item.productId===product.id) && Date.now()-new Date(order.date).getTime()<7*86400000):undefined;
  const alreadyReviewed=Boolean(account && reviews.some(r=>r.accountId===account.id || (!r.accountId && r.orderId===eligibleOrder?.id)));
  const canReview=Boolean(account && eligibleOrder && !alreadyReviewed);
  const summaries=[
    {title:'Visão geral',detail:product.description},
    {title:'Especificações técnicas',detail:(product.features||[]).slice(0,2).join(' · ')||'Consulte a descrição e as especificações cadastradas para este item.'},
    {title:'Compatibilidade',detail:(product.features||[]).find(f=>/compat|socket|ddr|interface|conex|plataforma|sistema|usb|pcie|suporte/i.test(f))||'Verifique modelo, conexões e requisitos de compatibilidade antes de escolher.'},
    {title:'Recursos e desempenho',detail:(product.features||[]).slice(2,4).join(' · ')||'Os recursos variam conforme a configuração e o fabricante.'}
  ];
  const avg=reviewList.length?reviewList.reduce((n,r)=>n+r.score,0)/reviewList.length:0;
  const submitReview=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!canReview || !account || !eligibleOrder){setReviewError('Só é possível avaliar uma vez, após concluir um pedido demonstrativo deste item com a conta conectada.');return;}
    if(!name.trim() || !message.trim())return;
    const review:LocalReview={id:'review-'+Date.now(),name:name.trim().slice(0,32),score,title:headline.trim().slice(0,80)||'Minha avaliação',comment:message.trim().slice(0,1000),date:new Date().toISOString(),accountId:account.id,orderId:eligibleOrder.id};
    if(supabase && !account.demo){
      const {data,error}=await supabase.from('store_reviews').insert({
        product_id:product.id,user_id:account.id,nickname:review.name,
        rating:review.score,title:review.title,comment:review.comment
      }).select('id,created_at').single();
      if(error){
        setReviewError(error.code==='23505'?'Esta conta já avaliou este produto.':error.message);
        return;
      }
      review.id=data.id;review.date=data.created_at;
    }else{
      const next=[review,...reviews];localStorage.setItem('techstore_reviews_v1_'+product.id,JSON.stringify(next));
    }
    setReviews(current=>[review,...current.filter(r=>r.accountId!==account.id)]);
    setName('');setHeadline('');setMessage('');setScore(5);setShowAllReviews(true);setReviewError('');
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500"><span>Imagem demonstrativa do produto. A aparência exata pode variar conforme o modelo.</span><span className="font-bold text-orange-700">Veja informações técnicas ao lado →</span></div>
          </section>
          <section className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">TechStore Selection</span><span className="text-xs font-semibold text-slate-400">Cód: {product.id}</span></div>
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{product.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm"><div className="flex text-amber-500">{Array.from({length:5},(_,i)=><Star key={i} size={17} className={i<Math.round(avg)?'fill-current':''}/>)}</div><strong>{reviewList.length?avg.toFixed(1):'Sem nota'}</strong><a href="#avaliacoes" className="text-orange-600 hover:underline">{reviewList.length} avaliações demonstrativas</a><button onClick={()=>onToggleFavorite(product.id)} className="ml-auto flex items-center gap-1 font-bold text-slate-500 hover:text-rose-600"><Heart size={18} className={favorite?'fill-rose-500 text-rose-500':''}/> {favorite?'Salvo':'Favoritar'}</button></div>

            <section className="mt-7 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black text-slate-900">Sobre o produto</h2><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">Resumo elaborado com IA a partir do catálogo</span></div>
              <ul className="mt-5 space-y-4">{summaries.map(item=><li key={item.title} className="flex gap-3 text-sm leading-7 text-slate-700"><CheckCircle2 size={19} className="mt-1 shrink-0 text-emerald-600"/><div><strong className="text-slate-900">{item.title}:</strong> {item.detail}</div></li>)}</ul>
              <p className="mt-4 text-xs leading-5 text-slate-400">Resumo informativo baseado nas características cadastradas. Consulte os dados oficiais do fabricante antes de uma compra real.</p>
              <div className="mt-4 flex flex-wrap gap-3"><button onClick={()=>{setInfoTab('description');document.getElementById('produto-informacoes')?.scrollIntoView({behavior:'smooth'});}} className="text-sm font-black text-orange-700 hover:underline">Ver descrição ↓</button><button onClick={()=>{setInfoTab('specs');document.getElementById('produto-informacoes')?.scrollIntoView({behavior:'smooth'});}} className="text-sm font-black text-orange-700 hover:underline">Ver informações técnicas ↓</button></div>
            </section>
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
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-orange-600">Comunidade</p><h2 className="mt-1 text-3xl font-black">Avaliações e comentários</h2><p className="mt-2 text-sm text-slate-500">Avaliações de contas que concluíram pedidos simulados deste produto. Não representam compras reais. Histórico de demonstração removido após sete dias.</p></div><div className="rounded-xl bg-slate-100 px-5 py-3"><p className="text-3xl font-black">{reviewList.length?avg.toFixed(1):'—'} <span className="text-base text-slate-500">/ 5</span></p><p className="text-xs text-slate-500">{reviewList.length} avaliações demonstrativas</p></div></div>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">{!reviewList.length&&<p className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-500">Ainda não há avaliações deste produto. Quem concluir um pedido demonstrativo poderá escrever a primeira.</p>}{reviewList.slice(0,showAllReviews?undefined:3).map(r=><article key={r.id} className="rounded-2xl border p-5"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold">{r.name}</p><span className="flex gap-1 text-amber-500">{Array.from({length:5},(_,i)=><Star key={i} size={15} className={i<r.score?'fill-current':''}/>)}</span></div><p className="mt-2 font-black">{r.title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{r.comment}</p><div className="mt-3 flex items-center gap-1 text-xs text-slate-400"><Clock3 size={13}/>{new Date(r.date).toLocaleDateString('pt-BR')} · {r.id.startsWith('sample')?'Exemplo fictício':'Enviado neste navegador'}</div></article>)}<button onClick={()=>setShowAllReviews(v=>!v)} className="text-sm font-bold text-orange-700 hover:underline">{showAllReviews?'Mostrar menos':'Ver todos os comentários'} ({reviewList.length})</button></div>
            {canReview?<form onSubmit={submitReview} className="h-fit rounded-2xl bg-slate-50 p-5"><h3 className="text-lg font-black">Avalie seu produto</h3><p className="mt-1 text-xs text-slate-500">Você concluiu um pedido demonstrativo deste item. Sua avaliação é publicada apenas neste navegador e expira em sete dias.</p><label className="mt-4 block text-sm font-semibold">Apelido<input maxLength={32} required value={name} onChange={e=>setName(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5" placeholder="Seu apelido"/></label><label className="mt-3 block text-sm font-semibold">Nota<select value={score} onChange={e=>setScore(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} estrela{n>1?'s':''}</option>)}</select></label><label className="mt-3 block text-sm font-semibold">Título<input maxLength={80} value={headline} onChange={e=>setHeadline(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5"/></label><label className="mt-3 block text-sm font-semibold">Comentário<textarea required maxLength={1000} rows={4} value={message} onChange={e=>setMessage(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5"/></label>{reviewError&&<p role="alert" className="mt-3 text-sm text-rose-700">{reviewError}</p>}<button className="mt-4 w-full rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700">Publicar minha avaliação</button></form>:<aside className="h-fit rounded-2xl border border-orange-100 bg-orange-50 p-6"><h3 className="text-lg font-black text-slate-900">{alreadyReviewed?'Você já avaliou este produto':'Avaliações exclusivas de compradores'}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{alreadyReviewed?'Obrigado por avaliar. Permitimos somente uma avaliação por produto e por conta.':!account?'Entre ou crie uma conta para acompanhar seus pedidos e avaliar os itens depois de concluir uma compra demonstrativa.':'Depois de concluir um pedido demonstrativo deste produto com esta conta, você poderá avaliá-lo uma vez.'}</p><p className="mt-3 text-xs text-slate-500">Não são avaliações de compras reais verificadas. As avaliações locais são apagadas após sete dias.</p></aside>}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12"><div className="mb-7"><p className="text-xs font-black uppercase tracking-widest text-orange-600">Combine com seu setup</p><h2 className="mt-2 text-3xl font-black">Você também pode gostar</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recommendations.map(p=><ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onViewDetails={onViewProduct}/>)}</div></section>

      <section id="produto-informacoes" className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-black uppercase tracking-widest text-orange-600">Conheça todos os detalhes</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Descrição e informações técnicas</h2>
          <div className="mt-6 flex flex-wrap gap-2 border-b pb-3" role="tablist" aria-label="Informações do produto">
            <button role="tab" aria-selected={infoTab==='description'} onClick={()=>setInfoTab('description')} className={'rounded-xl px-5 py-3 text-sm font-black '+(infoTab==='description'?'bg-orange-600 text-white':'bg-slate-100 text-slate-700 hover:bg-slate-200')}>Ver descrição</button>
            <button role="tab" aria-selected={infoTab==='specs'} onClick={()=>setInfoTab('specs')} className={'rounded-xl px-5 py-3 text-sm font-black '+(infoTab==='specs'?'bg-orange-600 text-white':'bg-slate-100 text-slate-700 hover:bg-slate-200')}>Ver informações técnicas</button>
          </div>
          {infoTab==='description'?<article role="tabpanel" className="mt-6 rounded-2xl border bg-slate-50 p-6 sm:p-9"><h3 className="text-xl font-black">{product.name}</h3><p className="mt-4 leading-8 text-slate-700">{product.details||product.description}</p><p className="mt-4 leading-7 text-slate-600">{product.description}</p></article>:<article role="tabpanel" className="mt-6 overflow-hidden rounded-2xl border"><table className="w-full text-left text-sm"><tbody>{[['Produto',product.name],['Categoria',product.category_id],['Código',product.id],...(product.features||[]).map((feature,i)=>['Especificação '+(i+1),feature])].map(([label,value],i)=><tr key={label} className={i%2===0?'bg-slate-50':'bg-white'}><th scope="row" className="w-1/3 border-r px-5 py-4 font-black text-slate-700">{label}</th><td className="px-5 py-4 text-slate-600">{value}</td></tr>)}</tbody></table><p className="border-t bg-orange-50 px-5 py-4 text-xs text-orange-900">Dados ilustrativos extraídos do catálogo; especificações completas devem ser confirmadas no site oficial do fabricante.</p></article>}
        </div>
      </section>
    </main>
    <Footer onInfoClick={onInfoClick}/>
  </div>;
}
