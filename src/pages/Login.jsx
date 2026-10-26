import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Authenticate the user
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = result.user;

            // Find the user's document using their Firebase UID
            const userRef = doc(db, "User", user.uid);
            const userSnapshot = await getDoc(userRef);

            const userData = userSnapshot.exists()
                ? userSnapshot.data()
                : {};

            // Save the login record in Firestore
            await addDoc(collection(db, "LoginHistory"), {
                uid: user.uid,
                email: user.email,
                name: userData.name || "",
                loginTime: serverTimestamp()
            });

            // Redirect to the home page
            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <div className="auth-container">
                <div className="auth-card">
                    <h1>Login</h1>

                    <p className="auth-description">
                        Welcome back to DEV@Deakin.
                    </p>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {error && (
                        <p className="auth-message auth-error">
                            {error}
                        </p>
                    )}

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Login;