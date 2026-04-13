import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, Plus, Minus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import toteBag from "@/assets/shop/tote-bag.png";
import postcardSet from "@/assets/shop/postcard-set.png";
import tshirt from "@/assets/shop/tshirt.png";
import fridgeMagnets from "@/assets/shop/fridge-magnets.png";
import notebook from "@/assets/shop/notebook.png";
import keychain from "@/assets/shop/keychain.png";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const products: Product[] = [
  { id: "tote", name: "Heritage Tote Bag", description: "Hand-printed cotton tote with pol house illustrations", price: 350, image: toteBag },
  { id: "postcard-set", name: "Pol Postcard Set", description: "Set of 8 heritage building postcards with descriptions", price: 200, image: postcardSet },
  { id: "tshirt", name: "Pol Walk T-Shirt", description: "Cotton t-shirt with Ghadiyali Pol motif print", price: 500, image: tshirt },
  { id: "fridge-magnet", name: "Heritage Fridge Magnets", description: "Set of 4 wooden magnets — Jama Masjid, Tambekar Wada & more", price: 250, image: fridgeMagnets },
  { id: "notebook", name: "Heritage Sketch Notebook", description: "A5 notebook with heritage illustrations on each page", price: 180, image: notebook },
  { id: "keychain", name: "Brass Pol Keychain", description: "Handcrafted brass keychain in jharokha (balcony) shape", price: 150, image: keychain },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const ShopPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);

  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);
  const totalPrice = Object.entries(cart).reduce((s, [id, qty]) => {
    const p = products.find((p) => p.id === id);
    return s + (p ? p.price * qty : 0);
  }, 0);

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  };

  const clearCart = () => setCart({});

  const handleEnquireAll = () => {
    const lines = Object.entries(cart).map(([id, qty]) => {
      const p = products.find((p) => p.id === id)!;
      return `• ${p.name} × ${qty} — ₹${p.price * qty}`;
    });
    const text = `Hi! I'd like to order the following:\n\n${lines.join("\n")}\n\nTotal: ₹${totalPrice}\n\nPlease confirm availability!`;
    window.open(
      "https://wa.me/919974095435?text=" + encodeURIComponent(text),
      "_blank"
    );
  };

  const handleEnquireSingle = (product: Product) => {
    const text = `Hi! I'm interested in buying the "${product.name}" (₹${product.price}). Is it available?`;
    window.open(
      "https://wa.me/919974095435?text=" + encodeURIComponent(text),
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Shop & Souvenirs
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Take a piece of heritage home — handcrafted merchandise
        </p>
      </div>

      <motion.div
        className="px-5 pb-8 grid grid-cols-2 gap-3 mt-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {products.map((product) => {
          const qty = cart[product.id] || 0;
          return (
            <motion.div
              key={product.id}
              variants={item}
              className="rounded-xl border border-border bg-card overflow-hidden flex flex-col"
            >
              <div className="aspect-square bg-muted/30 flex items-center justify-center p-3 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-full object-contain"
                />
                {qty > 0 && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {qty}
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-display font-bold text-sm text-foreground leading-snug">
                  {product.name}
                </h3>
                <p className="text-[11px] text-muted-foreground font-body mt-1 flex-1">
                  {product.description}
                </p>
                <p className="text-base font-bold text-primary mt-2">
                  ₹{product.price}
                </p>
                <div className="flex gap-1.5 mt-2">
                  {qty === 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs flex-1"
                      onClick={() => addToCart(product.id)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1 flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="flex-1 text-center text-sm font-bold text-foreground">{qty}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => addToCart(product.id)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground"
                    onClick={() => handleEnquireSingle(product)}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Floating cart bar */}
      <AnimatePresence>
        {totalItems > 0 && !showCart && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-5 left-5 right-5 z-50"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full flex items-center justify-between bg-primary text-primary-foreground rounded-xl px-5 py-3.5 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <span className="font-bold text-base">₹{totalPrice.toLocaleString("en-IN")}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl border-t border-border max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-display font-bold text-lg text-foreground">Your Cart</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCart}
                    className="text-xs text-destructive font-medium"
                  >
                    Clear all
                  </button>
                  <button onClick={() => setShowCart(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {Object.entries(cart).map(([id, qty]) => {
                  const p = products.find((p) => p.id === id)!;
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-14 h-14 rounded-lg object-contain bg-muted/30 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">₹{p.price} each</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => removeFromCart(id)}
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-foreground">{qty}</span>
                        <button
                          onClick={() => addToCart(id)}
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-foreground w-14 text-right">
                        ₹{(p.price * qty).toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="px-5 py-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total ({totalItems} items)</span>
                  <span className="text-lg font-bold text-foreground">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleEnquireAll}
                >
                  <MessageCircle className="w-4 h-4" />
                  Enquire on WhatsApp
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
