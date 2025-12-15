import React from 'react';
import { Order, OrderStatus } from '../types';
import { t } from '../utils/i18n';
import {
  X,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  Printer,
} from 'lucide-react';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onPrint?: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onClose,
  onPrint,
}) => {
  // Render status badge
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            {t('pending_status')}
          </span>
        );
      case OrderStatus.COOKING:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {t('cooking_status')}
          </span>
        );
      case OrderStatus.SERVED:
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            {t('served_status')}
          </span>
        );
      case OrderStatus.PAID:
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            {t('paid_status')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="h-4 w-4" />;
      case 'WECHAT':
      case 'ALIPAY':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('order_detail_title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Order Info */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Order Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">#{order.id}</h4>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>Table {order.tableNumber}</span>
                </div>
              </div>
              {renderStatusBadge(order.status)}
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              <span>{formatDate(order.createdAt)}</span>
            </div>

            {order.paymentMethod && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                {getPaymentMethodIcon(order.paymentMethod)}
                <span className="ml-1">{order.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h4 className="mb-2 font-medium text-gray-900">
              {t('order_items')}
            </h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-gray-100 py-2"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.dishName}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    ₱{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h4 className="mb-2 font-medium text-gray-900">
                {t('special_requests')}
              </h4>
              <p className="rounded-lg bg-gray-50 p-3 text-gray-700">
                {order.notes}
              </p>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <p className="text-gray-600">{t('total_amount')}</p>
              <p className="font-bold text-gray-900">₱{order.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {t('close')}
          </button>
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Printer size={16} />
              {t('print_receipt')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
