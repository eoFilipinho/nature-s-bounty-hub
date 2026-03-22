import { Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { categories } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";

const navItems = ["Início", "Produtos", "Cereais", "Temperos", "Vitaminas", "Suplementação", "Chás", "Grãos e Sementes"];

type HeaderProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
};

const Header = ({ activeTab, onTabChange, searchQuery, onSearchChange }: HeaderProps) => {
  const { count, setIsOpen } = useCart();

  return (
    <header className="w-full bg-popover/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
      {/* Top Row */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-foreground/[0.03] rounded-full py-2.5 pl-10 pr-4 text-sm focus:bg-foreground/[0.06] transition-all outline-none placeholder:text-muted-foreground"
              placeholder="Buscar sementes, chás..."
            />
          </div>
        </div>

        {/* Logo */}
        <div className="flex-1 flex justify-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Palace <span className="text-primary">Saúde & Performance</span>
          </h1>
        </div>

        {/* Cart */}
        <div className="flex-1 flex justify-end items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-foreground/[0.03] rounded-full transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-foreground" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold tabular-nums"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <LoginBox />
        </div>
      </div>

      {/* Nav Row */}
      <nav className="flex justify-center gap-8 py-3.5 border-t border-foreground/[0.03] overflow-x-auto px-4">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => onTabChange(item)}
            className={`text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${
              activeTab === item ? "text-primary" : "text-foreground/50 hover:text-foreground/80"
            }`}
          >
            {item}
            {activeTab === item && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
