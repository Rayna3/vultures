import { revalidatePath } from 'next/cache';
import { z } from 'zod'; // validation library (see https://zod.dev/)
import { collection, getDocs, addDoc, doc, updateDoc, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

import { db } from '../firebase/config';
import { Grocery } from './types';

export async function getAvailableGroceries(): Promise<Grocery[]> {
  const groceriesCol = collection(db, 'groceries');
  const q = query(groceriesCol, where('claimed', '==', false), orderBy('createdAt', 'desc'));
  const grocerySnapshot = await getDocs(q);
  const groceryList = grocerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grocery));
  return groceryList;
}

const addGrocerySchema = z.object({
  name: z.string().min(1, 'Name must have at least 1 character'),
  description: z.string().min(0),
});

export async function addGrocery(formData: FormData) {
  const validatedFields = addGrocerySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const newGrocery = {
    name: validatedFields.data.name,
    description: validatedFields.data.description,
    imageUrl: 'https://placehold.co/600x400.png',
    uploader: {
      name: 'CurrentUser', // This would be dynamic in a real app with auth
      avatarUrl: 'https://placehold.co/40x40.png',
    },
    claimed: false,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'groceries'), newGrocery);
  revalidatePath('/');
  return { success: true };
}