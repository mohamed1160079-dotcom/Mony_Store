import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { useCart, Product, ProductColor } from '../context/CartContext';
import { products } from '../data/products';
import ProductCard from './ProductCard';
import { 
  ArrowLeft, ArrowRight, Heart, ShoppingBag, Zap, Star, 
  Minus, Plus, Truck, RotateCcw, ChevronLeft, ChevronRight,
  ZoomIn, X, Check, BadgeCheck, CreditCard, Flame, Users,
  Award, Package, TrendingUp, Clock, ShieldCheck, Sparkles
} from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onQuickView: (product: Product) => void;
  onBuyNow: () => void;
}

export default function ProductDetails({ product, onBack, onQuickView, onBuyNow }: ProductDetailsProps) {
  const { lang, t, isRTL } = useLang();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const thumbRef = useRef<HTMLDivElement>(null);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(product.colors?.[0] || null);
  const [isAdded, setIsAdded] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  const name = lang === 'ar' ? product.nameAr : product.nameEn;
  const desc = lang === 'ar' ? product.descAr : product.descEn;
  const category = lang === 'ar' ? product.categoryAr : product.category;
  const wishlisted = isInWishlist(product.id);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  const images = product.images || [product.image];
  const media: { type: 'image' | 'video'; src: string }[] = [
    ...images.map(src => ({ type: 'image' as const, src })),
    ...(product.videos || []).map(src => ({ type: 'video' as const, src })),
  ];

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const currentMedia = media[selectedImage] || media[0];

  useEffect(() => {
    if (thumbRef.current) {
      const btn = thumbRef.current.children[selectedImage] as HTMLElement;
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedImage]);

  const handleColorSelect = (color: ProductColor) => {
    setSelectedColor(color);
    if (color.image) {
      const idx = media.findIndex(m => m.type === 'image' && m.src === color.image);
      if (idx >= 0) {
        setSelectedImage(idx);
      } else {
        const imageOnlyIndex = images.findIndex(img => img === color.image);
        if (imageOnlyIndex >= 0) setSelectedImage(imageOnlyIndex);
      }
    }
  };

  const handlePrev = () => setSelectedImage(p => (p > 0 ? p - 1 : media.length - 1));
  const handleNext = () => setSelectedImage(p => (p < media.length - 1 ? p + 1 : 0));

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor?.nameEn);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor?.nameEn);
    onBuyNow();
  };

  const reviews = product.customReviews || [
    { id: 1, name: 'Sara M.', nameAr: 'سارة م.', rating: 5, text: 'منتج رائع جداً!', textEn: 'Amazing product!', date: '2025-01-15', verified: true },
  ];
  const totalReviews = product.reviews;
  const remainingReviews = totalReviews - reviews.length;
  const soldCount = product.sold || 150;

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: 'linear-gradient(to bottom, white, #fdf2f8)' }}>
      {/* Breadcrumb */}
      <div className="bg-white/80 border-b border-pink-50">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <button onClick={onBack} className="flex items-center gap-1.5 text-gray-600 hover:text-pink-500 transition-colors cursor-pointer flex-shrink-0">
              {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              <span className="text-sm font-medium hidden sm:inline">{t('general.backToShop')}</span>
            </button>
            <div className="flex items-center gap-1.5 overflow-hidden mx-2">
              <span className="text-[10px] text-gray-400 flex-shrink-0">{category}</span>
              <span className="text-gray-300 flex-shrink-0">/</span>
              <span className="text-[10px] text-pink-500 font-medium truncate">{name}</span>
            </div>
            <button onClick={() => toggleWishlist(product.id)} className={`p-2 rounded-full cursor-pointer flex-shrink-0 ${wishlisted ? 'text-pink-500' : 'text-gray-400'}`}>
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-5 sm:py-6">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* ═══ LEFT: Gallery ═══ */}
          <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
            {/* Main Media */}
            <div className="relative rounded-2xl overflow-hidden bg-pink-50/50 mb-3 shadow-md">
              {currentMedia.type === 'video' ? (
                <video key={currentMedia.src} src={currentMedia.src} className="w-full aspect-[4/5] object-cover bg-black" controls autoPlay muted loop playsInline />
              ) : (
                <motion.img
                  key={currentMedia.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  src={currentMedia.src}
                  alt={name}
                  className="w-full aspect-[4/5] object-cover cursor-zoom-in bg-pink-50"
                  onClick={() => setShowZoom(true)}
                />
              )}

              {/* Badges */}
              <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex flex-col gap-1.5 z-10`}>
                {product.badge && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-bold rounded-full shadow-md uppercase tracking-wide">{lang === 'ar' ? product.badgeAr : product.badge}</span>
                )}
                {discount > 0 && (
                  <span className="px-2.5 py-1 bg-red-500 text-white text-[9px] font-bold rounded-full shadow-md">-{discount}%</span>
                )}
              </div>

              {currentMedia.type === 'image' && (
                <button onClick={() => setShowZoom(true)} className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} w-9 h-9 bg-white/90 rounded-lg flex items-center justify-center shadow-md cursor-pointer z-10`}>
                  <ZoomIn size={16} className="text-gray-600" />
                </button>
              )}

              {media.length > 1 && (
                <>
                  <button onClick={handlePrev} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-2' : 'left-2'} w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md cursor-pointer z-10`}>
                    {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  </button>
                  <button onClick={handleNext} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-2' : 'right-2'} w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md cursor-pointer z-10`}>
                    {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </button>
                </>
              )}

              {/* Dots indicator for mobile */}
              {media.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 sm:hidden">
                  {media.map((_, i) => (
                    <div key={i} className={`rounded-full transition-all ${selectedImage === i ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {media.length > 1 && (
              <div
                ref={thumbRef}
                dir="ltr"
                className="flex gap-2 pb-2"
                style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {media.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-14 h-[70px] sm:w-[72px] sm:h-[90px] rounded-lg overflow-hidden border-2 cursor-pointer relative transition-all ${
                      selectedImage === i ? 'border-pink-500 shadow-md shadow-pink-200/40' : 'border-gray-100 opacity-50 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={item.src} className="w-full h-full object-cover" muted preload="metadata" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-pink-500 ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img src={item.src} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* High Demand */}
            <div className="mt-5 p-4 glass-premium rounded-xl border border-pink-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <Flame size={18} className="text-white animate-fire" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm">{isRTL ? '🔥 منتج مطلوب بشدة' : '🔥 Product in High Demand'}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500">{isRTL ? 'باقي 5 قطع فقط • يتم بيعه بسرعة!' : 'Only 5 pieces left • Selling fast!'}</p>
                </div>
              </div>
              <div className="relative h-2.5 bg-pink-100 rounded-full overflow-hidden mb-1.5">
                <motion.div initial={{ width: 0 }} animate={{ width: '73%' }} transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 via-rose-500 to-red-500 rounded-full" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600"><span className="text-pink-600 font-bold">73%</span> {isRTL ? 'تم بيعه في آخر 24 ساعة' : 'sold in the last 24 hours'}</p>
            </div>
          </div>

          {/* ═══ RIGHT: Info ═══ */}
          <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <span className="text-pink-500 text-xs font-semibold uppercase tracking-wider block mb-2">{category}</span>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight mb-3" style={{ wordBreak: 'break-word' }}>{name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={15} className="text-amber-400 fill-amber-400" />)}</div>
              <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviews} {isRTL ? 'تقييم' : 'reviews'})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-pink-600">{product.price} <span className="text-sm">{t('products.egp')}</span></span>
              {product.oldPrice && <span className="text-base text-gray-400 line-through">{product.oldPrice} {t('products.egp')}</span>}
              {discount > 0 && <span className="px-3 py-1 bg-green-0 text-green-600 text-xs font-bold rounded-full border border-green-100">{isRTL ? `وفري ${product.oldPrice! - product.price} ج.م` : `Save ${product.oldPrice! - product.price} EGP`}</span>}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: <Award size={18} />, label: isRTL ? 'مستورد' : 'Imported', value: '100%', color: 'from-purple-400 to-pink-500' },
                { icon: <Sparkles size={18} />, label: isRTL ? 'جودة فاخرة' : 'Luxury Quality', value: '⭐', color: 'from-pink-400 to-rose-500' },
                { icon: <Truck size={18} />, label: isRTL ? 'شحن سريع' : 'Fast Shipping', value: isRTL ? '1-3 أيام' : '1-3 Days', color: 'from-rose-400 to-orange-400' },
              ].map((item, i) => (
                <div key={i} className="glass-premium rounded-xl p-3 text-center">
                  <div className={`w-8 h-8 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-sm`}>{item.icon}</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-tight">{item.label}</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Material */}
            {product.material && (
              <div className="mb-4 p-3 bg-pink-50/60 rounded-xl border border-pink-100 flex items-center gap-3">
                <Package size={16} className="text-pink-500 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-500 block">{isRTL ? 'الخامة' : 'Material'}</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-800">{lang === 'ar' ? product.material.ar : product.material.en}</span>
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizeInfo && (
              <div className="mb-5">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">{t('general.size')}</label>
                <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100">
                  <p className="text-xs sm:text-sm text-gray-700">{lang === 'ar' ? product.sizeInfo.ar : product.sizeInfo.en}</p>
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                  {t('general.color')}: <span className="text-pink-500 font-medium">{selectedColor ? (lang === 'ar' ? selectedColor.nameAr : selectedColor.nameEn) : ''}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, idx) => (
                    <button key={idx} onClick={() => handleColorSelect(color)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all ${selectedColor?.hex === color.hex ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-700 border border-pink-100 hover:border-pink-300'}`}>
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedColor?.hex === color.hex ? 'border-white' : 'border-gray-200'}`} style={{ backgroundColor: color.hex }} />
                      <span className="truncate">{lang === 'ar' ? color.nameAr : color.nameEn}</span>
                      {selectedColor?.hex === color.hex && <Check size={14} className="flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">{t('general.quantity')}</label>
              <div className="inline-flex items-center bg-pink-50 rounded-lg border border-pink-100">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-pink-100 rounded-l-lg cursor-pointer"><Minus size={16} /></button>
                <span className="w-10 text-center font-bold text-gray-800">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-pink-100 rounded-r-lg cursor-pointer"><Plus size={16} /></button>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex gap-3 mb-5">
              <button onClick={handleAddToCart} disabled={isAdded} className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${isAdded ? 'bg-green-500 text-white' : 'bg-pink-50 text-pink-600 border-2 border-pink-200 hover:bg-pink-100'}`}>
                {isAdded ? <><Check size={18} /> {t('cart.added')}</> : <><ShoppingBag size={18} /> {t('products.addToCart')}</>}
              </button>
              <button onClick={handleBuyNow} className="flex-1 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-200/50 cursor-pointer">
                <Zap size={18} /> {isRTL ? 'اشتري الآن' : 'Buy Now'}
              </button>
            </div>

            {/* Trust */}
            <div className="glass-premium rounded-xl p-4 mb-5">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { icon: <Users size={16} />, label: isRTL ? 'عميلة سعيدة' : 'Happy', value: '150+', color: 'text-pink-500' },
                  { icon: <Clock size={16} />, label: isRTL ? 'تم شراؤه' : 'Purchased', value: '✓', color: 'text-purple-500' },
                  { icon: <Star size={16} />, label: isRTL ? 'تقييم' : 'Rating', value: '4.8⭐', color: 'text-amber-500' },
                  { icon: <TrendingUp size={16} />, label: isRTL ? 'تم بيعه' : 'Sold', value: `${soldCount}+`, color: 'text-green-500' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className={`w-8 h-8 mx-auto mb-1 bg-white rounded-lg flex items-center justify-center ${item.color} shadow-sm`}>{item.icon}</div>
                    <div className="text-[8px] sm:text-[9px] text-gray-500 leading-tight">{item.label}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-800">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-pink-50/50 rounded-xl mb-5 border border-pink-100 text-center">
              {[
                { icon: <Truck size={16} />, t1: isRTL ? 'توصيل' : 'Delivery', t2: isRTL ? '3-5 أيام' : '3-5 Days' },
                { icon: <CreditCard size={16} />, t1: isRTL ? 'الدفع' : 'Payment', t2: isRTL ? 'عند الاستلام' : 'COD' },
                { icon: <RotateCcw size={16} />, t1: isRTL ? 'إرجاع' : 'Returns', t2: isRTL ? '30 يوم' : '30 Days' },
              ].map((f, i) => (
                <div key={i}>
                  <div className="w-8 h-8 mx-auto mb-1 bg-white rounded-lg flex items-center justify-center text-pink-500 shadow-sm">{f.icon}</div>
                  <div className="text-[9px] font-bold text-gray-700">{f.t1}</div>
                  <div className="text-[8px] text-gray-400">{f.t2}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-pink-100 mb-4 flex gap-6">
              {(['desc', 'reviews'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2.5 text-sm font-bold relative cursor-pointer ${activeTab === tab ? 'text-pink-600' : 'text-gray-400'}`}>
                  {tab === 'desc' ? t('general.description') : `${t('general.reviews')} (${totalReviews})`}
                  {activeTab === tab && <motion.div layoutId="pdtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'desc' ? (
                <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-gray-600 leading-relaxed">
                  <p className="mb-4">{desc}</p>
                  <ul className="space-y-2">
                    {[
                      { icon: <ShieldCheck size={14} />, t: isRTL ? 'جودة عالية مضمونة' : 'High quality guaranteed' },
                      { icon: <Truck size={14} />, t: isRTL ? 'شحن لجميع المحافظات' : 'Shipping to all governorates' },
                      { icon: <CreditCard size={14} />, t: isRTL ? 'الدفع عند الاستلام' : 'Cash on delivery' },
                      { icon: <RotateCcw size={14} />, t: isRTL ? 'إرجاع خلال 30 يوم' : '30 days return policy' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="w-6 h-6 bg-pink-50 rounded flex items-center justify-center text-pink-500 flex-shrink-0">{item.icon}</span>
                        <span>{item.t}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {reviews.map(review => (
                    <div key={review.id} className="glass-premium rounded-xl p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">{review.name.charAt(0)}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-gray-800 truncate">{lang === 'ar' ? review.nameAr : review.name}</span>
                              {review.verified && <BadgeCheck size={12} className="text-blue-500 flex-shrink-0" />}
                            </div>
                            <span className="text-[9px] text-gray-400 block">{review.date}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 flex-shrink-0">{[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}</div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed" style={{ wordBreak: 'break-word' }}>{lang === 'ar' ? review.text : review.textEn}</p>
                    </div>
                  ))}
                  {remainingReviews > 0 && (
                    <div className="text-center py-2">
                      <span className="px-3 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-medium inline-block">+{remainingReviews} {isRTL ? 'تعليق آخر' : 'more reviews'}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-pink-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 text-center">{t('general.related')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} onProductClick={onQuickView} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white border-t border-pink-100 p-3 pb-safe shadow-2xl">
          <div className="flex gap-2.5">
            <button onClick={handleAddToCart} disabled={isAdded} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all ${isAdded ? 'bg-green-500 text-white' : 'bg-pink-50 text-pink-600 border border-pink-200'}`}>
              {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
              <span className="truncate">{isAdded ? t('cart.added') : t('products.addToCart')}</span>
            </button>
            <button onClick={handleBuyNow} className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer">
              <Zap size={16} /> <span className="truncate">{isRTL ? 'اشتري الآن' : 'Buy Now'}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="h-24 lg:hidden" />

      {/* Zoom */}
      <AnimatePresence>
        {showZoom && currentMedia.type === 'image' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={() => setShowZoom(false)}>
            <button onClick={() => setShowZoom(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white cursor-pointer z-10"><X size={20} /></button>
            <img src={currentMedia.src} alt={name} className="max-w-full max-h-full object-contain p-4" />
            {media.filter(m => m.type === 'image').length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {media.map((m, i) => m.type === 'image' && (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }} className={`w-2.5 h-2.5 rounded-full cursor-pointer ${selectedImage === i ? 'bg-white w-6' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
