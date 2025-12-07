
import React, { useState } from 'react';
import { Car, MapPin, User, Calendar, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { CarRecord } from '../types';

interface CarServiceProps {
  records: CarRecord[];
  setRecords: React.Dispatch<React.SetStateAction<CarRecord[]>>;
}

const CarService: React.FC<CarServiceProps> = ({ records, setRecords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CarRecord>>({
    guestName: '',
    destination: '',
    price: 0,
    driver: '',
    status: 'Scheduled',
    date: new Date().toISOString().slice(0, 16) 
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: CarRecord = {
      ...formData as CarRecord,
      id: `CAR-${Date.now()}`,
    };
    setRecords(prev => [newRecord, ...prev]);
    setIsModalOpen(false);
    setFormData({ guestName: '', destination: '', price: 0, driver: '', status: 'Scheduled', date: new Date().toISOString().slice(0, 16) });
  };

  const handleStatusChange = (id: string, status: CarRecord['status']) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this record? 删除此行程记录？')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Car className="text-blue-600" /> 用车服务调度
           </h2>
           <p className="text-slate-500 text-sm mt-1">Airport pickup / Dropoff & Rentals</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> New Trip 新增行程
        </button>
      </div>

      <div className="grid gap-4">
        {sortedRecords.map(record => (
          <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <div className="flex-1 space-y-1">
               <div className="flex items-center gap-2">
                 <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                   record.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                   record.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                 }`}>
                   {record.status === 'Completed' ? 'Completed 已完成' : record.status === 'Cancelled' ? 'Cancelled 已取消' : 'Scheduled 待出行'}
                 </span>
                 <span className="text-slate-400 text-xs">{new Date(record.date).toLocaleString()}</span>
               </div>
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <MapPin size={18} className="text-red-500" /> {record.destination}
               </h3>
               <div className="flex gap-4 text-sm text-slate-500">
                 <span className="flex items-center gap-1"><User size={14} /> Guest: {record.guestName}</span>
                 <span className="flex items-center gap-1"><Car size={14} /> Driver: {record.driver}</span>
               </div>
             </div>

             <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1 w-full md:w-auto justify-between">
                <div className="text-xl font-bold text-slate-800">₱{record.price}</div>
                <div className="flex gap-2">
                  {record.status === 'Scheduled' && (
                    <button onClick={() => handleStatusChange(record.id, 'Completed')} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Mark Complete">
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(record.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
             </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
            No Records / 暂无用车记录
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">New Trip 新增用车行程</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination 目的地</label>
                <input type="text" required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. NAIA T3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Guest 客人</label>
                  <input type="text" required value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Driver 司机</label>
                  <input type="text" required value={formData.driver} onChange={e => setFormData({...formData, driver: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time 时间</label>
                <input type="datetime-local" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price 费用 (₱)</label>
                <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-lg">Cancel 取消</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Save 保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarService;
