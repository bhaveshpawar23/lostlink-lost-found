import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/items/${id}`);
        const data = response.data.item;

        setItem(data);

        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          location: data.location || "",
          date: data.date ? data.date.split("T")[0] : "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load item.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await API.put(`/items/${id}`, form);
      setSuccess("Item updated successfully.");
      setTimeout(() => {
        navigate(`/items/${id}`);
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update item");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <main className="items-details-page">
        <div className="container">
          <div className="loading-state">Loading item...</div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="items-details-page">
        <div className="container">
          <div className="form-error">{error || "Item not found."}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="items-details-page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">EDIT ITEM</span>
            <h1>Edit Reported Item</h1>
            <p>Update the information for your reported item.</p>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        {success && <div className="form-success">{success}</div>}

        <form className="claim-card claim-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>

            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Bags">Bags</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Personal">Personal</option>
              <option value="Documents">Documents</option>
              <option value="Accessories">Accessories</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>

            <input
              id="location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>

            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
export default EditItem;
