import React, { useState, useEffect } from 'react';
import { ProductStatus, Trip } from '../types';
import { createProductItem, getNextSerialNumber } from '../services/db';
import { AVATARS } from '../assets/avatars';

interface ProductFormProps {
  tripId: string;
  participants: string[];
  trip?: Trip;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ tripId, participants, trip, onClose }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [link, setLink] = useState('');
  const [subsystem, setSubsystem] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [status, setStatus] = useState<ProductStatus>('Pending');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions: ProductStatus[] = ['PR Sent', 'Ordered', 'Delivered', 'Out of Stock', 'Pending'];
  const subsystemOptions = ['MECH', 'AI', 'SNA', 'MGMT'];

  useEffect(() => {
    // Auto-generate next serial
    (async () => {
      try {
        const next = await getNextSerialNumber(tripId);
        setSerialNumber(next);
      } catch (err) {
        console.warn('Unable to fetch next serial, defaulting to PS-001', err);
        setSerialNumber('PS-001');
      }
    })();
  }, [tripId]);

  useEffect(() => {
    // Auto compute total price = unit * quantity
    const q = parseInt(quantity) || 1;
    const pu = parseFloat(pricePerUnit);
    if (!isNaN(pu) && q > 0) {
      setTotalPrice((pu * q).toFixed(2));
    } else if (!pricePerUnit) {
      setTotalPrice('');
    }
  }, [pricePerUnit, quantity]);

  const renderAvatar = (name: string, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-5 h-5 text-[8px]' : 'w-6 h-6 text-[10px]';
    const borderClass = size === 'sm' ? 'border' : 'border-2';
    
    if (trip?.memberAvatars?.[name]) {
      const avatar = AVATARS.find(a => a.id === trip.memberAvatars[name]);
      if (avatar) {
        return (
          <img 
            src={avatar.image} 
            alt={name} 
            className={`${sizeClass} rounded-full object-cover ${borderClass} border-white flex-shrink-0`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      }
    }
    
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className={`${sizeClass} rounded-full bg-[#f49221]/20 flex items-center justify-center font-bold text-[#f49221] flex-shrink-0`}>
        {initials}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber || !itemName || !addedBy) {
      return alert("Please fill Item Name and Added By.");
    }

    setLoading(true);
    try {
      const productData: any = {
        serialNumber,
        itemName,
        quantity: parseInt(quantity) || 1,
        addedBy,
        status
      };

      // Only add optional fields if they have values
      if (link && link.trim()) productData.link = link.trim();
      if (subsystem && subsystem.trim()) productData.subsystem = subsystem.trim();
      if (comments && comments.trim()) productData.comments = comments.trim();
      if (pricePerUnit) productData.pricePerUnit = parseFloat(pricePerUnit);
      if (totalPrice) productData.totalPrice = parseFloat(totalPrice);

      console.log('📤 Submitting product to PS board:', tripId, productData);
      await createProductItem(tripId, productData);
      console.log('✅ Product created successfully');
      onClose();
    } catch (err: any) {
      console.error("❌ Error creating product:", err);
      const errorMsg = err?.message || err?.code || 'Unknown error';
      alert(`Failed to add product to PS board.\n\nError: ${errorMsg}\n\nMake sure your Firestore rules allow:\n• Write access to ps_boards/${tripId}/products\n\nRule example:\nmatch /ps_boards/{psId}/products/{productId} {\n  allow read, write: if true;\n}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-10 border-4 border-[#f49221]">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-black font-pt uppercase tracking-tight">Add Product</h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Row 1: Serial Number and Item Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Serial Number (PS)</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black bg-gray-50" 
                value={serialNumber} 
                readOnly
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Item Name</label>
              <input 
                type="text" 
                placeholder="e.g. Heat Gun" 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
                value={itemName} 
                onChange={e => setItemName(e.target.value)} 
              />
            </div>
          </div>

          {/* Row 2: Quantity and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Quantity</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Status</label>
              <select 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none bg-white font-bold text-black" 
                value={status} 
                onChange={e => setStatus(e.target.value as ProductStatus)}
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Added By and Subsystem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Added By</label>
              <div className="relative">
                <select 
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none bg-white font-bold text-black appearance-none" 
                  value={addedBy} 
                  onChange={e => setAddedBy(e.target.value)}
                >
                  <option value="">Select Person</option>
                  {participants.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {addedBy && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {renderAvatar(addedBy, 'sm')}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Subsystem</label>
              <select 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none bg-white font-bold text-black" 
                value={subsystem} 
                onChange={e => setSubsystem(e.target.value)} 
              >
                <option value="">Select subsystem</option>
                {subsystemOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Price Per Unit and Total Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Price Per Unit (₹)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
                value={pricePerUnit} 
                onChange={e => setPricePerUnit(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Total Price (₹)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black bg-gray-50" 
                value={totalPrice} 
                readOnly 
              />
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Product Link</label>
            <input 
              type="url" 
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
              value={link} 
              onChange={e => setLink(e.target.value)} 
            />
          </div>

          {/* Comments */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Comments</label>
            <textarea 
              rows={3}
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
              value={comments} 
              onChange={e => setComments(e.target.value)} 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#f49221] to-[#e58515] hover:shadow-lg hover:shadow-[#f49221]/50 text-white py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
