import React, { useState } from 'react';
import { createPSBoard, createPSBoardWithId } from '../services/db';
import { AVATARS } from '../assets/avatars';

interface PSManagerProps {
  onPsSelected: (psId: string) => void;
  onBack?: () => void;
}

const PSManager: React.FC<PSManagerProps> = ({ onPsSelected, onBack }) => {
  const [view, setView] = useState<'selection' | 'create' | 'join'>('selection');
  const [psName, setPsName] = useState('');
  const [participants, setParticipants] = useState<string[]>(['', '']);
  const [memberAvatars, setMemberAvatars] = useState<{ [name: string]: string }>({});
  const [customId, setCustomId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAvatarPicker, setShowAvatarPicker] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = participants.filter(x => x.trim() !== '');
    if (!psName || p.length < 1) return alert("PS name and at least 1 person needed.");

    try {
      setLoading(true);
      setError('');
      console.log('📝 Creating PS board with:', { psName, participants: p, customId: customId || 'auto' });
      let id: string;
      if (customId.trim()) {
        id = await createPSBoardWithId(customId.trim(), psName, p, memberAvatars);
      } else {
        id = await createPSBoard(psName, p, memberAvatars);
      }
      console.log('✅ PS board created:', id);
      onPsSelected(id);
    } catch (err: any) {
      console.error('❌ PS board creation error:', err);
      const errorCode = err?.code || '';
      const errorMsg = err?.message || 'Unknown error';
      
      if (errorCode === 'permission-denied' || errorMsg.includes('permission')) {
        setError('⚠️ Permission Denied\n\nFirestore rules are blocking PS board creation.\n\n📋 Fix: Go to Firebase Console → Firestore → Rules and add:\n\nmatch /ps_boards/{psId} {\n  allow read, write: if true;\n}\n\nThen click Publish.');
      } else {
        setError(`Failed to create PS board:\n${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (view === 'create') {
    return (
      <>
        <div className="max-w-md mx-auto p-10 bg-white rounded-[2.5rem] shadow-2xl mt-12 border-4 border-[#f49221]">
          <h2 className="text-3xl font-bold mb-8 text-black font-pt uppercase tracking-tight">Create Purchase Sheet</h2>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-sm whitespace-pre-wrap">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-6">
            <input required className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#f49221] outline-none font-bold text-black placeholder-gray-400" placeholder="PS Name (e.g., Sensors Order)" value={psName} onChange={e => setPsName(e.target.value)} />
            <input className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#f49221] outline-none font-bold text-black placeholder-gray-400" placeholder="Custom PS ID (optional)" value={customId} onChange={e => setCustomId(e.target.value)} />
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">People</label>
              {participants.map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex gap-2 items-center">
                    {p.trim() && memberAvatars[p] && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-[#f49221]">
                        <img src={AVATARS.find(a => a.id === memberAvatars[p])?.image || ''} alt={p} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input required className="flex-1 px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#f49221] outline-none text-black placeholder-gray-400 font-bold" placeholder={`Person ${i+1}`} value={p} onChange={e => {
                      const n = [...participants]; n[i] = e.target.value; setParticipants(n);
                    }} />
                  </div>
                  {p.trim() && (
                    <button type="button" onClick={() => setShowAvatarPicker(p)} className="ml-2 text-xs text-[#f49221] font-bold hover:underline">
                      {memberAvatars[p] ? '✓ Change Avatar' : '+ Add Avatar (Optional)'}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setParticipants([...participants, ''])} className="text-xs text-[#f49221] font-bold uppercase tracking-wider hover:underline ml-1">+ Add Person</button>
            <div className="pt-8 flex flex-col gap-4">
              <button type="submit" disabled={loading} className="w-full py-5 bg-[#f49221] text-white rounded-2xl font-bold shadow-xl shadow-[#f49221]/20 uppercase tracking-widest disabled:opacity-50">
                {loading ? 'Creating PS...' : 'Create PS'}
              </button>
              <button type="button" onClick={() => setView('selection')} disabled={loading} className="w-full py-4 px-4 border-2 border-black rounded-2xl font-bold text-black uppercase tracking-widest text-xs disabled:opacity-50">Back</button>
            </div>
          </form>
        </div>

        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border-2 border-[#f49221]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-black">Choose Avatar</h3>
                <button onClick={() => setShowAvatarPicker(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {AVATARS.map((avatar) => (
                  <button key={avatar.id} type="button" onClick={() => { setMemberAvatars({ ...memberAvatars, [showAvatarPicker!]: avatar.id }); setShowAvatarPicker(null); }} className="w-full aspect-square rounded-2xl overflow-hidden hover:scale-110 transition-all border-2 border-transparent hover:border-[#f49221]">
                    <img src={avatar.image} alt="avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAvatarPicker(null)} className="w-full py-3 bg-gray-100 text-black rounded-xl font-bold hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (view === 'join') {
    return (
      <div className="max-w-md mx-auto p-10 bg-white rounded-[2.5rem] shadow-2xl mt-12 border-4 border-[#f49221] text-center">
        <h2 className="text-3xl font-bold mb-8 text-black font-pt uppercase">Access Purchase Sheet</h2>
        <input className="w-full px-6 py-5 border-2 border-gray-100 rounded-2xl focus:border-[#f49221] outline-none mb-8 text-center font-mono text-xl text-black placeholder-gray-400" placeholder="PASTE PS ID" value={joinId} onChange={e => setJoinId(e.target.value)} />
        <div className="flex flex-col gap-4">
          <button onClick={() => joinId && onPsSelected(joinId)} className="w-full py-5 bg-black text-white rounded-2xl font-bold shadow-xl uppercase tracking-widest">Open</button>
          <button onClick={() => setView('selection')} className="w-full py-4 font-bold text-gray-400 uppercase tracking-widest text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-center p-12 bg-white rounded-[3.5rem] shadow-2xl border-2 border-gray-50">
      <div className="w-28 h-28 bg-[#f49221] rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-[#f49221]/40 -rotate-3 border-4 border-white">
        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v4H3V3zm0 6h18v12H3V9zm4 3h5v6H7v-6z" /></svg>
      </div>
      <h1 className="text-5xl font-bold text-black mb-3 font-pt tracking-tighter uppercase">Purchase Sheet</h1>
      <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-14">Product Serial Tracking</p>
      <div className="space-y-5">
        <button onClick={() => setView('create')} className="w-full py-6 bg-[#f49221] text-white rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-2xl shadow-[#f49221]/30 uppercase tracking-widest">Create a PS</button>
        <button onClick={() => setView('join')} className="w-full py-6 bg-black text-white rounded-2xl font-bold hover:scale-[1.02] transition-all uppercase tracking-widest">Access a PS</button>
        {onBack && (
          <button onClick={onBack} className="w-full py-4 text-gray-400 hover:text-gray-600 rounded-2xl font-bold transition-all uppercase tracking-widest text-sm border-2 border-gray-200 hover:border-gray-300">
            ← Back to Boards
          </button>
        )}
      </div>
    </div>
  );
};

export default PSManager;
