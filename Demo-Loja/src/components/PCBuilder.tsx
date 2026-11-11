import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Cpu, Gamepad2, Monitor, PackageCheck, ShieldAlert, ShoppingCart, X } from 'lucide-react';
import type { Product } from '../lib/supabase';
import { installments, money } from '../lib/promotions';

type Props = { products: Product[]; onClose: () => void; onAddBuild: (ids: string[]) => void };
type Stage = { id: string; name: string; help: string; ids: string[]; optional?: boolean };
const stages: Stage[] = [
  { id: 'cpu', name: 'Processador', help: 'O coração do seu PC: escolha AMD ou Intel.', ids: ['pc-amd-7600','pc-amd-7800x3d','pc-intel-i5'] },
  { id: 'board', name: 'Placa-mãe', help: 'A placa deve usar o mesmo socket do processador.', ids: ['pc-board-am5','pc-board-intel'] },
  { id: 'ram', name: 'Memória RAM', help: 'Confira a geração DDR compatível com a placa-mãe.', ids: ['pc-ram-ddr5','pc-ram-ddr4'] },
  { id: 'gpu', name: 'Placa de vídeo', help: 'Escolha sua placa dedicada ou continue sem GPU (quando suportado).', ids: ['pc-gpu-4060','pc-gpu-4070'], optional: true },
  { id: 'ssd', name: 'Armazenamento', help: 'SSD para sistema, programas e jogos.', ids: ['pc-ssd-1tb','pc-ssd-2tb'] },
  { id: 'psu', name: 'Fonte', help: 'Potência suficiente para os componentes selecionados.', ids: ['pc-psu-650','pc-psu-850'] },
  { id: 'case', name: 'Gabinete', help: 'Escolha o visual e o espaço para sua montagem.', ids: ['pc-case-air','pc-case-rgb'] },
  { id: 'cooler', name: 'Refrigeração', help: 'Adicione um cooler para seu processador.', ids: ['pc-cooler-air'], optional: true },
  { id: 'extras', name: 'Periféricos', help: 'Opcional: monitor, teclado, mouse e acessórios.', ids: ['local-monitor-lg-ultragear','local-keyboard-redragon','local-mouse-razer-basilisk','local-mousepad-xl','local-webcam-logitech'], optional: true }
];
export function PCBuilder({ products, onClose, onAddBuild }: Props) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string,string[]>>({});
  const active = stages[step];
  const chosenIds = stages.flatMap(stage => selected[stage.id] || []);
  const chosenProducts = chosenIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p));
  const subtotal = chosenProducts.reduce((sum,p)=>sum+p.price,0);
  const allRequired = stages.filter(s=>!s.optional).every(s=>(selected[s.id]||[]).length>0);
  const warnings = useMemo(()=>{
    const issues: string[] = [];
    const cpu = (selected.cpu||[])[0] || '';
    const board = (selected.board||[])[0] || '';
    const ram = (selected.ram||[])[0] || '';
    if (cpu && board && ((cpu.startsWith('pc-amd') && board==='pc-board-intel') || (cpu.startsWith('pc-intel') && board==='pc-board-am5'))) issues.push('Incompatibilidade: processador e placa-mãe usam sockets diferentes.');
    if (board && ram && ((board==='pc-board-am5' && ram==='pc-ram-ddr4') || (board==='pc-board-intel' && ram==='pc-ram-ddr5'))) issues.push('Incompatibilidade: placa-mãe e memória RAM possuem gerações DDR diferentes.');
    if (cpu==='pc-intel-i5' && !(selected.gpu||[]).length) issues.push('O Core i5 14400F precisa de uma placa de vídeo dedicada.');
    if ((selected.gpu||[]).includes('pc-gpu-4070') && (selected.psu||[]).includes('pc-psu-650')) issues.push('Verifique a potência e os conectores: recomendamos uma fonte de maior capacidade para a RTX 4070 nesta simulação.');
    if (chosenProducts.some(p=>p.stock<=0)) issues.push('Um dos produtos escolhidos está sem estoque demonstrativo.');
    return issues;
  },[selected,products]);
  const choose = (id:string) => setSelected(current=>{
    const existing=current[active.id]||[];
    if(active.id==='extras') return {...current,[active.id]:existing.includes(id)?existing.filter(i=>i!==id):[...existing,id]};
    return {...current,[active.id]:existing.includes(id)?[]:[id]};
  });
  const next=()=>setStep(n=>Math.min(stages.length,n+1));
  const previous=()=>setStep(n=>Math.max(0,n-1));
  const atEnd=step===stages.length;
  return <div className="fixed inset-0 z-[125] overflow-y-auto bg-slate-100 text-slate-900">
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-600"><Cpu size={24}/></span><div><p className="text-xs font-bold uppercase tracking-widest text-orange-300">TechStore Lab · Simulador</p><h1 className="text-xl font-black">Monte seu PC</h1></div></div>
        <button onClick={onClose} className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 font-semibold hover:bg-white/10"><X size={18}/> Fechar</button>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Seu setup, suas escolhas</p>
        <h2 className="mt-2 text-3xl font-black">Crie uma configuração do seu jeito.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Escolha componentes, confira alertas de compatibilidade e veja o total com parcelamento simulado. Não realizamos montagem física nem processamos pagamentos.</p>
        <div className="mt-6 flex gap-1.5">{stages.map((stage,i)=><button key={stage.id} title={stage.name} onClick={()=>setStep(i)} className={'h-2 flex-1 rounded-full '+(i<=step?'bg-orange-500':'bg-white/20')}/>)}</div>
        <p className="mt-2 text-xs text-slate-400">Etapa {Math.min(step+1,stages.length)} de {stages.length}{atEnd?' · Resumo':''}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
          {!atEnd ? <>
            <div className="mb-6"><p className="text-xs font-extrabold uppercase tracking-widest text-orange-600">Etapa 0{step+1}</p><h3 className="mt-2 text-2xl font-black">{active.name}</h3><p className="mt-1 text-slate-500">{active.help}</p></div>
            <div className="grid gap-3 md:grid-cols-2">
              {active.optional && active.id!=='extras' && <button onClick={()=>setSelected(cur=>({...cur,[active.id]:[]}))} className={'rounded-xl border-2 p-5 text-left '+(!(selected[active.id]||[]).length?'border-orange-500 bg-orange-50':'border-slate-200')}><p className="font-bold">Não adicionar agora</p><p className="mt-1 text-xs text-slate-500">Pular este componente opcional</p></button>}
              {products.filter(p=>active.ids.includes(p.id)).map(p=>{
                const checked=(selected[active.id]||[]).includes(p.id);
                return <button key={p.id} onClick={()=>choose(p.id)} disabled={p.stock<=0} className={'group relative flex items-center gap-4 rounded-xl border-2 p-3 text-left transition disabled:opacity-50 '+(checked?'border-orange-500 bg-orange-50':'border-slate-200 hover:border-orange-200')}>
                  <img src={p.image_url} alt="" className="h-24 w-24 shrink-0 rounded-lg object-contain"/>
                  <div><p className="text-sm font-bold">{p.name}</p><p className="mt-1 text-lg font-black text-orange-600">{money(p.price)}</p><p className="text-xs text-slate-500">{p.stock>0?'Em estoque demonstrativo':'Indisponível'}</p></div>
                  {checked && <CheckCircle2 size={20} className="absolute right-3 top-3 text-orange-600"/>}
                </button>;
              })}
            </div>
          </> : <>
            <div className="mb-5"><h3 className="text-2xl font-black">Sua configuração</h3><p className="mt-1 text-slate-500">Revise suas escolhas, compatibilidade e valores ilustrativos.</p></div>
            <div className="space-y-3">{chosenProducts.map(p=><div key={p.id} className="flex items-center justify-between gap-3 border-b py-3"><div className="flex items-center gap-3"><img src={p.image_url} alt="" className="h-14 w-14 rounded-lg object-contain"/><span className="font-semibold">{p.name}</span></div><span className="shrink-0 font-bold">{money(p.price)}</span></div>)}</div>
            {warnings.length>0 && <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4"><div className="mb-2 flex items-center gap-2 font-bold text-amber-900"><ShieldAlert size={18}/> Verifique a compatibilidade</div>{warnings.map(w=><p key={w} className="mt-1 text-sm text-amber-900">• {w}</p>)}</div>}
            {warnings.length===0 && allRequired && <p className="mt-5 flex items-center gap-2 text-sm font-bold text-emerald-700"><PackageCheck size={18}/> Verificações básicas compatíveis. Confira dimensões, BIOS e conectores com o fabricante.</p>}
          </>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <button disabled={step===0} onClick={previous} className="flex items-center gap-2 rounded-xl border px-5 py-3 font-bold disabled:opacity-40"><ArrowLeft size={17}/> Voltar</button>
            {!atEnd ? <button onClick={next} disabled={!active.optional && !(selected[active.id]||[]).length} className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40">Próxima etapa <ArrowRight size={17}/></button> : <button disabled={!allRequired || warnings.length>0} onClick={()=>onAddBuild(chosenIds)} className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-40"><ShoppingCart size={18}/> Adicionar montagem ao carrinho</button>}
          </div>
        </section>
        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h3 className="flex items-center gap-2 text-lg font-black"><Monitor size={20} className="text-orange-600"/> Resumo em tempo real</h3>
          <p className="mt-1 text-xs text-slate-500">{chosenProducts.length} peças selecionadas</p>
          <div className="my-5 space-y-2 border-y py-4">{stages.map(s=><div key={s.id} className="flex items-center justify-between gap-2 text-xs"><span className="text-slate-500">{s.name}</span><span className="max-w-[175px] truncate text-right font-semibold">{(selected[s.id]||[]).length?money((selected[s.id]||[]).reduce((v,id)=>v+(products.find(p=>p.id===id)?.price||0),0)):'—'}</span></div>)}</div>
          <p className="text-sm text-slate-500">Total estimado</p><p className="text-3xl font-black text-orange-600">{money(subtotal)}</p>
          <p className="mt-2 text-sm font-bold text-slate-700">ou 10x de {installments(subtotal)} sem juros*</p>
          <p className="mt-1 text-xs text-slate-500">No Pix simulado: {money(subtotal*0.95)} (5% ilustrativos)</p>
          <p className="mt-5 text-xs leading-5 text-slate-500">*Simulação educacional. Disponibilidade, parcelamento, peças e preços não são ofertas reais. {warnings.length?'Há alertas de compatibilidade na configuração.':'Revise medidas, BIOS e consumo antes de uma compra real.'}</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-xs text-orange-900"><Gamepad2 size={16}/> Também é possível adicionar periféricos na última etapa.</div>
        </aside>
      </div>
    </div>
  </div>;
}
