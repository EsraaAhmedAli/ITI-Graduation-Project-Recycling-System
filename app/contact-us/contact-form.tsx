"use client";

import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext"; // adjust path

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const { t } = useLanguage();

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
    try {
      const res = await api.post("/contact-us", data);
      reset();
      toast.success(t("contact.success"));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("contact.error")
      );
    }
  };

  const validateEmail = (email: string) =>
    /\S+@\S+\.\S+/.test(email) || t("contact.errors.invalidEmail");

  return (
<main>
       <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">
  {t("contact.title")}
</h1>
<p className="text-base-content text-lg">
  {t("contact.description")}
</p>

          </header>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-lg rounded-2xl p-8 grid gap-6"
      noValidate
      aria-label={t("contact.formAria")}
    >
      {/* Name */}
      <div>
        <label htmlFor="name" className="block font-medium text-base-content mb-2">
          {t("contact.name")} *
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: t("contact.errors.nameRequired") })}
          className={`mt-1 w-full border border-base-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.name ? "border-error" : ""
          }`}
          placeholder={t("contact.placeholders.name")}
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-error text-sm mt-1" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block font-medium text-base-content mb-2">
          {t("contact.email")} *
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: t("contact.errors.emailRequired"),
            validate: validateEmail,
          })}
          className={`mt-1 w-full border border-base-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.email ? "border-error" : ""
          }`}
          placeholder={t("contact.placeholders.email")}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-error text-sm mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block font-medium text-base-content mb-2">
          {t("contact.message")} *
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message", {
            required: t("contact.errors.messageRequired"),
            minLength: {
              value: 10,
              message: t("contact.errors.messageMin"),
            },
          })}
          className={`mt-1 w-full border border-base-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-colors ${
            errors.message ? "border-error" : ""
          }`}
          placeholder={t("contact.placeholders.message")}
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

      {/* Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-describedby="submit-status"
      >
        {isSubmitting ? t("contact.sending") : t("contact.send")}
      </button>

      <p id="submit-status" className="sr-only">
        {isSubmitting ? t("contact.submitting") : t("contact.ready")}
      </p>
    </form>

</main>
  );
}
