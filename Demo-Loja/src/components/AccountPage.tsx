import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, CircleUserRound, ClipboardList, Home, LockKeyhole, LogOut, MapPin, ShieldCheck, UserRoundPlus, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { profileFromUser, type AccountProfile, type DeliveryAddress } from '../lib/customerAccount';
import type { DemoSale } from './AdminPanel';
import { money } from '../lib/promotions';
import { Footer } from './Footer';

type Props = { account:AccountProfile|null;orders:DemoSale[];initialTab?:ProfileTab;
  onBack:()=>void;onChange:(profile:AccountProfile|null)=>void;
  onInfoClick:(topic:string)=>void;
};
const blankAddress:DeliveryAddress={street:'',number:'',complement:'',district:'',city:'',state:'',cep:''};
const digits=(s:string)=>s.replace(/\D/g,'');
const cepMask=(s:string)=>digits(s).slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2');
type AuthTab='login'|'register';
type ProfileTab='profile'|'address'|'orders';
export function AccountPage({account,orders,initialTab='profile',onBack,onChange,onInfoClick}:Props){
  const [authTab,setAuthTab]=useState<AuthTab>('register');
  const [profileTab,setProfileTab]=useState<ProfileTab>(initialTab);
  const [name,setName]=useState(account?.name||'');
  const [email,setEmail]=useState(account?.email||'');
  const [password,setPassword]=useState('');
  const [phone,setPhone]=useState(account?.phone||'');
  const [address,setAddress]=useState<DeliveryAddress>(account?.address||blankAddress);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{setName(account?.name||'');setEmail(account?.email||'');setPhone(account?.phone||'');setAddress(account?.address||blankAddress);},[account]);
  const handleAuth=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setMessage('');setBusy(true);
    try{
      if(supabase) {
        if(!email.trim()||password.length<8){setMessage('Informe um e-mail válido e senha de pelo menos 8 caracteres.');return;}
        if(authTab==='register'){
          if(name.trim().length<2){setMessage('Informe o nome para criar a conta.');return;}
          const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()},emailRedirectTo:window.location.origin+import.meta.env.BASE_URL}});
          if(error)throw error;
          if(data.session&&data.user){onChange(profileFromUser(data.user));setMessage('Cadastro concluído. Verifique seu e-mail se a confirmação estiver ativada.');}
          else setMessage('Cadastro solicitado. Se o serviço de autenticação e e-mail estiver configurado, você receberá instruções para confirmar seu endereço.');
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
      setMessage(error instanceof Error?error.message:'Não foi possível concluir a operação.');}
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
  const userOrders=account?orders.filter(order=>order.email.toLowerCase()===account.email.toLowerCase()):[];
  return <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
    <div className="bg-[#08152e] p-2 text-center text-xs text-slate-200">TechStore · Identidade demonstrativa · Não forneça dados pessoais reais no modo de teste</div>
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c285a] text-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4"><button onClick={onBack} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10"><ArrowLeft size={18}/> Voltar à loja</button><button onClick={onBack} className="text-xl font-black">Tech<span className="text-orange-400">Store</span></button><span className="hidden items-center gap-2 text-xs font-bold sm:flex"><LockKeyhole size={17}/> Espaço do cliente</span></div></header>
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8"><p className="text-xs font-black uppercase tracking-widest text-orange-600">Área do cliente</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{account?'Olá, '+account.name.split(' ')[0]+'!':'Sua conta TechStore'}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{account?'Consulte seu perfil, endereços e pedidos demonstrativos.':'Crie seu perfil, salve um endereço e conheça a experiência de compra personalizada.'}</p></div>
      {!account?<div className="grid items-start gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          {supabase?<div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"><button onClick={()=>{setAuthTab('register');setMessage('');}} className={'rounded-lg px-4 py-3 text-sm font-bold '+(authTab==='register'?'bg-white text-orange-700 shadow-sm':'text-slate-500')}>Criar conta</button><button onClick={()=>{setAuthTab('login');setMessage('');}} className={'rounded-lg px-4 py-3 text-sm font-bold '+(authTab==='login'?'bg-white text-orange-700 shadow-sm':'text-slate-500')}>Entrar</button></div>:null}
          <h2 className="flex items-center gap-2 text-xl font-black"><UserRoundPlus className="text-orange-600"/>{supabase?(authTab==='register'?'Criar conta':'Entrar na minha conta'):'Criar perfil demonstrativo'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{supabase?'A autenticação usará o Supabase, se estiver configurado para este domínio.':'Sem backend conectado: o perfil será salvo somente neste dispositivo. Nenhum e-mail, confirmação ou senha serão enviados.'}</p>
          <form className="mt-6 space-y-4" onSubmit={handleAuth}>
            {(!supabase||authTab==='register')&&<label className="block text-sm font-semibold">Nome<input required value={name} onChange={e=>setName(e.target.value)} minLength={2} placeholder="Cliente Exemplo" className="mt-2 w-full rounded-xl border px-4 py-3"/></label>}
            <label className="block text-sm font-semibold">E-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="cliente@example.com" className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
            {supabase&&<label className="block text-sm font-semibold">Senha<input required type="password" minLength={8} autoComplete={authTab==='register'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres" className="mt-2 w-full rounded-xl border px-4 py-3"/></label>}
            <button disabled={busy} className="w-full rounded-xl bg-orange-600 px-5 py-4 font-black text-white hover:bg-orange-500 disabled:opacity-50">{busy?'Processando...':supabase?(authTab==='register'?'Criar minha conta':'Entrar na conta'):'Criar perfil local'}</button>
          </form>
          {message&&<p role="status" className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">{message}</p>}
          {!supabase&&<p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">A TechStore está hospedada no GitHub Pages. A autenticação real e o envio de e-mail dependem de configurar Supabase Auth e SMTP. Não use senha ou dados pessoais reais neste modo.</p>}
        </section>
        <aside className="rounded-2xl border bg-white p-6 shadow-sm"><h3 className="flex items-center gap-2 text-lg font-black"><ShieldCheck className="text-emerald-600"/> Uma experiência mais completa</h3><div className="mt-5 space-y-5">{[['01','Seu endereço','Visualize e altere um endereço salvo no seu perfil.'],['02','Histórico de pedidos','Consulte pedidos simulados registrados neste navegador.'],['03','Acesso personalizado','Veja seu nome e cidade de entrega na barra superior.']].map(([n,t,d])=><div key={n} className="flex gap-4"><span className="text-xl font-black text-orange-600">{n}</span><div><p className="font-black">{t}</p><p className="mt-1 text-sm leading-6 text-slate-500">{d}</p></div></div>)}</div></aside>
      </div>:<div className="grid items-start gap-6 lg:grid-cols-[235px_minmax(0,1fr)]">
        <aside className="rounded-2xl border bg-white p-3 shadow-sm"><div className="border-b px-3 py-4"><CircleUserRound size={34} className="text-orange-600"/><p className="mt-2 font-black">{account.name}</p><p className="break-all text-xs text-slate-500">{account.email}</p><p className="mt-1 text-xs text-slate-400">{account.demo?'Perfil local demonstrativo':'Conta autenticada'}</p></div><nav className="mt-3 space-y-1">{([{id:'profile',label:'Meu perfil',icon:UserRound},{id:'address',label:'Meus endereços',icon:Home},{id:'orders',label:'Meus pedidos',icon:ClipboardList}] as const).map(({id,label,icon:Icon})=><button key={id} onClick={()=>{setProfileTab(id);setMessage('');}} className={'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold '+(profileTab===id?'bg-orange-600 text-white':'hover:bg-orange-50 hover:text-orange-700')}><Icon size={19}/>{label}</button>)}</nav><button onClick={signOut} disabled={busy} className="mt-5 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"><LogOut size={18}/> Sair da conta</button></aside>
        <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          {profileTab!=='orders'?<form onSubmit={save}>
            <h2 className="flex items-center gap-2 text-xl font-black">{profileTab==='profile'?<UserRound className="text-orange-600"/>:<MapPin className="text-orange-600"/>}{profileTab==='profile'?'Dados da conta':'Meu endereço de entrega'}</h2>
            {profileTab==='profile'?<div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Nome<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"/></label><label className="block text-sm font-bold">Celular (opcional)<input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"/></label><label className="block text-sm font-bold sm:col-span-2">E-mail cadastrado<input readOnly value={email} className="mt-2 w-full rounded-xl border bg-slate-100 px-4 py-3 text-slate-500"/></label></div>:<div className="mt-6 grid gap-4 sm:grid-cols-2">
              {([['street','Endereço'],['number','Número'],['complement','Complemento'],['district','Bairro'],['city','Cidade'],['state','Estado (UF)'],['cep','CEP']] as [keyof DeliveryAddress,string][]).map(([key,label])=><label key={key} className={'block text-sm font-bold '+(key==='street'?'sm:col-span-2':'')}>{label}<input value={address[key]} onChange={e=>setAddress(x=>({...x,[key]:key==='cep'?cepMask(e.target.value):key==='state'?e.target.value.toUpperCase().slice(0,2):e.target.value}))} placeholder={key==='cep'?'00000-000':''} className="mt-2 w-full rounded-xl border px-4 py-3"/></label>)}
            </div>}
            <div className="mt-6 flex flex-wrap items-center gap-4"><button disabled={busy} className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white disabled:opacity-50">Salvar alterações</button><span className="text-xs text-slate-500">{account.demo?'Dados somente neste navegador':'Dados gravados no perfil autenticado'}</span></div>
          </form>:<div><h2 className="text-xl font-black">Meus pedidos demonstrativos</h2><p className="mt-2 text-sm text-slate-500">Pedidos associados a este e-mail apenas neste navegador. Não são compras reais.</p>{userOrders.length?<div className="mt-5 space-y-3">{userOrders.map(order=><article key={order.id} className="flex flex-wrap justify-between gap-4 rounded-xl border p-4"><div><p className="font-bold">{order.id}</p><p className="mt-1 text-xs text-slate-500">{new Date(order.date).toLocaleDateString('pt-BR')}</p></div><div><p className="font-black text-orange-700">{money(order.total)}</p><p className="text-xs text-slate-500">{order.status||'Recebido'}</p></div></article>)}</div>:<p className="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">Nenhum pedido demonstrativo associado a este perfil.</p>}</div>}
          {message&&<p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{message}</p>}
          <p className="mt-7 border-t pt-5 text-xs leading-6 text-slate-500">Os endereços do perfil servem apenas para demonstrar a interface. Se o login real estiver configurado, use dados apropriados e revise a política de privacidade.</p>
        </section>
      </div>}
    </main>
    <Footer onInfoClick={onInfoClick}/>
  </div>;
}
