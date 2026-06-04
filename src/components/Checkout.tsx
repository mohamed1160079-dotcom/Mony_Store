import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { governorates, governoratesWithCities } from '../data/products';
import { sendOrderToTelegram } from '../services/telegram';
import { ArrowRight, ArrowLeft, CheckCircle, Package, MapPin, Phone, User, FileText, Banknote, ChevronDown, AlertCircle } from 'lucide-react';

interface CheckoutProps {
  onBack: () => void;
  onOrderSuccess: () => void;
}


const shippingRates: Record<string, number> = {
  "القاهرة": 55, "الجيزة": 55, "الشرقية": 55, "القليوبية": 55,
  "الإسكندرية": 65, "البحيرة": 65, "كفر الشيخ": 65, "الغربية": 65, "المنوفية": 65, "الدقهلية": 65, "دمياط": 65,
  "بورسعيد": 70, "الإسماعيلية": 70, "السويس": 70,
  "الفيوم": 75, "بني سويف": 75, "المنيا": 75,
  "أسيوط": 100, "سوهاج": 100, "قنا": 100, "الأقصر": 100, "أسوان": 100,
  "مطروح": 110, "شمال سيناء": 110, "جنوب سيناء": 110, "البحر الأحمر": 110, "الوادي الجديد": 110,
};

