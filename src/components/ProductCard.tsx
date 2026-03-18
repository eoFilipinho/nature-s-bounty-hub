import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group rounded-lg shadow-card hover:shadow-card-hover transition-shadow bg-popover overflow-hidden cursor-pointer"
      onClick={() => navigate(`/produto/${product.id}`)}
    >
      {/* Image area */}
      <div className="aspect-square bg-accent flex items-center justify-center text-5xl select-none">
        {product.image}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
          {product.category}
        </p>
        <h3 className="text-base font-semibold text-foreground leading-tight">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.weight}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); addItem(product); }}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
