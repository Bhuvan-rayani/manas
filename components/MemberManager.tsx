import React, { useState } from 'react';
import { Trip } from '../types';
import { updateTripMembers } from '../services/db';
import { AVATARS } from '../assets/avatars';

interface MemberManagerProps {
  trip: Trip;
  mode: 'trip' | 'ps';
  onClose: () => void;
  onUpdate: () => void;
}

const MemberManager: React.FC<MemberManagerProps> = ({ trip, mode, onClose, onUpdate }) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newMemberName.trim();
    
    if (!name) {
      return alert('Please enter a member name.');
    }

    if (trip.participants.includes(name)) {
      return alert('This member already exists!');
    }

    setLoading(true);
    try {
      const updatedParticipants = [...trip.participants, name];
      const updatedAvatars = { ...trip.memberAvatars };
      if (selectedAvatarId) {
        updatedAvatars[name] = selectedAvatarId;
      }

      await updateTripMembers(trip.id, updatedParticipants, updatedAvatars);
      
      setNewMemberName('');
      setSelectedAvatarId('');
      onUpdate();
      alert(`${name} has been added successfully!`);
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const updatedParticipants = trip.participants.filter(p => p !== memberName);
      const updatedAvatars = { ...trip.memberAvatars };
      delete updatedAvatars[memberName];

      await updateTripMembers(trip.id, updatedParticipants, updatedAvatars);
      onUpdate();
      alert(`${memberName} has been removed.`);
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl p-10 border-4 border-[#f49221] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-black font-pt uppercase tracking-tight">
            👥 Manage Members
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Members */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Current Members</h3>
          <div className="space-y-3">
            {trip.participants.map((member, index) => {
              const avatarId = trip.memberAvatars?.[member];
              const avatar = AVATARS.find(a => a.id === avatarId);
              
              return (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    {avatar?.image ? (
                      <img 
                        src={avatar.image} 
                        alt={member} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#f49221]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#f49221]/20 flex items-center justify-center font-bold text-[#f49221]">
                        {member[0]}
                      </div>
                    )}
                    <span className="font-bold text-black text-lg">{member}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member)}
                    disabled={loading || trip.participants.length <= 1}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={trip.participants.length <= 1 ? "Cannot remove the last member" : "Remove member"}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Member */}
        <div className="border-t-2 border-gray-200 pt-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Add New Member</h3>
          <form onSubmit={handleAddMember} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                Member Name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#f49221] outline-none font-bold text-black"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                Avatar (Optional)
              </label>
              <div className="grid grid-cols-6 gap-3">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(avatar.id === selectedAvatarId ? '' : avatar.id)}
                    className={`p-2 rounded-xl border-2 transition-all ${
                      selectedAvatarId === avatar.id
                        ? 'border-[#f49221] bg-[#f49221]/10 scale-110'
                        : 'border-gray-200 hover:border-[#f49221]/50'
                    }`}
                    disabled={loading}
                  >
                    <img 
                      src={avatar.image} 
                      alt={`Avatar ${avatar.id}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !newMemberName.trim()}
                className="flex-1 bg-gradient-to-r from-[#f49221] to-[#e58515] hover:shadow-lg hover:shadow-[#f49221]/50 text-white py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberManager;
