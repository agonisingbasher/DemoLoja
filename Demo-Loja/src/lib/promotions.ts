export type Coupon = { code: string; label: string; description: string; type: 'percent' | 'fixed'; value: number; minSubtotal: number; maxDiscount?: number; category?: string; };
export const coupons: Coupon[] = [
  { code: 'TECH10', label: 'Boas-vindas', description: '10% em compras a partir de R$ 199 (máx. R$ 120)', type: 'percent', value: 10, minSubtotal: 199, maxDiscount: 120 },
  { code: 'GAMER15', label: 'Setup Gamer', description: '15% em periféricos a partir de R$ 299 (máx. R$ 150)', type: 'percent', value: 15, minSubtotal: 299, maxDiscount: 150, category: 'perifericos' },
  { code: 'SWITCH100', label: 'Semana Nintendo', description: 'R$ 100 em consoles a partir de R$ 1.999', type: 'fixed', value: 100, minSubtotal: 1999, category: 'consoles' },
  { code: 'EXTRA50', label: 'Desconto Extra', description: 'R$ 50 em pedidos a partir de R$ 699', type: 'fixed', value: 50, minSubtotal: 699 }
];
export type BasketItem = { category_id: string; price: number; quantity: number };
export function calculateCoupon(code: string, items: BasketItem[]): { discount: number; error: string; coupon?: Coupon } {
  const coupon = coupons.find(item => item.code === code.trim().toUpperCase());
  if (!coupon) return { discount: 0, error: 'Cupom não encontrado.' };
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const eligible = items.filter(item => !coupon.category || coupon.category === item.category_id).reduce((sum,item)=>sum+item.price*item.quantity,0);
  if (eligible <= 0) return { discount: 0, error: 'Nenhum item elegível para este cupom.' };
  const minimumBase = coupon.category ? eligible : subtotal;
  if (minimumBase < coupon.minSubtotal) return { discount: 0, error: 'Valor mínimo em itens elegíveis: ' + money(coupon.minSubtotal) + '.' };
  const base = coupon.type === 'percent' ? eligible * coupon.value / 100 : coupon.value;
  return { discount: Math.round(Math.min(eligible, base, coupon.maxDiscount ?? Infinity)*100)/100, error: '', coupon };
}
const currencyLocale=()=>{
  try{
    const selected=localStorage.getItem('techstore_language_v1');
    if(selected==='en')return 'en-US';
    if(selected==='es')return 'es-ES';
    if(selected==='fr')return 'fr-FR';
  }catch{/* Storage may be disabled */}
  return 'pt-BR';
};
export const dateLocale=currencyLocale;
export const money = (n: number) => n.toLocaleString(currencyLocale(), {style:'currency',currency:'BRL'});
export const installments = (amount:number, count=10) => money(amount/count);
