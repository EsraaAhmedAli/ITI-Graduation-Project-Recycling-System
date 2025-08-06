import { useLanguage } from '@/context/LanguageContext';
import { Modal, ModalBody, ModalHeader } from 'flowbite-react';
import Image from 'next/image';
import { priceWithMarkup } from '@/utils/priceUtils';

export default function ItemsModal({ show, onclose, selectedOrderItems, userRole , orderStatus }) {
  const { t, locale } = useLanguage();

  const count = selectedOrderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const formatted = count.toLocaleString();
  const currencyLabel = t('itemsModal.currency');

  const total = selectedOrderItems?.reduce(
    (sum, item) => sum + priceWithMarkup(item.price || 0, userRole) * (item.quantity || 0),
    0
  ) || 0;

  const totalPoints = selectedOrderItems?.reduce(
    (sum, item) => sum + (item.points || 0) * (item.quantity || 0),
    0
  ) || 0;

  const formattedTotal =
    total % 1 === 0
      ? total.toLocaleString()
      : total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Modal show={show} onClose={onclose} size="xl" dismissible>
      <ModalHeader className="border-b-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{t("itemsModal.headerTitle")}</h3>
            <p className="text-sm text-gray-500">{t('itemsModal.headerSubtitle')}</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="pt-4">
        {selectedOrderItems && selectedOrderItems.length > 0 ? (
          <div className="space-y-4">
            {selectedOrderItems.map((item, index) => {
              console.log(item)
              
              const price = priceWithMarkup(item.price || 0, userRole);
              const isOutOfStock = item.quantity === 0;
              const hasQuantityChange = item.originalQuantity !== item.quantity;

              return (
                <div key={index} className={`rounded-xl p-5 border transition-all ${
                  isOutOfStock 
                    ? 'bg-red-50 border-red-100 opacity-100' 
                    : 'bg-yellow-50 border-blue-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className={isOutOfStock ? "flex-1  opacity-80" : 'flex-1'}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {item.itemName || 'Unnamed Item'}
                          </h4>
                          <Image width={50} height={50} src={item.image} alt={item.itemName} />
                    
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Quantity */}
                     
                 {
                  orderStatus == 'collected' ?       <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 010 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                            </svg>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('itemsModal.OriginalQuantity')}</p>
                          </div>
                          <p className="text-gray-800 font-semibold text-lg mb-3">{item.originalQuantity || 0}</p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <svg className={`w-4 h-4 ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('itemsModal.quantityByDelivery')}</p>
                          </div>
                          <p className={`font-semibold text-lg ${
                            isOutOfStock 
                              ? 'text-red-600' 
                              : hasQuantityChange 
                                ? 'text-orange-600' 
                                : 'text-gray-800'
                          }`}>
                            {item.quantity || 0}
                          </p>
                          
                      
                        </div> :      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 010 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                            </svg>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('itemsModal.quantity')}</p>
                          </div>
                          <p className="text-gray-800 font-semibold text-lg">{item.quantity || 0}</p>
                        </div>
                 }

                        {/* Unit Price */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {t('itemsModal.unitPrice')}
                            </p>
                          </div>
                          <p className="text-gray-800 font-semibold text-lg">
                            {locale === 'ar' ? `${price} ${currencyLabel}` : `${currencyLabel}${price}`}
                          </p>
                        </div>

                        {/* Points */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {t('itemsModal.points')}
                            </p>
                          </div>
                          <p className="text-green-600 font-bold text-lg">{item.points || 0}</p>
                        </div>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {t('itemsModal.description')}
                            </p>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{item.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Order Total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{t('itemsModal.orderTotal')}</h4>
                    <p className="text-sm text-gray-600">
                      {t("itemsModal.itemsCount", { count: formatted })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {t('itemsModal.totalPrice', { total: formattedTotal })}
                  </p>
                  <p className="text-sm font-semibold text-green-700">
                    {t('itemsModal.totalPoints', { points: totalPoints.toLocaleString() })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items Found</h3>
            <p className="text-gray-600">This order does not contain any items.</p>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}