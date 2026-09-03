import { Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: { name: string; image_url: string | null } | null;
  }[];
  payments: { method: string; status: string }[];
};

const statusLabel: Record<string, string> = {
  pending: "Aguardando confirmação",
  confirmed: "Confirmado",
  preparing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    supabase
      .from("orders")
      .select(
        "id, status, total, created_at, order_items(id, quantity, unit_price, subtotal, products(name, image_url)), payments(method, status)",
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as unknown as OrderRow[]) ?? []);
        setLoading(false);
      });
  }, [user, authLoading]);

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

        {loading || authLoading ? (
          <p className="text-center py-20 text-muted-foreground text-sm">Carregando...</p>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Entre para ver seus pedidos</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login pelo ícone de usuário no cabeçalho da loja.
            </p>
            <Link
              to="/"
              className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Ir para a loja
            </Link>
          </div>
        ) : orders.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-popover p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {item.products?.name ?? "Produto"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × R$ {Number(item.unit_price).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        R$ {Number(item.subtotal).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {order.payments?.[0]
                      ? `Pagamento: ${order.payments[0].method} (${order.payments[0].status})`
                      : "Pagamento não registrado"}
                  </span>
                  <span className="text-base font-display font-bold">
                    R$ {Number(order.total).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
