// src/features/recipes/Recipes.js
import React, { useState, useEffect, CSSProperties } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Grocery } from '../components/types';

function Recipes() {
  const [commonFridgeItems, setCommonFridgeItems] = useState<Grocery[]>([]);
  const [personalIngredientsInput, setPersonalIngredientsInput] = useState('');
  // Change combinedIngredients to store objects indicating source
  const [combinedIngredients, setCombinedIngredients] = useState<{name: string, isPersonal: boolean}[]>([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unusedIngredients, setUnusedIngredients] = useState<string[]>([]);

  // --- Step 3: Implement fetching "common fridge" ingredients from Firestore ---
  useEffect(() => {
    const fetchCommonFridgeItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'groceries'));
        const items: Grocery[] = [];
        querySnapshot.forEach((doc) => {
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
    const uniqueCombined = new Map<string, {name: string, isPersonal: boolean}>();

    // Add common fridge items
    commonFridgeItems.forEach(item => {
      const lowerName = item.name.toLowerCase();
      if (!uniqueCombined.has(lowerName)) { // Add only if not already present
        uniqueCombined.set(lowerName, { name: item.name, isPersonal: false });
      }
    });

    // Add personal ingredients, prioritizing personal if names overlap
    personalIngredientsInput.split(',')
      .map(item => item.trim())
      .filter(name => name.length > 0)
      .forEach(name => {
        const lowerName = name.toLowerCase();
        // Always add/overwrite with personal, so it shows up as bold
        uniqueCombined.set(lowerName, { name: name, isPersonal: true });
      });

    setCombinedIngredients(Array.from(uniqueCombined.values()));
    console.log('Combined ingredients for API (with source):', Array.from(uniqueCombined.values()).map(item => item.name).join(', '));
  }, [commonFridgeItems, personalIngredientsInput]);

  // --- Step 5: Integrate with a free recipes API ---
  const SPOONACULAR_API_KEY = 'e3188e777c734f378968cdb8cddfa03f'; // <<< REPLACE WITH YOUR ACTUAL KEY

  const fetchRecipes = async () => {
    // Extract only names for the API call
    const ingredientsForApi = combinedIngredients.map(item => item.name);

    if (ingredientsForApi.length === 0) {
      setError('Please add some ingredients to find recipes.');
      setRecipes([]);
      setUnusedIngredients([]);
      return;
    }

    if (!SPOONACULAR_API_KEY) {
      setError('Spoonacular API key is not configured. Please get one from spoonacular.com/developers');
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);
    setUnusedIngredients([]);

    const ingredientsString = ingredientsForApi.join(',');
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&number=10&apiKey=${SPOONACULAR_API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // --- MINIMAL CHANGE START ---
      // Augment the recipe data to include 'isPersonal' flag for used ingredients
      const augmentedRecipes = data.map((recipe: any) => {
          const augmentedUsedIngredients = recipe.usedIngredients.map((usedIng: any) => {
              const isPersonalSource = combinedIngredients.some(
                  item => item.isPersonal && item.name.toLowerCase() === usedIng.name.toLowerCase()
              );
              return {
                  ...usedIng,
                  isPersonal: isPersonalSource // Add the flag
              };
          });
          return {
              ...recipe,
              usedIngredients: augmentedUsedIngredients // Replace with augmented list
          };
      });
      setRecipes(augmentedRecipes);
      // --- MINIMAL CHANGE END ---
      console.log('Fetched recipes:', augmentedRecipes); // Log augmented data

      const usedIngredientNamesInResults = new Set<string>();
      // Use the augmented recipes to get used names for the unused calculation
      augmentedRecipes.forEach((recipe: any) => {
        recipe.usedIngredients.forEach((ing: any) => {
          usedIngredientNamesInResults.add(ing.name.toLowerCase());
        });
      });

      const currentUnused = combinedIngredients
        .filter(item => !usedIngredientNamesInResults.has(item.name.toLowerCase()))
        .map(item => item.name); // Get only the name for display

      setUnusedIngredients(currentUnused);
      console.log('Unused ingredients:', currentUnused);

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
          **Combined Ingredients for Search:**{' '}
          {combinedIngredients.length > 0 ? (
            combinedIngredients.map((item, index) => (
              <React.Fragment key={item.name}>
                {item.isPersonal ? <strong>{item.name}</strong> : item.name}
                {index < combinedIngredients.length - 1 && ', '}
              </React.Fragment>
            ))
          ) : (
            'None'
          )}
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
                Using:{' '}
                {/* --- MINIMAL CHANGE START --- */}
                {recipe.usedIngredients.map((ing: any, idx: number) => (
                  <React.Fragment key={ing.id || ing.name}>
                    {ing.isPersonal ? <strong>{ing.name}</strong> : ing.name}
                    {idx < recipe.usedIngredients.length - 1 && ', '}
                  </React.Fragment>
                ))}
                {/* --- MINIMAL CHANGE END --- */}
              </p>
            )}
            <p>Missing Ingredients: {recipe.missedIngredientCount}</p>
            <a href={`https://spoonacular.com/recipes/${recipe.title.toLowerCase().replace(/\s/g, '-')}-${recipe.id}`} target="_blank" rel="noopener noreferrer" style={styles.viewRecipeLink}>
              View Recipe on Spoonacular
            </a>
          </div>
        ))}
        {recipes.length === 0 && !loading && !error && combinedIngredients.length > 0 && (
          <p>No recipes found with these ingredients. Try adding more!</p>
        )}
      </div>

      {/* Ingredients Not Used Section */}
      {combinedIngredients.length > 0 && !loading && recipes.length > 0 && unusedIngredients.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.subHeader}>Ingredients Not Used:</h2>
          <p style={styles.ingredientList}>
            {unusedIngredients.join(', ')}
          </p>
          <p style={styles.hintText}>
            These ingredients were available but not required for any of the recipes found.
          </p>
        </div>
      )}
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
  hintText: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
    fontStyle: 'italic',
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