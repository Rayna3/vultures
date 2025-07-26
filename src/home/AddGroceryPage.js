// src/features/groceries/AddGroceryPage.js
import React, { useState, CSSProperties } from "react";
import { db } from "../firebase/config"; // Adjust path if necessary
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

function AddGroceryPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [expiry, setExpiry] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // --- NEW STATE FOR CATEGORY ---
  const [category, setCategory] = useState(""); // Default to empty string or a default category

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!name || !amount || !unit || !expiry) {
      setError(
        "Please fill in all required fields (Name, Amount, Unit, Expiry Date)."
      );
      setLoading(false);
      return;
    }

    try {
      const newGrocery = {
        name: name.trim(),
        amount: Number(amount),
        unit: unit,
        expiry: expiry,
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        uploader: currentUser
          ? {
              name: currentUser.displayName || currentUser.email || "Anonymous",
              avatarUrl: currentUser.photoURL || null,
            }
          : null,
        claimed: false,
        createdAt: serverTimestamp(),
        // --- ADD CATEGORY TO THE OBJECT SENT TO FIRESTORE ---
        category: category.trim() || null, // Store as null if empty
      };

      await addDoc(collection(db, "groceries"), newGrocery);
      setSuccess("Grocery added successfully!");
      // Optionally clear form
      setName("");
      setAmount("");
      setUnit("pcs");
      setExpiry("");
      setDescription("");
      setImageUrl("");
      // --- CLEAR CATEGORY AFTER SUBMISSION ---
      setCategory("");

      // Optional: Navigate back or to a grocery list after successful submission
      // navigate('/');
    } catch (err) {
      console.error("Error adding document: ", err);
      setError(
        "Failed to add grocery: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={addGroceryPageStyles.container}>
      <button
        type="button"
        onClick={() => navigate("/")}
        style={addGroceryPageStyles.backButton}
      >
      ← Back to Home
      </button>
      <h1 style={addGroceryPageStyles.header}>Add New Grocery Item</h1>
      <p style={addGroceryPageStyles.text}>
        Fill out the form below to add a grocery item to the common fridge.
      </p>

      <form onSubmit={handleSubmit} style={addGroceryPageStyles.form}>
        {error && <p style={addGroceryPageStyles.errorMessage}>{error}</p>}
        {success && (
          <p style={addGroceryPageStyles.successMessage}>{success}</p>
        )}

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="name" style={addGroceryPageStyles.label}>
            Item Name:*
          </label>
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
          <label htmlFor="amount" style={addGroceryPageStyles.label}>
            Amount:*
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            style={addGroceryPageStyles.input}
            placeholder="e.g., 1"
          />
        </div>

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="unit" style={addGroceryPageStyles.label}>
            Unit:*
          </label>
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

        {/* --- NEW CATEGORY FORM ELEMENT --- */}
        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="category" style={addGroceryPageStyles.label}>
            Category (Optional):
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={addGroceryPageStyles.input}
          >
            <option value="">-- Select a Category --</option>{" "}
            {/* Optional: Default empty option */}
            <option value="Dairy & Alternatives">Dairy & Alternatives</option>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Meat & Poultry">Meat & Poultry</option>
            <option value="Seafood">Seafood</option>
            <option value="Grains, Pasta & Bread">Grains, Pasta & Bread</option>
            <option value="Canned & Packaged Goods">
              Canned & Packaged Goods
            </option>
            <option value="Baking & Spices">Baking & Spices</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks">Snacks</option>
            <option value="Frozen Foods">Frozen Foods</option>
            <option value="Condiments & Sauces">Condiments & Sauces</option>
            <option value="Oils & Vinegars">Oils & Vinegars</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {/* --- END NEW CATEGORY FORM ELEMENT --- */}

        <div style={addGroceryPageStyles.formGroup}>
          <label htmlFor="expiry" style={addGroceryPageStyles.label}>
            Expiry Date:*
          </label>
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
          <label htmlFor="description" style={addGroceryPageStyles.label}>
            Description (Optional):
          </label>
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
          <label htmlFor="imageUrl" style={addGroceryPageStyles.label}>
            Image URL (Optional):
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={addGroceryPageStyles.input}
            placeholder="e.g., https://example.com/milk.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={addGroceryPageStyles.submitButton}
        >
          {loading ? "Adding Grocery..." : "Add Grocery"}
        </button>
      </form>
    </div>
  );
}

const addGroceryPageStyles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "25px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    color: "#333",
    marginBottom: "25px",
  },
  text: {
    textAlign: "center",
    color: "#555",
    fontSize: "16px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "15px",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "15px",
    resize: "vertical",
    minHeight: "60px",
  },
  submitButton: {
    padding: "12px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "20px",
    transition: "background-color 0.3s ease",
  },
  errorMessage: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: "15px",
    textAlign: "center",
  },
  successMessage: {
    color: "#28a745",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: "15px",
    textAlign: "center",
  },
  backButton: {
    marginBottom: "15px",
    padding: "6px 12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default AddGroceryPage;
