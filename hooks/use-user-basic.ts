"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type BasicUser = {
  id: string;
  fullName: string;
  avatar: string;
  role: "admin" | "user" | "vendor";
};

export function useUserBasic(id: string | undefined) {
  const [data, setData] = useState<BasicUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) {
          setData(null);
          setLoading(false);
          return;
        }
        const res = await axios.get(`/api/user/basic/${id}`);
        if (!cancelled) setData(res.data?.user || null);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.error || e.message || "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}
