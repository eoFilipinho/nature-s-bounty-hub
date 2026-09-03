-- =========================
-- 1. CATEGORIES
-- =========================
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- migrate existing text categories
INSERT INTO public.categories (name)
SELECT DISTINCT btrim(category) FROM public.products
WHERE category IS NOT NULL AND btrim(category) <> ''
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.products ADD COLUMN category_id uuid;

UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE btrim(p.category) = c.name;

ALTER TABLE public.products
  ADD CONSTRAINT products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

ALTER TABLE public.products DROP COLUMN category;
CREATE INDEX idx_products_category_id ON public.products(category_id);

-- =========================
-- 2. ROLES / PROFILES
-- =========================
CREATE TYPE public.app_role AS ENUM ('customer', 'admin');

CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name'),
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- 3. ORDERS
-- =========================
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','preparing','shipped','delivered','cancelled');

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending',
  total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- 4. PAYMENTS
-- =========================
CREATE TYPE public.payment_method AS ENUM ('pix','cartao','boleto');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  method public.payment_method NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_payments_order_id ON public.payments(order_id);

-- =========================
-- 5. STOCK MOVEMENTS
-- =========================
CREATE TYPE public.stock_movement_type AS ENUM ('entrada','saida');

CREATE TABLE public.stock_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type public.stock_movement_type NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);

CREATE OR REPLACE FUNCTION public.apply_stock_movement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'entrada' THEN
    UPDATE public.products
      SET stock_quantity = stock_quantity + NEW.quantity
      WHERE id = NEW.product_id;
  ELSE
    UPDATE public.products
      SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0)
      WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_stock_movement
AFTER INSERT ON public.stock_movements
FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

-- baixa automatica de estoque quando o pedido e confirmado
CREATE OR REPLACE FUNCTION public.handle_order_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
    INSERT INTO public.stock_movements (product_id, type, quantity, reason, created_by)
    SELECT oi.product_id, 'saida', oi.quantity,
           'Baixa automatica - pedido confirmado ' || NEW.id::text,
           auth.uid()
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_confirmed_stock
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_confirmed();

-- =========================
-- 6. RLS POLICIES
-- =========================

-- categories
CREATE POLICY "Categorias visiveis para todos" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Admins gerenciam categorias" ON public.categories
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- products: substituir policies antigas
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;

CREATE POLICY "Admins gerenciam produtos" ON public.products
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Usuario ve seu proprio perfil" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuario cria seu proprio perfil" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuario atualiza seu proprio perfil" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "Usuario ve seus papeis" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gerenciam papeis" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- orders
CREATE POLICY "Cliente ve seus pedidos" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Cliente cria seus pedidos" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins atualizam pedidos" ON public.orders
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins excluem pedidos" ON public.orders
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- order_items
CREATE POLICY "Cliente ve itens dos seus pedidos" ON public.order_items
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Cliente cria itens dos seus pedidos" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

CREATE POLICY "Admins gerenciam itens de pedido" ON public.order_items
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- payments
CREATE POLICY "Cliente ve seus pagamentos" ON public.payments
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Cliente cria seus pagamentos" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

CREATE POLICY "Admins gerenciam pagamentos" ON public.payments
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- stock_movements
CREATE POLICY "Admins gerenciam movimentos de estoque" ON public.stock_movements
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));