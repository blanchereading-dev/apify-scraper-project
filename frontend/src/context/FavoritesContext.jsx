import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('reentry-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('reentry-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (resource) => {
    setFavorites(prev => {
      if (prev.find(f => f.id === resource.id)) return prev;
      return [...prev, resource];
    });
  };

  const removeFavorite = (resourceId) => {
    setFavorites(prev => prev.filter(f => f.id !== resourceId));
  };

  const isFavorite = (resourceId) => {
    return favorites.some(f => f.id === resourceId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addFavorite, 
      removeFavorite, 
      isFavorite, 
      clearFavorites,
      count: favorites.length 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
