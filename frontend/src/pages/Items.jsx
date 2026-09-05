import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    status: "",
  });

  const fetchItems = async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.category) params.category = currentFilters.category;
      if (currentFilters.status) params.status = currentFilters.status;

      const response = await API.get("/items", { params });

      setItems(response.data.items);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load items.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      category: "",
      status: "",
    });
    setTimeout(() => {
      fetchItems();
    }, 0);
  };

  return (
    <main className="items-page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">LOST & FOUND</span>

            <h1>Browse Items</h1>

            <p>Search through reported lost and found belongings.</p>
          </div>

          <Link to="/report" className="btn btn-primary">
            Report an Item
          </Link>
        </div>

        <form className="filters-card" onSubmit={handleSearch}>
          <div className="search-group">
            <label htmlFor="search">Search</label>

            <input
              id="search"
              type="text"
              name="search"
              placeholder="Search by title, description or location..."
              value={filters.search}
              onChange={handleChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="type">Type</label>

            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleChange}
            >
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleChange}
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Bags">Bags</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>

            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Search
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
        </form>

        {loading && <div className="loading-state">Loading items...</div>}

        {error && <div className="form-error">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="empty-state">
            <h2>No items found</h2>

            <p>Try changing your search or filters.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="items-grid">
            {items.map((item) => (
              <article className="item-card" key={item._id}>
                <div className="item-card-top">
                  <span
                    className={`type-badge ${
                      item.type === "lost" ? "lost" : "found"
                    }`}
                  >
                    {item.type}
                  </span>

                  <span className="status-badge">{item.status}</span>
                </div>

                <div className="item-card-body">
                  <h2>{item.title}</h2>

                  <p className="item-description">{item.description}</p>

                  <div className="item-meta">
                    <span>Category: {item.category}</span>

                    <span>Location: {item.location}</span>
                  </div>
                </div>

                <div className="item-card-footer">
                  <span>{new Date(item.date).toLocaleDateString()}</span>

                  <Link to={`/items/${item._id}`} className="item-link">
                    View Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Items;
