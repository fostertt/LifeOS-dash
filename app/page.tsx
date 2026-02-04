"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Suspense } from "react";

// Navigation card data
interface NavCard {
  title: string;
  href: string;
  description: string;
  status?: "active" | "soon" | "future";
  badge?: string;
}

const navigationCards: NavCard[] = [
  {
    title: "Projects",
    href: "/projects",
    description: "Manage your projects and goals",
    status: "soon",
    badge: "Coming in Phase 5"
  },
  {
    title: "All",
    href: "/all",
    description: "View all tasks, habits, and reminders",
    status: "active"
  },
  {
    title: "Calendar",
    href: "/calendar",
    description: "Day, week, and month views",
    status: "active"
  },
  {
    title: "Vault",
    href: "/vault",
    description: "Notes, lists, and research clips",
    status: "active"
  },
  {
    title: "Recipes",
    href: "/recipes",
    description: "Meal planning and recipes",
    status: "soon",
    badge: "Coming in Phase 4"
  },
  {
    title: "Docs",
    href: "/docs",
    description: "Documents and knowledge base",
    status: "future",
    badge: "Future"
  }
];

function HomeContent() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    return null;
  }

  const handleCardClick = (card: NavCard) => {
    if (card.status === "active") {
      router.push(card.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Header />

          {/* Navigation cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {navigationCards.map((card) => (
              <button
                key={card.title}
                onClick={() => handleCardClick(card)}
                disabled={card.status !== "active"}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${
                    card.status === "active"
                      ? "bg-white border-gray-200 hover:border-purple-400 hover:shadow-lg cursor-pointer"
                      : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                  }
                  text-left
                `}
              >
                {/* Badge for coming soon/future */}
                {card.badge && (
                  <div className="absolute top-3 right-3">
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${card.status === "soon" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}
                    `}>
                      {card.badge}
                    </span>
                  </div>
                )}

                {/* Card title */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {card.title}
                </h2>

                {/* Card description */}
                <p className="text-sm md:text-base text-gray-600">
                  {card.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
