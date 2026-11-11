import { Bell, Cpu, Gift, Heart, Menu, Search, ShoppingCart, User, X, Zap } from 'lucide-react';
import { useState } from 'react';

type Props = {
  onCartClick:()=>void; cartItemsCount:number; onLoginClick:()=>void;
  searchTerm:string; onSearchChange:(value:string)=>void;
  onBuilderClick:()=>void; onCouponsClick:()=>void; onNotificationsClick:()=>void;
  onFavoritesClick:()=>void; favoritesCount:number;
};
export const Header=({onCartClick,cartItemsCount,onLoginClick,searchTerm,onSearchChange,onBuilderClick,onCouponsClick,onNotificationsClick,onFavoritesClick,favoritesCount}:Props)=>{
  const [open,setOpen]=useState(false);
  const search=()=><label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/20 bg-white px-4 py-3 shadow-inner lg:max-w-[510px]"><Search size={20} className="shrink-0 text-slate-400"/><input type="search" aria-label="Buscar produtos" placeholder="Buscar produtos, peças, consoles e acessórios..." value={searchTerm} onChange={e=>onSearchChange(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none"/>{searchTerm&&<button onClick={()=>onSearchChange('')} aria-label="Limpar busca" className="text-slate-500"><X size={16}/></button>}</label>;
  const navClass="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white/90 transition hover:bg-white/15 hover:text-white";
  return <header className="relative z-40 shadow-lg">
    <div className="bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-[11px] font-semibold sm:text-xs"><span className="flex items-center gap-2"><Zap size={13} className="text-orange-400"/> TechStore Demo · A melhor experiência gamer é explorar</span><span>Produtos, valores, cupons e entregas ilustrativos · Não há cobranças</span></div>
    </div>
    <div className="bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4">
        <a href="#topo" aria-label="TechStore, início" className="flex shrink-0 items-center gap-2"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl font-black text-orange-600 shadow-sm">T</span><span className="text-2xl font-black tracking-tight">Tech<span className="text-orange-100">Store</span></span></a>
        <div className="order-3 w-full lg:order-none lg:ml-8 lg:flex-1">{search()}</div>
        <nav className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Ações da loja">
          <button onClick={onCouponsClick} aria-label="Ver cupons" title="Cupons" className={navClass}><Gift size={21}/><span className="hidden xl:inline">Cupons</span></button>
          <button onClick={onNotificationsClick} aria-label="Ver notificações" title="Notificações" className={navClass}><Bell size={21}/><span className="hidden xl:inline">Avisos</span></button>
          <button onClick={onFavoritesClick} aria-label="Meus favoritos" title="Favoritos" className={navClass}><Heart size={21}/><span className="hidden xl:inline">{favoritesCount}</span></button>
          <button onClick={onLoginClick} aria-label="Painel de controle" title="Painel de controle" className={navClass}><User size={21}/></button>
          <button onClick={onCartClick} aria-label={'Abrir carrinho, '+cartItemsCount+' itens'} title="Carrinho" className="relative flex items-center gap-2 rounded-xl bg-slate-950/25 px-3 py-2.5 hover:bg-slate-950/40"><ShoppingCart size={23}/><span className="hidden sm:inline text-sm font-black">Carrinho</span>{cartItemsCount>0&&<span className="absolute -right-1 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-slate-950 px-1 text-xs font-black">{cartItemsCount}</span>}</button>
          <button onClick={()=>setOpen(v=>!v)} className="ml-1 p-2 lg:hidden" aria-label={open?'Fechar menu':'Abrir menu'}>{open?<X/>:<Menu/>}</button>
        </nav>
      </div>
    </div>
    <div className="bg-slate-900 text-white">
      <div className={'mx-auto max-w-7xl flex-col items-start gap-2 px-4 py-2 lg:flex lg:flex-row lg:items-center '+(open?'flex':'hidden')}>
        <a href="#catalogo" onClick={()=>setOpen(false)} className={navClass}>Todos os produtos</a>
        <a href="#ofertas" onClick={()=>setOpen(false)} className={navClass}><Zap size={17}/> Ofertas da semana</a>
        <button onClick={()=>{onBuilderClick();setOpen(false)}} className={navClass}><Cpu size={17}/> Monte seu PC</button>
        <button onClick={()=>{onCouponsClick();setOpen(false)}} className={navClass}><Gift size={17}/> Cupons</button>
        <a href="#recomendados" onClick={()=>setOpen(false)} className={navClass}><Heart size={17}/> Recomendados</a>
        <a href="https://agonisingbasher.github.io/personal-website/?lang=pt-BR" target="_blank" rel="noopener noreferrer" className={navClass}>Portfólio ↗</a>
      </div>
    </div>
  </header>;
};
