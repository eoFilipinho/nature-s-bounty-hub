import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";

const ProductGrid = ({ products, title }: { products: Product[]; title?: string }) => {
  return (
    <section className="py-8">
      {title && (
        <h2 className="font-display text-3xl font-semibold mb-8 text-foreground">{title}</h2>
      )}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg shadow-card bg-popover overflow-hidden animate-pulse">
              <div className="aspect-square bg-accent" />
              <div className="p-4 space-y-3">
                <div className="h-2 w-16 bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
