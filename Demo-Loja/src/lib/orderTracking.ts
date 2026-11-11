/**
 * TechStore educational order tracking.
 * The timeline is an accelerated, clearly labeled demonstration.
 * No payment is verified, no fiscal document is issued and no carrier is contacted.
 */
export const trackingStages = [
  { id: 'received', label: 'Pedido recebido', note: 'Pedido de teste registrado com sucesso.' },
  { id: 'preparing', label: 'Em preparação', note: 'Separação dos produtos simulada.' },
  { id: 'invoice_pending', label: 'Nota fiscal pendente', note: 'Nenhuma nota fiscal real será emitida.' },
  { id: 'invoice_demo', label: 'Documento fiscal ilustrativo', note: 'Etapa fictícia: não existe NF-e nem chave de acesso.' },
  { id: 'shipped', label: 'Pedido enviado', note: 'Despacho demonstrativo, sem transportadora.' },
  { id: 'transit', label: 'Em transporte', note: 'Rastreamento ilustrativo; não há encomenda física.' },
  { id: 'delivered', label: 'Entregue', note: 'Conclusão da simulação, sem entrega real.' }
] as const;

export type TrackingStatus =
  | 'Recebido' | 'Em preparação' | 'Em separação'
  | 'Nota fiscal pendente' | 'Documento fiscal ilustrativo'
  | 'Enviado' | 'Em transporte' | 'Entregue'
  | 'Concluído' | 'Cancelado';

export const manualTrackingOptions: TrackingStatus[] = [
  'Recebido', 'Em preparação', 'Nota fiscal pendente',
  'Documento fiscal ilustrativo', 'Enviado', 'Em transporte',
  'Entregue', 'Cancelado'
];

const stageMap: Partial<Record<TrackingStatus, number>> = {
  'Recebido': 0,
  'Em preparação': 1, 'Em separação': 1,
  'Nota fiscal pendente': 2,
  'Documento fiscal ilustrativo': 3,
  'Enviado': 4,
  'Em transporte': 5,
  'Entregue': 6, 'Concluído': 6
};
// Minutes since the demo order was recorded. This is NOT actual fulfillment tracking.
const demoMinutes = [0, 1, 3, 5, 8, 11, 16];

export type TrackableOrder = {
  date: string;
  status?: TrackingStatus;
  trackingManual?: boolean;
};
export function getTrackingProgress(order: TrackableOrder, now = Date.now()) {
  if (order.status === 'Cancelado') return { index: -1, cancelled: true, manual: true };
  if (order.trackingManual || (order.status && order.status !== 'Recebido')) {
    return { index: stageMap[order.status as TrackingStatus] ?? 0, cancelled: false, manual: true };
  }
  const timestamp = new Date(order.date).getTime();
  const elapsedMinutes = Number.isFinite(timestamp) ? Math.max(0, (now - timestamp) / 60000) : 0;
  let index = 0;
  for (let i = 1; i < demoMinutes.length; i++) {
    if (elapsedMinutes >= demoMinutes[i]) index = i;
  }
  return { index, cancelled: false, manual: false };
}
export function getTrackingLabel(order: TrackableOrder, now = Date.now()) {
  const progress = getTrackingProgress(order, now);
  return progress.cancelled ? 'Cancelado' : trackingStages[progress.index].label;
}
