import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Copy, KeyRound, LockKeyhole, QrCode, Shield, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Factor={id:string;friendly_name?:string|null;status:string};
type Props={mode:'challenge'|'settings';onVerified?:()=>void;onSignOut?:()=>void};
type Enrollment={id:string;qr:string;secret:string};
const codeOnly=(x:string)=>x.replace(/\D/g,'').slice(0,6);
export function MFASecurity({mode,onVerified,onSignOut}:Props){
  const [verified,setVerified]=useState<Factor[]>([]);
  const [enrollment,setEnrollment]=useState<Enrollment|null>(null);
  const [code,setCode]=useState('');
  const [working,setWorking]=useState(false);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState(false);
  const [level,setLevel]=useState<'aal1'|'aal2'|null>(null);
  const refresh=async()=>{
    if(!supabase)return;
    const [{data:factors,error:factorError},{data:aal}]=await Promise.all([
      supabase.auth.mfa.listFactors(),supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    ]);
    if(factorError){setError(true);setNotice(factorError.message);return;}
    setVerified((factors?.totp||[]).filter(f=>f.status==='verified').map(f=>({id:f.id,friendly_name:f.friendly_name,status:f.status})));
    setLevel(aal?.currentLevel||null);
  };
  useEffect(()=>{void refresh();},[]);
  const enroll=async()=>{
    if(!supabase)return;setWorking(true);setNotice('');setError(false);
    try{
      const {data,error}=await supabase.auth.mfa.enroll({factorType:'totp',friendlyName:'TechStore - Autenticador'});
      if(error)throw error;
      if(!data.totp)throw new Error('Não foi possível gerar um QR Code.');
      setEnrollment({id:data.id,qr:data.totp.qr_code,secret:data.totp.secret});setCode('');
    }catch(e){setError(true);setNotice(e instanceof Error?e.message:'Erro ao iniciar autenticação em dois fatores.');}
    finally{setWorking(false);}
  };
  const confirm=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(!supabase||code.length!==6)return;
    const factorId=mode==='challenge'?verified[0]?.id:enrollment?.id;
    if(!factorId){setNotice('Nenhum autenticador disponível. Atualize a página.');setError(true);return;}
    setWorking(true);setNotice('');setError(false);
    try{
      const {error}=await supabase.auth.mfa.challengeAndVerify({factorId,code});
      if(error)throw error;
      setEnrollment(null);setCode('');
      await refresh();
      setNotice(mode==='challenge'?'Identidade verificada. Acesso liberado!':'Autenticação em dois fatores ativada com sucesso!');
      onVerified?.();
    }catch(e){setError(true);setNotice(e instanceof Error?e.message:'Código incorreto ou expirado. Tente novamente.');}
    finally{setWorking(false);}
  };
  const unenroll=async()=>{
    if(!supabase||verified.length===0)return;
    if(level!=='aal2'){setError(true);setNotice('Confirme primeiro seu código de autenticação para desativar o 2FA.');return;}
    setWorking(true);setNotice('');setError(false);
    try{
      for(const factor of verified){
        const {error}=await supabase.auth.mfa.unenroll({factorId:factor.id});
        if(error)throw error;
      }
      await supabase.auth.refreshSession();
      await refresh();setNotice('Autenticação em dois fatores desativada.');
    }catch(e){setError(true);setNotice(e instanceof Error?e.message:'Não foi possível desativar o 2FA.');}
    finally{setWorking(false);}
  };
  return <div className={mode==='challenge'?'min-h-screen bg-[#f2f5fb] text-slate-900':'text-slate-900'}>
    {mode==='challenge'&&<header className="bg-[#0a2655] px-5 py-5 text-white"><div className="mx-auto flex max-w-5xl items-center justify-between"><span className="text-2xl font-black">Tech<span className="text-orange-400">Store</span></span><span className="flex items-center gap-2 text-xs font-bold"><ShieldCheck size={18}/> Acesso protegido</span></div></header>}
    <section className={(mode==='challenge'?'mx-auto my-12 max-w-lg rounded-3xl border bg-white p-7 shadow-xl sm:p-10':'rounded-2xl border bg-white p-6 shadow-sm')}>
      <div className="flex items-start gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#0a2655] text-orange-400">{mode==='challenge'?<LockKeyhole size={28}/>:<Shield size={28}/>}</div><div><p className="text-xs font-black uppercase tracking-widest text-orange-600">TechStore · Segurança</p><h2 className="mt-2 text-2xl font-black">{mode==='challenge'?'Confirme sua identidade':'Autenticação em dois fatores (2FA)'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{mode==='challenge'?'Para entrar nesta conta, digite o código do seu aplicativo autenticador.':'Adicione uma camada extra de proteção usando Google Authenticator, Microsoft Authenticator, 1Password ou outro aplicativo TOTP.'}</p></div></div>
      {mode==='settings'&&<div className="mt-6 flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900"><ShieldCheck size={20} className="shrink-0"/><div><p className="font-bold">{verified.length?'2FA ativado':'2FA ainda não ativado'}</p><p className="mt-1 text-xs">{verified.length?'Sua conta usa códigos temporários do aplicativo autenticador.':'Ative o 2FA para exigir um código de verificação nos próximos acessos.'}</p></div></div>}
      {enrollment&&mode==='settings'&&<div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5"><h3 className="flex items-center gap-2 font-black"><QrCode size={20} className="text-orange-600"/> Escaneie o QR Code</h3><p className="mt-2 text-xs leading-6 text-slate-600">No aplicativo autenticador, adicione uma conta e escaneie o código abaixo. Se não conseguir, digite a chave manualmente.</p><img src={enrollment.qr} alt="QR Code secreto para cadastrar o autenticador desta conta TechStore" className="mx-auto my-5 h-52 w-52 rounded-xl border bg-white p-3" /><div className="rounded-xl bg-white p-4"><p className="text-xs font-bold text-slate-500">Chave de configuração secreta</p><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 break-all text-sm font-black tracking-wide">{enrollment.secret}</code><button type="button" title="Copiar chave" onClick={()=>navigator.clipboard?.writeText(enrollment.secret)} className="rounded-lg border p-2"><Copy size={17}/></button></div></div><p className="mt-3 text-xs font-semibold text-orange-800">Não compartilhe esse QR Code ou a chave com outras pessoas.</p></div>}
      {mode==='settings'&&!enrollment&&!verified.length&&<button type="button" disabled={working} onClick={()=>{void enroll();}} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 font-black text-white hover:bg-orange-500 disabled:opacity-50"><Smartphone size={19}/> Ativar 2FA</button>}
      {(mode==='challenge'||enrollment||verified.length>0)&&<form onSubmit={confirm} className="mt-7 space-y-4">
        {(mode==='challenge'||enrollment||level!=='aal2')&&<><label className="block text-sm font-bold">Código do aplicativo autenticador<input required pattern="[0-9]{6}" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e=>setCode(codeOnly(e.target.value))} placeholder="000000" className="mt-2 w-full rounded-xl border px-4 py-4 text-center text-2xl font-black tracking-[.3em] outline-none focus:border-orange-500"/></label><button disabled={working||code.length!==6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c285a] px-5 py-4 font-black text-white hover:bg-[#17417b] disabled:opacity-40"><KeyRound size={19}/>{working?'Verificando...':mode==='challenge'?'Validar e entrar':'Confirmar código e ativar/verificar'}</button></>}
      </form>}
      {mode==='settings'&&verified.length>0&&!enrollment&&<div className="mt-6 border-t pt-5"><p className="flex items-center gap-2 text-sm font-bold text-emerald-700"><CheckCircle2 size={19}/> Autenticador cadastrado</p>{level==='aal2'?<button type="button" disabled={working} onClick={()=>{void unenroll();}} className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50"><ShieldOff size={18}/> Desativar 2FA</button>:<p className="mt-2 text-xs text-slate-500">Digite seu código acima para validar o dispositivo antes de desativar o 2FA.</p>}</div>}
      {mode==='challenge'&&!verified.length&&<p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Nenhum fator de autenticação foi encontrado. Atualize a página ou procure o suporte do projeto.</p>}
      {notice&&<p role="status" className={'mt-5 rounded-xl p-4 text-sm leading-6 '+(error?'bg-rose-50 text-rose-800':'bg-emerald-50 text-emerald-900')}>{notice}</p>}
      {mode==='challenge'&&<button onClick={onSignOut} className="mt-7 w-full text-center text-sm font-bold text-slate-500 hover:text-orange-600">Sair e usar outra conta</button>}
      <p className="mt-5 text-xs leading-6 text-slate-400">Os códigos são gerados no seu dispositivo. A TechStore não vê nem armazena sua senha do autenticador.</p>
    </section>
  </div>;
}
