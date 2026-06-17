"use client";

import { useState } from "react";
import { PageHeader, Card, CardTitle, Button } from "@/components/ui";
import { useTranslations } from "next-intl";

const FAQS = [
  {
    id: 1,
    category: "Getting Started",
    question: "How do I set up my store?",
    answer: "To set up your store, navigate to Settings and complete your business information. Add your first products from the Products page, configure shipping methods, and set up payment gateways.",
  },
  {
    id: 2,
    category: "Getting Started",
    question: "How do I add products?",
    answer: "Click on Products in the sidebar, then click 'Add Product'. Fill in the product details including name, price, description, and images. You can also set inventory levels and variants.",
  },
  {
    id: 3,
    category: "Orders",
    question: "How do I manage orders?",
    answer: "All orders appear in the Orders section. Click any order to view details, update status, add tracking information, and manage shipments. You can also add internal notes for your team.",
  },
  {
    id: 4,
    category: "Orders",
    question: "How do I handle refunds?",
    answer: "Navigate to the order details page. Click the payment status button to change it to 'Refunded'. You can also add notes explaining the reason for the refund.",
  },
  {
    id: 5,
    category: "Analytics",
    question: "How do I view sales reports?",
    answer: "The Analytics section shows comprehensive sales data with charts and trends. Use the Reports page to generate custom reports and schedule them for email delivery.",
  },
  {
    id: 6,
    category: "Analytics",
    question: "Can I export data?",
    answer: "Yes! Go to Reports → Export to download your data in CSV, Excel, or PDF formats. You can also use the API for programmatic access.",
  },
  {
    id: 7,
    category: "Integrations",
    question: "How do I connect sales channels?",
    answer: "Go to Integrations and choose the channels you want to connect (Shopify, WooCommerce, Facebook, etc.). Follow the setup instructions for each platform.",
  },
  {
    id: 8,
    category: "Team",
    question: "How do I add team members?",
    answer: "Navigate to Team Management and click 'Invite Member'. Enter their email and select their role. They'll receive an invitation to join your workspace.",
  },
];

const GUIDES = [
  {
    title: "Managing Your Inventory",
    description: "Best practices for tracking stock levels and managing reorder points",
    icon: "📦",
  },
  {
    title: "Setting Up Shipping",
    description: "Configure shipping providers and manage deliveries",
    icon: "🚚",
  },
  {
    title: "Customer Analytics",
    description: "Understand your customer base with detailed analytics",
    icon: "📊",
  },
  {
    title: "Marketing Tools",
    description: "Use built-in email and social media marketing features",
    icon: "📢",
  },
  {
    title: "Payment Processing",
    description: "Accept payments safely with integrated payment gateways",
    icon: "💳",
  },
  {
    title: "API Documentation",
    description: "Integrate with custom applications using our API",
    icon: "⚙️",
  },
];

export default function HelpPage() {
  const t = useTranslations("help");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...new Set(FAQS.map((faq) => faq.category))];

  const filteredFaqs = selectedCategory === "all" ? FAQS : FAQS.filter((faq) => faq.category === selectedCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t("title", { defaultValue: "Help & Documentation" })}
        description={t("subtitle", { defaultValue: "Find answers and learn how to use DZCommerce" })}
      />

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="mailto:support@dzcommerce.com" className="group">
          <Card className="cursor-pointer group-hover:shadow-md transition-all h-full">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-display font-bold text-sm mb-1">{t("contact_support", { defaultValue: "Contact Support" })}</h3>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t("email_support", { defaultValue: "Get help via email" })}</p>
          </Card>
        </a>

        <a href="/dashboard/help?tab=faq" className="group">
          <Card className="cursor-pointer group-hover:shadow-md transition-all h-full">
            <div className="text-3xl mb-2">❓</div>
            <h3 className="font-display font-bold text-sm mb-1">{t("faqs", { defaultValue: "FAQs" })}</h3>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t("common_questions", { defaultValue: "Find common answers" })}</p>
          </Card>
        </a>

        <a href="/dashboard/help?tab=guides" className="group">
          <Card className="cursor-pointer group-hover:shadow-md transition-all h-full">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-display font-bold text-sm mb-1">{t("guides", { defaultValue: "Guides" })}</h3>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t("step_by_step", { defaultValue: "Step-by-step tutorials" })}</p>
          </Card>
        </a>

        <a href="/docs/api" className="group">
          <Card className="cursor-pointer group-hover:shadow-md transition-all h-full">
            <div className="text-3xl mb-2">🔌</div>
            <h3 className="font-display font-bold text-sm mb-1">{t("api", { defaultValue: "API Docs" })}</h3>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t("developers", { defaultValue: "For developers" })}</p>
          </Card>
        </a>
      </div>

      {/* Featured Guides */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4">{t("featured_guides", { defaultValue: "Featured Guides" })}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map((guide) => (
            <Card key={guide.title} className="cursor-pointer group hover:shadow-md transition-all">
              <div className="text-4xl mb-3">{guide.icon}</div>
              <h3 className="font-display font-bold mb-1">{guide.title}</h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">{guide.description}</p>
              <Button size="sm" variant="ghost">
                {t("read_more", { defaultValue: "Read More" })} →
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">{t("faqs_title", { defaultValue: "Frequently Asked Questions" })}</h2>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-display font-semibold transition-colors border ${
                selectedCategory === category
                  ? "bg-[rgb(var(--color-accent))] text-white border-[rgb(var(--color-accent))]"
                  : "border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-accent))]"
              }`}
            >
              {category === "all" ? "All" : category}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredFaqs.map((faq) => (
            <Card
              key={faq.id}
              className="cursor-pointer transition-all overflow-hidden"
              onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{faq.category}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-[rgb(var(--color-text-secondary))] transition-transform ${
                    expandedFaq === faq.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-4 border-t border-[rgb(var(--color-border))]">
                  <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-3">{faq.answer}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Support CTA */}
      <Card className="!p-6 bg-gradient-to-r from-[rgb(var(--color-accent-soft))] to-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))]">
        <div className="text-center">
          <h3 className="font-display text-xl font-bold mb-2">{"Didn't find what you're looking for?"}</h3>
          <p className="mb-4">{t("contact_us", { defaultValue: "Our support team is here to help" })}</p>
          <div className="flex gap-3 justify-center">
            <a href="mailto:support@dzcommerce.com" className="px-6 py-2 bg-white text-[rgb(var(--color-accent))] rounded-lg font-semibold hover:shadow-lg transition-all">
              {t("email_us", { defaultValue: "Email Us" })}
            </a>
            <Button className="!bg-white !text-[rgb(var(--color-accent))] hover:!bg-gray-100">
              {t("live_chat", { defaultValue: "Start Live Chat" })}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
