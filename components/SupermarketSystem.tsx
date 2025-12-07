import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBasket, ScanBarcode, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, QrCode, CircleDollarSign, Wallet, PackageOpen } from 'lucide-react';
import { Product, Order, OrderStatus, OrderItem, PaymentMethod } from '../types';

interface SupermarketSystemProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onPlaceOrder: (order: Order) => void;
}

const SupermarketSystem: React.FC<SupermarketSystemProps> = ({ products, setProducts, onPlaceOrder }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtered Products
  // Assuming searchTerm was meant for manual searching, but since it was unused in logic before this cleanup, 
  // I will just use the category filter for displayed products or just display all.
  // The original code had searchTerm but it was unused. Let's simplify.
  const displayedProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesCategory;
  });

  // Cart Calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handlers
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Out of Stock / 库存不足');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Check stock limit
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        // Check stock
        if (newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('Product Not Found / 未找到商品');
    }
  };

  const handleCheckout = (paymentMethod: PaymentMethod) => {
    if (cart.length === 0) return;

    // 1. Create Order
    const orderItems: OrderItem[] = cart.map(c => ({
      dishId: c.product.id,
      dishName: c.product.name,
      quantity: c.quantity,
      price: c.product.price
    }));

    const newOrder: Order = {
      id: `RET-${Date.now()}`,
      tableNumber: 'RETAIL',
      source: 'SUPERMARKET',
      items: orderItems,
      status: OrderStatus.PAID,
      totalAmount: cartTotal,
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethod,
      notes: 'Supermarket Retail 超市零售'
    };

    onPlaceOrder(newOrder);

    // 2. Deduct Stock
    const deductions = new Map<string, number>();
    cart.forEach(c => deductions.set(c.product.id, c.quantity));

    setProducts(prev => prev.map(p => {
      if (deductions.has(p.id)) {
        return { ...p, stock: Math.max(0, p.stock - deductions.get(p.id)!) };
      }
      return p;
    }));

    // 3. Reset
    setCart([]);
    setIsCheckoutModalOpen(false);
    alert('Payment Successful / 结账成功');
  };

  // Focus barcode input on load
  useEffect(() => {
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <ShoppingBasket className="text-teal-600" /> Supermarket POS 超市收银
           </h2>
           <p className="text-slate-500 text-sm mt-1">1F Retail Terminal / 一楼零售终端</p>
        </div>
        
        {/* Barcode Scanner Input */}
        <form onSubmit={handleBarcodeSubmit} className="relative w-96">
            <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
               ref={barcodeInputRef}
               type="text" 
               value={barcodeInput}
               onChange={e => setBarcodeInput(e.target.value)}
               placeholder="Scan Barcode / 扫描条形码..."
               className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-mono text-lg shadow-sm"
               autoFocus
            />
        </form>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left: Product Grid */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
           {/* Categories */}
           <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
              {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                     selectedCategory === cat 
                       ? 'bg-teal-600 text-white shadow-sm' 
                       : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                   }`}
                 >
                   {cat === 'All' ? '全部 All' : cat}
                 </button>
              ))}
           </div>

           {/* Grid */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20">
              {displayedProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={`bg-white p-3 rounded-xl border transition-all text-left flex flex-col h-full group ${
                    product.stock <= 0 ? 'opacity-60 grayscale border-slate-100' : 'border-slate-200 hover:border-teal-400 hover:shadow-md'
                  }`}
                >
                   <div className="aspect-square bg-slate-50 rounded-lg mb-3 relative overflow-hidden">
                      {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                         {product.stock > 0 && <Plus className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all drop-shadow-md" size={32} />}
                      </div>
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                           <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded">Sold Out 缺货</span>
                        </div>
                      )}
                   </div>
                   <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{product.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{product.barcode}</div>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                         <div className="font-bold text-teal-600 text-lg">¥{product.price}</div>
                         <div className={`text-xs px-1.5 py-0.5 rounded ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                            Stock: {product.stock}
                         </div>
                      </div>
                   </div>
                </button>
              ))}
           </div>
        </div>

        {/* Right: Cart */}
        <div className="w-96 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm shrink-0">
           <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <ShoppingBasket size={18} /> 购物车 Cart
              </h3>
              <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-bold">{cartCount} items</span>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <PackageOpen size={48} />
                    <p>Scan barcode or click items</p>
                    <p className="text-xs">扫描条码或点击商品</p>
                 </div>
              ) : (
                 cart.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                       <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                          {item.product.imageUrl && <img src={item.product.imageUrl} className="w-full h-full object-cover" />}
                       </div>
                       <div className="flex-1">
                          <div className="text-sm font-bold text-slate-800 line-clamp-1">{item.product.name}</div>
                          <div className="text-xs text-slate-500">¥{item.product.price}</div>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"><Minus size={12} /></button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"><Plus size={12} /></button>
                       </div>
                       <div className="text-right w-14 font-bold text-slate-800">
                          ¥{item.product.price * item.quantity}
                       </div>
                       <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-red-500 ml-1">
                          <Trash2 size={14} />
                       </button>
                    </div>
                 ))
              )}
           </div>

           <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-slate-500 font-medium">Total 合计</span>
                 <span className="text-3xl font-bold text-teal-600">¥{cartTotal}</span>
              </div>
              <button 
                 onClick={() => setIsCheckoutModalOpen(true)}
                 disabled={cart.length === 0}
                 className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200 transition-colors flex items-center justify-center gap-2"
              >
                 <CreditCard size={18} /> Checkout 结账
              </button>
           </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <CreditCard /> Payment Method 支付方式
              </h3>
              
              <div className="text-center mb-8">
                 <div className="text-sm text-slate-500 mb-1">Total Due 应收金额</div>
                 <div className="text-4xl font-bold text-slate-900">¥{cartTotal}</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 <PaymentBtn method="CASH" label="Cash" subLabel="现金" icon={Banknote} color="green" onClick={handleCheckout} />
                 <PaymentBtn method="WECHAT" label="WeChat" subLabel="微信" icon={QrCode} color="emerald" onClick={handleCheckout} />
                 <PaymentBtn method="ALIPAY" label="AliPay" subLabel="支付宝" icon={Smartphone} color="blue" onClick={handleCheckout} />
                 <PaymentBtn method="USDT" label="USDT" subLabel="USDT" icon={CircleDollarSign} color="teal" onClick={handleCheckout} />
                 <PaymentBtn method="GCASH" label="GCash" subLabel="GCash" icon={Wallet} color="blue" onClick={handleCheckout} />
                 <PaymentBtn method="MAYA" label="Maya" subLabel="Maya" icon={Wallet} color="green" onClick={handleCheckout} />
              </div>

              <button 
                 onClick={() => setIsCheckoutModalOpen(false)}
                 className="w-full mt-6 py-3 text-slate-500 hover:bg-slate-50 rounded-lg font-medium"
              >
                 Cancel 取消
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

const PaymentBtn = ({ method, label, subLabel, icon: Icon, color, onClick }: any) => (
   <button
      onClick={() => onClick(method)}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-${color}-500 hover:bg-${color}-50 transition-all gap-2`}
   >
      <Icon className={`text-${color}-600`} size={24} />
      <div className="text-center leading-tight">
        <span className="font-bold text-sm block text-slate-700">{label}</span>
        {subLabel && <span className="text-xs opacity-75 text-slate-500">{subLabel}</span>}
      </div>
   </button>
);

export default SupermarketSystem;