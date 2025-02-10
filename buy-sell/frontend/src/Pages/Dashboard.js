import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, TextField, Button, Grid, Typography, Card, CardContent, Alert } from "@mui/material";

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token")); 
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    contactNumber: "",
    email: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/profile/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          email: data.email,
          contactNumber: data.contactNumber,
        });
      } catch (error) {
        setError("Error fetching user data.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const { data } = await axios.put("http://localhost:5000/api/profile/profile", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(data.user);
      setSuccess("Profile updated successfully.");
      setEditMode(false);
    } catch (error) {
      setError("Error updating profile.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: "2rem" }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
            {editMode ? "Edit Profile" : "Profile Page"}
          </Typography>
          
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  value={formData.firstName}
                  onChange={handleInputChange}
                  name="firstName"
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  value={formData.lastName}
                  onChange={handleInputChange}
                  name="lastName"
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Age"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  name="age"
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Contact Number"
                  variant="outlined"
                  fullWidth
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  name="contactNumber"
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={formData.email}
                  onChange={handleInputChange}
                  name="email"
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                {editMode ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      sx={{ marginRight: "1rem" }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;
