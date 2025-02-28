// hooks/useReferral.ts
"use client"

import { useEffect, useState } from "react"

export const useReferral = () => {
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const storedReferralCode = localStorage.getItem("referralCode");

        if (storedReferralCode) {
            setReferralCode(storedReferralCode);
            return;
        }

        // Generate new code if not exists
        const newCode = `ERV-${Date.now().toString(36).slice(-4).toUpperCase()}-${Math.random()
            .toString(36)
            .slice(2, 6)
            .toUpperCase()}`;

        localStorage.setItem("referralCode", newCode); // Store the generated code
        setReferralCode(newCode);

    }, []);

    const copyToClipboard = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return { referralCode, isCopied, copyToClipboard };
};