import { formatMoney } from '@/lib/utils';
import type { Product } from '@/models';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, variant = 'default', onAddToCart }: ProductCardProps) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <article className="card overflow-hidden flex flex-col h-full transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="badge badge-danger text-lg px-3 py-1">Out of Stock</span>
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 badge badge-danger">
            -{discountPercent}%
          </span>
        )}

        {product.rating > 0 && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-sm font-medium">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {product.rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="card-body flex flex-col flex-1 p-4">
        <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">
          {product.category}
        </p>

        <h3 className="font-semibold text-primary text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>

        {variant === 'compact' && product.brand && (
          <p className="text-sm text-secondary mb-2">{product.brand}</p>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-primary">
            {formatMoney(product.price, 'USD')}
          </span>
          {hasDiscount && (
            <span className="text-sm text-secondary line-through">
              {formatMoney(product.compareAtPrice!, 'USD')}
            </span>
          )}
        </div>

        {variant !== 'compact' && (
          <p className="text-sm text-secondary line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          {product.inStock ? (
            <button
              onClick={() => onAddToCart?.(product)}
              className="btn btn-primary btn-block flex-1"
              disabled={!product.inStock}
            >
              Add to Cart
            </button>
          ) : (
            <button className="btn btn-secondary btn-block flex-1" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </article>
  );
}