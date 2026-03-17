export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  weight: string;
};

export const categories = [
  "Todos",
  "Cereais",
  "Temperos",
  "Vitaminas",
  "Suplementação",
  "Chás",
  "Grãos e Sementes",
] as const;

export type Category = (typeof categories)[number];

export const products: Product[] = [
  { id: "1", name: "Aveia em Flocos", price: 12.9, category: "Cereais", image: "🌾", weight: "500g" },
  { id: "2", name: "Granola Artesanal", price: 18.5, category: "Cereais", image: "🥣", weight: "400g" },
  { id: "3", name: "Muesli Tropical", price: 22.0, category: "Cereais", image: "🥥", weight: "350g" },
  { id: "4", name: "Farelo de Trigo", price: 8.9, category: "Cereais", image: "🌿", weight: "300g" },
  { id: "5", name: "Cúrcuma em Pó", price: 15.0, category: "Temperos", image: "🧡", weight: "100g" },
  { id: "6", name: "Pimenta Caiena", price: 11.5, category: "Temperos", image: "🌶️", weight: "80g" },
  { id: "7", name: "Canela do Ceilão", price: 19.9, category: "Temperos", image: "🪵", weight: "120g" },
  { id: "8", name: "Gengibre Desidratado", price: 14.0, category: "Temperos", image: "🫚", weight: "100g" },
  { id: "9", name: "Vitamina C Natural", price: 45.0, category: "Vitaminas", image: "🍊", weight: "60 cáps" },
  { id: "10", name: "Complexo B", price: 38.0, category: "Vitaminas", image: "💛", weight: "90 cáps" },
  { id: "11", name: "Vitamina D3", price: 32.0, category: "Vitaminas", image: "☀️", weight: "60 cáps" },
  { id: "12", name: "Zinco Quelado", price: 28.0, category: "Vitaminas", image: "🔬", weight: "60 cáps" },
  { id: "13", name: "Whey Vegetal", price: 89.9, category: "Suplementação", image: "💪", weight: "900g" },
  { id: "14", name: "Creatina Pura", price: 65.0, category: "Suplementação", image: "⚡", weight: "300g" },
  { id: "15", name: "Spirulina", price: 42.0, category: "Suplementação", image: "🌊", weight: "120 cáps" },
  { id: "16", name: "Colágeno Hidrolisado", price: 55.0, category: "Suplementação", image: "✨", weight: "300g" },
  { id: "17", name: "Camomila Premium", price: 16.5, category: "Chás", image: "🌼", weight: "30 sachês" },
  { id: "18", name: "Chá Verde Orgânico", price: 21.0, category: "Chás", image: "🍵", weight: "100g" },
  { id: "19", name: "Hibisco", price: 14.0, category: "Chás", image: "🌺", weight: "80g" },
  { id: "20", name: "Erva-cidreira", price: 12.0, category: "Chás", image: "🍃", weight: "50g" },
  { id: "21", name: "Chia", price: 17.5, category: "Grãos e Sementes", image: "🫘", weight: "250g" },
  { id: "22", name: "Linhaça Dourada", price: 13.0, category: "Grãos e Sementes", image: "🌻", weight: "300g" },
  { id: "23", name: "Quinoa Real", price: 24.0, category: "Grãos e Sementes", image: "🌾", weight: "500g" },
  { id: "24", name: "Semente de Girassol", price: 11.0, category: "Grãos e Sementes", image: "🌻", weight: "200g" },
];

export const featuredProducts = products.filter((_, i) => [0, 4, 8, 12, 16, 20].includes(i));
