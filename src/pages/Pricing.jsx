import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Pricing() {
    const { user, loading, subscriptionPlan, setSubscriptionPlan } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [error, setError] = useState("");
    const [upgrading, setUpgrading] = useState(false);

    const isPaid = subscriptionPlan === "Paid";

    function handleUpgradeClick() {
        setError("");

        if (!user) {
            setError("Please log in before upgrading your plan.");
            return;
        }

        if (isPaid) {
            setError("You are already on the Paid plan.");
            return;
        }

        setShowModal(true);
    }

    async function handlePaymentSubmit(event) {
        event.preventDefault();
        setError("");

        if (!cardName.trim()) {
            setError("Please enter the cardholder name.");
            return;
        }

        const digits = cardNumber.replace(/\s/g, "");

        if (!/^\d{16}$/.test(digits)) {
            setError("Enter a 16-digit test card number.");
            return;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
            setError("Enter the expiry date in MM/YY format.");
            return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            setError("Enter a 3- or 4-digit test CVV.");
            return;
        }

        setUpgrading(true);

        try {
            const token = await user.getIdToken();

            const response = await fetch("http://localhost:3001/api/upgrade", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to upgrade your plan.");
            }

            setSubscriptionPlan(result.subscriptionPlan);

            setShowModal(false);
            setCardName("");
            setCardNumber("");
            setExpiry("");
            setCvv("");
            setError("");
        } catch (err) {
            console.error("Subscription upgrade error:", err);
            setError(
                err.message ||
                "Could not connect to the backend. Check that the server is running."
            );
        } finally {
            setUpgrading(false);
        }
    }

    return (
        <main className="pricing-page">
            <h1>Choose Your Plan</h1>
            <p>Get more out of DEV@Deakin with a plan that suits you.</p>

            {error && !showModal && (
                <p className="auth-message auth-error" role="alert">
                    {error}
                </p>
            )}

            <div className="pricing-container">
                <section className="pricing-card">
                    <h2>Free</h2>
                    <h3>$0 <small>/ forever</small></h3>

                    <ul>
                        <li>Access to free posts</li>
                        <li>Limited monthly posts</li>
                        <li>Standard image uploads</li>
                        <li>Community support</li>
                    </ul>

                    <p>Available to all registered users.</p>
                </section>

                <section className="pricing-card paid-card">
                    <h2>Paid</h2>
                    <h3>$9.99 <small>/ month</small></h3>

                    <ul>
                        <li>Access to free and paid posts</li>
                        <li>More monthly posts</li>
                        <li>Larger image uploads</li>
                        <li>Priority support</li>
                    </ul>

                    {loading ? (
                        <p>Checking your account...</p>
                    ) : !user ? (
                        <p>
                            Please <a href="/login">log in</a> to upgrade your plan.
                        </p>
                    ) : isPaid ? (
                        <p className="subscription-status">
                            ✓ You are on the Paid plan.
                        </p>
                    ) : (
                        <button
                            type="button"
                            className="auth-button"
                            onClick={handleUpgradeClick}
                        >
                            Upgrade Plan
                        </button>
                    )}
                </section>
            </div>

            {showModal && (
                <div
                    className="payment-overlay"
                    onClick={() => {
                        if (!upgrading) setShowModal(false);
                    }}
                >
                    <section
                        className="payment-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payment-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="modal-close"
                            aria-label="Close payment form"
                            disabled={upgrading}
                            onClick={() => setShowModal(false)}
                        >
                            ×
                        </button>

                        <h2 id="payment-title">Upgrade to Paid</h2>
                        <p>Demo subscription price: $9.99/month</p>
                        <p>Use dummy details only. No real payment is processed.</p>

                        <form onSubmit={handlePaymentSubmit}>
                            <label htmlFor="cardName">Cardholder name</label>
                            <input
                                id="cardName"
                                value={cardName}
                                onChange={(event) => setCardName(event.target.value)}
                                autoComplete="off"
                                required
                                disabled={upgrading}
                            />

                            <label htmlFor="cardNumber">Test card number</label>
                            <input
                                id="cardNumber"
                                inputMode="numeric"
                                value={cardNumber}
                                onChange={(event) => setCardNumber(event.target.value)}
                                placeholder="16 digits"
                                autoComplete="off"
                                maxLength={19}
                                required
                                disabled={upgrading}
                            />

                            <div className="payment-fields">
                                <div>
                                    <label htmlFor="expiry">Expiry (MM/YY)</label>
                                    <input
                                        id="expiry"
                                        value={expiry}
                                        onChange={(event) => setExpiry(event.target.value)}
                                        placeholder="MM/YY"
                                        autoComplete="off"
                                        required
                                        disabled={upgrading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cvv">Test CVV</label>
                                    <input
                                        id="cvv"
                                        type="password"
                                        inputMode="numeric"
                                        value={cvv}
                                        onChange={(event) => setCvv(event.target.value)}
                                        autoComplete="off"
                                        maxLength={4}
                                        required
                                        disabled={upgrading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="auth-message auth-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="auth-button"
                                disabled={upgrading}
                            >
                                {upgrading ? "Upgrading..." : "Confirm Upgrade"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default Pricing;