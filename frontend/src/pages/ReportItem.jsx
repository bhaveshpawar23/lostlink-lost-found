import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReportItem() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await API.post("/items", {
        ...formData,
        type: "lost",
      });

      setSuccess(response.data.message || "Lost item reported successfully.");

      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        date: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to report the lost item. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="report-page">
      <div className="container report-container">
        <div className="page-header report-header">
          <div>
            <span className="eyebrow">REPORT LOST ITEM</span>
            <h1>Report Lost Item</h1>
            <p>
              Provide accurate information so your lost item can be identified
              and returned.
            </p>
          </div>
        </div>

        <div className="form-card report-form-card">
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <form onSubmit={handleSubmit} className="item-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Item Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Example: Black Wallet"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Bags">Bags</option>
                  <option value="Books">Books</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Personal">Personal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Describe the item, its appearance, markings, or other identifying details."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="Example: College Library"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date Lost</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/items")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Report Lost Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ReportItem;
