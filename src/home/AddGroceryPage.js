// src/features/groceries/AddGroceryPage.js (or similar path)
import React, { useState, CSSProperties } from 'react';
import { db } from '../firebase/config'; // Adjust path if necessary
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Adjust path if necessary

// Assuming Grocery type is defined in src/components/types.ts
// If you are using TypeScript and this file is meant to be .tsx, then change its extension.
// Otherwise, remove type annotations as shown below.

function AddGroceryPage() {
  const { currentUser } = useAuth(); // Get current user from AuthProvider
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState(''); // Changed to string for input type="number"
  const [unit, setUnit] = useState('pcs'); // Default unit
  const [expiry, setExpiry] = useState(''); // Date string
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Removed :string | null
  const [success, setSuccess] = useState(null); // Removed :string | null


  const handleSubmit = async (e) => { // Removed : React.FormEvent
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!name || !amount || !unit || !expiry) {
      setError('Please fill in all required fields (Name, Amount, Unit, Expiry Date).');
      setLoading(false);
      return;
    }

    try {
      const newGrocery = {
        name: name.trim(),
        amount: Number(amount), // Convert amount to number
        unit: unit,
        expiry: expiry, // Keep as string for now, can convert to Date if needed by Firebase rules
        description: description.trim() || null, // Store as null if empty
        imageUrl: imageUrl.trim() || null,       // Store as null if empty
        uploader: currentUser ? { // Populate uploader if user is logged in
          name: currentUser.displayName || currentUser.email || 'Anonymous', // Use displayName, email, or fallback
          avatarUrl: currentUser.photoURL || null,
        } : null, // If no current user, uploader is null
        claimed: false, // Default to not claimed
        createdAt: serverTimestamp(), // Firestore timestamp
      };

      await addDoc(collection(db, 'groceries'), newGrocery);
      setSuccess('Grocery added successfully!');
      // Optionally clear form or navigate
      setName('');
      setAmount('');
      setUnit('pcs');
      setExpiry('');
      setDescription('');
      setImageUrl('');

      // Optional: Navigate back or to a grocery list after successful submission
      // navigate('/'); // Example: navigate to home page
    } catch (err) { // <<< MINIMAL CHANGE HERE: Removed ': any'
      console.error("Error adding document: ", err);
      // Ensure err is treated as an object with a message property or fallback
      setError('Failed to add grocery: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={addGroceryPageStyles.container}>
      <h1 style={addGroceryPageStyles.header}>Add New Grocery Item</h1>
      <p style={addGroceryPageStyles.text}>Fill out the form below to add a grocery item to the common fridge.</p>

      <form onSubmit={handleSubmit} style={addGroceryPageStyles.form}>
        {error && <p style={addGroceryPageStyles.errorMessage}>{error}</p>}
        {success && <p style={addGroceryPageStyles.successMessage}>{success}</p>}

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="name" style={addGroceryPageStyles.label}>Item Name:*</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={addGroceryPageStyles.input}
            placeholder="e.g., Milk"
          />
        </div>

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="amount" style={addGroceryPageStyles.label}>Amount:*</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)} // Keep as string for input, convert to Number when submitting
            required
            min="0"
            style={addGroceryPageStyles.input}
            placeholder="e.g., 1"
          />
        </div>

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="unit" style={addGroceryPageStyles.label}>Unit:*</label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            style={addGroceryPageStyles.input}
          >
            <option value="pcs">Pcs</option>
            <option value="kg">Kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="ml">ml</option>
            <option value="box">Box</option>
            <option value="bag">Bag</option>
            <option value="pack">Pack</option>
            <option value="can">Can</option>
            <option value="bottle">Bottle</option>
            <option value="oz">oz</option>
            <option value="lb">lb</option>
            <option value="cup">Cup</option>
            <option value="Tbsp">Tbsp</option>
            <option value="Tsp">Tsp</option>
          </select>
        </div>

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="expiry" style={addGroceryPageStyles.label}>Expiry Date:*</label>
          <input
            type="date"
            id="expiry"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
            style={addGroceryPageStyles.input}
          />
        </div>

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="description" style={addGroceryPageStyles.label}>Description (Optional):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={addGroceryPageStyles.textarea}
            placeholder="e.g., Organic, 2% fat"
          />
        </div>

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="imageUrl" style={addGroceryPageStyles.label}>Image URL (Optional):</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={addGroceryPageStyles.input}
            placeholder="e.g., https://example.com/milk.jpg"
          />
        </div>

        <button type="submit" disabled={loading} style={addGroceryPageStyles.submitButton}>
          {loading ? 'Adding Grocery...' : 'Add Grocery'}
        </button>
      </form>
    </div>
  );
}

const addGroceryPageStyles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '25px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '25px',
  },
  text: {
    textAlign: 'center',
    color: '#555',
    fontSize: '16px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '15px',
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '15px',
    resize: 'vertical',
    minHeight: '60px',
  },
  submitButton: {
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.3s ease',
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  successMessage: {
    color: '#28a745',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '15px',
    textAlign: 'center',
  }
};

export default AddGroceryPage;