import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs, Button, ProductCard, QuantitySelector } from '@/components';
import { products } from '@/data/demo';
import { useAddToCart, useProduct, useRelatedProducts } from '@/hooks';
import { formatMoney } from '@/lib/utils';

export function ProductPage() {
  const { productId = '' } = useParams();
  const { data: product } = useProduct(productId);
  const { data: relatedProducts = [] } = useRelatedProducts(productId, 4);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const displayedProduct = product ?? products.find((item) => item.id === productId) ?? products[0];

  if (!displayedProduct) {
    return <main className="page-shell container"><div className="empty-state"><h1>Product not found</h1><Link className="btn btn-primary" to="/shop">Return to shop</Link></div></main>;
  }

  const handleAddToCart = () => {
    addToCart.mutate({ productId: displayedProduct.id, quantity });
  };

  return (
    <main className="page-shell">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: displayedProduct.name }]} />
        <section className="product-detail">
          <div className="product-gallery">
            <div className="product-main-image">
              <img src={displayedProduct.images[0] || '/product-placeholder.svg'} alt={displayedProduct.name} />
            </div>
            <div className="product-thumbnails" aria-label="Product images">
              {displayedProduct.images.map((image, index) => <button type="button" key={`${image}-${index}`} className={index === 0 ? 'active' : ''} aria-label={`View image ${index + 1}`}><img src={image} alt="" /></button>)}
            </div>
          </div>
          <div className="product-info">
            <p className="eyebrow">{displayedProduct.category} / {displayedProduct.brand}</p>
            <h1>{displayedProduct.name}</h1>
            <div className="product-rating"><span>★ {displayedProduct.rating.toFixed(1)}</span><span>{displayedProduct.reviewCount} reviews</span></div>
            <div className="product-price">
              <strong>{formatMoney(displayedProduct.price, 'USD')}</strong>
              {displayedProduct.compareAtPrice && <del>{formatMoney(displayedProduct.compareAtPrice, 'USD')}</del>}
            </div>
            <p className="product-description">{displayedProduct.description}</p>
            <div className={`product-stock ${displayedProduct.inStock ? 'available' : 'unavailable'}`}>
              <span className="stock-dot" /> {displayedProduct.inStock ? `In stock (${displayedProduct.stockQuantity} available)` : 'Out of stock'}
            </div>
            <div className="product-purchase">
              <QuantitySelector value={quantity} onChange={setQuantity} max={Math.max(1, displayedProduct.stockQuantity)} />
              <Button className="add-cart-button" loading={addToCart.isPending} disabled={!displayedProduct.inStock} onClick={handleAddToCart}>
                {addToCart.isPending ? 'Adding...' : 'Add to cart'}
              </Button>
            </div>
            {addToCart.isError && <p className="form-error" role="alert">We could not add this item. Please try again.</p>}
            <div className="product-meta">
              <div><span>SKU</span><strong>{displayedProduct.sku}</strong></div>
              <div><span>Category</span><Link to={`/categories/${displayedProduct.category.toLowerCase()}`}>{displayedProduct.category}</Link></div>
              <div><span>Shipping</span><strong>Free over $75</strong></div>
            </div>
          </div>
        </section>
      </div>
      {relatedProducts.length > 0 && (
        <section className="section container">
          <div className="section-heading"><div><p className="eyebrow">Keep exploring</p><h2>You may also like</h2></div></div>
          <div className="product-grid">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      )}
    </main>
  );
}
