import express from "express";
import cors from "cors";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp({
    credential: applicationDefault(),
});

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const db = getFirestore();
const adminAuth = getAuth();

app.post("/api/upgrade", async (req, res) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : "";

        if (!token) {
            return res.status(401).json({ error: "Please log in first." });
        }

        let decodedToken;

        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch {
            return res.status(401).json({ error: "Invalid or expired login." });
        }

        const userRef = db.collection("User").doc(decodedToken.uid);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            return res.status(404).json({ error: "User account not found." });
        }

        const userData = userSnapshot.data();

        if (userData.subscriptionPlan === "Paid") {
            return res.status(409).json({
                error: "You already have the Paid plan.",
            });
        }

        await userRef.update({
            subscriptionPlan: "Paid",
            subscriptionUpdatedAt: FieldValue.serverTimestamp(),
        });

        return res.json({
            message: "Plan upgraded successfully.",
            subscriptionPlan: "Paid",
        });
    } catch (error) {
        console.error("Upgrade error:", error);
        return res.status(500).json({ error: "Unable to upgrade the plan." });
    }
});

app.listen(3001, () => {
    console.log("Backend running at http://localhost:3001");
});