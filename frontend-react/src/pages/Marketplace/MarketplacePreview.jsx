import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Search,
  Store,
  Package,
  X,
} from "lucide-react";

import marketplaceRequest from "../../config/marketplaceApi";
import { getDirectory } from "./storeDirectory";
import "./MarketplacePreview.css";
import { EmptyState, LoadingSkeleton } from "../../components/common/Feedback";

export default function MarketplacePreview({ onBack }) {
const [sampleCatalogue] = useState(() => {
  const directory = getDirectory();

  const stores = directory.stores
    .filter((store) => store.id.startsWith("sample-"))
    .map((store) => ({
      ...store,
      userId: store.id,
      demo: true,
    }));

  const storesById = new Map(
    stores.map((store) => [store.userId, store])
  );

  const products = directory.products
    .filter(
      (product) =>
        storesById.has(product.storeId) &&
        !product.deletedAt &&
        product.active !== false
    )
    .map((product) => ({
      ...product,
      sellerId: product.storeId,
      store: storesById.get(product.storeId),
      demo: true,
    }));

  return { products, stores };
});

const [products, setProducts] = useState(
  sampleCatalogue.products
);

const [stores, setStores] = useState(
  sampleCatalogue.stores
);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  let cancelled = false;

  marketplaceRequest("/catalog")
    .then((data) => {
      if (cancelled) return;

      setProducts([
        ...(data.products ?? []),
        ...sampleCatalogue.products,
      ]);

      setStores([
        ...(data.stores ?? []),
        ...sampleCatalogue.stores,
      ]);

      setError("");
    })
    .catch((error) => {
      console.error("Catalogue error:", error);

      if (!cancelled) {
        setError(
          "Live catalogue unavailable. Showing sample products."
        );
      }
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [sampleCatalogue]);

  const categories = [
    "All Products",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();

    const matchesSearch = [
      product.name,
      product.description,
      product.category,
      product.store?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);

    return (
      matchesSearch &&
      (category === "All Products" ||
        product.category === category) &&
      (!selectedStore ||
        product.sellerId === selectedStore.userId)
    );
  });

  const formatPrice = (price) =>
    Number.isFinite(price)
      ? price.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
        })
      : "Price unavailable";

  return (
    <div className="indipay-marketplace mp-preview">
      <header className="mp-preview-header">
        <button onClick={onBack} aria-label="Back to Indipay">
          <ArrowLeft size={23} />
        </button>
        <strong>Indipay Super Store</strong>
        <ShoppingBag size={23} />
      </header>

      <main className="mp-wrap mp-preview-main">
        <section className="mp-preview-banner">
          <ShoppingBag size={48} />
          <span className="mp-preview-label">COMING SOON</span>
          <h1>Explore the Super Store</h1>
          <p>
            Explore our products and stores before
            the official launch.
          </p>
          <small>Shopping is currently unavailable.</small>
        </section>

        <div className="mp-preview-search">
          <Search size={20} />
          <input
            aria-label="Search products"
            placeholder="Search products and stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {stores.length > 0 && (
          <section>
            <h2>Explore Stores</h2>
            <div className="mp-preview-stores">
              {stores.map((store) => (
                <button
                  key={store.userId}
                  onClick={() => {
                    setSelectedStore(store);
                    setCategory("All Products");
                    setSearch("");
                  }}
                >
                  <Store size={28} />
                  <span>{store.name}</span>
{store.demo && <small>Sample store</small>}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2>
            {selectedStore
              ? selectedStore.name
              : "Explore Products"}
          </h2>

          {selectedStore && (
            <button
              className="mp-preview-clear"
              onClick={() => setSelectedStore(null)}
            >
              View all stores <X size={14} />
            </button>
          )}

          <div className="mp-preview-categories">
            {categories.map((item) => (
              <button
                key={item}
                aria-pressed={category === item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading && <LoadingSkeleton lines={2} />}
          {error && <p role="alert">{error}</p>}

          {!loading &&
            filteredProducts.length === 0 && (
              <EmptyState icon={<ShoppingBag />} title="No products to preview"
                description="Products from available stores appear here."
                actionLabel="Clear filters"
                onAction={search || selectedStore || category !== "All Products" ? () => {
                  setSearch(""); setSelectedStore(null); setCategory("All Products");
                } : undefined} />
            )}

          <div className="mp-preview-grid">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                className="mp-preview-card"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="mp-preview-image">
                  <Package size={42} />
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.hidden = true;
                      }}
                    />
                  )}
                </div>

                <div className="mp-preview-card-body">
                  <h3>{product.name}</h3>
                  <p>{product.store?.name}</p>
                  <strong>{formatPrice(product.price)}</strong>
                  <small>
  {product.demo ? "Sample product" : "Preview only"}
</small>
                </div>
              </button>
            ))}
          </div>
        </section>

        {selectedProduct && (
          <section
            className="mp-preview-details"
            aria-label="Product details"
          >
            <button
              className="mp-preview-clear"
              onClick={() => setSelectedProduct(null)}
            >
              Close details <X size={18} />
            </button>

            {selectedProduct.image && (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />
            )}

            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.store?.name}</p>
            <h3>{formatPrice(selectedProduct.price)}</h3>
            <p>{selectedProduct.description}</p>

            <button disabled className="mp-preview-disabled">
              Available after launch
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
