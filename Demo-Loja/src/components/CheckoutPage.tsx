import { useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2, ChevronRight, CreditCard, Gift, LockKeyhole, MapPin, Minus, Package, Plus, Printer, ShieldCheck, ShoppingCart, Tag, Trash2, Truck, Wallet } from 'lucide-react';
import type { Product } from '../lib/supabase';
import type { AccountProfile, DeliveryAddress } from '../lib/customerAccount';
import { calculateCoupon, coupons, money } from '../lib/promotions';

export type CheckoutSubmission={
  customer:string;email:string;total:number;discount:number;shipping:number;
  paymentMethod:'pix'|'card'|'boleto';couponCode?:string;
};
type CheckoutItem={product:Product;quantity:number};
type Props={
  items:CheckoutItem[];initialCoupon:string;account:AccountProfile|null;
  onBack:()=>void;onQuantityChange:(id:string,delta:number)=>void;onRemove:(id:string)=>void;
  onFinish:(payload:CheckoutSubmission)=>string;onCompleted:()=>void;
};
const steps=[
  {label:'Carrinho',icon:ShoppingCart},{label:'Endereço',icon:MapPin},
  {label:'Entrega',icon:Truck},{label:'Pagamento',icon:CreditCard},
  {label:'Revisão',icon:ShieldCheck},{label:'Concluir',icon:CheckCircle2}
] as const;
const onlyDigits=(s:string)=>s.replace(/\D/g,'');
const fmtCep=(s:string)=>onlyDigits(s).slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2');
const fmtCpf=(s:string)=>onlyDigits(s).slice(0,11).replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
const fmtPhone=(s:string)=>onlyDigits(s).slice(0,11).replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{4,5})(\d{4})$/,'$1-$2');
const shippingOptions=[
  {id:'economico',title:'Entrega econômica',duration:'7–10 dias úteis (simulação)',base:19.9},
  {id:'expresso',title:'Entrega expressa',duration:'3–5 dias úteis (simulação)',base:34.9},
  {id:'retirada',title:'Retirada demonstrativa',duration:'Sem local físico de retirada',base:0}
] as const;
type DeliveryChoice=typeof shippingOptions[number]['id'];
type PaymentChoice=CheckoutSubmission['paymentMethod'];
const emptyAddress:DeliveryAddress={street:'',number:'',complement:'',district:'',city:'',state:'',cep:''};
function validateCPF(value:string) {
  const s=onlyDigits(value);if(s.length!==11||/^(\d)\1+$/.test(s))return false;
  for(let j=9;j<=10;j++){let sum=0;for(let k=0;k<j;k++)sum+=Number(s[k])*(j+1-k);const d=(sum*10)%11;if(Number(s[j])!==(d===10?0:d))return false;}return true;
}
export function CheckoutPage({items,initialCoupon,account,onBack,onQuantityChange,onRemove,onFinish,onCompleted}:Props){
  const [step,setStep]=useState(0);
  const [invoice,setInvoice]=useState({name:account?.name||'',cpf:'',email:account?.email||'',phone:account?.phone||''});
  const [address,setAddress]=useState<DeliveryAddress>(account?.address||emptyAddress);
  const [shippingChoice,setShippingChoice]=useState<DeliveryChoice>('economico');
  const [payment,setPayment]=useState<PaymentChoice>('pix');
  const [installments,setInstallments]=useState(10);
  const [couponInput,setCouponInput]=useState(initialCoupon);
  const [coupon,setCoupon]=useState(initialCoupon);
  const [message,setMessage]=useState('');
  const [orderId,setOrderId]=useState('');
  const [completedItems,setCompletedItems]=useState<CheckoutItem[]>([]);
  const [completedTotal,setCompletedTotal]=useState(0);
  const subtotal=items.reduce((sum,item)=>sum+item.product.price*item.quantity,0);
  const couponResult=useMemo(()=>coupon?calculateCoupon(coupon,items.map(({product,quantity})=>({category_id:product.category_id,price:product.price,quantity}))):{discount:0,error:''},[coupon,items]);
  const discount=couponResult.discount;
  const ship=shippingOptions.find(x=>x.id===shippingChoice)!;
  const shipping=shippingChoice==='retirada'?0:shippingChoice==='economico'&&subtotal>=499?0:ship.base;
  const pixDiscount=payment==='pix'?Math.round((subtotal-discount)*5)/100:0;
  const total=Math.max(0,subtotal-discount-pixDiscount)+shipping;
  const isFinished=step===5;
  const canAddress=Boolean(invoice.name.trim().length>=3&&validateCPF(invoice.cpf)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.email)&&onlyDigits(invoice.phone).length>=10&&address.street.trim()&&address.number.trim()&&address.district.trim()&&address.city.trim()&&/^[a-zA-Z]{2}$/.test(address.state)&&onlyDigits(address.cep).length===8);
  const applyCoupon=()=>{
    const result=calculateCoupon(couponInput,items.map(({product,quantity})=>({category_id:product.category_id,price:product.price,quantity})));
    if(result.error){setMessage(result.error);return;}
    setCoupon(couponInput.trim().toUpperCase());setMessage('Cupom aplicado! Verifique o desconto no resumo.');
  };
  const next=()=>{
    setMessage('');
    if(step===0&&items.length===0){setMessage('Adicione pelo menos um produto ao carrinho.');return;}
    if(step===1&&!canAddress){setMessage('Preencha os dados de faturamento e endereço com informações fictícias válidas para continuar.');return;}
    if(step<4){setStep(n=>n+1);window.scrollTo(0,0);}
  };
  const complete=(event:FormEvent)=>{
    event.preventDefault();if(!canAddress||!items.length){setMessage('Confira os dados do pedido antes de concluir.');return;}
    const id=onFinish({customer:invoice.name.trim(),email:invoice.email.trim(),total,shipping,discount:discount+pixDiscount,paymentMethod:payment,couponCode:coupon||undefined});
    setOrderId(id);setCompletedItems([...items]);setCompletedTotal(total);setStep(5);window.scrollTo(0,0);
  };
  const field=(label:string,value:string,onChange:(s:string)=>void,placeholder:string,required=true)=><label className="block text-sm font-bold text-slate-700">{label}{required?' *':''}<input required={required} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/></label>;
  const subtotalLabel=items.reduce((count,item)=>count+item.quantity,0);
  return <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
    <header className="border-b border-white/10 bg-[#0c285a] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5"><button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-white"><ArrowLeft size={18}/> Voltar à loja</button><p className="text-xl font-black">Tech<span className="text-orange-400">Store</span></p><span className="hidden items-center gap-2 text-xs text-slate-200 sm:flex"><LockKeyhole size={16}/> Checkout de demonstração</span></div>
    </header>
    <div className="border-b bg-white"><div className="mx-auto max-w-7xl px-4 py-5"><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{steps.map(({label,icon:Icon},index)=><button key={label} disabled={index>step||isFinished} onClick={()=>{setStep(index);setMessage('');}} aria-current={step===index?'step':undefined} className={'flex items-center gap-2 rounded-xl border px-2 py-3 text-left text-xs font-bold sm:justify-center '+(step===index?'border-orange-500 bg-orange-50 text-orange-700':step>index?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-slate-200 bg-slate-50 text-slate-400')}>{step>index?<Check size={16}/>:<Icon size={16}/>}<span>{label}</span></button>)}</div></div></div>
    <main className="mx-auto max-w-7xl px-4 py-9">
      <div className="mb-6"><p className="text-xs font-black uppercase tracking-widest text-orange-600">TechStore · Finalização</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{['Revise seu carrinho','Dados para faturamento e entrega','Escolha como receber','Selecione o pagamento','Revise todos os detalhes','Pedido demonstrativo concluído!'][step]}</h1><p className="mt-2 text-sm leading-6 text-slate-500">Fluxo de portfólio: não processa pagamentos, não emite nota fiscal e não realiza entregas. Use somente dados fictícios.</p></div>
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="min-w-0">
          {step===0&&<section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7"><h2 className="mb-5 flex items-center gap-2 text-lg font-black"><ShoppingCart className="text-orange-600"/> Seu carrinho ({subtotalLabel} itens)</h2>{items.length?items.map(({product,quantity})=><article key={product.id} className="flex flex-wrap items-center gap-4 border-t py-5"><img src={product.image_url} alt="" className="h-24 w-24 rounded-xl bg-slate-50 object-contain"/><div className="min-w-48 flex-1"><h3 className="font-bold">{product.name}</h3><p className="mt-1 text-xs text-slate-500">Vendido por TechStore Demo · Estoque demonstrativo</p><p className="mt-2 text-lg font-black text-orange-600">{money(product.price*quantity)}</p></div><div className="flex items-center gap-2"><button onClick={()=>onQuantityChange(product.id,-1)} aria-label={'Diminuir '+product.name} className="rounded-lg border p-2"><Minus size={15}/></button><span className="w-7 text-center font-bold">{quantity}</span><button disabled={quantity>=product.stock} onClick={()=>onQuantityChange(product.id,1)} aria-label={'Aumentar '+product.name} className="rounded-lg border p-2 disabled:opacity-40"><Plus size={15}/></button><button onClick={()=>onRemove(product.id)} className="ml-2 rounded-lg p-2 text-rose-600" aria-label={'Remover '+product.name}><Trash2 size={19}/></button></div></article>):<p className="py-14 text-center text-slate-500">Seu carrinho está vazio.</p>}
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4"><label className="flex items-center gap-2 text-sm font-black"><Gift size={18} className="text-orange-600"/> Aplicar cupom demonstrativo</label><div className="mt-3 flex gap-2"><input value={couponInput} onChange={e=>setCouponInput(e.target.value.toUpperCase())} placeholder="Ex.: TECH10" className="min-w-0 flex-1 rounded-lg border px-3 py-3 text-sm uppercase"/><button onClick={applyCoupon} className="rounded-lg bg-[#0c285a] px-4 py-3 text-sm font-bold text-white">Aplicar</button></div><p className="mt-2 text-xs text-slate-600">Disponíveis: {coupons.map(c=>c.code).join(' · ')}</p></div>
          </section>}
          {step===1&&<section className="space-y-7 rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
            <div><h2 className="flex items-center gap-2 text-xl font-black"><BadgeCheck className="text-orange-600"/> Informações na nota fiscal ilustrativa</h2><p className="mt-2 text-xs text-slate-500">Não será emitida nota fiscal. CPF e celular são mantidos temporariamente nesta tela, não nos pedidos gravados.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">
              {field('Nome',invoice.name,v=>setInvoice(x=>({...x,name:v})),'Nome de teste')}
              {field('CPF',invoice.cpf,v=>setInvoice(x=>({...x,cpf:fmtCpf(v)})),'111.444.777-35')}
              {field('E-mail',invoice.email,v=>setInvoice(x=>({...x,email:v})),'cliente@example.com')}
              {field('Celular',invoice.phone,v=>setInvoice(x=>({...x,phone:fmtPhone(v)})),'(11) 99999-9999')}
            </div></div>
            <div className="border-t pt-6"><h2 className="flex items-center gap-2 text-xl font-black"><MapPin className="text-orange-600"/> Seu pedido será entregue em (simulação)</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{field('Endereço (rua/avenida)',address.street,v=>setAddress(x=>({...x,street:v})),'Rua de Exemplo')}</div>
              {field('Número',address.number,v=>setAddress(x=>({...x,number:v})),'123')}
              {field('Complemento',address.complement,v=>setAddress(x=>({...x,complement:v})),'Apto 45',false)}
              {field('Bairro',address.district,v=>setAddress(x=>({...x,district:v})),'Bairro Central')}
              {field('Cidade',address.city,v=>setAddress(x=>({...x,city:v})),'Cidade Exemplo')}
              {field('UF',address.state,v=>setAddress(x=>({...x,state:v.toUpperCase().slice(0,2)})),'SP')}
              {field('CEP',address.cep,v=>setAddress(x=>({...x,cep:fmtCep(v)})),'01001-000')}
            </div></div>
            <button onClick={()=>{setInvoice({name:'Cliente Exemplo',cpf:'111.444.777-35',email:'cliente@example.com',phone:'(11) 99999-9999'});setAddress({street:'Rua de Exemplo',number:'123',complement:'Apto Demo',district:'Centro',city:'Cidade Exemplo',state:'SP',cep:'01001-000'});}} className="text-sm font-bold text-orange-700 underline">Preencher com dados totalmente fictícios</button>
          </section>}
          {step===2&&<section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-black">Opções de entrega</h2><p className="mt-2 text-sm text-slate-500">Previsões demonstrativas; não é feita nenhuma consulta a transportadoras ou cálculo real por CEP.</p><div className="mt-6 space-y-3">{shippingOptions.map(option=>{const amount=option.id==='retirada'?0:option.id==='economico'&&subtotal>=499?0:option.base;return <button key={option.id} onClick={()=>setShippingChoice(option.id)} className={'flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left '+(shippingChoice===option.id?'border-orange-500 bg-orange-50':'border-slate-200 hover:border-orange-200')}><Truck className="shrink-0 text-orange-600" size={23}/><div className="flex-1"><h3 className="font-black">{option.title}</h3><p className="mt-1 text-sm text-slate-500">{option.duration}</p></div><p className="font-black">{amount===0?'Grátis':money(amount)}</p>{shippingChoice===option.id&&<CheckCircle2 size={19} className="text-orange-600"/>}</button>})}</div><p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Destino de exemplo: {address.street}, {address.number} · {address.city}/{address.state} · {address.cep}</p></section>}
          {step===3&&<section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-black">Escolha a forma de pagamento</h2><p className="mt-2 text-sm text-slate-500">Nenhum dado de cartão, boleto ou Pix será solicitado ou processado.</p><div className="mt-6 space-y-3">{([{id:'pix',label:'Pix à vista',sub:'5% de desconto adicional (ilustrativo)',icon:Wallet},{id:'card',label:'Cartão de crédito',sub:'Até 10x sem juros (simulado)',icon:CreditCard},{id:'boleto',label:'Boleto à vista',sub:'Não será gerado boleto real',icon:Package}] as const).map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>setPayment(item.id)} className={'flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left '+(payment===item.id?'border-orange-500 bg-orange-50':'border-slate-200 hover:border-orange-200')}><Icon size={23} className="shrink-0 text-orange-600"/><div className="flex-1"><h3 className="font-black">{item.label}</h3><p className="mt-1 text-sm text-slate-500">{item.sub}</p></div>{payment===item.id&&<CheckCircle2 size={19} className="text-orange-600"/>}</button>})}</div>
            {payment==='card'&&<label className="mt-5 block text-sm font-bold text-slate-700">Número de parcelas<select value={installments} onChange={e=>setInstallments(Number(e.target.value))} className="mt-2 w-full rounded-xl border bg-white px-4 py-3">{Array.from({length:10},(_,i)=>i+1).map(n=><option value={n} key={n}>{n}x de {money(total/n)} sem juros (simulado)</option>)}</select></label>}
            <p className="mt-5 rounded-xl bg-[#eaf0fa] p-4 text-sm text-[#0c285a]">Pagamento selecionado: <strong>{payment==='pix'?'Pix à vista':payment==='card'?installments+'x de '+money(total/installments)+' no cartão':'Boleto à vista'}</strong>. Nenhum pagamento será realizado.</p>
          </section>}
          {step===4&&<section className="space-y-5">
            <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7"><div className="flex justify-between gap-3"><h2 className="text-lg font-black">Informações na nota fiscal (ilustrativa)</h2><button onClick={()=>setStep(1)} className="text-sm font-bold text-orange-700">Alterar</button></div><dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Nome</dt><dd className="font-bold">{invoice.name}</dd></div><div><dt className="text-slate-500">CPF</dt><dd className="font-bold">{invoice.cpf}</dd></div><div><dt className="text-slate-500">E-mail</dt><dd className="font-bold">{invoice.email}</dd></div><div><dt className="text-slate-500">Celular</dt><dd className="font-bold">{invoice.phone}</dd></div></dl></div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7"><div className="flex justify-between gap-3"><h2 className="text-lg font-black">Seu pedido será entregue em</h2><button onClick={()=>setStep(1)} className="text-sm font-bold text-orange-700">Alterar</button></div><p className="mt-3 text-sm leading-7">{address.street}, {address.number}{address.complement?', '+address.complement:''} · {address.district}<br/>{address.city}/{address.state} · CEP {address.cep}</p></div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7"><div className="flex justify-between gap-3"><h2 className="text-lg font-black">Envio 1 · {subtotalLabel} produto(s)</h2><button onClick={()=>setStep(2)} className="text-sm font-bold text-orange-700">Alterar frete</button></div>{items.map(({product,quantity})=><div key={product.id} className="mt-4 flex gap-4 border-t py-4"><img src={product.image_url} alt="" className="h-24 w-24 rounded-lg object-contain"/><div><p className="font-semibold">{product.name}</p><p className="mt-1 text-sm text-slate-500">Quantidade: {quantity}</p><p className="mt-1 text-sm font-bold">{money(product.price*quantity)}</p></div></div>)}<p className="mt-2 text-sm"><strong>Produtos vendidos por:</strong> TechStore Demo</p><p className="mt-1 text-sm"><strong>Previsão de entrega:</strong> {ship.duration}</p><p className="mt-1 text-sm"><strong>Frete:</strong> {shipping===0?'Grátis':money(shipping)}</p><p className="mt-2 text-xs text-slate-400">*Não existe confirmação de pagamento, transportadora, estoque real ou prazo garantido.</p></div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">Forma de pagamento</h2><p className="mt-2 text-sm font-semibold">{payment==='pix'?'PIX à vista':payment==='card'?'Cartão de crédito · '+installments+'x sem juros':'Boleto à vista'}</p></div><button onClick={()=>setStep(3)} className="text-sm font-bold text-orange-700">Alterar</button></div></div>
          </section>}
          {step===5&&<section className="rounded-2xl border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-12"><CheckCircle2 size={70} className="mx-auto text-emerald-600"/><h2 className="mt-5 text-3xl font-black">Obrigado por explorar a TechStore!</h2><p className="mt-3 text-slate-600">Seu pedido de demonstração foi registrado neste navegador.</p><p className="mt-4 rounded-xl bg-emerald-50 p-4 text-lg font-black text-emerald-800">Código: {orderId}</p><p className="mt-4 text-sm">Total ilustrativo: <strong>{money(completedTotal)}</strong></p><p className="mt-2 text-xs text-slate-500">{completedItems.length} tipo(s) de produto. Não enviamos e-mail, nota fiscal, cobrança ou mercadoria.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={()=>window.print()} className="flex items-center gap-2 rounded-xl border px-5 py-3 font-bold"><Printer size={18}/> Imprimir resumo</button><button onClick={onCompleted} className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-bold text-white">Voltar à loja <ArrowRight size={18}/></button></div></section>}
          {message&&step!==5&&<p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{message}</p>}
          {step<5&&<div className="mt-7 flex flex-wrap justify-between gap-3"><button onClick={()=>step===0?onBack():setStep(n=>n-1)} className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold"><ArrowLeft size={17}/>{step===0?'Continuar comprando':'Etapa anterior'}</button>{step===4?<button onClick={complete} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 font-black text-white hover:bg-emerald-700"><CheckCircle2 size={20}/> Concluir pedido de demonstração</button>:<button onClick={next} className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-4 font-black text-white hover:bg-orange-700">Continuar <ArrowRight size={18}/></button>}</div>}
        </div>
        {!isFinished&&<aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-7">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-black"><Package size={21} className="text-orange-600"/> Resumo do pedido</h2>
          <div className="space-y-4 border-b pb-5 text-sm">{items.map(({product,quantity})=><div key={product.id} className="flex items-center gap-3"><img src={product.image_url} alt="" className="h-14 w-14 rounded-lg bg-slate-50 object-contain"/><p className="flex-1 text-xs font-semibold">{product.name}<span className="block text-slate-400">Quantidade: {quantity}</span></p><strong className="whitespace-nowrap text-xs">{money(product.price*quantity)}</strong></div>)}</div>
          <div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span>Valor dos produtos ({subtotalLabel})</span><strong>{money(subtotal)}</strong></div>{discount>0&&<div className="flex justify-between font-semibold text-emerald-700"><span>Desconto {coupon}</span><span>- {money(discount)}</span></div>}{pixDiscount>0&&<div className="flex justify-between font-semibold text-emerald-700"><span>Desconto Pix</span><span>- {money(pixDiscount)}</span></div>}<div className="flex justify-between"><span>Frete simulado</span><strong>{shipping===0?'Grátis':money(shipping)}</strong></div><div className="flex justify-between border-t pt-4 text-lg font-black"><span>Total</span><span className="text-orange-600">{money(total)}</span></div><p className="text-xs font-semibold text-slate-500">{payment==='pix'?'À vista no Pix (simulado)':payment==='card'?'Em '+installments+'x de '+money(total/installments)+' sem juros (simulado)':'À vista no boleto (simulado)'}</p></div>
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-[#eaf0fa] p-3 text-xs leading-5 text-[#12326b]"><ShieldCheck size={20} className="shrink-0"/> Projeto de demonstração. Não há produtos enviados, notas fiscais emitidas nem dados de pagamento processados.</p>
        </aside>}
      </div>
    </main>
    <footer className="mt-8 border-t bg-[#08152e] px-4 py-7 text-center text-xs text-slate-400">© TechStore · Experiência de checkout demonstrativa · Nenhuma transação real</footer>
  </div>;
}
