import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [subscriptionPlan, setSubscriptionPlan] = useState("Free");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!active) return;

            setUser(currentUser);
            setLoading(true);

            if (!currentUser) {
                setSubscriptionPlan("Free");
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, "User", currentUser.uid);
                const userSnapshot = await getDoc(userRef);

                if (active) {
                    const plan = userSnapshot.exists()
                        ? userSnapshot.data().subscriptionPlan || "Free"
                        : "Free";

                    setSubscriptionPlan(plan);
                }
            } catch (error) {
                console.error("Error loading subscription:", error);

                if (active) {
                    setSubscriptionPlan("Free");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        });

        return () => {
            active = false;
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                subscriptionPlan,
                setSubscriptionPlan
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}