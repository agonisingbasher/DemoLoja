import { Check, CheckCircle2, ChevronDown, Clock3, FileClock, FileText, Package, PackageCheck, Truck, XCircle } from 'lucide-react';
import type { DemoSale } from './AdminPanel';
import { getTrackingProgress, trackingStages } from '../lib/orderTracking';
import { money } from '../lib/promotions';

type Props = { order: DemoSale; expanded: boolean; onToggle: () => void; now: number };
const icons = [CheckCircle2, Package, FileClock, FileText, PackageCheck, Truck, Check] as const;

export function OrderTracking({order, expanded, onToggle, now}:Props) {
  const {index,cancelled,manual} = getTrackingProgress(order,now);
  const current = cancelled ? 'Cancelado' : trackingStages[index].label;
  const currentNote = cancelled ? 'Este pedido demonstrativo foi cancelado.' : trackingStages[index].note;
  const percent = cancelled ? 0 : Math.round(index / (trackingStages.length - 1) * 100);
  const invoiceStatus = cancelled ? 'Não aplicável' : index < 3 ? 'Nota fiscal pendente (simulada)' : 'Documento ilustrativo gerado na simulação';
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-lg text-slate-950">Pedido {order.id}</strong>
          <span className={'rounded-full px-3 py-1 text-xs font-black '+(cancelled?'bg-rose-50 text-rose-700':index===6?'bg-emerald-50 text-emerald-700':'bg-orange-50 text-orange-700')}>{current}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Realizado em {new Date(order.date).toLocaleString('pt-BR')} · Pedido de demonstração</p>
        <p className="mt-3 text-sm font-semibold text-slate-600">{currentNote}</p>
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><FileClock size={15}/> {invoiceStatus}</p>
      </div>
      <div className="flex min-w-36 flex-col items-end gap-2">
        <span className="text-xl font-black text-orange-600">{money(order.total)}</span>
        <span className="text-xs text-slate-500">{order.items.reduce((n,item)=>n+item.quantity,0)} item(ns)</span>
        <button onClick={onToggle} aria-expanded={expanded} aria-label={(expanded?'Ocultar':'Acompanhar')+' detalhes do pedido '+order.id} className="mt-1 flex items-center gap-2 rounded-xl bg-[#0c285a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#17417b]"> {expanded?'Ocultar detalhes':'Acompanhar pedido'} <ChevronDown size={17} className={expanded?'rotate-180 transition-transform':'transition-transform'}/></button>
      </div>
    </div>
    <div className="border-t bg-[#f8fafc] px-5 py-4 sm:px-6">
      <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500"><span>{cancelled?'Acompanhamento interrompido':'Progresso do pedido (simulação)'}</span><strong className="text-orange-700">{percent}%</strong></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Progresso ilustrativo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className={'h-full rounded-full transition-all duration-700 '+(cancelled?'bg-rose-500':'bg-gradient-to-r from-orange-500 to-amber-400')} style={{width:percent+'%'}}/></div>
      {!cancelled&&index<6&&<p className="mt-3 text-xs text-slate-500">Próxima etapa: <strong className="text-slate-700">{trackingStages[index+1].label}</strong></p>}
    </div>
    {expanded&&<div className="border-t px-5 py-6 sm:px-7">
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-[#16417e]"><Clock3 size={18} className="shrink-0"/><span><strong>Rastreamento educacional:</strong> {manual?'o andamento foi escolhido no painel demonstrativo deste navegador.':'as etapas avançam automaticamente em aproximadamente 16 minutos de teste.'} Não há postagem, entrega, rastreamento de transportadora, emissão de NF-e ou confirmação de pagamento reais.</span></div>
      {cancelled?<div className="flex items-center gap-3 rounded-xl bg-rose-50 p-5 text-rose-800"><XCircle size={22}/><span className="font-bold">Pedido cancelado na simulação.</span></div>:<ol className="relative space-y-0" aria-label="Etapas do pedido">
        {trackingStages.map((stage,i)=>{
          const Icon=icons[i];
          const done=i<index, active=i===index, pending=i>index;
          const color=done?'border-emerald-500 bg-emerald-500 text-white':active?'border-orange-500 bg-orange-500 text-white':'border-slate-200 bg-white text-slate-400';
          return <li key={stage.id} className="relative flex gap-4 pb-7 last:pb-0">
            {i<trackingStages.length-1&&<div aria-hidden="true" className={'absolute left-[17px] top-9 h-[calc(100%-33px)] w-[2px] '+(i<index?'bg-emerald-400':'bg-slate-200')}/>}
            <span className={'relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 '+color}><Icon size={17}/></span>
            <div className="flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2"><p className={'font-black '+(pending?'text-slate-400':active?'text-orange-700':'text-slate-800')}>{stage.label}</p>{done&&<span className="text-xs font-semibold text-emerald-700">Concluída na simulação</span>}{active&&<span className="rounded-full bg-orange-50 px-2 py-1 text-[11px] font-black text-orange-700">Em andamento</span>}</div>
              <p className={'mt-1 text-sm leading-6 '+(pending?'text-slate-400':'text-slate-500')}>{stage.note}</p>
            </div>
          </li>;
        })}
      </ol>}
      <div className="mt-6 rounded-2xl border bg-slate-50 p-5">
        <h3 className="flex items-center gap-2 text-base font-black"><Package size={19} className="text-orange-600"/> Itens do pedido</h3>
        <div className="mt-4 space-y-3">{order.items.map((item,i)=><div key={item.productId+'-'+i} className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm"><div className="font-semibold">{item.quantity}× {item.name}</div><strong>{money(item.quantity*item.unitPrice)}</strong></div>)}</div>
        <div className="mt-5 flex flex-wrap gap-4 border-t pt-4 text-xs text-slate-500"><span>Pagamento: <strong>{order.paymentMethod==='pix'?'Pix (simulado)':order.paymentMethod==='card'?'Cartão (simulado)':'Boleto (simulado)'}</strong></span><span>NF-e: <strong>Não emitida</strong></span><span>Código de rastreio real: <strong>Indisponível</strong></span></div>
      </div>
    </div>}
  </article>;
}
