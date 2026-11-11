import { Bell, ChevronDown, Cpu, Gift, Heart, LayoutDashboard, MapPin, Menu, Search, ShoppingCart, UserRound, X, Zap } from 'lucide-react';
import { useState } from 'react';
import type { AccountProfile } from '../lib/customerAccount';
import { LanguageSwitcher, useLocale } from '../i18n';

type AccountTab='profile'|'address'|'orders'|'security';
type Props={
  onCartClick:()=>void;cartItemsCount:number;onLoginClick:()=>void;
  searchTerm:string;onSearchChange:(value:string)=>void;
  onBuilderClick:()=>void;onCouponsClick:()=>void;onNotificationsClick:()=>void;
  onFavoritesClick:()=>void;favoritesCount:number;
  account:AccountProfile|null;onAccountClick:(tab?:AccountTab)=>void;
};

export const Header=({
  onCartClick,cartItemsCount,onLoginClick,searchTerm,onSearchChange,onBuilderClick,
  onCouponsClick,onNotificationsClick,onFavoritesClick,favoritesCount,account,onAccountClick
}:Props)=>{
  const {locale}=useLocale();
  const [open,setOpen]=useState(false);
  const [accountMenu,setAccountMenu]=useState(false);
  const navClass='inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white';
  const accountItem=(tab:AccountTab,label:string)=><button onClick={()=>{onAccountClick(tab);setAccountMenu(false);}} className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700">{label}</button>;
  const cartButton=(mobile:boolean)=><button
    onClick={onCartClick}
    aria-label={'Abrir carrinho, '+cartItemsCount+' itens'}
    className="relative flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2.5 text-white shadow-sm hover:bg-orange-500"
  >
    <ShoppingCart size={22}/>
    {!mobile&&<span className="hidden font-black xl:inline">Carrinho</span>}
    {cartItemsCount>0&&<span className="absolute -right-1 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-[#07162e] px-1 text-xs font-black">{cartItemsCount}</span>}
  </button>;

  return <header data-techstore-main-header className="relative z-40 w-full min-w-0 border-b border-[#1c4384] shadow-lg">
    {/* The utility bar is compact on phones, and flexes horizontally on desktop. */}
    <div className="bg-[#07162e] text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-2 text-xs sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-4">
        <button onClick={()=>onAccountClick('address')} className="flex max-w-full min-w-0 items-center justify-center gap-2 font-bold hover:text-white sm:justify-start">
          <MapPin size={15} className="shrink-0 text-orange-400"/>
          <span className="min-w-0 truncate">{account?.address?.city?'Entregar em '+account.address.city+' / '+account.address.state:'Cadastre seu endereço de entrega'}</span>
          <ChevronDown size={13} className="shrink-0"/>
        </button>
        <span className="hidden font-semibold text-slate-400 xl:inline">TechStore · E-commerce de demonstração · Nenhuma cobrança real</span>
        <LanguageSwitcher inline/>
        <a href={'https://agonisingbasher.github.io/personal-website/?lang='+locale} target="_blank" rel="noopener noreferrer" className="hidden shrink-0 font-bold text-orange-300 hover:text-orange-100 sm:inline-flex">Conheça o desenvolvedor ↗</a>
      </div>
    </div>

    {/* Separate rows on mobile prevent the cart, search and navigation from squeezing the logo. */}
    <div className="bg-[#0c285a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 lg:flex lg:items-center lg:gap-4">
        <div className="flex min-w-0 items-center justify-between gap-3 lg:shrink-0">
          <a href="#topo" className="flex min-w-0 shrink-0 items-center gap-2" aria-label="TechStore, início">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-600 text-2xl font-black text-white shadow-md sm:h-11 sm:w-11">T</span>
            <span className="whitespace-nowrap text-xl font-black tracking-tight sm:text-2xl">Tech<span className="text-orange-400">Store</span></span>
          </a>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            {cartButton(true)}
            <button onClick={()=>setOpen(v=>!v)} className="rounded-xl p-2.5 text-white hover:bg-white/10" aria-expanded={open} aria-label={open?'Fechar menu':'Abrir menu'}>{open?<X size={23}/>:<Menu size={23}/>}</button>
          </div>
        </div>

        <label className="mt-3 flex w-full min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm lg:mt-0 lg:max-w-[505px] lg:flex-1">
          <Search size={20} className="shrink-0 text-slate-400"/>
          <input type="search" aria-label="Buscar produtos" placeholder="Busque consoles, periféricos, peças..." value={searchTerm} onChange={event=>onSearchChange(event.target.value)} className="w-0 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none"/>
          {searchTerm&&<button onClick={()=>onSearchChange('')} aria-label="Limpar busca" className="shrink-0 text-slate-500"><X size={16}/></button>}
        </label>

        <nav className="mt-3 flex min-w-0 items-center justify-around gap-1 border-t border-white/10 pt-2 sm:justify-center lg:ml-auto lg:mt-0 lg:shrink-0 lg:justify-end lg:border-0 lg:pt-0" aria-label="Ações da loja">
          <button onClick={onCouponsClick} title="Central de Cupons" className={navClass}><Gift size={21}/><span className="hidden 2xl:inline">Cupons</span></button>
          <button onClick={onNotificationsClick} title="Notificações" className={navClass}><Bell size={21}/></button>
          <button onClick={onFavoritesClick} title="Favoritos" className={navClass}><Heart size={21}/>{favoritesCount>0&&<span className="text-xs">{favoritesCount}</span>}</button>
          <div className="relative shrink-0">
            <button onClick={()=>account?setAccountMenu(value=>!value):onAccountClick('profile')} aria-expanded={account?accountMenu:undefined} title={account?'Menu de minha conta':'Criar conta'} className={navClass}>
              <UserRound size={21}/>
              <span className="hidden max-w-28 truncate 2xl:inline">{account?'Olá, '+account.name.split(' ')[0]:'Criar conta'}</span>
              {account&&<ChevronDown size={14}/>}
            </button>
            {account&&accountMenu&&<div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <p className="border-b px-3 py-2 text-xs font-semibold text-slate-500">Minha TechStore {account.demo?'(demo)':''}</p>
              {accountItem('profile','Meu perfil')}{accountItem('address','Meus endereços')}{accountItem('orders','Meus pedidos')}
            </div>}
          </div>
          <div className="hidden lg:block">{cartButton(false)}</div>
        </nav>
      </div>
    </div>

    <div className="bg-[#091b3d] text-white">
      <div className={'mx-auto max-w-7xl flex-col items-start gap-1 px-4 py-2 lg:flex lg:flex-row lg:flex-wrap lg:items-center '+(open?'flex':'hidden')}>
        <a href="#catalogo" onClick={()=>setOpen(false)} className={navClass}>Todos os produtos</a>
        <a href="#ofertas" onClick={()=>setOpen(false)} className={navClass}><Zap size={17}/> Ofertas da semana</a>
        <button onClick={()=>{onBuilderClick();setOpen(false);}} className={navClass}><Cpu size={17}/> Monte seu PC</button>
        <button onClick={()=>{onCouponsClick();setOpen(false);}} className={navClass}><Gift size={17}/> Central de Cupons</button>
        <a href="#recomendados" onClick={()=>setOpen(false)} className={navClass}><Heart size={17}/> Recomendados</a>
        <button onClick={()=>{onAccountClick('profile');setOpen(false);}} className={navClass}><UserRound size={17}/> {account?'Minha conta':'Criar conta'}</button>
        <button onClick={()=>{onLoginClick();setOpen(false);}} className={navClass}><LayoutDashboard size={17}/> Painel Demo</button>
        <a href={'https://agonisingbasher.github.io/personal-website/?lang='+locale} target="_blank" rel="noopener noreferrer" className={navClass+' sm:hidden'}>Conheça o desenvolvedor ↗</a>
      </div>
    </div>
  </header>;
};
