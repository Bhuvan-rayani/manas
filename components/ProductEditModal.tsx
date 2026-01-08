import React, { useState, useEffect } from 'react';
import { ProductItem, ProductStatus, Trip } from '../types';
import { updateProductItem } from '../services/db';

interface ProductEditModalProps {
  product: ProductItem;
  trip?: Trip;
  onClose: () => void;
  onUpdate: () => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ product, trip, onClose, onUpdate }) => {
  const [itemName, setItemName] = useState(product.itemName);
  const [quantity, setQuantity] = useState(product.quantity.toString());
  const [link, setLink] = useState(product.link || '');
  const [subsystem, setSubsystem] = useState(product.subsystem || '');
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [pricePerUnit, setPricePerUnit] = useState(product.pricePerUnit?.toString() || '');
  const [totalPrice, setTotalPrice] = useState(product.totalPrice?.toString() || '');
  const [comments, setComments] = useState(product.comments || '');
  const [loading, setLoading] = useState(false);

  const statusOptions: ProductStatus[] = ['PR Sent', 'Ordered', 'Delivered', 'Out of Stock', 'Pending'];
  const subsystemOptions = ['MECH', 'AI', 'SNA', 'MGMT'];

  useEffect(() => {
    const q = parseInt(quantity) || 1;
    const pu = parseFloat(pricePerUnit);
    if (!isNaN(pu) && q > 0) {
      setTotalPrice((pu * q).toFixed(2));
    }
  }, [pricePerUnit, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates: Partial<ProductItem> = {
        itemName,
        quantity: parseInt(quantity) || 1,
        status
      };

      // Only add optional fields if they have values
      if (link && link.trim()) updates.link = link.trim();
      if (subsystem && subsystem.trim()) updates.subsystem = subsystem.trim();
      if (comments && comments.trim()) updates.comments = comments.trim();
      if (pricePerUnit) updates.pricePerUnit = parseFloat(pricePerUnit);
      if (totalPrice) updates.totalPrice = parseFloat(totalPrice);

      await updateProductItem(product.id, updates, trip?.id);
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-10 border-4 border-[#f49221]">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-black font-pt uppercase tracking-tight">Edit Product</h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Info - Read Only */}
          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Serial Number (PS)</label>
                <div className="text-lg font-bold text-[#f49221]">{product.serialNumber}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Added By</label>
                <div className="text-lg font-bold text-black">{product.addedBy}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-4">
              Created: {new Date(product.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Item Name</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
                value={itemName} 
                onChange={e => setItemName(e.target.value)} 
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Product Link</label>
            <input 
              type="url" 
              placeholder="https://example.com/product" 
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
              value={link} 
              onChange={e => setLink(e.target.value)} 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Comments</label>
            <textarea 
              placeholder="Add any notes or comments..." 
              rows={3}
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black" 
              value={comments} 
              onChange={e => setComments(e.target.value)} 
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#f49221] to-[#e58515] hover:shadow-lg hover:shadow-[#f49221]/50 text-white py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
