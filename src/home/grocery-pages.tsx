// src/home/grocery-pages.tsx (or .js if not using TypeScript)
import React, { useState, useEffect, CSSProperties } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../auth/AuthProvider'; // Assuming you have an AuthProvider
import { Grocery } from '../components/types'; // Import your Grocery type

// Define styles for the cards and buttons
const cardStyles: { [key: string]: CSSProperties } = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    wordWrap: 'break-word',
  },
  cardImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '1.2em',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  cardText: {
    fontSize: '0.9em',
    color: '#555',
    marginBottom: '5px',
  },
  claimedText: {
    color: '#dc3545', // Red for claimed
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  availableText: {
    color: '#28a745', // Green for available
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  claimButton: {
    padding: '8px 12px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9em',
    marginTop: '10px',
    alignSelf: 'flex-start', // Align button to start of flex item
    transition: 'background-color 0.2s ease',
  },
  claimButtonClaim: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  claimButtonUnclaim: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  uploaderInfo: {
    fontSize: '0.8em',
    color: '#777',
    marginTop: '10px',
    borderTop: '1px solid #eee',
    paddingTop: '8px',
  },
  uploaderAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    marginRight: '5px',
    verticalAlign: 'middle',
  },
};

function HomeGroceryPage() {
  const { currentUser } = useAuth(); // Get current user from AuthProvider
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'groceries'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedGroceries: Grocery[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedGroceries.push({
          id: doc.id,
          name: (data.name || '') as string,
          amount: (data.amount || 0) as number,
          unit: (data.unit || '') as string,
          expiry: (data.expiry || '') as string,
          description: (data.description ?? null) as string | null,
          imageUrl: (data.imageUrl ?? null) as string | null,
          uploader: (data.uploader ?? null) as Grocery['uploader'],
          claimed: (data.claimed ?? false) as boolean | null, // Ensure claimed is boolean or null, defaulting to false
          createdAt: (data.createdAt ?? null) as any | null,
          category: (data.category ?? null) as string | null, // Added category
        });
      });
      setGroceries(fetchedGroceries);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching groceries: ", err);
      setError("Failed to load groceries. Please try again.");
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  // --- NEW: Handle Claim/Unclaim Logic ---
  const handleClaimToggle = async (
    id: string,
    // FIX: Allow 'undefined' for currentClaimedStatus as it matches the Grocery type
    currentClaimedStatus: boolean | null | undefined,
    uploaderEmail: string | undefined
  ) => {
    if (!currentUser) {
      alert("You must be logged in to claim items.");
      return;
    }

    const itemRef = doc(db, 'groceries', id);
    const isCurrentlyClaimed = currentClaimedStatus === true;

    // Prevent claiming an item already claimed by someone else
    if (!currentUser.email && !currentUser.uid) { // Ensure current user object has identifiable info
        alert("Unable to identify current user. Please log in again.");
        return;
    }

    // If item is claimed and current user is NOT the uploader, check if it's claimed by them
    if (isCurrentlyClaimed) {
        // If the item is claimed and the current user is NOT the original uploader,
        // and they are attempting to unclaim it, they must be the one who claimed it.
        // For simplicity here, we allow unclaiming regardless of who claimed it (it's a shared fridge)
        // or add logic to check if currentUser.email matches claimedBy field (if you add one).
        // For now, we'll allow unclaiming regardless of who claimed it, if it's currently claimed.
        // If you want stricter control (only the claimant can unclaim), you'd need a 'claimedBy' field.

        try {
            await updateDoc(itemRef, {
                claimed: false,
                claimedBy: null, // Clear claimedBy when unclaiming
                claimedAt: null, // Clear claimedAt when unclaiming
            });
            console.log(`Grocery ${id} unclaimed successfully.`);
        } catch (error) {
            console.error("Error unclaiming document: ", error);
            alert("Failed to unclaim item. Please try again.");
        }
    } else {
        // Item is not currently claimed, so try to claim it
        try {
            await updateDoc(itemRef, {
                claimed: true,
                claimedBy: currentUser.email || currentUser.displayName || currentUser.uid, // Store who claimed it
                claimedAt: serverTimestamp(), // Store when it was claimed
            });
            console.log(`Grocery ${id} claimed successfully by ${currentUser.email}.`);
        } catch (error) {
            console.error("Error claiming document: ", error);
            alert("Failed to claim item. Please try again.");
        }
    }
  };


  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading available groceries...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</div>;
  if (groceries.length === 0) return <div style={{ textAlign: 'center', padding: '20px', color: '#555' }}>No groceries available yet. Be the first to add one!</div>;

  return (
    <div style={cardStyles.container}>
      {groceries.map((item) => (
        <div key={item.id} style={cardStyles.card}>
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.name} style={cardStyles.cardImage} />
          )}
          <h3 style={cardStyles.cardTitle}>{item.name}</h3>
          <p style={cardStyles.cardText}>
            Amount: {item.amount} {item.unit}
          </p>
          <p style={cardStyles.cardText}>Expiry: {item.expiry}</p>
          {item.category && (
            <p style={cardStyles.cardText}>Category: {item.category}</p>
          )}
          {item.description && (
            <p style={cardStyles.cardText}>Description: {item.description}</p>
          )}

          {/* Display Claimed Status */}
          {item.claimed ? (
            <p style={cardStyles.claimedText}>CLAIMED</p>
          ) : (
            <p style={cardStyles.availableText}>AVAILABLE</p>
          )}

          {/* Uploader Info */}
          {item.uploader && item.uploader.name && (
            <p style={cardStyles.uploaderInfo}>
              Uploaded by:{' '}
              {item.uploader.avatarUrl && (
                <img src={item.uploader.avatarUrl} alt="Uploader" style={cardStyles.uploaderAvatar} />
              )}
              {item.uploader.name}
            </p>
          )}

          {/* Claim Button */}
          <button
            onClick={() => handleClaimToggle(item.id, item.claimed, item.uploader?.name)}
            style={{
              ...cardStyles.claimButton,
              ...(item.claimed ? cardStyles.claimButtonUnclaim : cardStyles.claimButtonClaim),
            }}
            disabled={!currentUser} // Disable if no user logged in
          >
            {item.claimed ? 'Unclaim' : 'Claim'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default HomeGroceryPage;