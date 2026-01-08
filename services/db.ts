
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  serverTimestamp,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Expense, Trip, User, Settlement, ProductItem } from '../types';

const TRIPS_COLLECTION = 'trips';
const EXPENSES_COLLECTION = 'expenses';
const USERS_COLLECTION = 'users';
const SETTLEMENTS_COLLECTION = 'settlements';
const PS_BOARDS_COLLECTION = 'ps_boards';
const PRODUCTS_COLLECTION = 'products';

export const createTrip = async (name: string, participants: string[], memberAvatars?: { [name: string]: string }): Promise<string> => {
  try {
    console.log('📝 Creating trip with:', { name, participants, hasAvatars: !!memberAvatars });
    
    const tripData = {
      name,
      participants,
      memberAvatars: memberAvatars || {},
      createdAt: Date.now()
    };
    
    console.log('📤 Sending to Firestore:', tripData);
    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), tripData);
    console.log('✅ Trip created with ID:', docRef.id);
    return docRef.id;
  } catch (err: any) {
    console.error('❌ Create trip error details:', {
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    throw err;
  }
};

/**
 * Create a trip with a custom ID
 */
export const createTripWithId = async (
  customId: string,
  name: string,
  participants: string[],
  memberAvatars?: { [name: string]: string }
): Promise<string> => {
  try {
    const id = customId.trim();
    if (!id) throw new Error('Custom ID is required');
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new Error('ID can only contain letters, numbers, hyphens, and underscores');
    }
    const existing = await getDoc(doc(db, TRIPS_COLLECTION, id));
    if (existing.exists()) {
      throw new Error('ID already exists. Choose a different one.');
    }
    const tripData = {
      name,
      participants,
      memberAvatars: memberAvatars || {},
      createdAt: Date.now()
    };
    await setDoc(doc(db, TRIPS_COLLECTION, id), tripData);
    console.log('✅ Trip created with custom ID:', id);
    return id;
  } catch (err) {
    console.error('❌ Create trip with custom ID error:', err);
    throw err;
  }
};

/**
 * Create a PS board with a custom ID
 */
export const createPSBoardWithId = async (
  customId: string,
  name: string,
  participants: string[],
  memberAvatars?: { [name: string]: string }
): Promise<string> => {
  try {
    const id = customId.trim();
    if (!id) throw new Error('Custom ID is required');
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new Error('ID can only contain letters, numbers, hyphens, and underscores');
    }
    const existing = await getDoc(doc(db, PS_BOARDS_COLLECTION, id));
    if (existing.exists()) {
      throw new Error('ID already exists. Choose a different one.');
    }
    const psData = {
      name,
      participants,
      memberAvatars: memberAvatars || {},
      createdAt: Date.now()
    };
    await setDoc(doc(db, PS_BOARDS_COLLECTION, id), psData);
    console.log('✅ PS board created with custom ID:', id);
    return id;
  } catch (err) {
    console.error('❌ Create PS board with custom ID error:', err);
    throw err;
  }
};

/**
 * Create a PS board with auto-generated ID
 */
export const createPSBoard = async (name: string, participants: string[], memberAvatars?: { [name: string]: string }): Promise<string> => {
  try {
    console.log('📝 Creating PS board with:', { name, participants, hasAvatars: !!memberAvatars });
    const psData = {
      name,
      participants,
      memberAvatars: memberAvatars || {},
      createdAt: Date.now()
    };
    const docRef = await addDoc(collection(db, PS_BOARDS_COLLECTION), psData);
    console.log('✅ PS board created with ID:', docRef.id);
    return docRef.id;
  } catch (err: any) {
    console.error('❌ Create PS board error:', err);
    throw err;
  }
};

/**
 * Subscribe to a PS board
 */
export const subscribeToPSBoard = (psId: string, callback: (ps: Trip | null) => void) => {
  return onSnapshot(doc(db, PS_BOARDS_COLLECTION, psId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Trip);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('PS Board Subscribe Error:', error);
    callback(null);
  });
};

export const getTrip = async (tripId: string): Promise<Trip | null> => {
  const docRef = doc(db, TRIPS_COLLECTION, tripId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Trip;
  }
  return null;
};

export const subscribeToTrip = (tripId: string, callback: (trip: Trip | null) => void) => {
  return onSnapshot(doc(db, TRIPS_COLLECTION, tripId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Trip);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Firestore Subscribe Error:", error);
    callback(null);
  });
};

