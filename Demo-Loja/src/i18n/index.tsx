import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Globe2, Languages } from 'lucide-react';
import { phrases } from './phrases';
import { details } from './details';
import { information } from './information';
import { administration } from './administration';
import { catalog } from './catalog';
import { remaining } from './remaining';
import { marketing } from './marketing';
import { pcCatalog } from './pcCatalog';

export type Locale = 'pt-BR' | 'en' | 'es' | 'fr';
const variants = [
  { value:'pt-BR' as Locale, label:'Português', flag:'🇧🇷', short:'PT' },
  { value:'en' as Locale, label:'English', flag:'🇺🇸', short:'EN' },
  { value:'es' as Locale, label:'Español', flag:'🇪🇸', short:'ES' },
  { value:'fr' as Locale, label:'Français', flag:'🇫🇷', short:'FR' }
];
const dictionary={...phrases,...details,...information,...administration,...catalog,...remaining,...marketing,...pcCatalog};
const indexes:Record<Exclude<Locale,'pt-BR'>,number>={en:0,es:1,fr:2};
const localeStorageKey='techstore_language_v1';
const normalizeLocale=(source:string|null):Locale|null=>{
  if(!source)return null;
  const lower=source.toLowerCase();
  if(['pt','pt-br'].includes(lower))return 'pt-BR';
  if(['en','en-us','en-gb'].includes(lower))return 'en';
  if(['es','es-es','es-mx'].includes(lower))return 'es';
  if(['fr','fr-fr','fr-ca'].includes(lower))return 'fr';
  return null;
};
const initialLocale=():Locale=>{
  try {
    const url=new URL(window.location.href);
    return normalizeLocale(url.searchParams.get('lang'))||normalizeLocale(localStorage.getItem(localeStorageKey))||'pt-BR';
  } catch{return 'pt-BR';}
};
const escapeRegExp=(text:string)=>text.replace(/[|\\{}()[\]^$+*?.]/g,'\\$&');
const terms=Object.keys(dictionary).filter(item=>item.trim().length>2).sort((a,b)=>b.length-a.length);
const termsPattern=new RegExp('(?<![\\p{L}\\p{N}])(?:'+terms.map(escapeRegExp).join('|')+')(?![\\p{L}\\p{N}])','gu');
export function translate(source:string,locale:Locale):string {
  if(locale==='pt-BR'||!source.trim())return source;
  const index=indexes[locale];
  const prefix=source.match(/^\s*/)?.[0]||'';
  const suffix=source.match(/\s*$/)?.[0]||'';
  const trimmed=source.trim();
  const exact=dictionary[trimmed];
  if(exact)return prefix+exact[index]+suffix;
  const translated=trimmed.replace(termsPattern, term=>dictionary[term]?.[index]||term);
  return prefix+translated+suffix;
}
type LocaleContextValue={locale:Locale;setLocale:(locale:Locale)=>void};
const LocaleContext=createContext<LocaleContextValue>({locale:'pt-BR',setLocale:()=>{}});
export const useLocale=()=>useContext(LocaleContext);
export const localeForIntl=(locale:Locale)=>({ 'pt-BR':'pt-BR',en:'en-US',es:'es-ES',fr:'fr-FR' })[locale];
const textCache=new WeakMap<Text,{source:string;applied:string}>();
const attributeCache=new WeakMap<Element,Record<string,{source:string;applied:string}>>();
const excluded=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','TEXTAREA','SVG','PATH']);
const attrNames=['placeholder','aria-label','title','alt','aria-description'];
function translateTree(root:Element,locale:Locale) {
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let current:Node|null;
  while((current=walker.nextNode())){
    const node=current as Text;
    const parent=node.parentElement;
    if(!parent||excluded.has(parent.tagName)||parent.closest('[data-no-translate], [translate="no"], [contenteditable="true"]'))continue;
    const value=node.nodeValue||'';
    const old=textCache.get(node);
    const original=old&&(value===old.applied||value===old.source)?old.source:value;
    const translated=translate(original,locale);
    if(translated!==value)node.nodeValue=translated;
    textCache.set(node,{source:original,applied:translated});
  }
  const elements=[root,...Array.from(root.querySelectorAll('*'))];
  for(const element of elements){
    if(excluded.has(element.tagName)||element.closest('[data-no-translate], [translate="no"]'))continue;
    const cached=attributeCache.get(element)||{};
    for(const attr of attrNames){
      const value=element.getAttribute(attr);
      if(value===null)continue;
      const old=cached[attr];
      const original=old&&(value===old.applied||value===old.source)?old.source:value;
      const translated=translate(original,locale);
      if(translated!==value)element.setAttribute(attr,translated);
      cached[attr]={source:original,applied:translated};
    }
    attributeCache.set(element,cached);
  }
}
export function LocaleProvider({children}:{children:ReactNode}){
  const [locale,setCurrentLocale]=useState<Locale>(initialLocale);
  const setLocale=(next:Locale)=>{
    setCurrentLocale(next);
    try{
      localStorage.setItem(localeStorageKey,next);
      const url=new URL(window.location.href);
      url.searchParams.set('lang',next);
      window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);
    }catch{/* Browser storage unavailable */}
  };
  useEffect(()=>{
    document.documentElement.lang=locale;
    document.title=locale==='pt-BR'?'TechStore | Sua loja gamer demonstrativa':
      ({en:'TechStore | Demo gaming store',es:'TechStore | Tienda gamer de demostración',fr:'TechStore | Boutique gaming de démonstration'})[locale];
    const root=document.getElementById('root');
    if(!root)return;
    let animation=0;
    const scan=()=>{animation=0;translateTree(root,locale);};
    const schedule=()=>{if(!animation)animation=window.requestAnimationFrame(scan);};
    scan();
    const observer=new MutationObserver(schedule);
    observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:attrNames});
    return ()=>{observer.disconnect();if(animation)window.cancelAnimationFrame(animation);};
  },[locale]);
  const value=useMemo(()=>({locale,setLocale}),[locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function LanguageSwitcher({inline=false}:{inline?:boolean}){
  const {locale,setLocale}=useLocale();
  const [opened,setOpened]=useState(false);
  const active=variants.find(x=>x.value===locale)!;
  return <div data-no-translate className={inline?'relative shrink-0':'fixed bottom-4 left-4 z-[9999]'}>
    <button type="button" onClick={()=>setOpened(v=>!v)} aria-expanded={opened} aria-label="Select language / Seleccionar idioma / Choisir la langue" title="Language / Idioma / Langue" className={'inline-flex items-center gap-2 rounded-xl border font-bold shadow-lg transition '+(inline?'border-white/20 bg-[#142e59] px-3 py-2 text-xs text-white hover:bg-[#234b87]':'border-orange-200 bg-white px-3 py-3 text-sm text-slate-800 hover:border-orange-400')}>
      {inline?<Languages size={16}/>:<Globe2 size={19} className="text-orange-600"/>}<span aria-hidden="true">{active.flag}</span><span>{active.short}</span><ChevronDown size={14} className={opened?'rotate-180':''}/>
    </button>
    {opened&&<div role="menu" aria-label="Choose language" className={'absolute z-[10000] min-w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-2xl '+(inline?'right-0 top-full mt-2':'bottom-full left-0 mb-2')}>
      {variants.map(item=><button key={item.value} type="button" role="menuitemradio" aria-checked={locale===item.value} onClick={()=>{setLocale(item.value);setOpened(false);}} className={'flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-orange-50 '+(locale===item.value?'bg-orange-50 text-orange-700':'text-slate-700')}>
        <span aria-hidden="true">{item.flag}</span><span className="flex-1">{item.label}</span>{locale===item.value&&<Check size={16}/>}
      </button>)}
    </div>}
  </div>;
}
