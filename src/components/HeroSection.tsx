import { motion } from "framer-motion";

const HeroSection = () => (
  <section className="py-4 text-center space-y-1">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="font-display text-2xl font-semibold text-foreground leading-tight"
    >
      A curadoria da terra,
      <br />
      direto para sua mesa.
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="text-muted-foreground text-sm max-w-md mx-auto"
    >
      Produtos naturais selecionados com cuidado para nutrir seu corpo e respeitar a natureza.
    </motion.p>
  </section>
);

export default HeroSection;
