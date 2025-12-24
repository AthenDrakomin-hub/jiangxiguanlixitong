import React from 'react';
import { Order, OrderStatus, OrderSource } from '../types.js';
import { t } from '../utils/i18n.js';
import {
  X,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  Printer,
  Smartphone,
  QrCode,
  CircleDollarSign,
  ClipboardList,
  BedDouble,
  Mic2,
  Rocket,
  Utensils,
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
          <span className="inline-flex flex-col items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            <span>{t('pending_status')}</span>
            <span className="text-[10px] opacity-75">Pending</span>
          </span>
        );
      case OrderStatus.COOKING:
        return (
          <span className="inline-flex flex-col items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <span>{t('cooking_status')}</span>
            <span className="text-[10px] opacity-75">Cooking</span>
          </span>
        );
      case OrderStatus.SERVED:
        return (
          <span className="inline-flex flex-col items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <span>{t('served_status')}</span>
            <span className="text-[10px] opacity-75">Served</span>
          </span>
        );
      case OrderStatus.PAID:
        return (
          <span className="inline-flex flex-col items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            <span>{t('paid_status')}</span>
            <span className="text-[10px] opacity-75">Paid</span>
          </span>
        );
      case OrderStatus.COMPLETED:
        return (
          <span className="inline-flex flex-col items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
            <span>已完成</span>
            <span className="text-[10px] opacity-75">Completed</span>
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span className="inline-flex flex-col items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <span>已取消</span>
            <span className="text-[10px] opacity-75">Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
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
        return <QrCode className="h-4 w-4" />;
      case 'ALIPAY':
        return <Smartphone className="h-4 w-4" />;
      case 'USDT':
        return <CircleDollarSign className="h-4 w-4" />;
      case 'GCASH':
      case 'MAYA':
        return <Wallet className="h-4 w-4" />;
      case 'CREDIT_CARD':
      case 'UNIONPAY':
        return <CreditCard className="h-4 w-4" />;
      case 'SIGN_BILL':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  // Get order source badge
  const getSourceBadge = (source: OrderSource) => {
    switch (source) {
      case 'ROOM_SERVICE':
        return (
          <span className="flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
            <BedDouble size={12} /> 客房 Room
          </span>
        );
      case 'KTV':
        return (
          <span className="flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            <Mic2 size={12} /> KTV
          </span>
        );
      case 'TAKEOUT':
        return (
          <span className="flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            <Rocket size={12} /> 外卖 Takeout
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            <Utensils size={12} /> 堂食 Dine-in
          </span>
        );
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
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('order_detail_title')}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Order Info */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Order Summary */}
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-slate-900">#{order.id}</h4>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4" />
                  <span>Table {order.tableNumber}</span>
                </div>
                <div className="mt-1">
                  {getSourceBadge(order.source)}
                </div>
              </div>
              {renderStatusBadge(order.status)}
            </div>

            <div className="mt-2 flex items-center text-sm text-slate-500">
              <Clock className="mr-1 h-4 w-4" />
              <span>{formatDate(order.createdAt)}</span>
            </div>

            {order.paymentMethod && (
              <div className="mt-2 flex items-center text-sm text-slate-700">
                {getPaymentMethodIcon(order.paymentMethod)}
                <span className="ml-1 font-medium">{order.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h4 className="mb-2 font-medium text-slate-900">
              {t('order_items')}
            </h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-slate-100 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.dishName}</p>
                    <p className="text-sm text-slate-500">x{item.quantity}</p>
                  </div>
                  <p className="font-medium text-slate-900">
                    ₱{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h4 className="mb-2 font-medium text-slate-900">
                {t('special_requests')}
              </h4>
              <p className="rounded-lg bg-yellow-50 p-3 text-slate-700 border border-yellow-100">
                {order.notes}
              </p>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between">
              <p className="text-slate-600">{t('total_amount')}</p>
              <p className="font-bold text-slate-900">₱{order.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-slate-200 p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-800 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {t('close')}
          </button>
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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