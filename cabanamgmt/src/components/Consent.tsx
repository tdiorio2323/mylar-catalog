"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { consentSchema } from "@/lib/schema";
import { useBooking } from "@/lib/store";
import { toast } from "sonner";
import { z } from "zod";

type Form = z.infer<typeof consentSchema>;

export default function Consent() {
  const set = useBooking((s) => s.set);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(consentSchema) });

  const onSubmit = async (data: Form) => {
    try {
      // Create user in database via API
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
        }),
      });

      const user = await response.json();

      if (!response.ok) throw new Error(user.error || 'Failed to create user');

      // Store user info and consent in local state
      set({
        consent: data,
        bookingId: user.id
      });

      toast.success("Consent recorded");
      location.href = "/verify";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save consent");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input className="w-full rounded bg-white/10 p-2" placeholder="Full name" {...register("fullName")} />
      <input className="w-full rounded bg-white/10 p-2" placeholder="Email" {...register("email")} />
      <input className="w-full rounded bg-white/10 p-2" placeholder="Phone" {...register("phone")} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("agree")} />
        <span>I authorize identity verification and a background screening for booking eligibility.</span>
      </label>
      {Object.values(errors).length>0 && <p className="text-xs text-red-400">All fields required with consent.</p>}
      <button className="rounded bg-white px-4 py-2 text-black">Continue</button>
    </form>
  );
}
