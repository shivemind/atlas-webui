"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Users,
  CreditCard,
  RotateCcw,
  Webhook,
  Wallet,
  Activity,
  Route,
  BookOpen,
  Zap,
  Shield,
  Eye,
  Bot,
  Search,
  ShieldAlert,
} from "lucide-react";

const nav = [
  { label: "Estate", href: "/", icon: Globe },
  { label: "Activity", href: "/activity", icon: Zap },
  { label: "Governance", href: "/governance", icon: Shield },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Refunds", href: "/refunds", icon: RotateCcw },
  { label: "Balance", href: "/balance", icon: Wallet },
  { label: "Webhooks", href: "/webhooks", icon: Webhook },
  { label: "API Health", href: "/api-health", icon: Activity },
  { label: "Golden Path", href: "/golden-path", icon: Route },
  { label: "API Docs", href: "/api-docs", icon: BookOpen },
];

const echoatlasNav = [
  { label: "Overview", href: "/dashboard/echoatlas", icon: Eye },
  { label: "Agents", href: "/dashboard/echoatlas/agents", icon: Bot },
  { label: "Queries", href: "/dashboard/echoatlas/queries", icon: Search },
  { label: "Underground", href: "/dashboard/echoatlas/underground", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar-bg text-sidebar-fg">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-white text-sm">
          AP
        </div>
        <div>
          <div className="text-sm font-semibold text-white">AtlasPayments</div>
          <div className="text-xs text-sidebar-fg/50">Sandbox</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <ul className="space-y-1">
          {nav.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-sidebar-fg/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 mb-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-fg/40">
            EchoAtlas
          </span>
        </div>
        <ul className="space-y-1">
          {echoatlasNav.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard/echoatlas"
                ? pathname === "/dashboard/echoatlas"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-cyan-500/15 text-cyan-400"
                      : "text-sidebar-fg/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-sidebar-fg/60">
            Postman Spec Hub synced
          </span>
        </div>
      </div>
    </aside>
  );
}
