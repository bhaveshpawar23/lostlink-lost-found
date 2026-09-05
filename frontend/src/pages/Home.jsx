import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import heroImage from "../assets/hero.png";

function Home() {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchRecentItems = async () => {
      try {
        const response = await API.get("/items/returned");

        if (mounted) {
          setRecentItems((response.data.items || []).slice(0, 3));
        }
      } catch (err) {
        if (mounted) setRecentItems([]);
      }
    };

    fetchRecentItems();
    const interval = setInterval(fetchRecentItems, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="eyebrow">LOST & FOUND PORTAL</span>

            <h1>
              Find what you lost.
              <br />
              Return what you found.
            </h1>

            <p>
              LostLink makes it simple to report lost items, discover found
              belongings, and connect them with their rightful owners.
            </p>

            <div className="hero-actions">
              <Link to="/items" className="btn btn-primary">
                Browse Items
              </Link>

              <Link to="/report" className="btn btn-secondary">
                Report an Item
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-header">
              <span>Recently Returned</span>
              <span className="status-badge">Reported</span>
            </div>

            {recentItems.length === 0 ? (
              <div className="hero-empty">
                No active lost items reported yet.
              </div>
            ) : (
              recentItems.map((item) => (
                <Link
                  to={`/items/${item._id}`}
                  className="hero-item"
                  key={item._id}
                >
                  <img
                    className="hero-item-image"
                    src={
                      item.returnedImage
                        ? `http://localhost:5000${item.returnedImage}`
                        : heroImage
                    }
                    alt={item.title}
                  />

                  <div className="hero-item-content">
                    <h3>{item.title}</h3>
                    <p>
                      {item.location} · {formatDate(item.date)}
                    </p>
                  </div>
                </Link>
              ))
            )}

            <Link to="/items" className="view-all">
              View all items →
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>A simple way to reunite people with their belongings.</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-number">01</span>
              <h3>Report</h3>
              <p>
                Report something you've lost with the relevant details so others
                can identify it.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">02</span>
              <h3>Browse</h3>
              <p>
                Search reported items using categories, locations, and item
                types.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">03</span>
              <h3>Reunite</h3>
              <p>
                Submit a found response and connect the item with its rightful
                owner.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-content">
          <div>
            <span className="eyebrow">LOST SOMETHING?</span>
            <h2>Start searching for your item.</h2>
          </div>

          <Link to="/items" className="btn btn-primary">
            Browse Lost & Found
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
