'use client';

import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { useTranslation } from '@/context/TranslationContext';

interface AddToCartButtonProps {
  product: Product;
}

const AddToCartButton = ({ product }: AddToCartButtonProps) => {
  const { items, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const { t } = useTranslation();
  
  const cartItem = items.find((item: import('@/types/product').CartItem) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  if (quantity > 0) {
    return (
      <div className="flex items-center justify-between bg-orange-50 dark:bg-green-900/20 border-2 border-simba-orange dark:border-green-500 rounded-xl overflow-hidden transition-colors">
        <button 
          onClick={() => decreaseQuantity(product.id)}
          className="p-4 text-simba-orange dark:text-green-400 hover:bg-orange-100 dark:hover:bg-green-900/40 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus size={20} />
        </button>
        <span className="text-xl font-bold text-simba-orange dark:text-green-300">{quantity}</span>
        <button 
          onClick={() => increaseQuantity(product.id)}
          className="p-4 text-simba-orange dark:text-green-400 hover:bg-orange-100 dark:hover:bg-green-900/40 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus size={20} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => addToCart(product)}
      className="w-full bg-simba-orange hover:bg-orange-600 dark:bg-green-700 dark:hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-orange-100 dark:shadow-none disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:shadow-none"
      disabled={!product.inStock}
    >
      <ShoppingCart size={22} />
      {t('common.addToCart')}
    </button>
  );
};

export default AddToCartButton;
