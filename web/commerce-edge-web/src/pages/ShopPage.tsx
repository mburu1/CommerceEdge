import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components';
import { searchProducts } from '@/data/demo';
import { useProducts } from '@/hooks';
import type { Product } from '@/models';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

function sortProducts(items: Product[], sort: string) {
  return [...items].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating || b.reviewCount - a.reviewCount;
    return 0;
  });
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const category = searchParams.get('category') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const { data } = useProducts({ page, limit: 12, category: category || undefined, search: search || undefined, sort: sort === 'featured' ? undefined : sort, inStock: inStockOnly || undefined });
  const remoteProducts = data?.data ?? [];
  const fallbackProducts = useMemo(() => {
    const filtered = searchProducts(search).filter((product) => !category || product.category.toLowerCase() === category.toLowerCase());
    return sortProducts(inStockOnly ? filtered.filter((product) => product.inStock) : filtered, sort);
  }, [category, inStockOnly, search, sort]);
  const displayedProducts = remoteProducts.length > 0 ? remoteProducts : fallbackProducts;
  const totalPages = Math.max(1, data?.meta.totalPages || Math.ceil(displayedProducts.length / 12));
  const currentPage = Math.min(page, totalPages);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handlePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage > 1) next.set('page', String(nextPage));
    else next.delete('page');
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="page-shell">
      <header className="page-header container">
        <p className="eyebrow">The full collection</p>
        <h1>Shop all products</h1>
        <p className="page-subtitle">Practical, beautifully made essentials for the way you live now.</p>
      </header>
      <div className="container shop-layout">
        <aside className="filter-panel" aria-label="Product filters">
          <div>
            <h2>Categories</h2>
            <div className="filter-list">
              <button className={category ? 'filter-link' : 'filter-link active'} onClick={() => { updateParam('category', ''); setSearch(''); }} type="button">All products</button>
              {['Audio', 'Home', 'Accessories', 'Wearables', 'Footwear', 'Stationery'].map((item) => (
                <button className={category === item ? 'filter-link active' : 'filter-link'} key={item} onClick={() => updateParam('category', item)} type="button">{item}</button>
              ))}
            </div>
          </div>
          <label className="checkbox-filter">
            <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} />
            <span>In stock only</span>
          </label>
          <Link className="filter-help" to="/contact">Need help choosing? <span>→</span></Link>
        </aside>
        <section className="shop-content">
          <div className="shop-toolbar">
            <p>{displayedProducts.length} products</p>
            <form className="shop-search" role="search" onSubmit={(event) => { event.preventDefault(); updateParam('search', search.trim()); }}>
              <label className="sr-only" htmlFor="shop-search">Search products</label>
              <input id="shop-search" type="search" placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} />
              <button type="submit" aria-label="Apply search">⌕</button>
            </form>
            <label className="sort-select">
              <span className="sr-only">Sort products</span>
              <select value={sort} onChange={(event) => { setSort(event.target.value); updateParam('sort', event.target.value); }}>
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          {displayedProducts.length > 0 ? (
            <div className="product-grid product-grid-shop">
              {displayedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="empty-state compact">
              <h2>No products found</h2>
              <p>Try a different search or clear your filters.</p>
              <button className="btn btn-outline" type="button" onClick={() => { setSearch(''); setSort('featured'); setInStockOnly(false); setSearchParams({}); }}>Clear filters</button>
            </div>
          )}
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Product pages">
              <button type="button" disabled={currentPage <= 1} onClick={() => handlePage(currentPage - 1)}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button type="button" disabled={currentPage >= totalPages} onClick={() => handlePage(currentPage + 1)}>Next</button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
