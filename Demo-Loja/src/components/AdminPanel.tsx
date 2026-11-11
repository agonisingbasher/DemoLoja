import { useState, type FormEvent } from 'react';
import { Activity, ArrowUpRight, BarChart3, Bell, Boxes, CalendarDays, Download, Gift, LayoutDashboard, LogOut, PackagePlus, Search, ShoppingBag, Trash2, TrendingUp, Users, AlertTriangle, Wallet, CheckCircle2 } from 'lucide-react';
import { coupons } from '../lib/promotions';
import type { Product } from '../lib/supabase';

export interface DemoSale {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: { productId: string; name: string; quantity: number; unitPrice: number }[];
  status?: 'Recebido'|'Em separação'|'Em transporte'|'Concluído'|'Cancelado';
  paymentMethod?: 'card'|'pix'|'boleto';
  couponCode?: string;
  discount?: number;
  shipping?: number;
}
interface AdminPanelProps {
  products: Product[];
  sales: DemoSale[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateStock: (id: string, stock: number) => void;
  onLogout: () => void;
  onUpdateSaleStatus: (id: string, status: NonNullable<DemoSale['status']>) => void;
  onUpdateProduct: (id: string, patch: Partial<Product>) => void;
  onSeedDemoSales: (items: DemoSale[]) => void;
}
const money = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function AdminPanel({ products, sales, onAddProduct, onDeleteProduct, onUpdateStock, onLogout, onUpdateSaleStatus, onUpdateProduct, onSeedDemoSales }: AdminPanelProps) {
  const [tab, setTab] = useState<'overview' | 'products' | 'sales' | 'inventory' | 'customers' | 'marketing' | 'analytics'>('overview');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [period, setPeriod] = useState<'7'|'30'|'all'>('30');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('199.90');
  const [stock, setStock] = useState('10');
  const [category, setCategory] = useState('perifericos');
  const activeSales = sales.filter(s=>s.status!=='Cancelado');
  const revenue = activeSales.reduce((sum, sale) => sum + sale.total, 0);
  const today = new Date();
  const recentSales = activeSales.filter(s=>period==='all' || (today.getTime()-new Date(s.date).getTime())/86400000 <= Number(period));
  const periodRevenue = recentSales.reduce((sum,s)=>sum+s.total,0);
  const averageTicket = activeSales.length ? revenue/activeSales.length : 0;
  const last7 = Array.from({length:7},(_,index)=>{
    const date = new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()-6+index);
    return {label:date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}),amount:activeSales.filter(s=>new Date(s.date).toDateString()===date.toDateString()).reduce((n,s)=>n+s.total,0)};
  });
  const maxDay = Math.max(1,...last7.map(d=>d.amount));
  const topProducts = Object.values(activeSales.flatMap(s=>s.items).reduce<Record<string,{name:string,quantity:number,total:number}>>((acc,item)=>{
    if(!acc[item.productId])acc[item.productId]={name:item.name,quantity:0,total:0};
    acc[item.productId].quantity+=item.quantity;acc[item.productId].total+=item.quantity*item.unitPrice;return acc;
  },{})).sort((a,b)=>b.quantity-a.quantity).slice(0,5);
  const filteredOrders = [...sales].filter(s=>(statusFilter==='Todos'||(s.status||'Recebido')===statusFilter) && (s.id+' '+s.customer+' '+s.email).toLowerCase().includes(query.toLowerCase())).reverse();
  const seedOrders = () => {
    if(sales.length||!products.length)return;
    const examples=Array.from({length:18},(_,i)=>{
      const first=products[(i*7)%products.length];const second=products[(i*3+5)%products.length];
      const date=new Date();date.setDate(date.getDate()-(i%12));date.setHours(10+i%8,20,0,0);
      const count=i%3===0?2:1;
      const items=[{productId:first.id,name:first.name,quantity:count,unitPrice:first.price},...(second.id!==first.id&&i%2===0?[{productId:second.id,name:second.name,quantity:1,unitPrice:second.price}]:[])];
      return {id:'DEMO-'+String(i+1).padStart(4,'0'),customer:'Cliente Exemplo '+String(i+1),email:'cliente'+String(i+1)+'@example.com',date:date.toISOString(),total:items.reduce((n,item)=>n+item.unitPrice*item.quantity,0),items,status:(['Concluído','Recebido','Em separação','Em transporte'] as const)[i%4],couponCode:i%4===0?'TECH10':undefined,paymentMethod:(['pix','card','boleto'] as const)[i%3]} satisfies DemoSale;
    });
    onSeedDemoSales(examples);
  };
  const sold = sales.reduce((sum, sale) => sum + sale.items.reduce((n, item) => n + item.quantity, 0), 0);
  const lowStock = products.filter(product => product.stock <= 5);
  const inventoryValue = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const customers = Object.values(sales.reduce<Record<string, { email: string; name: string; orders: number; total: number }>>((acc, sale) => {
    const email = sale.email.trim().toLowerCase();
    const key = email || sale.customer.trim().toLowerCase();
    if (!acc[key]) acc[key] = { email: sale.email, name: sale.customer, orders: 0, total: 0 };
    acc[key].orders += 1;
    acc[key].total += sale.total;
    return acc;
  }, {})).sort((a, b) => b.total - a.total);
  const exportCsv = (filename: string, rows: (string | number)[][]) => {
    const csv = '\uFEFF' + rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
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
  const tabs = [
    { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'sales', label: 'Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Produtos', icon: Boxes },
    { id: 'inventory', label: 'Estoque', icon: AlertTriangle },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'marketing', label: 'Campanhas e cupons', icon: Gift },
    { id: 'analytics', label: 'Relatórios', icon: BarChart3 },
  ] as const;
  return <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#f4f6fa] text-slate-900">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950 px-4 py-4 text-white shadow-lg sm:px-7">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-600 text-xl font-black">T</span><div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">TechStore / Workspace</p><h1 className="text-xl font-black tracking-tight">Painel de controle <span className="ml-2 rounded-md bg-orange-500/20 px-2 py-1 text-xs text-orange-200">DEMO</span></h1></div></div>
        <div className="flex items-center gap-3"><span className="hidden items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 sm:flex"><CheckCircle2 size={16} className="text-emerald-400"/> Dados armazenados localmente</span><button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20"><LogOut size={17}/> Voltar à loja</button></div>
      </div>
    </header>
    <div className="mx-auto grid w-full max-w-[1500px] lg:grid-cols-[246px_minmax(0,1fr)]">
      <aside className="border-b bg-white px-3 py-5 lg:min-h-[calc(100vh-77px)] lg:border-b-0 lg:border-r">
        <p className="px-4 pb-3 text-xs font-black uppercase tracking-widest text-slate-400">Menu principal</p>
        <nav className="flex flex-wrap gap-1.5 lg:flex-col">{tabs.map(({id,label,icon:Icon})=><button key={id} onClick={()=>setTab(id)} className={'flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition '+(tab===id?'bg-orange-600 text-white shadow-md':'text-slate-600 hover:bg-orange-50 hover:text-orange-700')}><Icon size={19}/>{label}</button>)}</nav>
        <div className="mt-8 hidden rounded-2xl bg-slate-950 p-5 text-white lg:block"><div className="flex items-center gap-2 text-sm font-black"><Bell size={17} className="text-orange-400"/> Central de operação</div><p className="mt-3 text-xs leading-5 text-slate-400">{lowStock.length} produtos com estoque baixo. {sales.length} pedidos demonstrativos registrados.</p><button onClick={()=>setTab('inventory')} className="mt-4 text-xs font-bold text-orange-300">Ver alertas →</button></div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-7 lg:px-9">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-orange-600">Gestão de e-commerce • Ambiente demonstrativo</p><p className="mt-1 text-sm text-slate-500">Os indicadores representam apenas os registros deste navegador.</p></div><div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-xs font-bold text-slate-600"><CalendarDays size={16}/> {new Date().toLocaleDateString('pt-BR')}</div></div>
      {tab === 'overview' && <>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-3xl font-black text-slate-900">Visão geral da operação</h2><p className="mt-1 text-slate-500">Um centro de controle completo para a TechStore demonstrativa.</p></div>{sales.length===0&&<button onClick={seedOrders} className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700">Carregar 18 pedidos fictícios para demonstração</button>}</div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {label:'Vendas realizadas',value:String(sales.length),icon:ShoppingBag},
            {label:'Unidades vendidas',value:String(sold),icon:TrendingUp},
            {label:'Produtos cadastrados',value:String(products.length),icon:Boxes},
            {label:'Faturamento demonstrativo',value:money(revenue),icon:BarChart3},
            {label:'Ticket médio',value:money(averageTicket),icon:Wallet},
            {label:'Clientes de exemplo',value:String(customers.length),icon:Users},
            {label:'Estoque baixo',value:String(lowStock.length),icon:AlertTriangle},
            {label:'Valor em catálogo',value:money(inventoryValue),icon:Activity},
          ].map(({label,value,icon:Icon})=><article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-slate-500"><span className="text-sm font-semibold">{label}</span><Icon className="text-orange-500"/></div><p className="mt-4 text-2xl font-black text-slate-900">{value}</p></article>)}
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between"><div><h3 className="text-lg font-black">Desempenho dos últimos 7 dias</h3><p className="text-xs text-slate-500">Receita de pedidos locais não cancelados</p></div><button onClick={()=>setTab('analytics')} className="text-xs font-bold text-orange-600">Relatórios →</button></div>
            <div className="flex h-48 items-end gap-2 border-b border-dashed border-slate-200 pb-2">{last7.map(day=><div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-bold text-slate-500">{day.amount?money(day.amount):''}</span><div title={day.label+' '+money(day.amount)} className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-orange-600 to-amber-400" style={{height:String(Math.max(5,day.amount/maxDay*100))+'%'}}/><span className="text-[10px] text-slate-500">{day.label}</span></div>)}</div>
            {!sales.length&&<p className="mt-3 text-xs text-slate-400">Sem vendas locais. Use o botão de pedidos fictícios para visualizar o gráfico.</p>}
          </section>
          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><h3 className="text-lg font-black">Pedidos por situação</h3><ShoppingBag size={19} className="text-orange-500"/></div><div className="mt-5 space-y-4">{(['Recebido','Em separação','Em transporte','Concluído','Cancelado'] as const).map(status=>{const count=sales.filter(order=>(order.status||'Recebido')===status).length;return <div key={status}><div className="mb-1 flex justify-between text-xs font-semibold"><span>{status}</span><span>{count}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-orange-500" style={{width:String(sales.length?count/sales.length*100:0)+'%'}}/></div></div>})}</div><button onClick={()=>setTab('sales')} className="mt-5 text-xs font-bold text-orange-600">Gerenciar pedidos →</button></section>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6"><h3 className="font-black text-slate-900">Estoque e valor de catálogo</h3><p className="mt-2 text-slate-600">{products.reduce((n,p)=>n+p.stock,0)} unidades disponíveis em {products.length} produtos.</p><p className="mt-2 text-lg font-bold text-slate-900">{money(inventoryValue)} em estoque ilustrativo</p><button onClick={()=>setTab('inventory')} className="mt-3 text-sm font-bold text-orange-600 hover:underline">Gerenciar estoque →</button></section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h3 className="flex items-center gap-2 font-black text-amber-900"><AlertTriangle size={18}/> Alertas de estoque</h3><p className="mt-2 text-amber-900">{lowStock.length} produtos com 5 unidades ou menos.</p><p className="mt-2 text-sm text-amber-700">Dados salvos somente neste navegador.</p><button onClick={()=>setTab('inventory')} className="mt-3 text-sm font-bold text-amber-900 hover:underline">Ver alertas →</button></section>
        </div>
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
      {tab === 'inventory' && <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-black text-slate-900">Gestão de estoque</h2><p className="mt-1 text-sm text-slate-500">Controle de quantidades e alertas para itens com 5 unidades ou menos.</p></div><button onClick={()=>exportCsv('techstore-estoque.csv', [['Produto','Categoria','Preço','Quantidade','Situação'], ...products.map(p=>[p.name,p.category_id,p.price,p.stock,p.stock===0?'Esgotado':p.stock<=5?'Baixo':'Disponível'])])} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"><Download size={17}/> Exportar CSV</button></div>
        <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-white p-5"><p className="text-sm text-slate-500">Atenção ao estoque</p><p className="text-3xl font-black text-amber-600">{lowStock.length}</p></div><div className="rounded-xl bg-white p-5"><p className="text-sm text-slate-500">Esgotados</p><p className="text-3xl font-black text-rose-600">{products.filter(p=>p.stock===0).length}</p></div><div className="rounded-xl bg-white p-5"><p className="text-sm text-slate-500">Valor ilustrativo</p><p className="text-2xl font-black">{money(inventoryValue)}</p></div></div>
        <div className="space-y-3">{[...products].sort((a,b)=>a.stock-b.stock).map(p=><article key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><div className="flex items-center gap-3"><img src={p.image_url} alt="" className="h-12 w-12 rounded-lg object-contain"/><div><h3 className="max-w-sm font-bold text-slate-900">{p.name}</h3><p className={`text-xs font-semibold ${p.stock<=5?'text-amber-700':'text-emerald-700'}`}>{p.stock===0?'Esgotado':p.stock<=5?'Estoque baixo':'Disponível'}</p></div></div><label className="flex items-center gap-2 text-sm font-semibold text-slate-700">Quantidade <input aria-label={`Quantidade de ${p.name}`} type="number" min="0" step="1" value={p.stock} onChange={e=>onUpdateStock(p.id, Math.max(0,Math.floor(Number(e.target.value)||0)))} className="w-24 rounded-lg border px-3 py-2"/></label></article>)}</div>
      </section>}
      {tab === 'customers' && <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-black text-slate-900">Clientes demonstrativos</h2><p className="mt-1 text-sm text-slate-500">Dados dos pedidos simulados criados neste navegador.</p></div><button onClick={()=>exportCsv('techstore-clientes.csv', [['Nome','E-mail','Pedidos','Total'],...customers.map(c=>[c.name,c.email,c.orders,c.total])])} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"><Download size={17}/> Exportar CSV</button></div>
        {customers.length ? <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="p-4">Cliente</th><th className="p-4">E-mail</th><th className="p-4">Pedidos</th><th className="p-4">Total ilustrativo</th></tr></thead><tbody>{customers.map((c,i)=><tr key={i} className="border-t"><td className="p-4 font-bold">{c.name}</td><td className="p-4">{c.email}</td><td className="p-4">{c.orders}</td><td className="p-4 font-bold">{money(c.total)}</td></tr>)}</tbody></table></div> : <div className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-500">Nenhum cliente fictício registrado. Simule um pedido na loja.</div>}
      </section>}
      <p className="mt-8 text-xs leading-5 text-slate-400">Painel educacional: login e dados armazenados no navegador não oferecem segurança real. Não utilize informações pessoais ou dados de pagamento.</p>
    </main>
  </div>;
}
