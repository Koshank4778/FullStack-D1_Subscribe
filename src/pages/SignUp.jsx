import { useState } from "react";
import {
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import {
    doc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

function SignUp() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Your password must contain at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const cleanName = fullName.trim();
            const cleanEmail = email.trim();

            // Create the Firebase Authentication account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                cleanEmail,
                password
            );

            const user = userCredential.user;

            // Save the user's display name in Firebase Authentication
            await updateProfile(user, {
                displayName: cleanName
            });

            // Create the user's Firestore document
            await setDoc(doc(db, "User", user.uid), {
                name: cleanName,
                email: user.email,
                createdAt: serverTimestamp(),
                subscriptionPlan: "Free"
            });

            // Navigate only after both account setup steps succeed
            navigate("/");
        } catch (err) {
            console.error("Signup error:", err);

            if (err.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please log in.");
            } else if (err.code === "auth/weak-password") {
                setError("Your password must contain at least 6 characters.");
            } else if (err.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else if (err.code === "permission-denied") {
                setError(
                    "Your account was created, but Firestore denied saving your user details. Please check your Firestore security rules."
                );
            } else {
                setError(err.message || "Unable to create your account.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h1>Create an Account</h1>

                <p className="auth-subtitle">
                    Join the DEV@Deakin community.
                </p>

                <form onSubmit={handleSignUp}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signupEmail">Email</label>
                        <input
                            id="signupEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signupPassword">Password</label>
                        <input
                            id="signupPassword"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </div>

                    {error && (
                        <p className="auth-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    );
}

export default SignUp;