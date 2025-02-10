import React from "react";

export default function CategoryFilter({ categories, selectedCategories, onCategoryChange }) {
  const handleCheckboxChange = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];
    onCategoryChange(updatedCategories);
  };

  return (
    <div className="category-filter">
      <h4>Filter by Category</h4>
      {categories.map((category) => (
        <div key={category} className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id={category}
            checked={selectedCategories.includes(category)}
            onChange={() => handleCheckboxChange(category)}
          />
          <label className="form-check-label" htmlFor={category}>
            {category}
          </label>
        </div>
      ))}
    </div>
  );
}
