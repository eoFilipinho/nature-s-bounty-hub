
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  weight TEXT,
  description TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Admin management policies (authenticated users)
CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing products
INSERT INTO public.products (name, price, category, image_url, weight, description, stock_quantity) VALUES
('Aveia em Flocos', 12.90, 'Cereais', '/products/aveia-em-flocos.jpg', '500g', 'Aveia em flocos finos de alta qualidade.', 50),
('Granola Artesanal', 18.50, 'Cereais', '/products/granola-artesanal.jpg', '400g', 'Granola artesanal crocante.', 30),
('Muesli Tropical', 22.00, 'Cereais', '/products/muesli-tropical.jpg', '350g', 'Muesli tropical com frutas.', 25),
('Farelo de Trigo', 8.90, 'Cereais', '/products/farelo-de-trigo.jpg', '300g', 'Farelo de trigo rico em fibras.', 40),
('Cúrcuma em Pó', 15.00, 'Temperos', '/products/curcuma.jpg', '100g', 'Cúrcuma orgânica em pó.', 60),
('Pimenta Caiena', 11.50, 'Temperos', '/products/pimenta-caiena.jpg', '80g', 'Pimenta caiena moída.', 45),
('Canela do Ceilão', 19.90, 'Temperos', '/products/canela-ceilao.jpg', '120g', 'Canela do Ceilão em pó.', 35),
('Gengibre Desidratado', 14.00, 'Temperos', '/products/gengibre-desidratado.jpg', '100g', 'Gengibre desidratado em lascas.', 50),
('Vitamina C Natural', 45.00, 'Vitaminas', '/products/vitamina-c.jpg', '60 cáps', 'Vitamina C de acerola orgânica.', 80),
('Complexo B', 38.00, 'Vitaminas', '/products/complexo-b.jpg', '90 cáps', 'Complexo B completo.', 70),
('Vitamina D3', 32.00, 'Vitaminas', '/products/vitamina-d3.jpg', '60 cáps', 'Vitamina D3 2000 UI.', 65),
('Zinco Quelado', 28.00, 'Vitaminas', '/products/zinco-quelado.jpg', '60 cáps', 'Zinco quelado bisglicinato.', 55),
('Whey Vegetal', 89.90, 'Suplementação', '/products/whey-vegetal.jpg', '900g', 'Proteína vegetal premium.', 20),
('Creatina Pura', 65.00, 'Suplementação', '/products/creatina-pura.jpg', '300g', 'Creatina monoidratada pura.', 40),
('Spirulina', 42.00, 'Suplementação', '/products/spirulina.jpg', '120 cáps', 'Spirulina orgânica em cápsulas.', 35),
('Colágeno Hidrolisado', 55.00, 'Suplementação', '/products/colageno-hidrolisado.jpg', '300g', 'Colágeno tipo I e III.', 30),
('Camomila Premium', 16.50, 'Chás', '/products/camomila.jpg', '30 sachês', 'Camomila premium orgânica.', 90),
('Chá Verde Orgânico', 21.00, 'Chás', '/products/cha-verde.jpg', '100g', 'Chá verde de folhas inteiras.', 75),
('Hibisco', 14.00, 'Chás', '/products/hibisco.jpg', '80g', 'Flores de hibisco desidratadas.', 60),
('Erva-cidreira', 12.00, 'Chás', '/products/erva-cidreira.jpg', '50g', 'Erva-cidreira desidratada.', 85),
('Chia', 17.50, 'Grãos e Sementes', '/products/chia.jpg', '250g', 'Sementes de chia selecionadas.', 45),
('Linhaça Dourada', 13.00, 'Grãos e Sementes', '/products/linhaca-dourada.jpg', '300g', 'Linhaça dourada em grãos.', 50),
('Quinoa Real', 24.00, 'Grãos e Sementes', '/products/quinoa-real.jpg', '500g', 'Quinoa real boliviana.', 30),
('Semente de Girassol', 11.00, 'Grãos e Sementes', '/products/semente-girassol.jpg', '200g', 'Sementes de girassol cruas.', 55);
