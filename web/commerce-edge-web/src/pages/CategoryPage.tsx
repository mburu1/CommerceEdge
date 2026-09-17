import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs, ProductCard } from '@/components';
import { categories, products } from '@/data/demo';
import { useCategory, useProducts } from '@/hooks';

export function CategoryPage() {
  const { categorySlug = '' } = useParams();
  const { data: category } = useCategory(categorySlug);
  const { data } = useProducts({ limit: 12, category: categorySlug || undefined });
  const displayedCategory = category ?? categories.find((item) => item.slug === categorySlug);
  const displayedProducts = data?.data && data.data.length > 0 ? data.data : products.filter((product) => product.category.toLowerCase() === categorySlug.toLowerCase());

  return (
    <main className="page-shell">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: displayedCategory?.name ?? categorySlug }]} />
      </div>
      <header className="category-hero">
        <div className="container category-hero-inner">
          <div><p className="eyebrow">Collection</p><h1>{displayedCategory?.name ?? categorySlug}</h1><p>{displayedCategory?.description || 'Explore this CommerceEdge collection.'}</p></div>
          <span>{displayedProducts.length} products</span>
        </div>
      </header>
      <section className="section container">
        {displayedProducts.length > 0 ? <div className="product-grid">{displayedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>No products in this category yet</h2><Link className="btn btn-primary" to="/shop">Shop all products</Link></div>}
      </section>
    </main>
  );
}
