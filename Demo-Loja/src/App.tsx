import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bell, BadgePercent, CheckCircle2, Cpu, Gift, Heart, Search, ShieldCheck, Sparkles, Truck, X, Zap } from 'lucide-react';
import { CategoryFilter } from './components/CategoryFilter';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { AdminPanel, type DemoSale } from './components/AdminPanel';
import { FooterInfoPage } from './components/FooterInfoPage';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { PCBuilder } from './components/PCBuilder';
import { categoryIcons } from './components/CategoryFilter';
import { CheckoutPage, type CheckoutSubmission } from './components/CheckoutPage';
import { CouponCenterPage } from './components/CouponCenterPage';
import { AccountPage } from './components/AccountPage';
import { defaultCouponBanner, couponBannerKey, type CouponBanner } from './lib/couponBanner';
import { loadDemoAccount, saveDemoAccount, profileFromUser, type AccountProfile } from './lib/customerAccount';
import { supabase } from './lib/supabase';
import { catalogProducts } from './lib/catalogProducts';
import type { Category, Product } from './lib/supabase';

type CartLine = { productId: string; quantity: number };
const CART_KEY = 'techstore_cart_v1';
const FAVORITES_KEY = 'techstore_favorites_v1';
const PRODUCTS_KEY = 'techstore_products_v1';
const SALES_KEY = 'techstore_sales_v1';
const footerRoutes: Record<string, string> = {
  'Sobre Nós': 'sobre-nos',
  'Trabalhe Conosco': 'trabalhe-conosco',
  'Política de Privacidade': 'politica-de-privacidade',
  'Termos de Uso': 'termos-de-uso',
  'Central de Ajuda': 'central-de-ajuda',
  'Trocas e Devoluções': 'trocas-e-devolucoes',
  'Rastreamento': 'rastreamento',
  FAQ: 'faq',
};
function topicFromHash(hash: string): string | null {
  const slug = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  return Object.keys(footerRoutes).find(topic => footerRoutes[topic] === slug) ?? null;
}

const categories: Category[] = [
  { id: 'consoles', name: 'Consoles', slug: 'consoles', created_at: '' },
  { id: 'perifericos', name: 'Periféricos', slug: 'perifericos', created_at: '' },
  { id: 'acessorios', name: 'Acessórios', slug: 'acessorios', created_at: '' },
  { id: 'cadeiras', name: 'Cadeiras', slug: 'cadeiras', created_at: '' },
  { id: 'componentes', name: 'Peças para PC', slug: 'componentes', created_at: '' },
];
function readStorage<T,>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}


const DEMO_RETENTION_MS=7*24*60*60*1000;
function purgeExpiredDemoData(){
  try{
    const now=Date.now();
    const startedKey='techstore_demo_storage_started_v2';
    const started=Number(localStorage.getItem(startedKey))||now;
    if(now-started>=DEMO_RETENTION_MS){
      for(const key of [CART_KEY,FAVORITES_KEY,PRODUCTS_KEY,SALES_KEY,'techstore_demo_customer_v2']){
        localStorage.removeItem(key);
      }
      for(let i=localStorage.length-1;i>=0;i--){
        const key=localStorage.key(i);
        if(key?.startsWith('techstore_reviews_v1_'))localStorage.removeItem(key);
      }
      localStorage.setItem(startedKey,String(now));
      return;
    }
    if(!localStorage.getItem(startedKey))localStorage.setItem(startedKey,String(now));
    const old=JSON.parse(localStorage.getItem(SALES_KEY)||'[]');
    if(Array.isArray(old)){
      const valid=old.filter(x=>Number.isFinite(new Date(x.date).getTime()) && now-new Date(x.date).getTime()<DEMO_RETENTION_MS);
      if(valid.length!==old.length)localStorage.setItem(SALES_KEY,JSON.stringify(valid));
    }
    for(let i=localStorage.length-1;i>=0;i--){
      const key=localStorage.key(i);
      if(!key?.startsWith('techstore_reviews_v1_'))continue;
      const oldReviews=JSON.parse(localStorage.getItem(key)||'[]');
      if(!Array.isArray(oldReviews)){localStorage.removeItem(key);continue;}
      const next=oldReviews.filter(x=>Number.isFinite(new Date(x.date).getTime()) && now-new Date(x.date).getTime()<DEMO_RETENTION_MS);
      if(next.length!==oldReviews.length)localStorage.setItem(key,JSON.stringify(next));
    }
  }catch{ /* Browsers may block local storage; the shop remains usable. */ }
}
purgeExpiredDemoData();

