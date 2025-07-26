// src/components/types.ts (or similar)

export type Grocery = {
  id: string;
  name: string;
  amount: number;
  unit: string;
  
  // Make these properties optional and allow 'null'
  description?: string | null; // Can be string or null
  imageUrl?: string | null;    // Can be string or null
  uploader?: {                // Uploader can be null or a specific type
    name: string;
    avatarUrl: string;
  } | null;
  claimed?: boolean | null;    // Can be boolean or null
  createdAt?: any | null;      // Can be any (like Firestore Timestamp) or null
};
