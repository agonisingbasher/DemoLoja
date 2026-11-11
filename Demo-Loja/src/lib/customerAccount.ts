import type { User } from '@supabase/supabase-js';
export type DeliveryAddress={street:string;number:string;complement:string;district:string;city:string;state:string;cep:string};
export type AccountProfile={id:string;name:string;email:string;phone:string;address:DeliveryAddress|null;demo:boolean};
export const demoAccountKey='techstore_demo_customer_v2';
export function profileFromUser(user:User):AccountProfile {
  const data=user.user_metadata||{};
  const address=(data.address&&typeof data.address==='object')?data.address:null;
  return {id:user.id,name:String(data.full_name||data.name||user.email?.split('@')[0]||'Cliente'),email:user.email||'',phone:String(data.phone||''),address:address as DeliveryAddress|null,demo:false};
}
export function loadDemoAccount():AccountProfile|null {
  try{const item=localStorage.getItem(demoAccountKey);return item?JSON.parse(item) as AccountProfile:null;}catch{return null;}
}
export function saveDemoAccount(profile:AccountProfile|null){
  try{if(profile)localStorage.setItem(demoAccountKey,JSON.stringify(profile));else localStorage.removeItem(demoAccountKey);}catch{ /* Storage disabled */ }
}
