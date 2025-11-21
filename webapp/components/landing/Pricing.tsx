"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out the platform.",
    features: [
      "1 Resume Analysis per month",
      "Basic Interview Questions",
      "Standard Voice Mode",
      "Community Support",
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious job seekers who want results.",
    features: [
      "Unlimited Resume Analyses",
      "Advanced CrewAI Insights",
      "Real-time Voice Interviews (Vapi)",
      "Detailed Performance Analytics",
      "Priority Support",
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For coaching centers and universities.",
    features: [
      "Bulk Student Management",
      "Custom Interview Scenarios",
      "White-label Options",
      "API Access",
      "Dedicated Account Manager",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            Simple, Transparent Pricing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            Invest in your career with a plan that fits your needs. No hidden fees.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl border flex flex-col ${
                plan.popular
                  ? "bg-white/5 border-white/20"
                  : "bg-[#0A0A0A] border-white/5"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-white shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-4 rounded-xl font-semibold text-center transition-all ${
                  plan.popular
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
