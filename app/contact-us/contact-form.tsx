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
    <main className="min-h-screen p-6" style={{
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 contact-header">
          <h1 className="text-4xl font-bold mb-4" style={{
            color: 'var(--color-primary)'
          }}>
            {t("contact.title")}
          </h1>
          <p className="text-lg" style={{
            color: 'var(--color-base-content)'
          }}>
            {t("contact.description")}
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="contact-form shadow-lg rounded-2xl p-8 grid gap-6"
          style={{
            backgroundColor: 'var(--color-card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border-color)'
          }}
          noValidate
          aria-label={t("contact.formAria")}
        >
          {/* Name */}
          <div>
            <label 
              htmlFor="name" 
              className="block font-medium mb-2"
              style={{ color: 'var(--color-base-content)' }}
            >
              {t("contact.name")} *
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: t("contact.errors.nameRequired") })}
              className={`mt-1 w-full rounded-md p-3 focus:outline-none focus:ring-2 transition-colors ${
                errors.name ? "border-2" : "border"
              }`}
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: errors.name ? 'var(--color-error)' : 'var(--border-color)',
                focusBorderColor: 'var(--color-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(14, 159, 110, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name ? 'var(--color-error)' : 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
              placeholder={t("contact.placeholders.name")}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p 
                id="name-error" 
                className="text-sm mt-1" 
                role="alert"
                style={{ color: 'var(--color-error)' }}
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block font-medium mb-2"
              style={{ color: 'var(--color-base-content)' }}
            >
              {t("contact.email")} *
            </label>
            <input
              id="email"
              type="email"
              {...register("email", {
                required: t("contact.errors.emailRequired"),
                validate: validateEmail,
              })}
              className={`mt-1 w-full rounded-md p-3 focus:outline-none focus:ring-2 transition-colors ${
                errors.email ? "border-2" : "border"
              }`}
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: errors.email ? 'var(--color-error)' : 'var(--border-color)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(14, 159, 110, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email ? 'var(--color-error)' : 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
              placeholder={t("contact.placeholders.email")}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p 
                id="email-error" 
                className="text-sm mt-1" 
                role="alert"
                style={{ color: 'var(--color-error)' }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label 
              htmlFor="message" 
              className="block font-medium mb-2"
              style={{ color: 'var(--color-base-content)' }}
            >
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
              className={`mt-1 w-full rounded-md p-3 focus:outline-none focus:ring-2 resize-none transition-colors ${
                errors.message ? "border-2" : "border"
              }`}
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: errors.message ? 'var(--color-error)' : 'var(--border-color)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(14, 159, 110, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.message ? 'var(--color-error)' : 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
              placeholder={t("contact.placeholders.message")}
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : undefined}
            />
            {errors.message && (
              <p
                id="message-error"
                className="text-sm mt-1"
                role="alert"
                style={{ color: 'var(--color-error)' }}
              >
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="font-semibold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed"
            style={{
              backgroundColor: isSubmitting ? 'var(--text-gray-400)' : 'var(--color-primary)',
              color: 'white',
              opacity: isSubmitting ? 0.5 : 1,
              focusRingColor: 'var(--color-primary)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = 'var(--color-green-600)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }
            }}
            aria-describedby="submit-status"
          >
            {isSubmitting ? t("contact.sending") : t("contact.send")}
          </button>

          <p id="submit-status" className="sr-only">
            {isSubmitting ? t("contact.submitting") : t("contact.ready")}
          </p>
        </form>
      </div>
    </main>
  );
}