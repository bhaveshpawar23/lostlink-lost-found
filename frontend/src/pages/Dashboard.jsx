import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [foundResponses, setFoundResponses] = useState([]);
  const [submittedResponses, setSubmittedResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          itemsResponse,
          foundResponsesResponse,
          submittedResponsesResponse,
        ] = await Promise.all([
          API.get("/items"),
          API.get("/found-responses/my"),
          API.get("/found-responses/my-submissions"),
        ]);

        setFoundResponses(foundResponsesResponse.data.responses || []);
        setSubmittedResponses(submittedResponsesResponse.data.responses || []);

        const currentUser = savedUser ? JSON.parse(savedUser) : null;

        if (currentUser) {
          const userItems = (itemsResponse.data.items || []).filter(
            (item) =>
              item.reportedBy?._id === currentUser.id ||
              item.reportedBy === currentUser.id,
          );
          setItems(userItems);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);
  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="container">
          <div className="loading-state">Loading dashboard...</div>
        </div>
      </main>
    );
  }

  const handleFoundResponseStatus = async (responseId, status) => {
    try {
      await API.patch(`/found-responses/${responseId}/status`, {
        status,
      });

      setFoundResponses((prev) =>
        prev.map((response) =>
          response._id === responseId
            ? {
                ...response,
                status,
              }
            : response,
        ),
      );

      if (status === "accepted") {
        setItems((prev) =>
          prev.map((item) => {
            const response = foundResponses.find((r) => r._id === responseId);
            return response?.itemId?._id === item._id
              ? {
                  ...item,
                  status: "returned",
                }
              : item;
          }),
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update found response.",
      );
    }
  };

  const handleDeleteItem = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirmed) return;
    try {
      await API.delete(`/items/${itemId}`);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete item.");
    }
  };

  return (
    <main className="dashboard-page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">DASHBOARD</span>

            <h1>Welcome, {user?.name || "User"}</h1>

            <p>Manage your reported items and found responses.</p>
          </div>
          <Link to="/report" className="btn btn-primary">
            Report an Item
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        <section className="dashboard-stats">
          <div className="stat-card">
            <span>Reported Items</span>
            <strong>{items.length}</strong>
          </div>

          <div className="stat-card">
            <span>Found Responses</span>
            <strong>{foundResponses.length}</strong>
          </div>

          <div className="stat-card">
            <span>Active Items</span>
            <strong>
              {items.filter((item) => item.status === "active").length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Returned Items</span>
            <strong>
              {items.filter((item) => item.status === "returned").length}
            </strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">YOUR ITEMS</span>

              <h2>Reported Items</h2>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <h3>No reported items</h3>

              <p>You haven't reported any items yet.</p>

              <Link to="/report" className="btn btn-primary">
                Report an Item
              </Link>
            </div>
          ) : (
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
                      <span>{item.category}</span>

                      <span>{item.location}</span>
                    </div>
                  </div>

                  <div className="item-card-footer">
                    <span>{new Date(item.date).toLocaleDateString()}</span>

                    <Link
                      to={`/items/${item._id}`}
                      className="item-link dashboard-view"
                    >
                      View Details →
                    </Link>

                    <Link
                      to={`/items/${item._id}/edit`}
                      className="item-link dashboard-edit"
                    >
                      Edit
                    </Link>
                    <button
                      className="item-link dashboard-delete"
                      onClick={() => handleDeleteItem(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="dashboard-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">FOUND RESPONSES</span>
              <h2>People Who Found Your Items</h2>
            </div>
          </div>

          {foundResponses.length === 0 ? (
            <div className="empty-state">
              <h3>No found responses yet</h3>
              <p>Nobody has reported finding one of your lost items yet.</p>
            </div>
          ) : (
            <div className="claims-list">
              {foundResponses.map((response) => (
                <article className="claim-row" key={response._id}>
                  <div>
                    <h3>{response.itemId?.title || "Item"}</h3>

                    <p>
                      <strong>Found by:</strong>{" "}
                      {response.responderId?.name || "Unknown"}
                    </p>

                    <p>{response.message}</p>

                    <small>
                      Submitted{" "}
                      {new Date(response.createdAt).toLocaleDateString()}
                    </small>

                    {response.image && (
                      <div className="response-image-wrap">
                        <img
                          className="response-image"
                          src={
                            response.image?.startsWith("http")
                              ? response.image
                              : `http://localhost:5000${response.image}`
                          }
                          alt="Found item"
                          onClick={() =>
                            window.open(
                              response.image?.startsWith("http")
                                ? response.image
                                : `http://localhost:5000${response.image}`,
                              "_blank",
                            )
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="claim-row-right">
                    <span className={`claim-status ${response.status}`}>
                      {response.status}
                    </span>

                    {response.status === "pending" && (
                      <small>
                        Waiting for the item owner to review your response.
                      </small>
                    )}

                    {response.status === "accepted" && (
                      <small>
                        The owner accepted your response. The item has been
                        returned.
                      </small>
                    )}

                    {response.status === "rejected" && (
                      <small>The owner rejected this response.</small>
                    )}

                    {response.status === "pending" && (
                      <div className="response-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleFoundResponseStatus(response._id, "accepted")
                          }
                        >
                          Accept
                        </button>

                        <button
                          className="btn btn-secondary"
                          onClick={() =>
                            handleFoundResponseStatus(response._id, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="dashboard-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">MY RESPONSES</span>
              <h2>Found Responses I Submitted</h2>
            </div>
          </div>

          {submittedResponses.length === 0 ? (
            <div className="empty-state">
              <h3>No responses submitted</h3>
              <p>You haven't reported finding any items yet.</p>
              <Link to="/items" className="btn btn-secondary">
                Browse Items
              </Link>
            </div>
          ) : (
            <div className="claims-list">
              {submittedResponses.map((response) => (
                <article className="claim-row" key={response._id}>
                  <div>
                    <h3>{response.itemId?.title || "Item"}</h3>

                    <p>
                      <strong>Owner:</strong>{" "}
                      {response.itemId?.reportedBy?.name || "Unknown"}
                    </p>

                    <small>
                      Submitted{" "}
                      {new Date(response.createdAt).toLocaleDateString()}
                    </small>

                    {response.image && (
                      <div className="response-image-wrap">
                        <img
                          className="response-image"
                          src={
                            response.image?.startsWith("http")
                              ? response.image
                              : `http://localhost:5000${response.image}`
                          }
                          alt="Found item"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000${response.image}`,
                              "_blank",
                            )
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="claim-row-right">
                    <span className={`claim-status ${response.status}`}>
                      {response.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
export default Dashboard;
