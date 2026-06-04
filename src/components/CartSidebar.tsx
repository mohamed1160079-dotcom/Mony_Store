import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { t, isRTL, lang } = useLang();
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: isRTL ? -380 : 380 }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? -380 : 380 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-full max-w-[340px] sm:max-w-[380px] h-full bg-white shadow-2xl flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-pink-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center text-white">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-sm">{t('cart.title')}</h2>
                  <span className="text-[10px] text-gray-400">{totalItems} {isRTL ? 'منتج' : 'items'}</span>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-pink-50 rounded-xl transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-pink-300" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm mb-1.5">{t('cart.empty')}</h3>
                  <p className="text-xs text-gray-400 mb-5">{t('cart.emptyDesc')}</p>
                  <button 
                    onClick={onClose}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium text-xs shadow-md hover:shadow-pink-200/50 transition-all"
                  >
                    {t('cart.continue')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="flex gap-2.5 p-2.5 bg-pink-50/30 rounded-xl border border-pink-50"
                    >
                      <img
                        src={item.product.image}
                        alt={lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                        className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-gray-800 line-clamp-1 mb-0.5">
                          {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        <p className="text-[10px] text-pink-400 mb-2">
                          {lang === 'ar' ? item.product.categoryAr : item.product.category}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-white rounded-lg border border-pink-100 overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-pink-50 transition-colors"
                            >
                              <Minus size={12} className="text-gray-500" />
                            </button>
                            <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-pink-50 transition-colors"
                            >
                              <Plus size={12} className="text-gray-500" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-pink-600">
                            {item.product.price * item.quantity} {t('products.egp')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-red-50 rounded-lg transition-colors self-start flex-shrink-0"
                      >
                        <Trash2 size={13} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-pink-50 p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{t('cart.subtotal')}</span>
                  <span className="font-semibold">{totalPrice} {t('products.egp')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{t('cart.shipping')}</span>
                  <span className="font-semibold text-gray-600">0 {t('products.egp')}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-pink-50 pt-3">
                  <span>{t('cart.total')}</span>
                  <span className="text-pink-600">{totalPrice} {t('products.egp')}</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-200/50 hover:shadow-pink-300/60 transition-all hover:-translate-y-0.5"
                >
                  {t('cart.checkout')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
