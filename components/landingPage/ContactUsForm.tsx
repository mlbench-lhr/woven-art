"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Swal from "sweetalert2";

type FormData = {
  name: string;
  email: string;
  message: string;
};

const ContactUsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Email sent successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const { error } = await res.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error || "Something went wrong",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col justify-start items-start gap-[18px] w-full lg:w-[50%] h-fit"
    >
      {/* Email */}
      <div className="w-full flex flex-col gap-[10px]">
        <label className="label-style" htmlFor="email">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          placeholder="JennyWilson@gmail.com"
          className="input-style h-[50px]"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>

      <div className="w-full flex flex-col gap-[10px]">
        <label className="label-style" htmlFor="name">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Jenny Wilson"
          className="input-style h-[50px]"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>

      {/* Message */}
      <div className="w-full flex flex-col gap-[10px]">
        <label className="label-style" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          placeholder="Write your message..."
          className="input-style "
          style={{ height: "180px" }}
          {...register("message", { required: "Message is required" })}
        />
        {errors.message && (
          <span className="text-red-500 text-sm">{errors.message.message}</span>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="main_green_button"
        size="lg"
        className="w-full h-[50px] primary-button"
        disabled={loading}
      >
        {loading ? "Sending..." : "Message"}
      </Button>
    </form>
  );
};

export default ContactUsForm;
