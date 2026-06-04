import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { CheckCircle, Home, Package } from 'lucide-react';

interface OrderSuccessProps {
  onBackHome: () => void;
}

export default function OrderSuccess({ onBackHome }: OrderSuccessProps) {
  const { t, isRTL } = useLang();
  const orderNumber = `MNY-${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-sm w-full text-center shadow-xl shadow-pink-100/30 border border-pink-50"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-18 h-18 sm:w-20 sm:h-20 mx-auto mb-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200/50"
        >
          <CheckCircle size={36} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{t('order.success')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed">{t('order.successDesc')}</p>

          {/* Order Number */}
          <div className="bg-pink-50 rounded-xl sm:rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <Package size={14} className="text-pink-500" />
              <span className="text-xs text-gray-500">{t('order.number')}</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-pink-600 tracking-wider" dir="ltr">{orderNumber}</span>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[
              { icon: '📱', text: isRTL ? 'تأكيد' : 'Confirmed' },
              { icon: '📦', text: isRTL ? 'التجهيز' : 'Preparing' },
              { icon: '🚚', text: isRTL ? 'التوصيل' : 'Delivery' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${i === 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {step.icon}
                </div>
                {i < 2 && <div className="w-4 sm:w-6 h-0.5 bg-gray-200" />}
              </div>
            ))}
          </div>

          <button
            onClick={onBackHome}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-200/50 hover:shadow-pink-300/60 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Home size={16} />
            {t('order.backHome')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
