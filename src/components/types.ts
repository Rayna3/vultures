export type Grocery = {
  id: string;
  name: string;
  description: string;
  uploader: string;
  amount: number;
  unit: string;
  claimed: boolean;
  createdAt: any; // Using `any` for Firestore ServerTimestamp
  expiry: string;
};