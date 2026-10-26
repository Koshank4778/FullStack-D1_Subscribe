
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavBar() {
    const { user, loading } = useAuth();

    return (
        <header className="site-header">
            <Link to="/" className="logo">
                DEV<span>@</span>Deakin
            </Link>

            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/post">Post</Link>
                <Link to="/pricing">Pricing</Link>

                {!loading && (
                    user ? (
                        <>
                            <span>{user.email}</span>
                            <button onClick={() => import("firebase/auth").then(({ signOut }) => signOut(user.auth))}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Sign Up</Link>
                        </>
                    )
                )}
            </nav>
        </header>
    );
}

export default NavBar;
