import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";

function ItemDetails() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");
  const [foundImage, setFoundImage] = useState(null);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/items/${id}`);

        setItem(response.data.item);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load item details.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const isOwner =
    currentUser?.id &&
    item?.reportedBy?._id &&
    currentUser.id === item.reportedBy._id;

  const canRespond =
    token && item?.type === "lost" && item?.status === "active" && !isOwner;

  const handleFoundResponse = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please describe where or how you found the item.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("itemId", id);
      formData.append("message", message.trim());

      if (foundImage) {
        formData.append("image", foundImage);
      }

      const response = await API.post("/found-responses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("");
      setFoundImage(null);
      setResponseSubmitted(true);

      setSuccess(
        response.data?.message || "Found response submitted successfully.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to submit found response.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="items-details-page">
        <div className="container">
          <div className="loading-state">Loading item details...</div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="items-details-page">
        <div className="container">
          {error && <div className="form-error">{error}</div>}

          <Link to="/items" className="btn btn-secondary">
            Back to Items
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="items-details-page">
      <div className="container">
        <Link to="/items" className="back-link">
          ← Back to items
        </Link>

        <div className="details-layout">
          {/* ITEM DETAILS */}
          <section className="details-card">
            <div className="details-header">
              <div>
                <span
                  className={`type-badge ${
                    item.type === "lost" ? "lost" : "found"
                  }`}
                >
                  {item.type}
                </span>

                <h1>{item.title}</h1>
              </div>

              <span className="status-badge">{item.status}</span>
            </div>

            <div className="details-section">
              <h2>Description</h2>

              <p>{item.description}</p>
            </div>

            <div className="details-info-grid">
              <div>
                <span>Category</span>
                <strong>{item.category}</strong>
              </div>

              <div>
                <span>Location</span>
                <strong>{item.location}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>{new Date(item.date).toLocaleDateString()}</strong>
              </div>

              <div>
                <span>Reported By</span>
                <strong>{item.reportedBy?.name || "Unknown"}</strong>
              </div>
            </div>
          </section>

          {/* FOUND RESPONSE SECTION */}
          <aside className="claim-card">
            <span className="eyebrow">
              {item.type === "lost" ? "FOUND THIS ITEM?" : "ITEM INFORMATION"}
            </span>

            <h2>
              {item.type === "lost"
                ? "Did you find this item?"
                : "This is a found item"}
            </h2>

            <p>
              {item.type === "lost"
                ? "If you found this item, let the owner know by sending a response."
                : "This item was reported as found and does not accept found responses."}
            </p>

            {success && <div className="form-success">{success}</div>}

            {error && <div className="form-error">{error}</div>}

            {/* NOT LOGGED IN */}
            {!token ? (
              <>
                {item.type === "lost" && (
                  <p className="claim-login-text">
                    You need to sign in before telling the owner that you found
                    this item.
                  </p>
                )}

                {item.type === "lost" && (
                  <Link to="/login" className="btn btn-primary btn-full">
                    Sign In to Respond
                  </Link>
                )}
              </>
            ) : item.type !== "lost" ? (
              <div className="empty-state">
                <strong>No response required</strong>

                <p>Found items cannot receive found responses.</p>
              </div>
            ) : item.status !== "active" ? (
              <div className="empty-state">
                <strong>Item Already Returned</strong>

                <p>This item has already been processed.</p>
              </div>
            ) : isOwner ? (
              <div className="empty-state">
                <strong>This is your reported item</strong>

                <p>
                  Other users can send you a found response if they find it.
                </p>
              </div>
            ) : (
              canRespond &&
              !responseSubmitted && (
                <form onSubmit={handleFoundResponse} className="claim-form">
                  <div className="form-group">
                    <label htmlFor="message">Found Message</label>
                    <textarea
                      id="message"
                      rows="6"
                      placeholder="Tell the owner where and how you found this item..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="foundImage">Photo (Optional)</label>

                    <input
                      id="foundImage"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) =>
                        setFoundImage(e.target.files?.[0] || null)
                      }
                    />

                    <small>
                      You can take a photo of the item to help the owner verify
                      it.
                    </small>

                    {foundImage && <p>Selected: {foundImage.name}</p>}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "I Found This Item"}
                  </button>
                </form>
              )
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ItemDetails;
