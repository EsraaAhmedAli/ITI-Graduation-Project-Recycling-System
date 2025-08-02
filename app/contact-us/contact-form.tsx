"use client";

import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

    const onSubmit = async (data: ContactFormData) => {
        console.log(data);
        try {
        const res = await api.post('/contact-us', data);
        console.log(res);
        
        reset();
        toast.success('Email sent to us, thank you!');
        
        } catch (error: any) {
        console.log(error);
        toast.error(error?.response?.data?.message || error?.message || 'Failed to send message');
        }
    };

  const validateEmail = (email: string) =>
    /\S+@\S+\.\S+/.test(email) || "Invalid email address";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-lg rounded-2xl p-8 grid gap-6"
      noValidate
      aria-label="Contact form"
    >
      <div>
        <label 
          htmlFor="name" 
          className="block font-medium text-base-content mb-2"
        >
          Name *
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: "Name is required" })}
          className={`mt-1 w-full border border-base-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.name ? "border-error" : ""
          }`}
          placeholder="Your full name"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p 
            id="name-error"
            className="text-error text-sm mt-1" 
            role="alert"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="email" 
          className="block font-medium text-base-content mb-2"
        >
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            validate: validateEmail,
          })}
          className={`mt-1 w-full border border-base-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.email ? "border-error" : ""
          }`}
          placeholder="you@example.com"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p 
            id="email-error"
            className="text-error text-sm mt-1" 
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="message" 
          className="block font-medium text-base-content mb-2"
        >
          Message *
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message", {
            required: "Message is required",
            minLength: {
              value: 10,
              message: "Message must be at least 10 characters",
            },
          })}
          className={`mt-1 w-full border border-base-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-colors ${
            errors.message ? "border-error" : ""
          }`}
          placeholder="Tell us how we can help..."
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p 
            id="message-error"
            className="text-error text-sm mt-1" 
            role="alert"
          >
            {errors.message.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-describedby="submit-status"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
      
      <p id="submit-status" className="sr-only">
        {isSubmitting ? "Submitting your message, please wait..." : "Ready to submit"}
      </p>
    </form>
  );
}