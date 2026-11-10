import { ShoppingCart, Search, Menu, User, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onCartClick: () => void;
  cartItemsCount: number;
  onLoginClick: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const Header = ({ onCartClick, cartItemsCount, onLoginClick, searchTerm, onSearchChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const searchBox = (mobile = false) => (
    <label className={`flex items-center gap-2 rounded-lg bg-white px-4 py-2 ${mobile ? 'w-full' : 'w-80'}`}>
      <Search className="shrink-0 text-gray-400" size={19} />
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar produtos..."
        aria-label="Buscar produtos"
        className="min-w-0 flex-1 text-gray-700 outline-none"
      />
      {searchTerm && <button type="button" onClick={() => onSearchChange('')} aria-label="Limpar busca" className="text-gray-400 hover:text-gray-700"><X size={16} /></button>}
    </label>
  );

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-4">
          <a href="#topo" className="flex shrink-0 items-center gap-2" aria-label="TechStore - início">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white"><ShoppingCart className="text-orange-600" size={24} /></span>
            <span className="text-2xl font-bold text-white">TechStore</span>
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            <a href="#catalogo" className="font-medium text-white transition hover:text-orange-100">Ofertas</a>
            <a href="#catalogo" onClick={() => onSearchChange('Xbox')} className="font-medium text-white transition hover:text-orange-100">Consoles</a>
            <a href="#catalogo" onClick={() => onSearchChange('Mouse')} className="font-medium text-white transition hover:text-orange-100">Periféricos</a>
            <a href="#catalogo" onClick={() => onSearchChange('Controle')} className="font-medium text-white transition hover:text-orange-100">Acessórios</a>
          </nav>

          <div className="hidden flex-1 justify-center xl:flex">{searchBox()}</div>

          <div className="flex shrink-0 items-center gap-3">
            <button onClick={onLoginClick} className="hidden items-center gap-2 rounded-lg bg-orange-700 px-4 py-2 text-white transition hover:bg-orange-800 md:flex">
              <User size={19} /><span>Entrar</span>
            </button>
            <button onClick={onCartClick} aria-label={`Abrir carrinho, ${cartItemsCount} itens`} className="relative rounded-lg bg-orange-700 p-2 text-white transition hover:bg-orange-800">
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">{cartItemsCount}</span>}
            </button>
            <button onClick={() => setIsMenuOpen((open) => !open)} aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={isMenuOpen} className="text-white md:hidden">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <nav className="space-y-3 pb-4 md:hidden">
            {searchBox(true)}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white">
              <a href="#catalogo" onClick={() => setIsMenuOpen(false)}>Ofertas</a>
              <a href="#catalogo" onClick={() => { onSearchChange('Xbox'); setIsMenuOpen(false); }}>Consoles</a>
              <a href="#catalogo" onClick={() => { onSearchChange('Mouse'); setIsMenuOpen(false); }}>Periféricos</a>
              <a href="#catalogo" onClick={() => { onSearchChange('Controle'); setIsMenuOpen(false); }}>Acessórios</a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
