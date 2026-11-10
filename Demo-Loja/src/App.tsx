import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, Minus, Plus, Search, ShieldCheck, ShoppingCart, Trash2, X } from 'lucide-react';
import { CategoryFilter } from './components/CategoryFilter';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { catalogProducts } from './lib/catalogProducts';
import type { Category, Product } from './lib/supabase';

type CartLine = { productId: string; quantity: number };
const CART_KEY = 'techstore_cart_v1';
const FAVORITES_KEY = 'techstore_favorites_v1';
const initialProducts = catalogProducts as Product[];
const categories: Category[] = [
  { id: 'consoles', name: 'Consoles', slug: 'consoles', created_at: '' },
  { id: 'perifericos', name: 'Periféricos', slug: 'perifericos', created_at: '' },
  { id: 'acessorios', name: 'Acessórios', slug: 'acessorios', created_at: '' },
  { id: 'cadeiras', name: 'Cadeiras', slug: 'cadeiras', created_at: '' },
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

export default function App() {
  const [cart, setCart] = useState<CartLine[]>(() => readStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(FAVORITES_KEY, []));
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [infoTopic, setInfoTopic] = useState<string | null>(null);
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
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
  }, [category, favorites, favoritesOnly, search, sort]);

  const cartProducts = cart
    .map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) }))
    .filter((line): line is CartLine & { product: Product } => Boolean(line.product));
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartProducts.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 19.9;
  const total = subtotal + shipping;

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
    setOrderCode(`TS-${Date.now().toString().slice(-8)}`);
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setNotice('Pedido demonstrativo concluído!');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onCartClick={() => setCartOpen(true)}
        cartItemsCount={itemCount}
        onLoginClick={() => setNotice('Login demonstrativo: autenticação ainda não está habilitada.')}
        searchTerm={search}
        onSearchChange={setSearch}
      />
      <Hero />
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
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
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
      <Footer onInfoClick={setInfoTopic} />


      {selectedProduct && (
        <div className="fixed inset-0 z-[65] overflow-y-auto bg-slate-50">
          <div className="min-h-screen">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur">
              <button type="button" onClick={() => setSelectedProductId(null)} className="inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-orange-600"><ArrowLeft size={20} /> Voltar à loja</button>
              <span className="font-black text-orange-600">TechStore</span>
            </div>
            <main className="container mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
              <div className="flex min-h-[320px] items-center justify-center rounded-3xl bg-white p-6 shadow-sm md:min-h-[520px]">
                <img src={selectedProduct.image_url || 'https://placehold.co/800x800?text=TechStore'} alt={selectedProduct.name} onError={(event) => { event.currentTarget.src = 'https://placehold.co/800x800?text=Imagem+indisponivel'; }} className="max-h-[480px] w-full object-contain" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Detalhes do produto</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{selectedProduct.name}</h1>
                <div className="mt-4 flex items-center gap-2 text-amber-500"><span>★★★★★</span><span className="text-sm font-semibold text-slate-600">{selectedProduct.rating.toFixed(1)} / 5.0</span></div>
                <p className="mt-6 text-lg leading-8 text-slate-600">{selectedProduct.details || selectedProduct.description}</p>
                <div className="mt-7 rounded-2xl bg-white p-5 shadow-sm">
                  {selectedProduct.original_price && <p className="text-sm text-slate-400 line-through">{formatPrice(selectedProduct.original_price)}</p>}
                  <p className="text-4xl font-black text-orange-600">{formatPrice(selectedProduct.price)}</p>
                  <p className={`mt-2 text-sm font-semibold ${selectedProduct.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{selectedProduct.stock > 0 ? `Em estoque: ${selectedProduct.stock} unidade(s)` : 'Produto esgotado'}</p>
                  <button type="button" disabled={selectedProduct.stock <= 0} onClick={() => addToCart(selectedProduct.id)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 font-bold text-white transition hover:bg-orange-700 disabled:bg-slate-300"><ShoppingCart size={20} /> Adicionar ao carrinho</button>
                </div>
                {selectedProduct.features?.length ? (
                  <div className="mt-8">
                    <h2 className="text-lg font-bold text-slate-900">Características</h2>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {selectedProduct.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-500" />{feature}</li>)}
                    </ul>
                  </div>
                ) : null}
                <p className="mt-8 text-xs leading-5 text-slate-400">Produto e valores ilustrativos. Esta loja é uma demonstração e não processa pagamentos reais.</p>
              </div>
            </main>
          </div>
        </div>
      )}

      {infoTopic && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setInfoTopic(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="footer-info-title" className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-orange-600">TechStore • Informações</p><h2 id="footer-info-title" className="mt-2 text-2xl font-black text-slate-900">{infoTopic}</h2></div>
              <button type="button" onClick={() => setInfoTopic(null)} aria-label="Fechar" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X /></button>
            </div>
            <p className="mt-5 leading-7 text-slate-600">
              {infoTopic === 'Sobre Nós' ? 'A TechStore é uma loja fictícia criada como projeto demonstrativo de e-commerce, com catálogo, filtros, favoritos e carrinho.' :
               infoTopic === 'Trabalhe Conosco' ? 'Esta demonstração não possui processo seletivo ativo. A área institucional está pronta para receber informações reais em uma próxima etapa.' :
               infoTopic === 'Política de Privacidade' ? 'Os favoritos e o carrinho ficam armazenados somente no navegador. Não há cadastro, envio de dados para servidor ou processamento de pagamento nesta versão.' :
               infoTopic === 'Termos de Uso' ? 'Os produtos, preços, avaliações, estoque e informações desta loja são ilustrativos e não representam ofertas comerciais reais.' :
               infoTopic === 'Trocas e Devoluções' ? 'Como esta é uma loja demonstrativa, nenhuma compra real é realizada e não existe operação de troca ou devolução.' :
               infoTopic === 'Rastreamento' ? 'Ainda não há integração logística. Os pedidos gerados nesta demonstração não são enviados nem possuem rastreamento real.' :
               infoTopic === 'Redes sociais' ? 'Os perfis oficiais da TechStore ainda não foram configurados. Os ícones sociais exibem esta informação em vez de direcionar para páginas genéricas.' :
               'Central demonstrativa: explore o catálogo, abra os detalhes de um produto, adicione itens ao carrinho e teste a finalização. Nenhuma cobrança será feita.'}
            </p>
            <button type="button" onClick={() => setInfoTopic(null)} className="mt-7 w-full rounded-xl bg-orange-600 py-3 font-bold text-white hover:bg-orange-700">Entendi</button>
          </section>
        </div>
      )}

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
              <div className="flex justify-between text-sm text-slate-600"><span>Entrega</span><span>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span></div>
              {subtotal > 0 && subtotal < 499 && <p className="text-xs text-emerald-600">Faltam {formatPrice(499 - subtotal)} para ganhar frete grátis.</p>}
              <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-black text-slate-900"><span>Total</span><span>{formatPrice(total)}</span></div>
              <button disabled={!cartProducts.length} onClick={() => setCheckoutOpen(true)} className="w-full rounded-xl bg-orange-600 py-3.5 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300">Continuar para entrega</button>
              <p className="text-center text-xs text-slate-400">Demonstração — sem pagamento real.</p>
            </div>
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={finishDemoOrder} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div><p className="text-sm font-bold uppercase tracking-widest text-orange-600">Última etapa</p><h2 className="mt-1 text-2xl font-black text-slate-900">Dados para entrega</h2></div>
              <button type="button" onClick={() => setCheckoutOpen(false)} aria-label="Fechar" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Nome completo<input required minLength={3} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400" placeholder="Seu nome" /></label>
              <label className="block text-sm font-semibold text-slate-700">E-mail<input required type="email" autoComplete="email" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400" placeholder="voce@email.com" /></label>
              <label className="block text-sm font-semibold text-slate-700">Endereço de entrega<input required minLength={6} autoComplete="street-address" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400" placeholder="Rua, número, bairro e cidade" /></label>
            </div>
            <div className="my-5 flex justify-between rounded-xl bg-slate-50 p-4 font-bold"><span className="text-slate-600">Total demonstrativo</span><span className="text-orange-600">{formatPrice(total)}</span></div>
            <button type="submit" className="w-full rounded-xl bg-orange-600 py-3.5 font-bold text-white transition hover:bg-orange-700">Confirmar pedido de demonstração</button>
            <p className="mt-3 text-center text-xs text-slate-400">Nenhum e-mail será enviado ou pagamento realizado.</p>
          </form>
        </div>
      )}

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