// TechStore demo storefront with local admin, inventory and sales state.
export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const defaults = catalogProducts as Product[];
    const stored = readStorage(PRODUCTS_KEY, defaults);
    // Retain users' local demo stock and prices, but repair outdated images and add new SKUs.
    const repaired = stored.map(product => {
      const source = defaults.find(item => item.id === product.id);
      return source && source.image_url.includes('/images/') ? { ...product, image_url: source.image_url } : product;
    });
    return [...repaired, ...defaults.filter(product => !repaired.some(old => old.id === product.id))];
  });
  const [sales, setSales] = useState<DemoSale[]>(() => readStorage(SALES_KEY, []));
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [cart, setCart] = useState<CartLine[]>(() => readStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(FAVORITES_KEY, []));
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [couponsPage, setCouponsPage] = useState(() => window.location.hash === '#/cupons');
  const [accountPage, setAccountPage] = useState(() => window.location.hash === '#/minha-conta');
  const [accountTab, setAccountTab] = useState<'profile'|'address'|'orders'>('profile');
  const [account, setAccount] = useState<AccountProfile|null>(() => supabase ? null : loadDemoAccount());
  const [couponBanner, setCouponBanner] = useState<CouponBanner>(() => readStorage(couponBannerKey, defaultCouponBanner));
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(() => window.location.hash === '#/checkout');
  const [notice, setNotice] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [infoTopic, setInfoTopic] = useState<string | null>(() => topicFromHash(window.location.hash));
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(SALES_KEY, JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem(couponBannerKey, JSON.stringify(couponBanner)); }, [couponBanner]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({data})=>setAccount(data.user?profileFromUser(data.user):null)).catch(()=>setAccount(null));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, session)=>{
      setAccount(session?.user?profileFromUser(session.user):null);
    });
    return ()=>subscription.unsubscribe();
  }, []);
  const updateAccount=(profile:AccountProfile|null)=>{
    setAccount(profile);
    if(!supabase)saveDemoAccount(profile);
  };
  useEffect(() => {
    const onHashChange = () => {
      const hash=window.location.hash;
      setInfoTopic(topicFromHash(hash));
      setCouponsPage(hash==='#/cupons');
      setAccountPage(hash==='#/minha-conta');
      setCheckoutOpen(hash==='#/checkout');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => { if (infoTopic||couponsPage||accountPage||checkoutOpen) window.scrollTo(0, 0); }, [infoTopic,couponsPage,accountPage,checkoutOpen]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const result = products.filter((product) => {
      const matchesCategory = !category || product.category_id === category;
      const matchesTerm = !term || product.name.toLocaleLowerCase('pt-BR').includes(term) || product.description.toLocaleLowerCase('pt-BR').includes(term);
      const matchesFavorite = !favoritesOnly || favorites.includes(product.id);
      return matchesCategory && matchesTerm && matchesFavorite;
    });
    return result.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'name') return a.name.localeCompare(b.name, 'pt-BR');
      return Number(b.featured) - Number(a.featured);
    });
  }, [products, category, favorites, favoritesOnly, search, sort]);
  useEffect(() => { setPage(1); }, [category, favoritesOnly, search, sort]);
  const pages = Math.max(1, Math.ceil(filteredProducts.length / 9));
  const pagedProducts = filteredProducts.slice((page-1)*9,page*9);
  const offers = products.filter(product => product.original_price && product.original_price > product.price && product.stock>0).sort((a,b)=>((b.original_price||0)-b.price)-((a.original_price||0)-a.price)).slice(0,4);
  const favoriteCategories = new Set(products.filter(product=>favorites.includes(product.id)).map(product=>product.category_id));
  const recommendations = products.filter(product=>product.stock>0).sort((a,b)=>Number(favoriteCategories.has(b.category_id))-Number(favoriteCategories.has(a.category_id)) || b.rating-a.rating).slice(0,4);

  const cartProducts = cart
    .map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) }))
    .filter((line): line is CartLine & { product: Product } => Boolean(line.product));
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const addBuildToCart=(ids:string[])=>{
    if(!ids.length)return;
    const current = new Map(cart.map(item=>[item.productId,item.quantity]));
    if(ids.some(id=>{const p=products.find(product=>product.id===id);return !p || (current.get(id)||0)+ids.filter(x=>x===id).length>p.stock;})){setNotice('Confira o estoque disponível dos itens selecionados.');return;}
    setCart(old=>{const next=new Map(old.map(line=>[line.productId,line.quantity]));ids.forEach(id=>next.set(id,(next.get(id)||0)+1));return Array.from(next,([productId,quantity])=>({productId,quantity}));});
    setBuilderOpen(false);setCheckoutOpen(true);window.location.hash='/checkout';setNotice('Montagem adicionada ao checkout de demonstração.');
  };

  const addToCart = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const currentQuantity = cart.find((line) => line.productId === productId)?.quantity ?? 0;
    if (currentQuantity >= product.stock) {
      setNotice('Limite de estoque disponível atingido.');
      return;
    }
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId);
      return existing
        ? current.map((line) => line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { productId, quantity: 1 }];
    });
    setNotice('Produto adicionado ao carrinho!');
  };

  const changeQuantity = (productId: string, delta: number) => {
    setCart((current) => current.flatMap((line) => {
      if (line.productId !== productId) return [line];
      const nextQuantity = line.quantity + delta;
      const product = products.find((item) => item.id === productId);
      if (nextQuantity <= 0) return [];
      if (product && nextQuantity > product.stock) {
        setNotice('Quantidade máxima em estoque atingida.');
        return [line];
      }
      return [{ ...line, quantity: nextQuantity }];
    }));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  };

  const finishDemoOrder = async (payload:CheckoutSubmission):Promise<string> => {
    let remoteReference:string|undefined;
    if(supabase && account && !account.demo){
      const {data,error}=await supabase.rpc('create_demo_order',{
        p_items:cartProducts.map(({product,quantity})=>({productId:product.id,quantity})),
        p_payment_method:payload.paymentMethod
      });
      if(error)throw new Error('Não foi possível registrar o pedido na sua conta: '+error.message);
      remoteReference=data?.[0]?.order_reference;
    }
    const sale:DemoSale = {
      id:remoteReference || 'TS-'+Date.now().toString().slice(-8),
      customer:payload.customer, email:account?.email || payload.email,
      userId:account?.id,
      backendRecorded:Boolean(remoteReference),
      date:new Date().toISOString(), total:payload.total,
      status:'Recebido', paymentMethod:payload.paymentMethod,
      couponCode:payload.couponCode, discount:payload.discount, shipping:payload.shipping,
      items:cartProducts.map(({product,quantity})=>({productId:product.id,name:product.name,quantity,unitPrice:product.price})),
    };
    setSales(current=>{
      const next=[...current,sale];
      // Persist immediately so leaving the checkout cannot race the React effect.
      localStorage.setItem(SALES_KEY,JSON.stringify(next));
      return next;
    });
    setProducts(current=>current.map(product=>{
      const line=cartProducts.find(item=>item.product.id===product.id);
      return line?{...product,stock:Math.max(0,product.stock-line.quantity)}:product;
    }));
    setCart([]);setOrderCode(sale.id);setCouponInput('');
    return sale.id;
  };
  const openCheckout=()=>{setSelectedProductId(null);setCouponsPage(false);setAccountPage(false);setCheckoutOpen(true);window.location.hash='/checkout';window.scrollTo(0,0);};
  const openCoupons=()=>{setCouponsPage(true);setAccountPage(false);setCheckoutOpen(false);setSelectedProductId(null);window.location.hash='/cupons';window.scrollTo(0,0);};
  const openAccount=(tab:'profile'|'address'|'orders'='profile')=>{setAccountTab(tab);setAccountPage(true);setCouponsPage(false);setCheckoutOpen(false);setSelectedProductId(null);window.location.hash='/minha-conta';window.scrollTo(0,0);};
  const closeSpecial=()=>{setCouponsPage(false);setAccountPage(false);setCheckoutOpen(false);window.location.hash='topo';window.scrollTo(0,0);};
  const openInfo = (topic: string) => {
    const slug = footerRoutes[topic];
    if (!slug) return;
    window.location.hash = '/' + slug;
    setInfoTopic(topic);setCouponsPage(false);setAccountPage(false);setCheckoutOpen(false);setSelectedProductId(null);
    window.scrollTo(0, 0);
  };
  const closeInfo = () => {
    window.location.hash = 'topo';
    setInfoTopic(null);
    window.scrollTo(0, 0);
  };
  // Information and detail pages are first-class views with their own footer.
  if (infoTopic) return <FooterInfoPage topic={infoTopic} onBack={closeInfo} onNavigate={openInfo} />;
  if (checkoutOpen) return <CheckoutPage items={cartProducts} initialCoupon={couponInput} account={account}
    onBack={closeSpecial} onQuantityChange={changeQuantity}
    onRemove={id=>setCart(current=>current.filter(line=>line.productId!==id))}
    onFinish={finishDemoOrder} onCompleted={closeSpecial} onViewOrders={()=>openAccount('orders')}/>;
  if (couponsPage) return <CouponCenterPage banner={couponBanner} cartCount={itemCount} onBack={closeSpecial}
    onSelect={code=>{setCouponInput(code);if(itemCount)openCheckout();else{closeSpecial();setNotice('Cupom '+code+' selecionado. Adicione produtos e abra o checkout.');}}}
    onInfoClick={openInfo}/>;
  if (accountPage) return <AccountPage account={account} initialTab={accountTab} orders={sales} onBack={closeSpecial} onChange={updateAccount} onInfoClick={openInfo}/>;
  if (selectedProduct) return <ProductDetailsPage
    product={selectedProduct} products={products} orders={sales} account={account} favorite={favorites.includes(selectedProduct.id)}
    onToggleFavorite={toggleFavorite} onBack={()=>{setSelectedProductId(null);window.scrollTo(0,0);}}
    onAddToCart={id=>{addToCart(id);openCheckout();}}
    onViewProduct={id=>{setSelectedProductId(id);window.scrollTo(0,0);}}
    onOpenCart={openCheckout}
    onInfoClick={topic=>{setSelectedProductId(null);openInfo(topic);}}
  />;
  return (
    <div id="topo" className="min-h-screen bg-slate-50">
      <Header
        onCartClick={openCheckout}
        cartItemsCount={itemCount}
        onLoginClick={() => setLoginOpen(true)}
        searchTerm={search}
        onSearchChange={setSearch}
        onBuilderClick={()=>setBuilderOpen(true)}
        onCouponsClick={openCoupons}
        onNotificationsClick={()=>setNotificationsOpen(true)}
        onFavoritesClick={()=>{setFavoritesOnly(v=>!v);document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'});}}
        favoritesCount={favorites.length}
        account={account} onAccountClick={openAccount}
      />
      <Hero />

      <section className="border-b bg-white py-7">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><Truck className="shrink-0 text-orange-600" size={26}/><div><p className="text-sm font-black">Frete demonstrativo</p><p className="text-xs text-slate-500">Simule o prazo e valor por CEP</p></div></div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><BadgePercent className="shrink-0 text-orange-600" size={26}/><div><p className="text-sm font-black">Cupons exclusivos</p><p className="text-xs text-slate-500">Use descontos de demonstração</p></div></div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><Cpu className="shrink-0 text-orange-600" size={26}/><div><p className="text-sm font-black">Monte seu PC</p><p className="text-xs text-slate-500">Escolha peças e compare totais</p></div></div>
        </div>
      </section>
      <section id="ofertas" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600"><Zap size={16}/> Seleção com desconto</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Produtos em oferta <span className="text-orange-600">🔥</span></h2><p className="mt-2 text-sm text-slate-500">Valores e descontos ilustrativos para testar a loja.</p></div><a href="#catalogo" className="text-sm font-bold text-orange-700 hover:underline">Ver todo o catálogo →</a></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map(product=><div key={product.id} className="relative"><button onClick={()=>toggleFavorite(product.id)} aria-label={favorites.includes(product.id)?'Remover favorito':'Adicionar favorito'} className="absolute right-3 top-3 z-20 rounded-full bg-white p-2 text-rose-500 shadow-md"><Heart size={18} className={favorites.includes(product.id)?'fill-current':''}/></button><ProductCard product={product} onAddToCart={addToCart} onViewDetails={id=>setSelectedProductId(id)}/></div>)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950 text-white shadow-2xl">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-orange-600/25 blur-3xl"/>
          <div className="relative grid items-center gap-6 p-7 md:grid-cols-[1.3fr_1fr] md:p-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-200"><Sparkles size={16}/> Especial Nintendo · TechStore Demo</span>
              <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">Uma nova geração.<br/><span className="text-orange-400">A nostalgia continua.</span></h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">Explore o Nintendo Switch 2, controles e acessórios em promoção ilustrativa — e conheça também nosso projeto independente de Ocarina of Time para Nintendo DSi.</p>
              <div className="mt-6 flex flex-wrap gap-3"><button onClick={()=>{setSearch('Switch 2');setCategory(null);document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'});}} className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700">Ver ofertas Switch 2 →</button><a href="https://agonisingbasher.github.io/ocarina-of-time-dsi/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10">Projeto Ocarina of Time ↗</a></div>
              <p className="mt-4 text-xs text-slate-400">Campanha conceitual, sem parceria oficial com Nintendo ou ofertas comerciais reais.</p>
            </div>
            <div className="relative flex min-h-[260px] items-center justify-center">
              <div className="absolute h-64 w-64 rounded-full bg-orange-500/30 blur-3xl"/>
              <img src={import.meta.env.BASE_URL+'images/switch2.svg'} alt="Ilustração conceitual de console portátil estilo Switch 2" className="relative max-h-[285px] w-full max-w-[440px] rotate-[-6deg] rounded-2xl object-contain shadow-2xl"/>
            </div>
          </div>
        </div>
      </section>
      <section id="recomendados" className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6"><p className="text-xs font-black uppercase tracking-widest text-orange-600">Inspiração para seu setup</p><h2 className="mt-2 text-3xl font-black">Recomendados para você</h2><p className="mt-2 text-sm text-slate-500">{favorites.length?'Priorizamos categorias que você favoritou neste navegador.':'Uma seleção de produtos em destaque para explorar.'}</p></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recommendations.map(product=><div key={product.id} className="relative"><button onClick={()=>toggleFavorite(product.id)} aria-label="Favoritar produto" className="absolute right-3 top-3 z-20 rounded-full bg-white p-2 text-rose-500 shadow-md"><Heart size={18} className={favorites.includes(product.id)?'fill-current':''}/></button><ProductCard product={product} onAddToCart={addToCart} onViewDetails={id=>setSelectedProductId(id)}/></div>)}</div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-3xl bg-slate-900 p-7 text-white md:p-10"><div className="flex items-center gap-5"><span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-orange-500/20 text-orange-300"><Cpu size={42}/></span><div><p className="text-xs font-extrabold uppercase tracking-widest text-orange-400">TechStore PC Builder</p><h2 className="mt-1 text-2xl font-black">Seu PC, peça por peça</h2><p className="mt-2 max-w-xl text-sm text-slate-400">Simule configurações AMD ou Intel, compare preços, verifique socket e memória, e monte um carrinho completo.</p></div></div><button onClick={()=>setBuilderOpen(true)} className="shrink-0 rounded-xl bg-orange-600 px-6 py-4 font-black text-white hover:bg-orange-700">Começar montagem →</button></div>
      </section>
      <main id="catalogo" className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-orange-600">TechStore • seleção gamer</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Encontre seu próximo upgrade</h2>
            <p className="mt-2 text-slate-500">Tecnologia, games e acessórios para o seu setup.</p>
          </div>
          <button onClick={() => setFavoritesOnly((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${favoritesOnly ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-600 hover:text-rose-600'}`}>
            <Heart size={17} className={favoritesOnly ? 'fill-current' : ''} />
            {favoritesOnly ? 'Ver catálogo' : 'Meus favoritos'} ({favorites.length})
          </button>
        </div>


        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          {([{id:'',name:'Tudo'},...categories]).map(item=>{
            const Icon=item.id?categoryIcons[item.id]:Sparkles;
            return <button key={item.id} onClick={()=>setCategory(item.id||null)} aria-pressed={(category||'')===item.id} className={'flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-bold transition '+((category||'')===item.id?'border-orange-600 bg-orange-600 text-white':'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-700')}><Icon size={17}/>{item.name}</button>;
          })}
        </div>
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <CategoryFilter categories={categories} selectedCategory={category} onSelectCategory={setCategory} />
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
              <div className="mb-2 flex items-center gap-2 font-bold text-orange-900"><ShieldCheck size={19} /> Ambiente de demonstração</div>
              <p className="text-sm leading-6 text-orange-800">Carrinho, favoritos e pedidos são armazenados localmente. Nenhuma cobrança real é feita.</p>
            </div>
          </aside>

          <section aria-label="Produtos">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500"><strong className="text-slate-900">{filteredProducts.length}</strong> produto(s) encontrado(s)</p>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                Ordenar:
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-orange-400">
                  <option value="featured">Destaques</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                  <option value="rating">Melhor avaliação</option>
                  <option value="name">Nome (A–Z)</option>
                </select>
              </label>
            </div>
            {filteredProducts.length ? (
              <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {pagedProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <button
                      type="button"
                      aria-label={favorites.includes(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      onClick={() => toggleFavorite(product.id)}
                      className={`absolute right-3 top-3 z-20 rounded-full bg-white p-2.5 shadow-md transition hover:scale-110 ${favorites.includes(product.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                      <Heart size={18} className={favorites.includes(product.id) ? 'fill-current' : ''} />
                    </button>
                    <ProductCard product={product} onAddToCart={addToCart} onViewDetails={(id) => { setSelectedProductId(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                  </div>
                ))}
              </div>
              <nav aria-label="Paginação do catálogo" className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button disabled={page===1} onClick={()=>{setPage(p=>Math.max(1,p-1));document.getElementById('catalogo')?.scrollIntoView();}} className="rounded-xl border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40">← Anterior</button>
                {Array.from({length:pages},(_,i)=>i+1).map(n=><button key={n} onClick={()=>{setPage(n);document.getElementById('catalogo')?.scrollIntoView();}} aria-current={page===n?'page':undefined} className={'grid h-10 w-10 place-items-center rounded-xl border text-sm font-black '+(page===n?'border-orange-600 bg-orange-600 text-white':'bg-white text-slate-700 hover:border-orange-300')}>{n}</button>)}
                <button disabled={page===pages} onClick={()=>{setPage(p=>Math.min(pages,p+1));document.getElementById('catalogo')?.scrollIntoView();}} className="rounded-xl border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40">Próxima →</button>
              </nav>
              <p className="mt-3 text-center text-xs text-slate-500">Página {page} de {pages} · {filteredProducts.length} produtos</p>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Search size={36} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-800">Nenhum produto encontrado</h3>
                <p className="mt-2 text-sm text-slate-500">Altere sua busca ou os filtros selecionados.</p>
                <button onClick={() => { setSearch(''); setCategory(null); setFavoritesOnly(false); }} className="mt-5 font-semibold text-orange-600 hover:text-orange-700">Limpar filtros</button>
              </div>
            )}
          </section>
        </div>
      </main>

      <section className="bg-slate-900 py-12 text-white">
        <div className="container mx-auto flex flex-col items-start justify-between gap-5 px-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">Seu setup merece</p>
            <h2 className="mt-2 text-2xl font-black">Pronto para o próximo upgrade?</h2>
            <p className="mt-2 text-slate-400">Explore o catálogo e encontre seu equipamento.</p>
          </div>
          <a href="#catalogo" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600">Explorar produtos <ArrowRight size={18} /></a>
        </div>
      </section>
      <div className="border-t border-orange-100 bg-orange-50 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4">
          <div><p className="text-sm font-black text-slate-900">Fique por dentro da TechStore</p><p className="mt-1 text-xs text-slate-500">Cupons e avisos demonstrativos para explorar o projeto</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={()=>setNotificationsOpen(true)} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:text-orange-700"><Bell size={17}/> Notificações</button><button onClick={openCoupons} className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700"><Gift size={17}/> Ver cupons</button></div>
        </div>
      </div>
      <Footer onInfoClick={openInfo} />


      {loginOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4">
          <form onSubmit={(event) => { event.preventDefault(); if (username === 'admin' && password === 'admin') { setLoginOpen(false); setAdminOpen(true); setLoginError(''); setUsername(''); setPassword(''); } else setLoginError('Usuário ou senha incorretos.'); }} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-600">Área restrita</p><h2 className="mt-1 text-2xl font-black text-slate-900">Entrar na administração</h2></div><button type="button" onClick={() => setLoginOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X/></button></div>
            <label className="mb-4 block text-sm font-semibold text-slate-700">Usuário<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} className="mt-1.5 w-full rounded-xl border px-4 py-3"/></label>
            <label className="block text-sm font-semibold text-slate-700">Senha<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border px-4 py-3"/></label>
            {loginError && <p className="mt-3 text-sm font-semibold text-red-600">{loginError}</p>}
            <div className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-orange-900">Acesso de demonstração: <strong>admin</strong> / <strong>admin</strong></div>
            <button type="submit" className="mt-5 w-full rounded-xl bg-orange-600 py-3 font-bold text-white hover:bg-orange-700">Entrar no painel</button>
          </form>
        </div>
      )}
      {adminOpen && <AdminPanel products={products} sales={sales} onAddProduct={product=>setProducts(current=>[product,...current])} onDeleteProduct={id=>{setProducts(current=>current.filter(p=>p.id!==id));setCart(current=>current.filter(line=>line.productId!==id));}} onUpdateStock={(id,stock)=>setProducts(current=>current.map(p=>p.id===id?{...p,stock}:p))} onLogout={()=>setAdminOpen(false)} onUpdateSaleStatus={(id,status)=>setSales(current=>current.map(s=>s.id===id?{...s,status}:s))} onUpdateProduct={(id,patch)=>setProducts(current=>current.map(p=>p.id===id?{...p,...patch}:p))} onSeedDemoSales={items=>setSales(current=>current.length?current:items)} couponBanner={couponBanner} onUpdateCouponBanner={setCouponBanner}/>}

      {notificationsOpen && <div role="dialog" aria-modal="true" aria-label="Notificações da TechStore" className="fixed inset-0 z-[135] flex items-center justify-center bg-slate-950/70 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-orange-600">Caixa de avisos</p><h2 className="mt-2 text-2xl font-black">Notificações</h2></div><button aria-label="Fechar avisos" onClick={()=>setNotificationsOpen(false)}><X/></button></div>
          <div className="mt-6 space-y-4">
            <div className="flex gap-3 rounded-xl border p-4"><Gift className="shrink-0 text-orange-600"/><div><h3 className="font-bold">Cupons de demonstração</h3><p className="mt-1 text-sm text-slate-500">Confira os códigos TECH10, GAMER15 e outros.</p><button onClick={()=>{setNotificationsOpen(false);openCoupons();}} className="mt-2 text-sm font-bold text-orange-700">Ver cupons →</button></div></div>
            <div className="flex gap-3 rounded-xl border p-4"><Cpu className="shrink-0 text-orange-600"/><div><h3 className="font-bold">Novidade: monte seu PC</h3><p className="mt-1 text-sm text-slate-500">Escolha componentes e veja o valor ilustrativo.</p><button onClick={()=>{setNotificationsOpen(false);setBuilderOpen(true);}} className="mt-2 text-sm font-bold text-orange-700">Começar →</button></div></div>
            <div className="flex gap-3 rounded-xl border p-4"><Bell className="shrink-0 text-orange-600"/><div><h3 className="font-bold">Sua lista de favoritos</h3><p className="mt-1 text-sm text-slate-500">{favorites.length} produtos salvos localmente.</p></div></div>
          </div>
          <p className="mt-5 text-xs text-slate-400">Avisos fixos de demonstração; não são notificações em tempo real.</p>
        </div>
      </div>}
      {builderOpen && <PCBuilder products={products} onClose={()=>setBuilderOpen(false)} onAddBuild={addBuildToCart}/>}
      {orderCode && (
        <div role="status" className="fixed bottom-5 right-5 z-[90] max-w-sm rounded-2xl bg-emerald-600 p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 font-bold"><CheckCircle2 /> Pedido registrado!</div>
          <p className="mt-2 text-sm text-emerald-50">Código demonstrativo: {orderCode}. Obrigado por testar a TechStore.</p>
          <button onClick={() => setOrderCode('')} className="mt-3 text-sm font-bold underline">Fechar</button>
        </div>
      )}
      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">{notice}</div>}
    </div>
  );
}
