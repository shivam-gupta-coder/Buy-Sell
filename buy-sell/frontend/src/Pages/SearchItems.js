import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Paper,
  Chip,
  Divider,
} from '@mui/material';

export default function SearchItems() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error:", error);
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };
    verifyToken();
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, []);

  // Extract unique categories from items
  useEffect(() => {
    if (items.length > 0) {
      const categories = [...new Set(items.map(item => item.category))].filter(Boolean);
      setAvailableCategories(categories);
    }
  }, [items]);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/allProducts");
      const data = response.data;
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleSearch = (results) => {
    const filteredByCategory = results.filter((item) =>
      selectedCategories.length > 0
        ? selectedCategories.includes(item.category)
        : true
    );
    setFilteredItems(filteredByCategory);
  };

  const handleCategoryChange = (categories) => {
    setSelectedCategories(categories);
    const filteredByCategory = items.filter((item) =>
      categories.length > 0 ? categories.includes(item.category) : true
    );
    setFilteredItems(filteredByCategory);
  };

  // Function to get color for category chip
  const getCategoryColor = (category) => {
    // Create a hash of the category string
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a consistent hue value between 0 and 360
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          color: '#1a237e'
        }}>
          Search Items
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Find the items you need from sellers at IIIT.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SearchBar items={items} onSearch={handleSearch} />
          </Grid>
          <Grid item xs={12} md={6}>
            <CategoryFilter
              categories={availableCategories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea 
                  component={Link} 
                  to={`/productDetails/${item._id}`}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {item.name}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                      ₹{item.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Seller: {item.sellerName}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={item.category}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(item.category),
                          color: 'text.primary'
                        }}
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No items found.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}