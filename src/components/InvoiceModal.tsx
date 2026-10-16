import React from 'react';
import type { Order } from '../types/index.js';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#0B0F14]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#151B23] border border-[#293241] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Top Actions */}
        <div className="p-4 bg-[#111720] border-b border-[#293241] text-[#F8FAFC] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#F8FAFC]">Official Tax Invoice & Receipt</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/40">
              Verified LKR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C66A] text-[#0B0F14] text-xs font-black transition cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet (Clean high-contrast theme inside white paper format) */}
        <div className="p-8 overflow-y-auto space-y-6 text-stone-800 text-xs font-sans bg-white print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-[#0B0F14] tracking-tight">FOODORA SRI LANKA</h1>
              <p className="text-stone-500 text-[11px] mt-0.5">FOODORA (PVT) LTD • Reg No: PV 00294821</p>
              <p className="text-stone-500 text-[11px]">50 Nawam Mawatha, Colombo 02, Western Province</p>
              <p className="text-stone-500 text-[11px]">VAT TIN: 10928374-7000</p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest block">INVOICE</span>
              <p className="font-mono font-bold text-sm text-stone-900">{order.orderNumber}</p>
              <p className="text-[11px] text-stone-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-[11px] text-stone-500">Time: {new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Customer & Merchant Info Grid */}
          <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
            <div>
              <span className="font-bold text-[10px] text-stone-400 uppercase tracking-wider block mb-1">
                Billed To (Customer)
              </span>
              <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
              <p className="text-stone-600">{order.customerEmail}</p>
              <p className="text-stone-600">{order.customerPhone}</p>
              <p className="text-stone-500 mt-1">
                {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}, {order.deliveryAddress.district}
              </p>
            </div>

            <div>
              <span className="font-bold text-[10px] text-stone-400 uppercase tracking-wider block mb-1">
                Fulfilled By Partner
              </span>
              <p className="font-bold text-stone-900 text-sm">{order.restaurantName}</p>
              <p className="text-stone-600">{order.restaurantAddress}</p>
              <p className="text-stone-500 mt-1">Payment Method: {order.paymentMethod === 'cod' ? 'Cash On Delivery (LKR)' : 'Card Payment'}</p>
              <p className="text-stone-500">Payment Status: <strong className="text-emerald-700 font-bold uppercase">{order.paymentStatus}</strong></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-900 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3">
                      <span className="font-bold text-stone-900 block">{item.name}</span>
                      {item.instructions && (
                        <span className="text-[10px] text-stone-400 italic">Note: {item.instructions}</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold text-stone-700">{item.quantity}</td>
                    <td className="p-3 text-right text-stone-600">Rs. {item.priceLkr.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-stone-900">
                      Rs. {(item.priceLkr * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-bold text-stone-900">Rs. {order.subtotalLkr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Island Delivery Fee:</span>
                <span className="font-bold text-stone-900">Rs. {order.deliveryFeeLkr.toLocaleString()}</span>
              </div>
              {order.discountLkr > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo Discount ({order.promoCode}):</span>
                  <span>-Rs. {order.discountLkr.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Sri Lankan SSCL / VAT (Included):</span>
                <span>Rs. {Math.round(order.subtotalLkr * 0.025).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Amount:</span>
                <span className="text-[#0B0F14] font-black text-lg">
                  Rs. {order.totalLkr.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <div className="flex items-center gap-1.5 text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authentic Sri Lankan Computer Generated Invoice. Valid without signature.</span>
            </div>
            <span>Support: +94 11 777 5678</span>
          </div>
        </div>
      </div>
    </div>
  );
};
