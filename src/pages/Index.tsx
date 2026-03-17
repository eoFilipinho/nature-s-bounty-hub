import { useState, useMemo } from "react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import { CartProvider } from "@/context/CartContext";
import { products, featuredProducts } from "@/data/products";

const categoryMap: Record<string, string> = {
  Cereais: "Cereais",
  Temperos: "Temperos",
  Vitaminas: "Vitaminas",
  Suplementação: "Suplementação",
  Chás: "Chás",
  "Grãos e Sementes": "Grãos e Sementes",
};

const IndexContent = () => {
  const [activeTab, setActiveTab] = useState("Início");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    let list = activeTab === "Início" ? featuredProducts : activeTab === "Produtos" ? products : products.filter((p) => p.category === categoryMap[activeTab]);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = (activeTab === "Início" || activeTab === "Produtos" ? products : list).filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, searchQuery]);

  const title = activeTab === "Início" ? "Colheita da Semana" : activeTab === "Produtos" ? "Todos os Produtos" : activeTab;

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="max-w-7xl mx-auto px-6">
        {activeTab === "Início" && !searchQuery && <HeroSection />}
        <ProductGrid products={filteredProducts} title={title} />
      </main>
      <CartDrawer />
    </div>
  );
};

const Index = () => (
  <CartProvider>
    <IndexContent />
  </CartProvider>
);

export default Index;
