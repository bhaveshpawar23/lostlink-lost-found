import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          LostLink
        </Link>

        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? "open" : ""}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link className={isActive("/") ? "active" : ""} to="/">
            Home
          </Link>

          <Link className={isActive("/items") ? "active" : ""} to="/items">
            Browse Items
          </Link>

          {token && (
            <Link className={isActive("/report") ? "active" : ""} to="/report">
              Report Item
            </Link>
          )}

          {token && (
            <Link
              className={isActive("/dashboard") ? "active" : ""}
              to="/dashboard"
            >
              Dashboard
            </Link>
          )}

          {!token ? (
            <>
              <Link
                to="/login"
                className={`nav-login ${isActive("/login") ? "active" : ""}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-register ${isActive("/register") ? "active" : ""}`}
              >
                Register
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="nav-logout">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
