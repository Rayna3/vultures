export type Grocery = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  uploader: {
    name: string;
    avatarUrl: string;
  };
  claimed: boolean;
  createdAt: any; // Using `any` for Firestore ServerTimestamp
};
