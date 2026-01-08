import React, { useState } from 'react';
import { ProductItem, Trip, ProductStatus } from '../types';
import { AVATARS } from '../assets/avatars';
import { updateProductItem, deleteProductItem } from '../services/db';
import { RupeeSymbol } from './CurrencyIcon';
import ProductEditModal from './ProductEditModal';

interface ProductListProps {
  products: ProductItem[];
  trip?: Trip;
}

const ProductList: React.FC<ProductListProps> = ({ products, trip }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<ProductStatus>('PR Sent');
  const [loading, setLoading] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<ProductItem | null>(null);
  const [subsystemFilter, setSubsystemFilter] = useState<string>('All');
  const [showCommentsForId, setShowCommentsForId] = useState<string | null>(null);
  const [showDeliveryDateModal, setShowDeliveryDateModal] = useState<ProductItem | null>(null);
  const [deliveryDateInput, setDeliveryDateInput] = useState<string>('');

  const statusOptions: ProductStatus[] = ['PR Sent', 'Ordered', 'Delivered', 'Out of Stock', 'Pending'];
  const subsystemOptions = ['All', 'MECH', 'AI', 'SNA', 'MGMT'];

  // Filter products by subsystem
  const filteredProducts = subsystemFilter === 'All' 
    ? products 
    : products.filter(p => p.subsystem?.toLowerCase() === subsystemFilter.toLowerCase());

  const getStatusColor = (status: ProductStatus) => {
    const colors = {
      'PR Sent': 'bg-blue-500/20 text-blue-400 border-blue-500',
      'Ordered': 'bg-purple-500/20 text-purple-400 border-purple-500',
      'Delivered': 'bg-green-500/20 text-green-400 border-green-500',
      'Out of Stock': 'bg-red-500/20 text-red-400 border-red-500',
      'Pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
    };
    return colors[status] || colors['Pending'];
  };

  const renderAvatar = (name: string) => {
    const avatarId = trip?.memberAvatars?.[name];
    const avatar = AVATARS.find(a => a.id === avatarId);
    if (avatar?.image) {
      return <img src={avatar.image} alt={name} className="w-7 h-7 rounded-full object-cover border border-white" />;
    }
    return (
      <div className="w-7 h-7 bg-[#f49221]/30 rounded-full flex items-center justify-center text-[#f49221] font-bold text-xs border border-[#f49221]">
        {name[0]}
      </div>
    );
  };

  const handleStatusUpdate = async (productId: string, newStatus: ProductStatus) => {
    setLoading(true);
    try {
      await updateProductItem(productId, { status: newStatus }, trip?.id);
      setEditingId(null);
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product status.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      await deleteProductItem(productId, trip?.id);
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };
  const handleSetDeliveryDate = async () => {
    if (!showDeliveryDateModal || !deliveryDateInput) return;
    setLoading(true);
    try {
      const dateTimestamp = new Date(deliveryDateInput).getTime();
      await updateProductItem(showDeliveryDateModal.id, { deliveryDate: dateTimestamp }, trip?.id);
      setShowDeliveryDateModal(null);
      setDeliveryDateInput('');
    } catch (err) {
      console.error('Error setting delivery date:', err);
      alert('Failed to set delivery date.');
    } finally {
      setLoading(false);
    }
  };
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-gray-400 text-lg">No products added yet</p>
        <p className="text-gray-500 text-sm mt-2">Add your first product to get started tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subsystem Filter Buttons */}
      <div className="flex gap-3 flex-wrap backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-4">
        <span className="text-gray-300 font-bold text-sm mr-2 flex items-center">Filter by Subsystem:</span>
        {subsystemOptions.map(option => (
          <button
            key={option}
            onClick={() => setSubsystemFilter(option)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              subsystemFilter === option
                ? 'bg-gradient-to-r from-[#f49221] to-[#e58515] text-white shadow-lg shadow-[#f49221]/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
            }`}
          >
            {option === 'All' ? `All (${products.length})` : `${option.toUpperCase()} (${products.filter(p => p.subsystem?.toLowerCase() === option.toLowerCase()).length})`}
          </button>
        ))}
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl overflow-hidden shadow-2xl shadow-[#f49221]/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-[#f49221] to-[#e58515] text-white backdrop-blur-xl sticky top-0">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">PS</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Item Name</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Qty</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Added By</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Subsystem</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Price</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="text-gray-400 text-lg">No products found in {subsystemFilter} subsystem</div>
                    <button
                      onClick={() => setSubsystemFilter('All')}
                      className="mt-4 px-6 py-2 bg-[#f49221] hover:bg-[#e58515] text-white rounded-xl font-bold text-sm transition-colors"
                    >
                      Show All Products
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                <React.Fragment key={product.id}>
                <tr className="hover:bg-white/10 transition-all border-l-4 border-transparent hover:border-[#f49221] backdrop-blur-sm group">
                  {/* PS - Serial Number */}
                  <td className="px-6 py-5">
                    <div className="font-bold text-[#f49221] bg-[#f49221]/10 px-3 py-1 rounded-lg text-sm border border-[#f49221]/50">
                      {product.serialNumber}
                    </div>
                  </td>

                  {/* Item Name */}
                  <td className="px-6 py-5">
                    <div className="font-bold text-white text-base">{product.itemName}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(product.createdAt).toLocaleDateString()} • {new Date(product.createdAt).toLocaleTimeString()}
                    </div>
                    {product.deliveryDate && (
                      <div className="text-xs text-green-400 mt-1 flex items-center gap-1 font-semibold">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Delivery: {new Date(product.deliveryDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-6 py-5">
                    <span className="font-bold text-white text-lg">{product.quantity}</span>
                  </td>

                  {/* Added By - with Avatar */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {renderAvatar(product.addedBy)}
                      <span className="text-gray-300 font-medium text-sm">{product.addedBy}</span>
                    </div>
                  </td>

                  {/* Subsystem */}
                  <td className="px-6 py-5">
                    <span className="text-gray-300 font-medium text-sm">
                      {product.subsystem || '—'}
                    </span>
                  </td>

                  {/* Status - with Edit */}
                  <td className="px-6 py-5">
                    {editingId === product.id ? (
                      <div className="flex gap-2">
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value as ProductStatus)}
                          className="px-2 py-1 rounded text-xs bg-black text-white border border-[#f49221] outline-none"
                        >
                          {statusOptions.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(product.id, editStatus)}
                          disabled={loading}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                          setEditStatus(product.status);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${getStatusColor(product.status)}`}
                      >
                        {product.status}
                      </button>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-5">
                    <div className="text-gray-300 font-medium">
                      {product.totalPrice ? (
                        <>
                          <div><RupeeSymbol className="mr-1 inline" />{product.totalPrice.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            @ <RupeeSymbol className="mr-1 inline" />{product.pricePerUnit?.toFixed(2) || '—'}
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedProductForEdit(product)}
                        className="bg-[#f49221] hover:bg-[#e58515] text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        Edit
                      </button>
                      {product.link && (
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                        >
                          Link
                        </a>
                      )}
                      {product.comments && (
                        <button
                          onClick={() => setShowCommentsForId(showCommentsForId === product.id ? null : product.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                        >
                          {showCommentsForId === product.id ? 'Hide Note' : '📝 Note'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowDeliveryDateModal(product);
                          setDeliveryDateInput(product.deliveryDate ? new Date(product.deliveryDate).toISOString().split('T')[0] : '');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        📅 {product.deliveryDate ? 'Update' : 'Set'} Date
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Show comment row if this product is selected */}
                {showCommentsForId === product.id && product.comments && (
                  <tr className="bg-purple-500/10 border-l-4 border-purple-500">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="text-purple-400 mt-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">Product Note</div>
                          <p className="text-gray-300 text-sm leading-relaxed">{product.comments}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProductForEdit && (
        <ProductEditModal
          product={selectedProductForEdit}
          trip={trip}
          onClose={() => setSelectedProductForEdit(null)}
          onUpdate={() => {
            setSelectedProductForEdit(null);
          }}
        />
      )}

      {/* Delivery Date Modal */}
      {showDeliveryDateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border-4 border-green-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">📅 Set Delivery Date</h3>
              <button 
                onClick={() => {
                  setShowDeliveryDateModal(null);
                  setDeliveryDateInput('');
                }} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-[#f49221] text-sm">{showDeliveryDateModal.serialNumber}</span>
                <span className="font-bold text-black">{showDeliveryDateModal.itemName}</span>
              </div>
              {showDeliveryDateModal.deliveryDate && (
                <div className="text-xs text-gray-600">
                  Current: {new Date(showDeliveryDateModal.deliveryDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDateInput}
                onChange={(e) => setDeliveryDateInput(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 outline-none font-bold text-black"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSetDeliveryDate}
                disabled={loading || !deliveryDateInput}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/50 text-white py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Date'}
              </button>
              <button
                onClick={() => {
                  setShowDeliveryDateModal(null);
                  setDeliveryDateInput('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
