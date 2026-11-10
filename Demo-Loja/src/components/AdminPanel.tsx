import { useState, type FormEvent } from 'react';
import { BarChart3, Boxes, LogOut, PackagePlus, ShoppingBag, Trash2, TrendingUp } from 'lucide-react';
import type { Product } from '../lib/supabase';

export interface DemoSale {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: { productId: string; name: string; quantity: number; unitPrice: number }[];
}
interface AdminPanelProps {
  products: Product[];
  sales: DemoSale[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateStock: (id: string, stock: number) => void;
  onLogout: () => void;
}
const money = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function AdminPanel({ products, sales, onAddProduct, onDeleteProduct, onUpdateStock, onLogout }: AdminPanelProps) {
  const [tab, setTab] = useState<'overview' | 'products' | 'sales'>('overview');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('199.90');
  const [stock, setStock] = useState('10');
  const [category, setCategory] = useState('perifericos');
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const sold = sales.reduce((sum, sale) => sum + sale.items.reduce((n, item) => n + item.quantity, 0), 0);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !description.trim()) return;
    onAddProduct({
      id: `custom-${Date.now()}`, name: name.trim(), description: description.trim(),
      details: details.trim() || description.trim(), features: [], price: Math.max(0, Number(price) || 0),
      original_price: null, image_url: image.trim() || 'https://placehold.co/800x600?text=Novo+Produto',
      category_id: category, stock: Math.max(0, Number(stock) || 0), rating: 5, featured: false,
      created_at: new Date().toISOString(),
    });
    setName(''); setDescription(''); setDetails(''); setImage(''); setShowForm(false);
  };
  const tabs = [{ id: 'overview', label: 'Visão geral', icon: BarChart3 }, { id: 'products', label: 'Produtos', icon: Boxes }, { id: 'sales', label: 'Vendas', icon: ShoppingBag }] as const;
  return <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-100">
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950 px-5 py-4 text-white shadow-lg md:px-10">
      <div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">TechStore • Administração</p><h1 className="text-xl font-black">Painel de controle</h1></div>
      <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"><LogOut size={17}/> Sair</button>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-7 flex flex-wrap gap-2">{tabs.map(({id,label,icon:Icon}) => <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${tab===id?'bg-orange-600 text-white':'bg-white text-slate-600 hover:bg-orange-50'}`}><Icon size={17}/>{label}</button>)}</div>
      {tab === 'overview' && <>
        <div className="mb-7"><h2 className="text-2xl font-black text-slate-900">Visão geral</h2><p className="mt-1 text-slate-500">Resumo da operação demonstrativa da loja.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {label:'Vendas realizadas',value:String(sales.length),icon:ShoppingBag},
            {label:'Unidades vendidas',value:String(sold),icon:TrendingUp},
            {label:'Produtos cadastrados',value:String(products.length),icon:Boxes},
            {label:'Faturamento demonstrativo',value:money(revenue),icon:BarChart3},
          ].map(({label,value,icon:Icon})=><article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-slate-500"><span className="text-sm font-semibold">{label}</span><Icon className="text-orange-500"/></div><p className="mt-4 text-2xl font-black text-slate-900">{value}</p></article>)}
        </div>
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6"><h3 className="font-black text-slate-900">Estoque</h3><p className="mt-2 text-slate-600">{products.reduce((n,p)=>n+p.stock,0)} unidades disponíveis em {products.length} produtos.</p><p className="mt-2 text-sm text-slate-400">Os dados ficam salvos apenas neste navegador.</p></section>
      </>}
      {tab === 'products' && <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black text-slate-900">Gerenciar produtos</h2><p className="mt-1 text-slate-500">Cadastre itens, ajuste o estoque ou remova produtos.</p></div><button onClick={()=>setShowForm(v=>!v)} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700"><PackagePlus size={18}/> Novo produto</button></div>
        {showForm && <form onSubmit={submit} className="mb-6 grid gap-3 rounded-2xl border border-orange-200 bg-white p-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Nome<input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
          <label className="text-sm font-semibold text-slate-700">Categoria<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3"><option value="consoles">Consoles</option><option value="perifericos">Periféricos</option><option value="acessorios">Acessórios</option><option value="cadeiras">Cadeiras</option></select></label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Descrição<input required value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Detalhes<input value={details} onChange={e=>setDetails(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">URL da imagem<input value={image} onChange={e=>setImage(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border p-3"/></label>
          <label className="text-sm font-semibold text-slate-700">Preço (R$)<input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
          <label className="text-sm font-semibold text-slate-700">Estoque inicial<input type="number" min="0" step="1" value={stock} onChange={e=>setStock(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
          <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={()=>setShowForm(false)} className="rounded-lg border px-4 py-2 font-semibold">Cancelar</button><button type="submit" className="rounded-lg bg-orange-600 px-5 py-2 font-bold text-white">Salvar produto</button></div>
        </form>}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Produto</th><th className="p-4">Categoria</th><th className="p-4">Preço</th><th className="p-4">Estoque</th><th className="p-4">Ação</th></tr></thead><tbody>{products.map(p=><tr key={p.id} className="border-t"><td className="p-4"><div className="flex items-center gap-3"><img src={p.image_url} alt="" className="h-12 w-12 rounded-lg bg-slate-100 object-contain"/><span className="font-bold text-slate-800">{p.name}</span></div></td><td className="p-4 capitalize text-slate-500">{p.category_id}</td><td className="p-4 font-semibold">{money(p.price)}</td><td className="p-4"><input aria-label={`Estoque de ${p.name}`} type="number" min="0" value={p.stock} onChange={e=>onUpdateStock(p.id,Math.max(0,Number(e.target.value)||0))} className="w-20 rounded-lg border p-2"/></td><td className="p-4"><button onClick={()=>onDeleteProduct(p.id)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-semibold text-rose-600 hover:bg-rose-50"><Trash2 size={16}/>Excluir</button></td></tr>)}</tbody></table></div></div>
      </>}
      {tab === 'sales' && <><div className="mb-6"><h2 className="text-2xl font-black text-slate-900">Histórico de vendas</h2><p className="mt-1 text-slate-500">Pedidos de demonstração concluídos neste navegador.</p></div>{sales.length ? <div className="space-y-3">{[...sales].reverse().map(s=><article key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-black text-slate-900">{s.id}</p><p className="text-sm text-slate-500">{s.customer} • {s.email}</p></div><div className="text-right"><p className="font-black text-orange-600">{money(s.total)}</p><p className="text-xs text-slate-400">{new Date(s.date).toLocaleString('pt-BR')}</p></div></div><ul className="mt-3 border-t pt-3 text-sm text-slate-600">{s.items.map((item,i)=><li key={i}>{item.quantity}× {item.name} — {money(item.unitPrice*item.quantity)}</li>)}</ul></article>)}</div> : <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-slate-500">Ainda não existem vendas. Faça um pedido demonstrativo na loja para vê-lo aqui.</div>}</>}
      <p className="mt-8 text-xs leading-5 text-slate-400">Painel educacional: login e dados armazenados no navegador não oferecem segurança real. Não utilize informações pessoais ou dados de pagamento.</p>
    </main>
  </div>;
}
