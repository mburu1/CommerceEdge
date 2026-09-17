import { Link } from 'react-router-dom';
import { ProductCard } from '@/components';
import { categories, products } from '@/data/demo';
import { useCategories, useProducts } from '@/hooks';

export function CategoriesPage() {
  const { data: remoteCategories } = useCategories();
  const { data: remoteProducts } = useProducts({ limit: 4 });
  const displayedCategories = remoteCategories && remoteCategories.length > 0 ? remoteCategories : categories;
  const displayedProducts = remoteProducts?.data && remoteProducts.data.length > 0 ? remoteProducts.data : products.slice(0, 4);

  return (
    <main className="page-shell">
      <header className="page-header container narrow">
        <p className="eyebrow">Browse the collection</p>
        <h1>Shop by category</h1>
        <p className="page-subtitle">Find the right objects for every part of your day.</p>
      </header>
      <section className="container category-directory">
        <div className="category-directory-grid">
          {displayedCategories.map((category) => (
            <Link className="category-directory-card" key={category.id} to={`/categories/${category.slug}`}>
              <img src={category.image || '/product-placeholder.svg'} alt="" />
              <div><span>{category.productCount} products</span><h2>{category.name}</h2><p>{category.description || 'Explore this category.'}</p><strong>Shop category →</strong></div>
            </Link>
          ))}
        </div>
      </section>
      <section className="section container">
        <div className="section-heading"><div><p className="eyebrow">Popular right now</p><h2>Trending goods</h2></div><Link className="text-link" to="/shop">View all <span>→</span></Link></div>
        <div className="product-grid">{displayedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>
    </main>
  );
}
