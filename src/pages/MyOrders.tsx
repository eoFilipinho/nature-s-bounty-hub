import { Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const MyOrders = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <Package className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl font-semibold text-foreground">Meus Pedidos</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Nenhum pedido encontrado</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Você ainda não realizou nenhum pedido. Explore nossos produtos!
          </p>
          <Link
            to="/"
            className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Ver Produtos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
