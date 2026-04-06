// hooks/useTrackVisit.js
import { useEffect } from "react";

export default function useTrackVisit(
  path: string,
  userId: string | null = null
) {
  console.log("hook calling---------");
  useEffect(() => {
    const visited = document.cookie.includes("visited=true");
    if (visited) return;

    fetch("/api/log-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, userId }),
    });

    document.cookie = "visited=true; path=/; max-age=86400"; // 1 day
  }, [path, userId]);
}
