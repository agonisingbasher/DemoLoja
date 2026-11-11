import { Armchair, Boxes, Cpu, Gamepad2, Headphones, Keyboard, LayoutGrid } from 'lucide-react';
import type { Category } from '../lib/supabase';
type Props={categories:Category[];selectedCategory:string|null;onSelectCategory:(id:string|null)=>void};
export const categoryIcons:Record<string,typeof LayoutGrid>={consoles:Gamepad2,perifericos:Keyboard,acessorios:Headphones,cadeiras:Armchair,componentes:Cpu};
export function CategoryFilter({categories,selectedCategory,onSelectCategory}:Props){
  return <section className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="mb-4 flex items-center gap-2 font-black text-slate-900"><Boxes size={19} className="text-orange-600"/> Categorias</h3>
    <div className="space-y-1.5">{[{id:'',name:'Todos os produtos'},...categories].map(category=>{
      const Icon=category.id?categoryIcons[category.id]||Boxes:LayoutGrid;const selected=(selectedCategory||'')===category.id;
      return <button key={category.id} onClick={()=>onSelectCategory(category.id||null)} aria-pressed={selected} className={'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition '+(selected?'bg-orange-600 text-white':'text-slate-600 hover:bg-orange-50 hover:text-orange-700')}><Icon size={19}/>{category.name}</button>;
    })}</div></section>;
}