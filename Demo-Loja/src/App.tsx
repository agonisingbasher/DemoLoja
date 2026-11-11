import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, Bell, BadgePercent, CheckCircle2, Cpu, Gift, Heart, Minus, Plus, Search, ShieldCheck, ShoppingCart, Sparkles, Tag, Trash2, Truck, X, Zap } from 'lucide-react';
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
import { calculateCoupon, coupons } from './lib/promotions';
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
const formatPrice = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
function readStorage<T,>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}

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
  const [couponsOpen, setCouponsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [delivery, setDelivery] = useState<'economico'|'expresso'|'retirada'>('economico');
  const [checkoutCep, setCheckoutCep] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card'|'pix'|'boleto'>('card');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [infoTopic, setInfoTopic] = useState<string | null>(() => topicFromHash(window.location.hash));
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(SALES_KEY, JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => {
    const onHashChange = () => setInfoTopic(topicFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => { if (infoTopic) window.scrollTo(0, 0); }, [infoTopic]);
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
  const subtotal = cartProducts.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = !subtotal || delivery==='retirada' ? 0 : delivery==='expresso' ? 34.90 : subtotal>=499 ? 0 : 19.90;
  const couponResult = appliedCoupon ? calculateCoupon(appliedCoupon, cartProducts.map(({product,quantity})=>({category_id:product.category_id,price:product.price,quantity}))) : {discount:0,error:''};
  const discount = couponResult.discount;
  const pixDiscount = paymentMethod==='pix' ? Math.round(Math.max(0,subtotal-discount)*5)/100 : 0;
  const total = Math.max(0,subtotal-discount-pixDiscount)+shipping;
  const applyCoupon=(code:string)=>{
    const result=calculateCoupon(code,cartProducts.map(({product,quantity})=>({category_id:product.category_id,price:product.price,quantity})));
    if(result.error){setNotice(result.error);return;}
    setAppliedCoupon(code.trim().toUpperCase());setCouponInput(code.trim().toUpperCase());
    setCouponsOpen(false);setNotice('Cupom demonstrativo '+code.toUpperCase()+' aplicado!');
  };
  const addBuildToCart=(ids:string[])=>{
    if(!ids.length)return;
    const current = new Map(cart.map(item=>[item.productId,item.quantity]));
    if(ids.some(id=>{const p=products.find(product=>product.id===id);return !p || (current.get(id)||0)+ids.filter(x=>x===id).length>p.stock;})){setNotice('Confira o estoque disponível dos itens selecionados.');return;}
    setCart(old=>{const next=new Map(old.map(line=>[line.productId,line.quantity]));ids.forEach(id=>next.set(id,(next.get(id)||0)+1));return Array.from(next,([productId,quantity])=>({productId,quantity}));});
    setBuilderOpen(false);setCartOpen(true);setNotice('Montagem adicionada ao carrinho de demonstração.');
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

  const finishDemoOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartProducts.length) return;
    const form = new FormData(event.currentTarget);
    const sale: DemoSale = {
      id: `TS-${Date.now().toString().slice(-8)}`,
      customer: String(form.get('customer') || 'Cliente demonstrativo'),
      email: String(form.get('email') || 'sem-email@demo.local'),
      date: new Date().toISOString(),
      total, status:'Recebido', paymentMethod, couponCode:appliedCoupon||undefined, discount:discount+pixDiscount, shipping,
      items: cartProducts.map(({ product, quantity }) => ({ productId: product.id, name: product.name, quantity, unitPrice: product.price })),
    };
    setSales(current => [...current, sale]);
    setProducts(current => current.map(product => {
      const soldLine = cartProducts.find(line => line.product.id === product.id);
      return soldLine ? { ...product, stock: Math.max(0, product.stock - soldLine.quantity) } : product;
    }));
    setOrderCode(sale.id);
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setAppliedCoupon('');setCouponInput('');setPaymentMethod('card');setDelivery('economico');setCheckoutCep('');
    setNotice('Pedido demonstrativo concluído!');
  };

  const openInfo = (topic: string) => {
    const slug = footerRoutes[topic];
    if (!slug) return;
    window.location.hash = '/' + slug;
    setInfoTopic(topic);
    window.scrollTo(0, 0);
  };
  const closeInfo = () => {
    window.location.hash = 'topo';
    setInfoTopic(null);
    window.scrollTo(0, 0);
  };
  // Information and detail pages are first-class views with their own footer.
  if (infoTopic) return <FooterInfoPage topic={infoTopic} onBack={closeInfo} onNavigate={openInfo} />;
  if (selectedProduct) return <ProductDetailsPage
    product={selectedProduct} products={products} favorite={favorites.includes(selectedProduct.id)}
    onToggleFavorite={toggleFavorite} onBack={()=>{setSelectedProductId(null);window.scrollTo(0,0);}}
    onAddToCart={id=>{addToCart(id);setSelectedProductId(null);setCartOpen(true);}}
    onViewProduct={id=>{setSelectedProductId(id);window.scrollTo(0,0);}}
    onOpenCart={()=>{setSelectedProductId(null);setCartOpen(true);}}
    onInfoClick={topic=>{setSelectedProductId(null);openInfo(topic);}}
  />;
  return (
    <div id="topo" className="min-h-screen bg-slate-50">
      <Header
        onCartClick={() => setCartOpen(true)}
        cartItemsCount={itemCount}
        onLoginClick={() => setLoginOpen(true)}
        searchTerm={search}
        onSearchChange={setSearch}
        onBuilderClick={()=>setBuilderOpen(true)}
        onCouponsClick={()=>setCouponsOpen(true)}
        onNotificationsClick={()=>setNotificationsOpen(true)}
        onFavoritesClick={()=>{setFavoritesOnly(v=>!v);document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'});}}
        favoritesCount={favorites.length}
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
          <div className="flex flex-wrap gap-2"><button onClick={()=>setNotificationsOpen(true)} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:text-orange-700"><Bell size={17}/> Notificações</button><button onClick={()=>setCouponsOpen(true)} className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700"><Gift size={17}/> Ver cupons</button></div>
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
      {adminOpen && <AdminPanel products={products} sales={sales} onAddProduct={product=>setProducts(current=>[product,...current])} onDeleteProduct={id=>{setProducts(current=>current.filter(p=>p.id!==id));setCart(current=>current.filter(line=>line.productId!==id));}} onUpdateStock={(id,stock)=>setProducts(current=>current.map(p=>p.id===id?{...p,stock}:p))} onLogout={()=>setAdminOpen(false)} onUpdateSaleStatus={(id,status)=>setSales(current=>current.map(s=>s.id===id?{...s,status}:s))} onUpdateProduct={(id,patch)=>setProducts(current=>current.map(p=>p.id===id?{...p,...patch}:p))} onSeedDemoSales={items=>setSales(current=>current.length?current:items)}/>}

      {cartOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/50" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside role="dialog" aria-modal="true" aria-label="Carrinho de compras" className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div><h2 className="text-xl font-black text-slate-900">Seu carrinho</h2><p className="text-sm text-slate-500">{itemCount} item(ns)</p></div>
              <button onClick={() => setCartOpen(false)} aria-label="Fechar carrinho" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {cartProducts.length ? cartProducts.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 border-b border-slate-100 pb-4">
                  <img src={product.image_url} alt={product.name} className="h-20 w-20 rounded-xl bg-slate-100 object-contain" />
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-bold text-slate-800">{product.name}</h3>
                    <p className="mt-1 font-bold text-orange-600">{formatPrice(product.price)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => changeQuantity(product.id, -1)} aria-label="Diminuir quantidade" className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50"><Minus size={14} /></button>
                      <span className="min-w-6 text-center text-sm font-bold">{quantity}</span>
                      <button onClick={() => changeQuantity(product.id, 1)} aria-label="Aumentar quantidade" className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50"><Plus size={14} /></button>
                      <button onClick={() => setCart((current) => current.filter((line) => line.productId !== product.id))} aria-label="Remover produto" className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-16 text-center"><ShoppingCart size={38} className="mx-auto mb-3 text-slate-300" /><p className="font-bold text-slate-700">Seu carrinho está vazio</p><p className="mt-1 text-sm text-slate-500">Adicione produtos para continuar.</p></div>
              )}
            </div>
            <div className="space-y-3 border-t border-slate-100 p-6">
              <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>Entrega simulada</span><span>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span></div>
              {discount>0&&<div className="flex justify-between text-sm font-bold text-emerald-700"><span>Cupom ({appliedCoupon})</span><span>-{formatPrice(discount)}</span></div>}
              {pixDiscount>0&&<div className="flex justify-between text-sm font-bold text-emerald-700"><span>Desconto Pix demo</span><span>-{formatPrice(pixDiscount)}</span></div>}
              {subtotal > 0 && subtotal < 499 && <p className="text-xs text-emerald-600">Faltam {formatPrice(499 - subtotal)} para ganhar frete grátis.</p>}
              <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-black text-slate-900"><span>Total</span><span>{formatPrice(total)}</span></div>
              <button onClick={()=>setCouponsOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-100"><Gift size={17}/> Ver cupons disponíveis</button>
              <button disabled={!cartProducts.length} onClick={() => {setCartOpen(false);setCheckoutOpen(true);}} className="w-full rounded-xl bg-orange-600 py-3.5 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300">Continuar para entrega</button>
              <p className="text-center text-xs text-slate-400">Demonstração — sem pagamento real.</p>
            </div>
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={finishDemoOrder} className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div><p className="text-sm font-bold uppercase tracking-widest text-orange-600">Última etapa</p><h2 className="mt-1 text-2xl font-black text-slate-900">Finalize sua simulação</h2></div>
              <button type="button" onClick={() => setCheckoutOpen(false)} aria-label="Fechar" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Nome completo<input name="customer" required minLength={3} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400" placeholder="Seu nome" /></label>
              <label className="block text-sm font-semibold text-slate-700">E-mail<input name="email" required type="email" autoComplete="email" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400" placeholder="voce@email.com" /></label>
              <p className="rounded-lg bg-orange-50 p-3 text-xs leading-5 text-orange-900">Use dados de teste. Nenhum produto é enviado e não solicitamos endereço completo ou cartão.</p>
              <label className="block text-sm font-semibold text-slate-700">CEP para simulação<input inputMode="numeric" maxLength={9} value={checkoutCep} onChange={e=>setCheckoutCep(e.target.value.replace(/[^0-9-]/g,''))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="00000-000 (opcional)"/></label>
              <fieldset className="rounded-xl border p-4"><legend className="px-2 text-sm font-black">Opção de entrega (simulada)</legend><div className="space-y-2">{([{id:'economico',label:'Econômica · 7–10 dias úteis',value:subtotal>=499?'Grátis':formatPrice(19.9)},{id:'expresso',label:'Expressa · 3–5 dias úteis',value:formatPrice(34.9)},{id:'retirada',label:'Retirada simulada',value:'Grátis'}] as const).map(option=><label key={option.id} className="flex items-center gap-2 text-sm"><input type="radio" checked={delivery===option.id} onChange={()=>setDelivery(option.id)}/><span className="flex-1">{option.label}</span><strong>{option.value}</strong></label>)}</div></fieldset>
              <fieldset className="rounded-xl border p-4"><legend className="px-2 text-sm font-black">Forma de pagamento ilustrativa</legend><div className="grid gap-2">{([{id:'card',label:'Cartão — até 10x sem juros',description:'10x de '+formatPrice((subtotal-discount+shipping)/10)},{id:'pix',label:'Pix — 5% OFF adicional',description:'Total '+formatPrice(Math.max(0,subtotal-discount)*.95+shipping)},{id:'boleto',label:'Boleto à vista',description:'Total '+formatPrice(subtotal-discount+shipping)}] as const).map(m=><label key={m.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm"><input type="radio" name="payment" checked={paymentMethod===m.id} onChange={()=>setPaymentMethod(m.id)}/><span className="flex-1 font-semibold">{m.label}</span><span className="text-xs text-slate-500">{m.description}</span></label>)}</div></fieldset>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4"><label htmlFor="checkout-coupon" className="flex items-center gap-2 text-sm font-black text-orange-900"><Tag size={17}/> Cupom de desconto</label><div className="mt-2 flex gap-2"><input id="checkout-coupon" value={couponInput} onChange={e=>setCouponInput(e.target.value.toUpperCase())} placeholder="Digite o código" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm uppercase"/><button type="button" onClick={()=>applyCoupon(couponInput)} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white">Aplicar</button></div><button type="button" onClick={()=>setCouponsOpen(true)} className="mt-2 text-xs font-bold text-orange-700 underline">Ver cupons disponíveis</button>{appliedCoupon&&<p className="mt-2 text-xs font-semibold text-emerald-700">{couponResult.error?couponResult.error:'Cupom '+appliedCoupon+' aplicado: -'+formatPrice(discount)} <button type="button" className="ml-2 underline" onClick={()=>{setAppliedCoupon('');setCouponInput('');}}>Remover</button></p>}</div>
            </div>
            <div className="my-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between"><span>Frete ilustrativo</span><span>{shipping?formatPrice(shipping):'Grátis'}</span></div>{discount>0&&<div className="flex justify-between text-emerald-700"><span>Cupom</span><span>-{formatPrice(discount)}</span></div>}{pixDiscount>0&&<div className="flex justify-between text-emerald-700"><span>Desconto Pix</span><span>-{formatPrice(pixDiscount)}</span></div>}<div className="flex justify-between border-t pt-3 text-lg font-black"><span>Total demonstrativo</span><span className="text-orange-600">{formatPrice(total)}</span></div></div>
            <button type="submit" className="w-full rounded-xl bg-orange-600 py-3.5 font-bold text-white transition hover:bg-orange-700">Confirmar pedido de demonstração</button>
            <p className="mt-3 text-center text-xs text-slate-400">Nenhum e-mail, boleto ou Pix será gerado. Checkout 100% ilustrativo.</p>
          </form>
        </div>
      )}


      {couponsOpen && <div role="dialog" aria-modal="true" aria-label="Central de cupons" className="fixed inset-0 z-[135] flex items-center justify-center bg-slate-950/70 p-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-orange-600">Benefícios TechStore</p><h2 className="mt-2 text-2xl font-black">Central de cupons</h2><p className="mt-2 text-sm text-slate-500">Cupons de demonstração, sujeitos a categoria e compra mínima.</p></div><button onClick={()=>setCouponsOpen(false)} aria-label="Fechar cupons" className="rounded-full p-2 hover:bg-slate-100"><X/></button></div>
          <div className="grid gap-3 sm:grid-cols-2">{coupons.map(c=><article key={c.code} className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-5"><div className="flex items-center gap-2 text-orange-600"><Gift size={20}/><span className="text-xs font-black uppercase">{c.label}</span></div><p className="mt-3 text-xl font-black tracking-wide">{c.code}</p><p className="mt-2 min-h-10 text-sm text-slate-600">{c.description}</p><button onClick={()=>{setCouponInput(c.code);setCouponsOpen(false);if(!checkoutOpen){setCartOpen(true);setNotice('Cupom '+c.code+' selecionado. Aplique-o no checkout após adicionar itens.');}}} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600">Selecionar cupom →</button></article>)}</div>
          <p className="mt-5 text-xs leading-5 text-slate-500">Cupons fictícios não cumulativos, descontos não reais. Os valores dependem dos itens selecionados.</p>
        </div>
      </div>}
      {notificationsOpen && <div role="dialog" aria-modal="true" aria-label="Notificações da TechStore" className="fixed inset-0 z-[135] flex items-center justify-center bg-slate-950/70 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-orange-600">Caixa de avisos</p><h2 className="mt-2 text-2xl font-black">Notificações</h2></div><button aria-label="Fechar avisos" onClick={()=>setNotificationsOpen(false)}><X/></button></div>
          <div className="mt-6 space-y-4">
            <div className="flex gap-3 rounded-xl border p-4"><Gift className="shrink-0 text-orange-600"/><div><h3 className="font-bold">Cupons de demonstração</h3><p className="mt-1 text-sm text-slate-500">Confira os códigos TECH10, GAMER15 e outros.</p><button onClick={()=>{setNotificationsOpen(false);setCouponsOpen(true);}} className="mt-2 text-sm font-bold text-orange-700">Ver cupons →</button></div></div>
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
