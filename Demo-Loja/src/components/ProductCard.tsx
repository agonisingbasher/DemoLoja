import { Eye, ShoppingCart, Star, Truck } from 'lucide-react';
import type { Product } from '../lib/supabase';
import { installments, money } from '../lib/promotions';

type Props={product:Product;onAddToCart:(id:string)=>void;onViewDetails:(id:string)=>void};
export const ProductCard=({product,onAddToCart,onViewDetails}:Props)=>{
  const discount=product.original_price?Math.max(0,Math.round(100*(1-product.price/product.original_price))):0;
  return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
    <button onClick={()=>onViewDetails(product.id)} className="relative block w-full overflow-hidden bg-gradient-to-b from-white to-slate-50 text-left" aria-label={'Ver detalhes de '+product.name}>
      {discount>0&&<span className="absolute left-3 top-3 z-10 rounded-lg bg-rose-600 px-3 py-1 text-xs font-black text-white">-{discount}% OFF</span>}
      <img src={product.image_url} loading="lazy" alt={product.name} className="h-52 w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105 sm:h-56" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=import.meta.env.BASE_URL+'images/monitor.svg';}}/>
    </button>
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500"><Star size={14} className="fill-amber-400 text-amber-400"/><strong className="text-slate-800">{product.rating.toFixed(1)}</strong><span>· Avaliação ilustrativa</span></div>
      <button onClick={()=>onViewDetails(product.id)} className="min-h-12 text-left text-base font-black leading-snug text-slate-800 hover:text-orange-600">{product.name}</button>
      <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{product.description}</p>
      <div className="mt-auto pt-4">
        {product.original_price&&<p className="text-xs text-slate-400 line-through">{money(product.original_price)}</p>}
        <p className="mt-1 text-2xl font-black tracking-tight text-orange-600">{money(product.price)}</p>
        <p className="mt-1 text-xs font-semibold text-emerald-700">No Pix demo: {money(product.price*.95)}</p>
        <p className="mt-1 text-xs text-slate-500">ou 10x de {installments(product.price)} sem juros*</p>
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500"><Truck size={15}/> Frete simulado no checkout</div>
        <div className="mt-4 flex gap-2">
          <button disabled={product.stock<=0} onClick={()=>onAddToCart(product.id)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-2 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:bg-slate-300"><ShoppingCart size={16}/>{product.stock>0?'Adicionar':'Esgotado'}</button>
          <button onClick={()=>onViewDetails(product.id)} aria-label={'Ver '+product.name} className="rounded-xl border border-slate-200 px-3 text-slate-600 hover:border-orange-300 hover:text-orange-600"><Eye size={19}/></button>
        </div>
      </div>
    </div>
  </article>;
};