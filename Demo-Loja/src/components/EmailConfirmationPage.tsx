import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, MailCheck, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Props={onBack:()=>void;onSuccess:()=>void};
const destination='https://agonisingbasher.github.io/DemoLoja/';
export function EmailConfirmationPage({onBack,onSuccess}:Props){
  const [email,setEmail]=useState(()=>{try{return sessionStorage.getItem('techstore_confirmation_email')||'';}catch{return '';}});
  const [code,setCode]=useState('');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState(()=>{try{const issue=sessionStorage.getItem('techstore_confirmation_error')||'';sessionStorage.removeItem('techstore_confirmation_error');return issue;}catch{return '';}});
  const [failed,setFailed]=useState(()=>Boolean(notice));
  const [success,setSuccess]=useState(false);
  const confirm=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setNotice('');setFailed(false);
    if(!supabase){setNotice('Serviço de autenticação indisponível.');setFailed(true);return;}
    if(!/^\d{6,8}$/.test(code)){setNotice('Informe o código numérico de 6 a 8 dígitos recebido no e-mail.');setFailed(true);return;}
    setBusy(true);
    try{
      const {error}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:code.trim(),type:'email'});
      if(error)throw error;
      try{sessionStorage.removeItem('techstore_confirmation_email');}catch{/* Session storage restricted */}
      setSuccess(true);setNotice('Seu e-mail foi confirmado! A conta está pronta para entrar.');
    }catch(error){
      setFailed(true);setNotice(error instanceof Error?error.message:'O código é inválido ou expirou. Solicite um novo e tente novamente.');
    }finally{setBusy(false);}
  };
  const resend=async()=>{
    if(!supabase){setFailed(true);setNotice('Serviço de autenticação indisponível.');return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setFailed(true);setNotice('Informe um endereço de e-mail válido.');return;}
    setBusy(true);setFailed(false);setNotice('');
    try{
      const {error}=await supabase.auth.resend({type:'signup',email:email.trim().toLowerCase(),options:{emailRedirectTo:destination}});
      if(error)throw error;
      setNotice('Caso exista um cadastro pendente, uma nova confirmação foi solicitada. Verifique sua caixa de entrada e spam.');
    }catch(err){setFailed(true);setNotice(err instanceof Error?err.message:'Não foi possível solicitar outro código.');}
    finally{setBusy(false);}
  };
  return <div className="min-h-screen bg-[#f1f5fb] text-slate-900">
    <header className="bg-[#091d41] text-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5"><button onClick={onBack} className="flex items-center gap-2 text-sm font-bold hover:text-orange-300"><ArrowLeft size={17}/> Voltar à loja</button><span className="text-2xl font-black">Tech<span className="text-orange-400">Store</span></span><span className="hidden items-center gap-2 text-xs text-blue-100 sm:flex"><ShieldCheck size={17}/> Verificação segura</span></div></header>
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:py-20">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3479] via-[#0a2556] to-[#071630] p-9 text-white shadow-2xl sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-3 py-2 text-xs font-black tracking-wider text-orange-200"><Sparkles size={15}/> TECHSTORE · SEGURANÇA</span>
        <div className="mt-12 grid h-28 w-28 place-items-center rounded-3xl border border-white/15 bg-orange-500/15"><MailCheck size={62} className="text-orange-400"/></div>
        <h1 className="mt-8 text-4xl font-black leading-tight">Sua conta, <span className="text-orange-400">mais protegida.</span></h1>
        <p className="mt-5 text-sm leading-7 text-blue-100">Confirme seu e-mail com o código enviado pela TechStore. Evitamos depender de links de uso único que podem ser acessados por verificadores automáticos de e-mail.</p>
        <p className="mt-8 border-t border-white/15 pt-5 text-xs text-blue-200">Site demonstrativo de tecnologia. Não efetua pagamentos nem entregas.</p>
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-10">
        {success?<div className="py-8 text-center"><CheckCircle2 size={66} className="mx-auto text-emerald-600"/><h2 className="mt-5 text-3xl font-black">E-mail confirmado!</h2><p className="mt-3 text-sm leading-6 text-slate-500">{notice}</p><button onClick={onSuccess} className="mt-8 rounded-xl bg-orange-600 px-6 py-4 font-black text-white hover:bg-orange-500">Entrar na minha conta</button></div>:<>
          <span className="text-xs font-black uppercase tracking-widest text-orange-600">Passo de verificação</span>
          <h2 className="mt-3 text-3xl font-black">Confirme seu e-mail</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">Informe o e-mail usado no cadastro e o código de uso único recebido. Se o seu link anterior expirou ou apresentou erro, solicite um código novo.</p>
          <form onSubmit={confirm} className="mt-7 space-y-5">
            <label className="block text-sm font-bold">E-mail cadastrado<input value={email} type="email" required onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="seuemail@exemplo.com" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-400"/></label>
            <label className="block text-sm font-bold">Código de confirmação<input value={code} required inputMode="numeric" autoComplete="one-time-code" maxLength={8} pattern="[0-9]{6,8}" onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,8))} placeholder="000000" className="mt-2 w-full rounded-xl border px-4 py-4 text-center text-2xl font-black tracking-[.3em] outline-none focus:border-orange-400"/></label>
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 font-black text-white hover:bg-orange-500 disabled:opacity-60"><KeyRound size={19}/> {busy?'Verificando...':'Confirmar e-mail'}</button>
          </form>
          <button disabled={busy||!email.trim()} onClick={()=>{void resend();}} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#0d3479] hover:bg-blue-50 disabled:opacity-50"><RefreshCw size={17}/> Reenviar código de confirmação</button>
          {notice&&<p role="status" className={'mt-5 rounded-xl p-4 text-sm leading-6 '+(failed?'bg-rose-50 text-rose-800':'bg-emerald-50 text-emerald-800')}>{notice}</p>}
          <p className="mt-5 text-xs leading-6 text-slate-400">O código é pessoal e temporário. Nunca compartilhe seu código nem senha com ninguém.</p>
        </>}
      </section>
    </main>
  </div>;
}