export const subscribeToExpenses = (tripId: string, callback: (expenses: Expense[]) => void) => {
  // We remove orderBy('createdAt') here because it requires a manual composite index in Firebase.
  // We will sort client-side to ensure the app works out-of-the-box.
  const q = query(
    collection(db, EXPENSES_COLLECTION), 
    where('tripId', '==', tripId)
  );
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    // Sort client-side by createdAt descending
    expenses.sort((a, b) => b.createdAt - a.createdAt);
    callback(expenses);
  }, (error) => {
    console.error("Firestore Expenses Subscribe Error:", error);
    callback([]);
  });
};

export const createExpense = async (tripId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'tripId'>) => {
  console.log('📝 Creating expense:', { tripId, ...expense });
  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
    ...expense,
    tripId,
    createdAt: Date.now()
  });
  console.log('✅ Expense created with ID:', docRef.id);
  return docRef;
};

export const updateExpenseItem = async (expenseId: string, updates: Partial<Expense>): Promise<void> => {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  await updateDoc(docRef, updates);
  console.log('✅ Expense updated with ID:', expenseId);
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  await deleteDoc(docRef);
};

export const uploadProof = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `proofs/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const addUser = async (name: string): Promise<User> => {
  const q = query(collection(db, USERS_COLLECTION), where("name", "==", name));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, name: doc.data().name };
  }
  const docRef = await addDoc(collection(db, USERS_COLLECTION), {
    name,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, name };
};

// Settlement management
export const createSettlement = async (tripId: string, from: string, to: string, amount: number, proofImageUrl?: string): Promise<string> => {
  const docRef = await addDoc(collection(db, SETTLEMENTS_COLLECTION), {
    tripId,
    from,
    to,
    amount,
    isPaid: false,
    proofImageUrl: proofImageUrl || null,
    createdAt: Date.now()
  });
  return docRef.id;
};

export const markSettlementAsPaid = async (settlementId: string, proofImageUrl?: string): Promise<void> => {
  const docRef = doc(db, SETTLEMENTS_COLLECTION, settlementId);
  const updateData: any = {
    isPaid: true,
    paidAt: Date.now()
  };
  if (proofImageUrl) {
    updateData.proofImageUrl = proofImageUrl;
  }
  await updateDoc(docRef, updateData);
};

export const setSettlementPaidStatus = async (settlementId: string, isPaid: boolean): Promise<void> => {
  const docRef = doc(db, SETTLEMENTS_COLLECTION, settlementId);
  const updateData: any = {
    isPaid,
    paidAt: isPaid ? Date.now() : null
  };
  await updateDoc(docRef, updateData);
};

export const deleteSettlement = async (settlementId: string): Promise<void> => {
  const docRef = doc(db, SETTLEMENTS_COLLECTION, settlementId);
  await deleteDoc(docRef);
};

export const updateTripMemberPhotos = async (tripId: string, memberPhotos: { [name: string]: File | string }): Promise<void> => {
  try {
    console.log('📸 Updating member photos for trip:', tripId);
    
    // Upload new photos and get URLs
    const photoUrls: { [name: string]: string } = {};
    for (const [participantName, photoData] of Object.entries(memberPhotos)) {
      if (photoData instanceof File) {
        console.log(`📸 Uploading photo for ${participantName}...`);
        const url = await uploadProof(photoData);
        photoUrls[participantName] = url;
        console.log(`✅ Photo uploaded for ${participantName}: ${url}`);
      } else if (typeof photoData === 'string' && photoData.length > 0) {
        photoUrls[participantName] = photoData;
      }
    }
    
    if (Object.keys(photoUrls).length === 0) {
      throw new Error('No valid photos to upload');
    }
    
    const docRef = doc(db, TRIPS_COLLECTION, tripId);
    console.log('📤 Updating Firestore with photos:', Object.keys(photoUrls));
    await updateDoc(docRef, { memberPhotos: photoUrls });
    console.log('✅ Trip photos updated successfully');
  } catch (err: any) {
    console.error('❌ Update trip photos error:', {
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    throw err;
  }
};

export const updateTripMembers = async (
  tripId: string, 
  participants: string[], 
  memberAvatars?: { [name: string]: string }
): Promise<void> => {
  try {
    console.log('👥 Updating members for trip/PS:', tripId);
    
    // Try to update in trips collection
    const tripDocRef = doc(db, TRIPS_COLLECTION, tripId);
    const tripDoc = await getDoc(tripDocRef);
    
    if (tripDoc.exists()) {
      const updateData: any = { participants };
      if (memberAvatars) {
        updateData.memberAvatars = memberAvatars;
      }
      await updateDoc(tripDocRef, updateData);
      console.log('✅ Trip members updated successfully');
      return;
    }
    
    // Try PS board collection
    const psDocRef = doc(db, PS_BOARDS_COLLECTION, tripId);
    const psDoc = await getDoc(psDocRef);
    
    if (psDoc.exists()) {
      const updateData: any = { participants };
      if (memberAvatars) {
        updateData.memberAvatars = memberAvatars;
      }
      await updateDoc(psDocRef, updateData);
      console.log('✅ PS board members updated successfully');
      return;
    }
    
    throw new Error('Trip/PS board not found');
  } catch (err: any) {
    console.error('❌ Update members error:', {
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    throw err;
  }
};

export const subscribeToSettlements = (tripId: string, callback: (settlements: Settlement[]) => void) => {
  const q = query(
    collection(db, SETTLEMENTS_COLLECTION),
    where('tripId', '==', tripId)
  );
  return onSnapshot(q, (snapshot) => {
    const settlements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Settlement));
    callback(settlements);
  }, (error) => {
    console.error("Firestore Settlements Subscribe Error:", error);
    callback([]);
  });
};
// Product/PS (Product Serial) management
export const createProductItem = async (psId: string, product: Omit<ProductItem, 'id' | 'createdAt' | 'tripId'>) => {
  console.log('📝 Creating product in PS board:', { psId, ...product });
  const payload = {
    ...product,
    tripId: psId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  // Write to ps_boards/{psId}/products subcollection
  const docRef = await addDoc(collection(db, PS_BOARDS_COLLECTION, psId, PRODUCTS_COLLECTION), payload);
  console.log('✅ Product created in PS board with ID:', docRef.id);
  return docRef;
};

export const subscribeToProducts = (psId: string, callback: (products: ProductItem[]) => void) => {
  // Subscribe to PS board subcollection only
  const q = query(collection(db, PS_BOARDS_COLLECTION, psId, PRODUCTS_COLLECTION));
  
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductItem));
    products.sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
    callback(products);
  }, (error) => {
    console.error('PS board products subscribe error:', error);
    callback([]);
  });
};

export const updateProductItem = async (productId: string, updates: Partial<ProductItem>, psId?: string): Promise<void> => {
  if (!psId) throw new Error('PS Board ID required for product update');
  const docRef = doc(db, PS_BOARDS_COLLECTION, psId, PRODUCTS_COLLECTION, productId);
  await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
  console.log('✅ Product updated in PS board with ID:', productId);
};

export const deleteProductItem = async (productId: string, psId?: string): Promise<void> => {
  if (!psId) throw new Error('PS Board ID required for product deletion');
  const docRef = doc(db, PS_BOARDS_COLLECTION, psId, PRODUCTS_COLLECTION, productId);
  await deleteDoc(docRef);
  console.log('✅ Product deleted from PS board with ID:', productId);
};

export const getProductsBySerialNumber = async (psId: string, serialNumber: string): Promise<ProductItem | null> => {
  const q = query(collection(db, PS_BOARDS_COLLECTION, psId, PRODUCTS_COLLECTION));
  const snapshot = await getDocs(q);
  const found = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProductItem)).find(p => p.serialNumber === serialNumber) || null;
  return found;
};

export const getAllProducts = async (psId: string): Promise<ProductItem[]> => {
  const snapshot = await getDocs(query(collection(db, PS_BOARDS_COLLECTION, psId, PRODUCTS_COLLECTION)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductItem));
};

/** Compute next auto serial number for a PS board: PS-001, PS-002 ... */
export const getNextSerialNumber = async (psId: string): Promise<string> => {
  const products = await getAllProducts(psId);
  let max = 0;
  for (const p of products) {
    const match = /PS-(\d+)/i.exec(p.serialNumber || '');
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) max = Math.max(max, num);
    }
  }
  const next = max + 1;
  return `PS-${String(next).padStart(3, '0')}`;
};