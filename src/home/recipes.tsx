// src/features/recipes/Recipes.js
import React, { useState, useEffect, CSSProperties } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Grocery } from '../components/types';

function Recipes() {
  const [commonFridgeItems, setCommonFridgeItems] = useState<Grocery[]>([]);
  const [personalIngredientsInput, setPersonalIngredientsInput] = useState('');
  const [combinedIngredients, setCombinedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Step 3: Implement fetching "common fridge" ingredients from Firestore ---
  useEffect(() => {
    const fetchCommonFridgeItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'fridgeItems'));
        const items: Grocery[] = [];
        querySnapshot.forEach((doc) => {
          // Assuming doc.data() matches the Grocery type
          // Ensure 'id' is correctly added from doc.id, and type assertion for the rest
          items.push({ id: doc.id, ...doc.data() as Omit<Grocery, 'id'> });
        });
        setCommonFridgeItems(items);
        console.log('Fetched common fridge items:', items.map(item => item.name));
      } catch (err) {
        console.error('Error fetching common fridge items:', err);
        setError('Failed to load common fridge items.');
      }
    };

    fetchCommonFridgeItems();
  }, []); // Run once on component mount

  // --- Update combined ingredients whenever commonFridgeItems or personalIngredientsInput changes ---
  useEffect(() => {
    const commonNames = commonFridgeItems.map(item => item.name.toLowerCase());
    const personalNames = personalIngredientsInput.split(',').map(item => item.trim().toLowerCase()).filter(name => name.length > 0);
    const uniqueCombined = Array.from(new Set([...commonNames, ...personalNames]));
    setCombinedIngredients(uniqueCombined);
    console.log('Combined ingredients for API:', uniqueCombined.join(', '));
  }, [commonFridgeItems, personalIngredientsInput]);

  // --- Step 5: Integrate with a free recipes API ---
  const SPOONACULAR_API_KEY = 'e3188e777c734f378968cdb8cddfa03f'; // <<< REPLACE WITH YOUR ACTUAL KEY

  const fetchRecipes = async () => {
    if (combinedIngredients.length === 0) {
      setError('Please add some ingredients to find recipes.');
      setRecipes([]);
      return;
    }

    // Check if API key is provided
    if (!SPOONACULAR_API_KEY) {
      setError('Spoonacular API key is not configured. Please get one from spoonacular.com/developers');
      return;
    }


    setLoading(true);
    setError('');
    setRecipes([]); // Clear previous recipes

    const ingredientsString = combinedIngredients.join(',');
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&number=10&apiKey=${SPOONACULAR_API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRecipes(data);
      console.log('Fetched recipes:', data);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError(`Failed to fetch recipes: ${err.message || 'An unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Recipe Finder</h1>

      {/* Common Fridge Items Display */}
      <div style={styles.section}>
        <h2 style={styles.subHeader}>Common Fridge Items:</h2>
        {commonFridgeItems.length === 0 ? (
          <p>No common items found or loading...</p>
        ) : (
          <p>{commonFridgeItems.map(item => item.name).join(', ')}</p>
        )}
      </div>

      {/* Personal Ingredients Input */}
      <div style={styles.section}>
        <h2 style={styles.subHeader}>Your Personal Ingredients (comma-separated):</h2>
        <input
          type="text"
          value={personalIngredientsInput}
          onChange={(e) => setPersonalIngredientsInput(e.target.value)}
          placeholder="e.g., milk, eggs, flour"
          style={styles.input}
        />
        <p style={styles.ingredientList}>
          **Combined Ingredients for Search:** {combinedIngredients.length > 0 ? combinedIngredients.join(', ') : 'None'}
        </p>
      </div>

      <button onClick={fetchRecipes} disabled={loading} style={styles.button}>
        {loading ? 'Finding Recipes...' : 'Find Recipes'}
      </button>

      {error && <p style={styles.errorText}>{error}</p>}

      {/* Suggested Recipes Display */}
      <div style={styles.recipesGrid}>
        {recipes.map((recipe: any) => (
          <div key={recipe.id} style={styles.recipeCard}>
            <h3>{recipe.title}</h3>
            <img src={recipe.image} alt={recipe.title} style={styles.recipeImage} />
            {recipe.usedIngredientCount > 0 && (
              <p>
                **Using:** {recipe.usedIngredients.map((ing: any) => ing.name).join(', ')}
              </p>
            )}
            <p>Missing Ingredients: {recipe.missedIngredientCount}</p>
            <a href={`https://spoonacular.com/recipes/${recipe.slug}-${recipe.id}`} target="_blank" rel="noopener noreferrer" style={styles.viewRecipeLink}>
              View Recipe on Spoonacular
            </a>
          </div>
        ))}
        {recipes.length === 0 && !loading && !error && combinedIngredients.length > 0 && (
          <p>No recipes found with these ingredients. Try adding more!</p>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: '960px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  section: {
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  subHeader: {
    color: '#555',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  ingredientList: {
    fontSize: '14px',
    color: '#777',
    marginTop: '5px',
  },
  button: {
    padding: '12px 25px',
    fontSize: '18px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'block',
    width: '100%',
    marginBottom: '30px',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: '20px',
  },
  recipesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  recipeCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  recipeImage: {
    maxWidth: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  viewRecipeLink: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  },
};

export default Recipes;