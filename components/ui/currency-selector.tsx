 "use client";
 
 import { useEffect, useState } from "react";
 import axios from "axios";
 import {
   Select,
   SelectTrigger,
   SelectContent,
   SelectItem,
   SelectValue,
 } from "@/components/ui/select";
 
 const OPTIONS = [
   { code: "usd", label: "USD", symbol: "$" },
   { code: "eur", label: "EUR", symbol: "€" },
   { code: "try", label: "TRY", symbol: "₺" },
 ];
 
 export default function CurrencySelector({
   className,
   size = "sm",
 }: {
   className?: string;
   size?: "sm" | "default";
 }) {
   const [value, setValue] = useState<string>("usd");
   const [loading, setLoading] = useState<boolean>(false);
 
   useEffect(() => {
     const load = async () => {
       try {
         setLoading(true);
         const res = await axios.get("/api/currency-preference");
         const cur = String(res.data?.currency || "usd").toLowerCase();
         setValue(cur);
       } catch {
       } finally {
         setLoading(false);
       }
     };
     load();
   }, []);
 
   const onChange = async (val: string) => {
     setValue(val);
     try {
       setLoading(true);
       await axios.put("/api/currency-preference", { currency: val });
     } catch {
     } finally {
       setLoading(false);
     }
   };
 
   const current = OPTIONS.find((o) => o.code === value) || OPTIONS[0];
 
   return (
     <Select disabled={loading} value={value} onValueChange={onChange}>
       <SelectTrigger size={size} className={className}>
         <SelectValue placeholder={`${current.symbol} ${current.label}`} />
       </SelectTrigger>
       <SelectContent>
         {OPTIONS.map((o) => (
           <SelectItem key={o.code} value={o.code}>
             {o.symbol} {o.label}
           </SelectItem>
         ))}
       </SelectContent>
     </Select>
   );
 }