export default function Checkout({ onBack, onOrderSuccess }: CheckoutProps) {
  const { t, lang, isRTL } = useLang();
  const { items, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    governorate: '',
    city: '',
    address: '',
    notes: '',
  });

  const [cities, setCities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (form.governorate && governoratesWithCities[form.governorate]) {
      setCities(governoratesWithCities[form.governorate]);
      setForm(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [form.governorate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = isRTL ? 'الاسم مطلوب' : 'Name is required';
    if (!form.phone.trim()) e.phone = isRTL ? 'رقم الموبايل مطلوب' : 'Phone is required';
    else if (!/^01[0125]\d{8}$/.test(form.phone)) e.phone = isRTL ? 'رقم موبايل غير صحيح' : 'Invalid phone number';
    if (!form.governorate) e.governorate = isRTL ? 'المحافظة مطلوبة' : 'Governorate is required';
    if (!form.city) e.city = isRTL ? 'المدينة مطلوبة' : 'City is required';
    if (!form.address.trim()) e.address = isRTL ? 'العنوان مطلوب' : 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    const orderNumber = `MS-${Date.now().toString().slice(-4)}`;
    const shipping = shippingRates[form.governorate] || 0;

    const whatsappMessage = encodeURIComponent(`🛍️ طلب جديد من Mony Store\n\n👤 الاسم: ${form.name}\n📞 الهاتف: ${form.phone}\n📍 العنوان: ${form.governorate} - ${form.city} - ${form.address}\n\n🧾 المنتجات:\n${items.map(i => `• ${i.product.nameAr} × ${i.quantity}`).join('\n')}\n\n💰 الإجمالي: ${totalPrice + shipping} جنيه`);

    const success = await sendOrderToTelegram({
      orderNumber,
      name: form.name,
      phone: form.phone,
      governorate: form.governorate,
      city: form.city,
      address: form.address,
      notes: form.notes,
      items,
      subtotal: totalPrice,
      shipping,
      total: totalPrice + shipping,
    });

    if (success) {
      // WhatsApp redirect removed
      clearCart();
      setIsSubmitting(false);
      onOrderSuccess();
    } else {
      setIsSubmitting(false);
      setSubmitError(isRTL ? 'حدث خطأ، برجاء المحاولة مرة أخرى' : 'An error occurred, please try again');
    }
  };

  const shippingCost = shippingRates[form.governorate] || 0;
  const finalTotal = totalPrice + shippingCost;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white pt-4">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium text-xs sm:text-sm mb-6 group cursor-pointer">
          {isRTL ? <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
          {t('general.backToShop')}
        </button>

        <div className="grid lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-pink-50">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-5 flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white"><MapPin size={16} /></div>
                {t('checkout.info')}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2"><User size={12} className="text-pink-400" />{t('checkout.name')}</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`w-full px-3 py-3 rounded-xl border text-sm ${errors.name ? 'border-red-300 bg-red-50/30' : 'border-pink-100 bg-pink-50/20'} focus:bg-white transition-all`} placeholder={isRTL ? 'مثال: سارة أحمد' : 'e.g. Sara Ahmed'} />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
                </div>
                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2"><Phone size={12} className="text-pink-400" />{t('checkout.phone')}</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={`w-full px-3 py-3 rounded-xl border text-sm ${errors.phone ? 'border-red-300 bg-red-50/30' : 'border-pink-100 bg-pink-50/20'} focus:bg-white transition-all`} placeholder="01xxxxxxxxx" dir="ltr" />
                  {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
                </div>
                {/* Governorate */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2"><MapPin size={12} className="text-pink-400" />{t('checkout.governorate')}</label>
                  <div className="relative">
                    <select value={form.governorate} onChange={e => setForm({...form, governorate: e.target.value})} className={`w-full px-3 py-3 rounded-xl border text-sm appearance-none cursor-pointer ${errors.governorate ? 'border-red-300 bg-red-50/30' : 'border-pink-100 bg-pink-50/20'} focus:bg-white transition-all`}>
                      <option value="">{isRTL ? 'اختاري المحافظة' : 'Select Governorate'}</option>
                      {governorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                    <ChevronDown size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 pointer-events-none`} />
                  </div>
                  {errors.governorate && <p className="text-[10px] text-red-500 mt-1">{errors.governorate}</p>}
                </div>
                {/* City */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2"><MapPin size={12} className="text-pink-400" />{t('checkout.city')}</label>
                  <div className="relative">
                    <select value={form.city} onChange={e => setForm({...form, city: e.target.value})} disabled={!form.governorate} className={`w-full px-3 py-3 rounded-xl border text-sm appearance-none cursor-pointer ${errors.city ? 'border-red-300 bg-red-50/30' : 'border-pink-100 bg-pink-50/20'} focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <option value="">{!form.governorate ? (isRTL ? 'اختاري المحافظة أولاً' : 'Select governorate first') : (isRTL ? 'اختاري المدينة' : 'Select City')}</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 pointer-events-none`} />
                  </div>
                  {errors.city && <p className="text-[10px] text-red-500 mt-1">{errors.city}</p>}
                </div>
                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2"><MapPin size={12} className="text-pink-400" />{t('checkout.address')}</label>
                  <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={`w-full px-3 py-3 rounded-xl border text-sm ${errors.address ? 'border-red-300 bg-red-50/30' : 'border-pink-100 bg-pink-50/20'} focus:bg-white transition-all resize-none`} rows={2} placeholder={isRTL ? 'الشارع، رقم المبنى، الشقة...' : 'Street, building, apartment...'} />
                  {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address}</p>}
                </div>
                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2"><FileText size={12} className="text-pink-400" />{t('checkout.notes')}</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-3 rounded-xl border border-pink-100 bg-pink-50/20 focus:bg-white transition-all text-sm resize-none" rows={2} placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional notes...'} />
                </div>
              </div>

              {/* Payment */}
              <div className="mt-6 pt-5 border-t border-pink-50">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Banknote size={16} className="text-pink-500" />{t('checkout.payment')}</h3>
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl sm:rounded-2xl p-4 border-2 border-pink-200 relative">
                  <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}><div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center"><CheckCircle size={14} className="text-white" /></div></div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center"><span className="text-2xl">💵</span></div>
                    <div><h4 className="font-bold text-gray-800 text-sm">{t('checkout.cod')}</h4><p className="text-xs text-gray-500">{t('checkout.codDesc')}</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-pink-50 sticky top-20">
              <h3 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2"><Package size={16} className="text-pink-500" />{t('checkout.orderSummary')}</h3>
              <div className="space-y-2.5 mb-4 max-h-[200px] sm:max-h-[260px] overflow-y-auto scrollbar-hide">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-2.5 p-2 rounded-lg bg-pink-50/30">
                    <img src={item.product.image} alt={lang === 'ar' ? item.product.nameAr : item.product.nameEn} className="w-12 h-14 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 line-clamp-1">{lang === 'ar' ? item.product.nameAr : item.product.nameEn}</p>
                      {item.color && <p className="text-[10px] text-pink-400">{item.color}</p>}
                      <p className="text-[10px] text-gray-400">x{item.quantity}</p>
                      <p className="text-xs font-bold text-pink-600">{item.product.price * item.quantity} {t('products.egp')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 border-t border-pink-50 pt-3">
                <div className="flex justify-between text-xs"><span className="text-gray-500">{t('cart.subtotal')}</span><span className="font-medium">{totalPrice} {t('products.egp')}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">{t('cart.shipping')}</span><span className="font-medium">{shippingCost} {t('products.egp')}</span></div>
                <div className="flex justify-between text-base font-bold border-t border-pink-0 pt-2.5"><span>{t('cart.total')}</span><span className="text-pink-600">{finalTotal} {t('products.egp')}</span></div>
              </div>

              {/* Error */}
              {submitError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-xs">
                  <AlertCircle size={16} /> {submitError}
                </div>
              )}

              <button onClick={handleSubmit} disabled={isSubmitting || items.length === 0} className="w-full mt-5 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-200/50 hover:shadow-pink-300/60 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                {isSubmitting ? (
                  <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isRTL ? 'جاري التأكيد...' : 'Processing...'}</div>
                ) : (
                  <><CheckCircle size={16} />{t('checkout.placeOrder')}</>
                )}
              </button>
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold mb-2">✅ ضمان استبدال خلال 14 يوم • شحن سريع لكل المحافظات</div>
                <div className="text-[11px] text-gray-500 leading-5">بعد تأكيد الطلب سيتم التواصل معك عبر واتساب لتأكيد الشحنة وموعد التوصيل.</div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400">
                <span>🔒 {isRTL ? 'آمن 100%' : '100% Secure'}</span><span>🇪🇬 {isRTL ? 'مصر' : 'Egypt'}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
