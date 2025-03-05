"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthState } from "react-firebase-hooks/auth";
import { Copy, Users } from "lucide-react";
import { auth, getUserData } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

import Image from "next/image";
import { toast } from "sonner";

interface Friend {
  id: number;
  name: string;
  level: number;
  mining: number;
  joinedAt: string;
  avatar?: string;
}

interface FrensProps {
  onReferralReward?: (amount: number) => void;
}

export function FrensSection({ onReferralReward }: FrensProps) {
  const [copied, setCopied] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [user, loading] = useAuthState(auth);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/");
    }
  }, [user, loading, router, mounted]);

  // User data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
      }
    };
    if (mounted) fetchData();
  }, [user, mounted]);

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}?ref=${userData.referralToken}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

   const handleShare = async () => {
    if (!userData?.referralToken || !user) {
      toast.error("Referral information not available");
      return;
    }

    const referralLink = `${window.location.origin}?ref=${userData.referralToken}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join ERVERSE WALLET",
          text: "Join me in ERVERSE WALLET! Use my referral link:",
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(referralLink);
        toast.success("Link copied! Share with friends.");
      }

      // Update referrals in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        numberOfReferrals: increment(1)
      });

      const updatedData = await getUserData(user.uid);
      setUserData(updatedData);

    } catch (error) {
      toast.error("Sharing failed. Try again.");
      console.error("Sharing failed:", error);
    }
  };
  // Simulate adding a new friend (in real app, this would be called when someone uses the referral code)
  const addFriend = (newFriend: Friend) => {
    setFriends((prev) => {
      const updated = [...prev, newFriend];
      localStorage.setItem("referredFriends", JSON.stringify(updated));
      return updated;
    });

    

   
  };

  return (
    <div className="p-4">
      <Card className="mb-6 bg-white p-4">
        <div className="text-sm text-gray-600">Your Referral Code</div>
        <div className="mt-2 flex items-center justify-between">
          <code className="text-lg font-medium text-[#25D366]">
            {userData?.referralToken }
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyReferralCode}
            className="text-[#25D366] hover:text-[#128C7E]"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        {copied && (
          <div className="mt-2 text-sm text-green-500">
            Referral link copied to clipboard!
          </div>
        )}
      </Card>

      <div className="mb-6 space-y-4">
        <Card className="bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Referrals</div>
              <div className="text-2xl font-medium">{userData?.numberOfReferrals}</div>
            </div>
            <Users className="h-8 w-8 text-[#25D366]" />
          </div>
        </Card>

        <Card className="bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Earned Rewards</div>
              <div className="text-2xl font-medium">{userData?.points}</div>
            </div>
            <div className="text-[#25D366]">Coins</div>
          </div>
        </Card>
      </div>

      <Card className="mb-6 bg-white p-4">
        <h3 className="text-lg font-semibold mb-4">Enter Referral Code</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const code = formData.get("referralCode") as string;

            if (!code) {
              toast.error("Please enter a referral code");
              return;
            }

            if (!code.startsWith("ERV-")) {
              toast.error("Invalid referral code format");
              return;
            }

            // Check if code has been used before
            const usedCodes = JSON.parse(
              localStorage.getItem("usedReferralCodes") || "[]"
            );
            if (usedCodes.includes(code)) {
              toast.error("This referral code has already been used");
              return;
            }

            // Save used code
            localStorage.setItem(
              "usedReferralCodes",
              JSON.stringify([...usedCodes, code])
            );

            // Add reward
            if (onReferralReward) {
              onReferralReward(10);
            }

            toast.success("Successfully claimed 10 ERVE tokens!");
            (e.target as HTMLFormElement).reset();
          }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              name="referralCode"
              placeholder="Enter referral code"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            />
            <Button
              type="submit"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white"
            >
              Submit
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="flex items-center text-xl font-bold">
          <Users className="mr-2 h-5 w-5" />
          Your Frens
        </h2>

        {friends.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Invite friends to start earning rewards!
          </div>
        ) : (
          friends.map((friend) => (
            <Card key={friend.id} className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    {friend.avatar && (
                      <Image
                        src={friend.avatar || "/placeholder.svg"}
                        alt={friend.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{friend.name}</h3>
                    <p className="text-sm text-gray-500">
                      Level {friend.level}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Mining Rate</div>
                  <div className="font-medium text-[#25D366]">
                    {friend.mining.toFixed(4)} /hr
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
         <div className="flex justify-center items-center">
          <button
            type="button"
            onClick={handleShare}
            className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Share & Invite
          </button>
         </div>
        <div className="flex">
          <button
          onClick={() => auth.signOut()}
          type="button"
          className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
        >
          Log Out
        </button>
        </div>
      </div>
    </div>
  );
}
