import { Eye, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

export const ProductCard = ({ product, onAddToCart, onViewDetails }: ProductCardProps) => {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <button type="button" onClick={() => onViewDetails(product.id)} className="relative block w-full overflow-hidden bg-slate-100 text-left" aria-label={`Ver detalhes de ${product.name}`}>
        {discount > 0 && <span className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">-{discount}%</span>}
        {product.stock <= 3 && product.stock > 0 && <span className="absolute bottom-3 left-3 z-10 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Últimas unidades</span>}
        <img
          src={product.image_url || 'https://placehold.co/600x450?text=TechStore'}
          alt={product.name}
          loading="lazy"
          className="h-64 w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          onError={(event) => { event.currentTarget.src = 'https://placehold.co/600x450?text=Imagem+indisponivel'; }}
        />
      </button>
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star key={index} size={16} className={index < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
          ))}
          <span className="ml-2 text-sm text-gray-600">({product.rating.toFixed(1)})</span>
        </div>
        <button type="button" onClick={() => onViewDetails(product.id)} className="block min-h-[3.5rem] text-left text-lg font-semibold text-gray-800 hover:text-orange-600">{product.name}</button>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-gray-600">{product.description}</p>
        <div className="space-y-2">
          {product.original_price && <p className="text-sm text-gray-400 line-through">R$ {product.original_price.toFixed(2).replace('.', ',')}</p>}
          <p className="text-3xl font-bold text-orange-600">R$ {product.price.toFixed(2).replace('.', ',')}</p>
          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `Em estoque: ${product.stock} unidades` : 'Produto esgotado'}
          </p>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button type="button" disabled={product.stock <= 0} onClick={() => onAddToCart(product.id)} className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300">
            <ShoppingCart size={19} /><span>{product.stock > 0 ? 'Adicionar' : 'Indisponível'}</span>
          </button>
          <button type="button" onClick={() => onViewDetails(product.id)} aria-label="Ver detalhes" className="flex items-center justify-center rounded-lg border border-slate-200 px-4 text-slate-700 transition hover:border-orange-400 hover:text-orange-600"><Eye size={20} /></button>
        </div>
      </div>
    </article>
  );
};
