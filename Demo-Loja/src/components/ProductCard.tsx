import { ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const getProductImage = () => {
    const name = product.name.toLowerCase();
    if (name.includes('xbox')) return 'https://m.media-amazon.com/images/I/516pVDAQMnL.jpg';
    if (name.includes('playstation') || name.includes('ps5')) return 'https://images.kabum.com.br/produtos/fotos/527400/console-playstation-5-sony-slim-branco-2-jogos-1000038899_1710512865_gg.jpg';
    if (name.includes('switch')) return 'https://m.media-amazon.com/images/I/7148mbvrbWL.jpg';
    if (name.includes('mouse')) return 'https://theawesomer.com/photos/2019/11/razer_basilisk_ultimate_mouse_4.jpg';
    if (name.includes('controle')) return name.includes('xbox')
      ? 'https://cdn.awsli.com.br/600x450/1919/1919257/produto/120337656/d8fc9b09e0.jpg'
      : 'https://images.kabum.com.br/produtos/fotos/115801/controle-sem-fio-ps5-dualsense_1598897393_gg.jpg';
    if (name.includes('cadeira')) return 'https://cdn.dooca.store/1841/products/cadeira-rgb-draxen.jpg?v=1644257662&webp=0';
    return product.image_url || 'https://placehold.co/400x400?text=TechStore';
  };

  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative overflow-hidden bg-gray-100">
        {discount > 0 && <span className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">-{discount}%</span>}
        {product.stock <= 3 && product.stock > 0 && <span className="absolute bottom-3 left-3 z-10 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Últimas unidades</span>}
        <img
          src={getProductImage()}
          alt={product.name}
          loading="lazy"
          className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => { event.currentTarget.src = 'https://placehold.co/400x400?text=Imagem+indisponivel'; }}
        />
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star key={index} size={16} className={index < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
          ))}
          <span className="ml-2 text-sm text-gray-600">({product.rating.toFixed(1)})</span>
        </div>
        <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-gray-600">{product.description}</p>
        <div className="space-y-2">
          {product.original_price && <p className="text-sm text-gray-400 line-through">R$ {product.original_price.toFixed(2).replace('.', ',')}</p>}
          <p className="text-3xl font-bold text-orange-600">R$ {product.price.toFixed(2).replace('.', ',')}</p>
          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `Em estoque: ${product.stock} unidades` : 'Produto esgotado'}
          </p>
        </div>
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => onAddToCart(product.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart size={20} />
          <span>{product.stock > 0 ? 'Adicionar ao carrinho' : 'Indisponível'}</span>
        </button>
      </div>
    </article>
  );
};
