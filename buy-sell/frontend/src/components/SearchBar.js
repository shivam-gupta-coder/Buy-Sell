import React, { useState } from "react";

export default function SearchBar({ items, onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setQuery(value);

    // Filter items based on the search query
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(value)
    );

    // Pass filtered items back to the parent component
    onSearch(filteredItems);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={handleSearch}
        className="form-control"
      />
    </div>
  );
}
