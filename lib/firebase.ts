import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    updateDoc,
    increment,
} from "firebase/firestore";
import { toast } from "sonner";
import {
    getAuth,
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

const generateRandomLetters = (length: number): string => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () =>
        letters.charAt(Math.floor(Math.random() * letters.length))
    ).join("");
};


export const generateReferralCode = (): string => {
    return `ERV-${generateRandomLetters(4)}-${generateRandomLetters(4)}`;
};

const firebaseConfig = {
    apiKey: "AIzaSyDyPXJDj-qxrYF3IqA0NAz8jVIqGlqhTm8",
    authDomain: "erversewallet.firebaseapp.com",
    projectId: "erversewallet",
    storageBucket: "erversewallet.firebasestorage.app",
    messagingSenderId: "925710455861",
    appId: "1:925710455861:web:bd02d1a0655d9eea398d7c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// User type
    export interface AppUser extends User {
    referralToken?: string;
    level?: number;
    miningSpeed?: number;
    erveBalance?: number;
    numberOfReferrals?: number;
}

// Auth functions
export const createUser = async (
  email: string,
  password: string,
  referralCode?: string
): Promise<void> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const referralToken = generateReferralCode();

  if (referralCode) {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("referralToken", "==", referralCode));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        
        // Create referral record
        await setDoc(doc(db, "referrals", uuidv4()), {
          referrer: referrerDoc.id,
          referee: userCredential.user.uid,
          createdAt: serverTimestamp(),
        });

        // Update referrer's referral count
        await updateDoc(doc(db, "users", referrerDoc.id), {
          numberOfReferrals: increment(1)
        });
      }
    } catch (error) {
      console.error("Error processing referral:", error);
      toast.error("Failed to process referral code");
    }
  }

  // Create user document with new fields
  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    createdAt: serverTimestamp(),
    referralToken,
    referredBy: referralCode || null,
    points: 0,
    completedTasks: [],
    level: 1,
    miningSpeed: 0.458,
    erveBalance: 0,
    numberOfReferrals: 0
  });
};


export const loginUser = async (
    email: string,
    password: string
): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
};

// Get user data
export const getUserData = async (uid: string): Promise<any> => {
    console.log('uuid',uid)
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserBalance = async (userId: string, newBalance: number) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      erveBalance: newBalance
    });
  } catch (error) {
    console.error("Error updating balance:", error);
    throw error;
  }
};