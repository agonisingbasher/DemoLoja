import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, CircleUserRound, ClipboardList, Home, LockKeyhole, LogOut, MapPin, RefreshCw, ShieldCheck, UserRoundPlus, UserRound } from 'lucide-react';
import { MFASecurity } from './MFASecurity';
import { supabase } from '../lib/supabase';
import { profileFromUser, type AccountProfile, type DeliveryAddress } from '../lib/customerAccount';
import type { DemoSale } from './AdminPanel';
import { OrderTracking } from './OrderTracking';
import { Footer } from './Footer';

type Props = { account:AccountProfile|null;orders:DemoSale[];initialTab?:ProfileTab;
  onBack:()=>void;onChange:(profile:AccountProfile|null)=>void;
  onInfoClick:(topic:string)=>void;
};
const blankAddress:DeliveryAddress={street:'',number:'',complement:'',district:'',city:'',state:'',cep:''};
const digits=(s:string)=>s.replace(/\D/g,'');
const cepMask=(s:string)=>digits(s).slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2');
type AuthTab='login'|'register';
type ProfileTab='profile'|'address'|'orders'|'security';
export function AccountPage({account,orders,initialTab='profile',onBack,onChange,onInfoClick}:Props){
  const [authTab,setAuthTab]=useState<AuthTab>('register');
  const [profileTab,setProfileTab]=useState<ProfileTab>(initialTab);
  const [name,setName]=useState(account?.name||'');
  const [email,setEmail]=useState(account?.email||'');
  const [password,setPassword]=useState('');
  const [phone,setPhone]=useState(account?.phone||'');
  const [address,setAddress]=useState<DeliveryAddress>(account?.address||blankAddress);
  const [message,setMessage]=useState('');
  const [accountExists,setAccountExists]=useState(false);
  const [busy,setBusy]=useState(false);
  const [remoteOrders,setRemoteOrders]=useState<DemoSale[]>([]);
  const [loadingOrders,setLoadingOrders]=useState(false);
  const [ordersError,setOrdersError]=useState('');
  const [reloadOrders,setReloadOrders]=useState(0);
  const [clock,setClock]=useState(()=>Date.now());
  const [expandedOrders,setExpandedOrders]=useState<string[]>(['__auto__']);
  useEffect(()=>{
    const clockId=window.setInterval(()=>setClock(Date.now()),15000);
    return ()=>window.clearInterval(clockId);
  },[]);
  useEffect(()=>{
    if(!account || account.demo || !supabase){setRemoteOrders([]);setOrdersError('');setLoadingOrders(false);return;}
    const client=supabase;
    const userId=account.id;
    let alive=true;
    const load=async()=>{
      setLoadingOrders(true);setOrdersError('');
      const {data,error}=await client.from('customer_orders')
        .select('id,reference,user_id,amount,discount,shipping,status,payment_method,created_at,customer_order_items(product_id,product_name,quantity,unit_price)')
        .eq('user_id',userId)
        .gte('created_at',new Date(Date.now()-7*24*60*60*1000).toISOString())
        .order('created_at',{ascending:false}).limit(100);
      if(!alive)return;
      if(error){setOrdersError('Não foi possível sincronizar os pedidos do Supabase: '+error.message);}
      else if(data){
        const mapped:DemoSale[]=data.map(row=>{
          const dbItems=Array.isArray(row.customer_order_items)?row.customer_order_items:[];
          return {
            id:row.reference,
            customer:account.name,email:account.email,userId:row.user_id,backendRecorded:true,
            date:row.created_at,total:Number(row.amount),discount:Number(row.discount),shipping:Number(row.shipping),
            status:row.status==='cancelled'?'Cancelado':'Recebido',
            paymentMethod:row.payment_method,
            items:dbItems.map(item=>({productId:item.product_id,name:item.product_name,quantity:item.quantity,unitPrice:Number(item.unit_price)}))
          } as DemoSale;
        });
        setRemoteOrders(mapped);
      }
      setLoadingOrders(false);
    };
    void load();
    const refresh=window.setInterval(()=>{void load();},90000);
    return ()=>{alive=false;window.clearInterval(refresh);};
  },[account?.id,account?.demo,reloadOrders]);
  useEffect(()=>{setName(account?.name||'');setEmail(account?.email||'');setPhone(account?.phone||'');setAddress(account?.address||blankAddress);},[account]);
  const handleAuth=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setMessage('');setAccountExists(false);setBusy(true);
    try{
      if(supabase) {
        if(!email.trim()||password.length<8){setMessage('Informe um e-mail válido e senha de pelo menos 8 caracteres.');return;}
        if(authTab==='register'){
          if(name.trim().length<2){setMessage('Informe o nome para criar a conta.');return;}
          const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()},emailRedirectTo:window.location.origin+import.meta.env.BASE_URL}});
          // Supabase may return an obfuscated user with no identities for a repeat signup.
          // Never query auth.users from a public client to guess whether an address exists.
          if(error){
            if(error.code==='user_already_exists'||/user already registered/i.test(error.message)){
              setAccountExists(true);
              setMessage('Essa conta já existe! Entre com seu e-mail e senha.');
              return;
            }
            throw error;
          }
          if(data.user && Array.isArray(data.user.identities) && data.user.identities.length===0){
            setAccountExists(true);
            setMessage('Essa conta já existe! Entre com seu e-mail e senha.');
            return;
          }
          if(data.session&&data.user){onChange(profileFromUser(data.user));setMessage('Cadastro concluído. Verifique seu e-mail se a confirmação estiver ativada.');}
          else {
            try{sessionStorage.setItem('techstore_confirmation_email',email.trim().toLowerCase());}catch{/* Private mode */}
            window.location.hash='/confirmar-email';
          }
        }else{
          const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
          if(error)throw error;
          if(data.user)onChange(profileFromUser(data.user));
        }
      } else {
        // GitHub Pages without configured auth: no fake email sending, no password storage.
        if(name.trim().length<2||!email.includes('@')){setMessage('Informe um nome e e-mail fictícios para a experiência local.');return;}
        const demo:AccountProfile={id:'demo-local',name:name.trim(),email:email.trim(),phone:'',address:null,demo:true};
        onChange(demo);
        setMessage('Perfil de demonstração criado neste navegador. Nenhum e-mail foi enviado.');
      }
    }catch(error){
      const status=('status' in Object(error))?Number((error as {status?:number}).status):undefined;
      const rawMessage=error instanceof Error?error.message:'Não foi possível concluir a operação.';
      const signupServerError=authTab==='register'&&(status===500||/internal server error|unexpected_failure|failed to send|sending confirmation/i.test(rawMessage));
      setMessage(signupServerError
        ?'Não foi possível enviar a confirmação por e-mail no momento. O serviço de envio da TechStore está indisponível. Tente novamente mais tarde.'
        :rawMessage);
    }
    finally{setBusy(false);setPassword('');}
  };
  const save=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(!account)return;setBusy(true);setMessage('');
    const updated:AccountProfile={...account,name:name.trim(),phone:phone.trim(),address:{...address}};
    try{
      if(!updated.name){setMessage('Informe um nome.');return;}
      if(account.demo){onChange(updated);setMessage('Dados demonstrativos salvos apenas neste navegador.');}
      else if(supabase) {
        const {data,error}=await supabase.auth.updateUser({data:{full_name:updated.name,phone:updated.phone,address:updated.address}});
        if(error)throw error;
        if(data.user)onChange(profileFromUser(data.user));
        setMessage('Dados atualizados na sua conta autenticada.');
      }
    }catch(err){setMessage(err instanceof Error?err.message:'Erro ao atualizar os dados.');}
    finally{setBusy(false);}
  };
  const signOut=async()=>{
    setMessage('');setBusy(true);
    try{if(account&&!account.demo&&supabase)await supabase.auth.signOut();onChange(null);}
    catch(err){setMessage(err instanceof Error?err.message:'Não foi possível sair.');}
    finally{setBusy(false);}
  };
  const localOrders=account?orders.filter(order=>{
    if (order.userId) return order.userId===account.id;
    return order.email.trim().toLowerCase()===account.email.trim().toLowerCase();
  }):[];
  const orderMap=new Map<string,DemoSale>();
  remoteOrders.forEach(order=>orderMap.set(order.id,order));
  localOrders.forEach(order=>{
    const remote=orderMap.get(order.id);
    // The server proves that an order exists; the local demo can retain a manual preview status.
    orderMap.set(order.id,remote?{...remote,...order,backendRecorded:true,items:remote.items.length?remote.items:order.items}:order);
  });
  const userOrders=[...orderMap.values()].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
  return <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
    <div className="bg-[#08152e] p-2 text-center text-xs text-slate-200">TechStore · Identidade demonstrativa · Não forneça dados pessoais reais no modo de teste</div>
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c285a] text-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4"><button onClick={onBack} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10"><ArrowLeft size={18}/> Voltar à loja</button><button onClick={onBack} className="text-xl font-black">Tech<span className="text-orange-400">Store</span></button><span className="hidden items-center gap-2 text-xs font-bold sm:flex"><LockKeyhole size={17}/> Espaço do cliente</span></div></header>
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8"><p className="text-xs font-black uppercase tracking-widest text-orange-600">Área do cliente</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{account?'Olá, '+account.name.split(' ')[0]+'!':'Sua conta TechStore'}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{account?'Consulte seu perfil, endereços e pedidos demonstrativos.':'Crie seu perfil, salve um endereço e conheça a experiência de compra personalizada.'}</p></div>
      {!account?<div className="grid items-start gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          {supabase?<div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"><button onClick={()=>{setAuthTab('register');setMessage('');setAccountExists(false);}} className={'rounded-lg px-4 py-3 text-sm font-bold '+(authTab==='register'?'bg-white text-orange-700 shadow-sm':'text-slate-500')}>Criar conta</button><button onClick={()=>{setAuthTab('login');setMessage('');setAccountExists(false);}} className={'rounded-lg px-4 py-3 text-sm font-bold '+(authTab==='login'?'bg-white text-orange-700 shadow-sm':'text-slate-500')}>Entrar</button></div>:null}
          <h2 className="flex items-center gap-2 text-xl font-black"><UserRoundPlus className="text-orange-600"/>{supabase?(authTab==='register'?'Criar conta':'Entrar na minha conta'):'Criar perfil demonstrativo'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{supabase?'A autenticação usará o Supabase, se estiver configurado para este domínio.':'Sem backend conectado: o perfil será salvo somente neste dispositivo. Nenhum e-mail, confirmação ou senha serão enviados.'}</p>
          <form className="mt-6 space-y-4" onSubmit={handleAuth}>
            {(!supabase||authTab==='register')&&<label className="block text-sm font-semibold">Nome<input required value={name} onChange={e=>setName(e.target.value)} minLength={2} placeholder="Cliente Exemplo" className="mt-2 w-full rounded-xl border px-4 py-3"/></label>}
            <label className="block text-sm font-semibold">E-mail<input required type="email" value={email} onChange={e=>{setEmail(e.target.value);setAccountExists(false);setMessage('');}} placeholder="cliente@example.com" className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
            {supabase&&<label className="block text-sm font-semibold">Senha<input required type="password" minLength={8} autoComplete={authTab==='register'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres" className="mt-2 w-full rounded-xl border px-4 py-3"/></label>}
            <button disabled={busy} className="w-full rounded-xl bg-orange-600 px-5 py-4 font-black text-white hover:bg-orange-500 disabled:opacity-50">{busy?'Processando...':supabase?(authTab==='register'?'Criar minha conta':'Entrar na conta'):'Criar perfil local'}</button>
          </form>
          {supabase&&<button type="button" onClick={()=>{try{sessionStorage.setItem('techstore_confirmation_email',email.trim().toLowerCase());}catch{/* Private mode */}window.location.hash='/confirmar-email';}} className="mt-4 w-full text-center text-sm font-bold text-orange-700 hover:underline">Não recebeu o e-mail? Confirmar por código ou reenviar</button>}
          {message&&(accountExists?
            <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
              <div className="flex items-start gap-3"><AlertCircle size={22} className="mt-0.5 shrink-0 text-rose-600"/><div><p className="font-black">Este e-mail já está cadastrado</p><p className="mt-1 text-sm leading-6">{message}</p></div></div>
              <button type="button" onClick={()=>{setAuthTab('login');setAccountExists(false);setMessage('');setPassword('');}} className="mt-4 w-full rounded-xl bg-[#0c285a] px-5 py-3 text-sm font-bold text-white hover:bg-[#17417b]">Entrar na minha conta</button>
            </div>:
            <p role="status" className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">{message}</p>)}
          {supabase&&<div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-bold text-amber-900">Quer apenas testar o site?</p><p className="mt-2 text-xs leading-6 text-amber-900">Se o envio de e-mails ainda não estiver habilitado, você pode criar um perfil local sem senha e sem mensagem de confirmação. Esse perfil não é uma conta autenticada e será limpo após sete dias.</p><button type="button" onClick={()=>{if(name.trim().length<2){setMessage('Digite um nome de teste antes de continuar.');return;}onChange({id:'demo-local',name:name.trim(),email:email.trim()||'demo@example.com',phone:'',address:null,demo:true});setMessage('Perfil local de teste criado. Nenhum e-mail foi enviado.');}} className="mt-3 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700">Usar perfil demonstrativo local</button></div>}
          {!supabase&&<p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">A TechStore está hospedada no GitHub Pages. A autenticação real e o envio de e-mail dependem de configurar Supabase Auth e SMTP. Não use senha ou dados pessoais reais neste modo.</p>}
        </section>
        <aside className="rounded-2xl border bg-white p-6 shadow-sm"><h3 className="flex items-center gap-2 text-lg font-black"><ShieldCheck className="text-emerald-600"/> Uma experiência mais completa</h3><div className="mt-5 space-y-5">{[['01','Seu endereço','Visualize e altere um endereço salvo no seu perfil.'],['02','Histórico de pedidos','Consulte pedidos simulados registrados neste navegador.'],['03','Acesso personalizado','Veja seu nome e cidade de entrega na barra superior.']].map(([n,t,d])=><div key={n} className="flex gap-4"><span className="text-xl font-black text-orange-600">{n}</span><div><p className="font-black">{t}</p><p className="mt-1 text-sm leading-6 text-slate-500">{d}</p></div></div>)}</div></aside>
      </div>:<div className="grid items-start gap-6 lg:grid-cols-[235px_minmax(0,1fr)]">
        <aside className="rounded-2xl border bg-white p-3 shadow-sm"><div className="border-b px-3 py-4"><CircleUserRound size={34} className="text-orange-600"/><p className="mt-2 font-black">{account.name}</p><p className="break-all text-xs text-slate-500">{account.email}</p><p className="mt-1 text-xs text-slate-400">{account.demo?'Perfil local demonstrativo':'Conta autenticada'}</p></div><nav className="mt-3 space-y-1">{([{id:'profile',label:'Meu perfil',icon:UserRound},{id:'address',label:'Meus endereços',icon:Home},{id:'orders',label:'Meus pedidos',icon:ClipboardList},{id:'security',label:'Segurança · 2FA',icon:ShieldCheck}] as const).map(({id,label,icon:Icon})=><button key={id} onClick={()=>{setProfileTab(id);setMessage('');}} className={'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold '+(profileTab===id?'bg-orange-600 text-white':'hover:bg-orange-50 hover:text-orange-700')}><Icon size={19}/>{label}</button>)}</nav><button onClick={signOut} disabled={busy} className="mt-5 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"><LogOut size={18}/> Sair da conta</button></aside>
        <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          {profileTab==='security'?
            (account.demo?<div className="rounded-xl bg-orange-50 p-6 text-sm text-orange-900">O perfil local é apenas demonstrativo. Para habilitar o 2FA, faça o cadastro e entre em uma conta autenticada no Supabase.</div>:<MFASecurity mode="settings"/>)
          :profileTab!=='orders'?<form onSubmit={save}>
            <h2 className="flex items-center gap-2 text-xl font-black">{profileTab==='profile'?<UserRound className="text-orange-600"/>:<MapPin className="text-orange-600"/>}{profileTab==='profile'?'Dados da conta':'Meu endereço de entrega'}</h2>
            {profileTab==='profile'?<div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Nome<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"/></label><label className="block text-sm font-bold">Celular (opcional)<input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"/></label><label className="block text-sm font-bold sm:col-span-2">E-mail cadastrado<input readOnly value={email} className="mt-2 w-full rounded-xl border bg-slate-100 px-4 py-3 text-slate-500"/></label></div>:<div className="mt-6 grid gap-4 sm:grid-cols-2">
              {([['street','Endereço'],['number','Número'],['complement','Complemento'],['district','Bairro'],['city','Cidade'],['state','Estado (UF)'],['cep','CEP']] as [keyof DeliveryAddress,string][]).map(([key,label])=><label key={key} className={'block text-sm font-bold '+(key==='street'?'sm:col-span-2':'')}>{label}<input value={address[key]} onChange={e=>setAddress(x=>({...x,[key]:key==='cep'?cepMask(e.target.value):key==='state'?e.target.value.toUpperCase().slice(0,2):e.target.value}))} placeholder={key==='cep'?'00000-000':''} className="mt-2 w-full rounded-xl border px-4 py-3"/></label>)}
            </div>}
            <div className="mt-6 flex flex-wrap items-center gap-4"><button disabled={busy} className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white disabled:opacity-50">Salvar alterações</button><span className="text-xs text-slate-500">{account.demo?'Dados somente neste navegador':'Dados gravados no perfil autenticado'}</span></div>
          </form>:<div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-2xl font-black">Meus pedidos</h2><p className="mt-2 text-sm leading-6 text-slate-500">Acompanhe as etapas dos pedidos demonstrativos com um rastreamento visual, preparação e nota fiscal pendente.</p></div>
              {!account.demo&&<button type="button" onClick={()=>setReloadOrders(n=>n+1)} disabled={loadingOrders} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-xs font-bold text-[#0c285a] hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} className={loadingOrders?'animate-spin':''}/> Atualizar pedidos</button>}
            </div>
            <div className="mt-5 rounded-2xl border border-blue-100 bg-[#eff5fe] p-4 text-xs leading-6 text-[#153a73]">
              <strong>Simulação acelerada:</strong> os pedidos avançam automaticamente por etapas fictícias em aproximadamente 16 minutos, quando não há alteração manual no painel de testes. Nota fiscal, postagem, transportadora, pagamento e entrega não são reais.
              {!account.demo&&<span className="mt-1 block font-semibold">Pedidos vinculados à sua conta são consultados no Supabase e podem ser vistos em outros dispositivos.</span>}
            </div>
            {ordersError&&<p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{ordersError}</p>}
            {loadingOrders&&<p role="status" className="mt-4 text-sm text-slate-500">Sincronizando pedidos da sua conta...</p>}
            {userOrders.length?<div className="mt-6 space-y-4">{userOrders.map((order,i)=><OrderTracking key={order.id} order={order} now={clock} expanded={expandedOrders.includes(order.id)||(i===0&&expandedOrders.includes('__auto__'))} onToggle={()=>setExpandedOrders(current=>{const wasExpanded=current.includes(order.id)||(i===0&&current.includes('__auto__'));const withoutAuto=current.filter(id=>id!=='__auto__');return wasExpanded?withoutAuto.filter(id=>id!==order.id):[...withoutAuto,order.id];})}/>)}</div>:<div className="mt-6 rounded-2xl border border-dashed bg-slate-50 p-10 text-center"><ClipboardList size={36} className="mx-auto text-slate-300"/><p className="mt-4 font-bold">Nenhum pedido de demonstração encontrado</p><p className="mt-2 text-sm text-slate-500">Faça uma simulação de compra no catálogo para acompanhar cada etapa nesta página.</p></div>}
          </div>}
          {message&&<p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{message}</p>}
          <p className="mt-7 border-t pt-5 text-xs leading-6 text-slate-500">Os endereços do perfil servem apenas para demonstrar a interface. Se o login real estiver configurado, use dados apropriados e revise a política de privacidade.</p>
        </section>
      </div>}
    </main>
    <Footer onInfoClick={onInfoClick}/>
  </div>;
}
