import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { prisma } from "./prisma";

/* ── Entity-to-service mapping ───────────────────────────────────── */

const ENTITY_SERVICE_MAP: Record<string, string> = {
  Customer: "Atlas Payments",
  PaymentIntent: "Atlas Payments",
  PaymentMethod: "Atlas Payments",
  SetupIntent: "Atlas Payments",
  Refund: "Atlas Payments",
  Balance: "Atlas Payments",
  LedgerEntry: "Atlas Payments",

  Product: "Atlas Billing",
  Price: "Atlas Billing",
  Coupon: "Atlas Billing",
  PromotionCode: "Atlas Billing",
  TaxRate: "Atlas Billing",
  Subscription: "Atlas Billing",
  Invoice: "Atlas Billing",
  InvoiceItem: "Atlas Billing",
  CreditNote: "Atlas Billing",
  CreditNoteLine: "Atlas Billing",

  RiskSignal: "Atlas Risk & Disputes",
  RiskRuleset: "Atlas Risk & Disputes",
  RiskRule: "Atlas Risk & Disputes",
  RiskDecision: "Atlas Risk & Disputes",
  RiskList: "Atlas Risk & Disputes",
  RiskListEntry: "Atlas Risk & Disputes",
  Dispute: "Atlas Risk & Disputes",
  DisputeEvidence: "Atlas Risk & Disputes",
  Representment: "Atlas Risk & Disputes",

  Transfer: "Atlas Treasury",
  Reserve: "Atlas Treasury",
  Hold: "Atlas Treasury",
  ReconSource: "Atlas Treasury",
  ReconPeriod: "Atlas Treasury",

  Org: "Atlas Platform",
  Team: "Atlas Platform",
  OnboardingProfile: "Atlas Platform",
  UnderwritingCase: "Atlas Platform",
  WebhookEndpoint: "Atlas Platform",
  WebhookDelivery: "Atlas Platform",
  Report: "Atlas Platform",
  Export: "Atlas Platform",
  ExportSchedule: "Atlas Platform",
  Job: "Atlas Platform",
  DeadLetter: "Atlas Platform",
};

const SERVICE_COLORS: Record<string, string> = {
  "Atlas Payments": "#ff6c37",
  "Atlas Billing": "#6366f1",
  "Atlas Risk & Disputes": "#ef4444",
  "Atlas Treasury": "#10b981",
  "Atlas Platform": "#8b5cf6",
};

export async function getDashboardStats() {
  const [
    customerCount,
    paymentIntentCount,
    refundCount,
    webhookEndpointCount,
    webhookDeliveryCount,
    capturedPayments,
    recentPayments,
    recentCustomers,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.paymentIntent.count(),
    prisma.refund.count(),
    prisma.webhookEndpoint.count(),
    prisma.webhookDelivery.count(),
    prisma.paymentIntent.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCEEDED" },
    }),
    prisma.paymentIntent.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    }),
    prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const deliveredWebhooks = await prisma.webhookDelivery.count({
    where: { status: "DELIVERED" },
  });

  const webhookSuccessRate =
    webhookDeliveryCount > 0
      ? Math.round((deliveredWebhooks / webhookDeliveryCount) * 100)
      : 100;

  return {
    customerCount,
    paymentIntentCount,
    refundCount,
    webhookEndpointCount,
    webhookDeliveryCount,
    totalCapturedCents: Number(capturedPayments._sum.amount ?? 0),
    webhookSuccessRate,
    recentPayments,
    recentCustomers,
  };
}

export async function getCustomers(page = 1, limit = 20) {
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { paymentIntents: true } } },
    }),
    prisma.customer.count(),
  ]);
  return { customers, total, pages: Math.ceil(total / limit) };
}

export async function getPayments(page = 1, limit = 20) {
  const [payments, total] = await Promise.all([
    prisma.paymentIntent.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    }),
    prisma.paymentIntent.count(),
  ]);
  return { payments, total, pages: Math.ceil(total / limit) };
}

export async function getRefunds(page = 1, limit = 20) {
  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        paymentIntent: {
          select: { id: true, amount: true, currency: true },
        },
      },
    }),
    prisma.refund.count(),
  ]);
  return { refunds, total, pages: Math.ceil(total / limit) };
}

export async function getBalance() {
  const accounts = await prisma.ledgerAccount.findMany({
    include: {
      lines: {
        where: { journalEntry: { status: "POSTED" } },
        select: { direction: true, amount: true },
      },
    },
  });

  const summary: Record<string, number> = {};
  for (const acct of accounts) {
    let balance = 0;
    for (const line of acct.lines) {
      balance += line.direction === "DEBIT" ? Number(line.amount) : -Number(line.amount);
    }
    summary[acct.code] = balance;
  }
  return summary;
}

export async function getWebhookEndpoints() {
  return prisma.webhookEndpoint.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deliveries: true } } },
  });
}

export async function getWebhookDeliveries(page = 1, limit = 20) {
  const [deliveries, total] = await Promise.all([
    prisma.webhookDelivery.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: { webhookEndpoint: { select: { url: true } } },
    }),
    prisma.webhookDelivery.count(),
  ]);
  return { deliveries, total, pages: Math.ceil(total / limit) };
}

/* ═══════════════════════════════════════════════════════════════════
   Activity Dashboard DAL
   ═══════════════════════════════════════════════════════════════════ */

export async function getActivityStats() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const oneHourAgo = new Date(now.getTime() - 3600_000);

  const [totalEvents, eventsToday, eventsThisHour, entityTypes] =
    await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.event.count({ where: { createdAt: { gte: oneHourAgo } } }),
      prisma.event.groupBy({ by: ["entityType"] }),
    ]);

  const serviceSet = new Set(
    entityTypes.map((e) => ENTITY_SERVICE_MAP[e.entityType] ?? "Other"),
  );

  return {
    totalEvents,
    eventsToday,
    eventsThisHour,
    activeEntityTypes: entityTypes.length,
    activeServices: serviceSet.size,
  };
}

export async function getEventTimeline(hours = 24) {
  const since = new Date(Date.now() - hours * 3600_000);

  const events = await prisma.event.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, entityType: true },
    orderBy: { createdAt: "asc" },
  });

  const buckets: Record<string, { hour: string; count: number; label: string }> = {};

  for (let i = 0; i < hours; i++) {
    const t = new Date(Date.now() - (hours - 1 - i) * 3600_000);
    const key = t.toISOString().slice(0, 13);
    buckets[key] = {
      hour: key,
      count: 0,
      label: t.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
    };
  }

  for (const ev of events) {
    const key = ev.createdAt.toISOString().slice(0, 13);
    if (buckets[key]) buckets[key].count++;
  }

  return Object.values(buckets);
}

export async function getServiceBreakdown() {
  const groups = await prisma.event.groupBy({
    by: ["entityType"],
    _count: { id: true },
  });

  const serviceMap: Record<
    string,
    { name: string; color: string; count: number; entityTypes: string[] }
  > = {};

  for (const svc of Object.values(SERVICE_COLORS)) {
    const name = Object.entries(SERVICE_COLORS).find(([, c]) => c === svc)?.[0];
    if (name) {
      serviceMap[name] = { name, color: svc, count: 0, entityTypes: [] };
    }
  }

  for (const g of groups) {
    const svcName = ENTITY_SERVICE_MAP[g.entityType] ?? "Other";
    if (!serviceMap[svcName]) {
      serviceMap[svcName] = {
        name: svcName,
        color: "#94a3b8",
        count: 0,
        entityTypes: [],
      };
    }
    serviceMap[svcName].count += g._count.id;
    serviceMap[svcName].entityTypes.push(g.entityType);
  }

  return Object.values(serviceMap).sort((a, b) => b.count - a.count);
}

export async function getRecentEvents(limit = 25) {
  const events = await prisma.event.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      entityType: true,
      entityId: true,
      merchantId: true,
      createdAt: true,
    },
  });

  return events.map((e) => ({
    ...e,
    service: ENTITY_SERVICE_MAP[e.entityType] ?? "Other",
    color: SERVICE_COLORS[ENTITY_SERVICE_MAP[e.entityType] ?? ""] ?? "#94a3b8",
  }));
}

export async function getEndpointCatalog() {
  let specData: {
    paths: Record<string, Record<string, { operationId?: string; tags?: string[]; summary?: string }>>;
    tags?: { name: string; description?: string }[];
  };

  try {
    const yaml = await import("yaml");
    const specPath = resolve(process.cwd(), "openapi", "openapi.yaml");
    specData = yaml.parse(readFileSync(specPath, "utf8"));
  } catch {
    return { operations: [], tagCounts: {} };
  }

  const operations: {
    method: string;
    path: string;
    operationId: string;
    tag: string;
    service: string;
    color: string;
    summary: string;
  }[] = [];

  const tagToService: Record<string, string> = {};
  try {
    const svcData = JSON.parse(
      readFileSync(resolve(process.cwd(), "scripts", "services.json"), "utf8"),
    );
    for (const svc of svcData.services) {
      for (const tag of svc.tags) {
        tagToService[tag] = svc.name;
      }
    }
  } catch {}

  for (const [path, item] of Object.entries(specData.paths ?? {})) {
    for (const method of ["get", "post", "patch", "put", "delete"]) {
      const op = item[method];
      if (!op) continue;
      const tag = op.tags?.[0] ?? "Other";
      const service = tagToService[tag] ?? "Other";
      operations.push({
        method: method.toUpperCase(),
        path,
        operationId: op.operationId ?? "",
        tag,
        service,
        color: SERVICE_COLORS[service] ?? "#94a3b8",
        summary: op.summary ?? "",
      });
    }
  }

  const tagCounts: Record<string, number> = {};
  for (const op of operations) {
    tagCounts[op.tag] = (tagCounts[op.tag] || 0) + 1;
  }

  return { operations, tagCounts };
}

/* ═══════════════════════════════════════════════════════════════════
   Estate-wide Dashboard DAL
   ═══════════════════════════════════════════════════════════════════ */

const WORKSPACE_REGISTRY = [
  {
    name: "Atlas Payments",
    slug: "payments",
    description: "Core payment processing — intents, captures, refunds, balance",
    color: "#ff6c37",
    workspaceId: "36dcb763-84e2-4a02-9cbf-0da2b17e7438",
    collectionUid: "51415493-6b6c6d8e-1046-4d8f-a597-e357a5fe0bad",
    envUid: "51415493-ce39bde3-a72e-48a5-b65c-2a97023e1cbf",
    ops: 37,
    tags: ["Ops", "Auth", "Customers", "PaymentMethods", "SetupIntents", "PaymentIntents", "Refunds", "Balances", "Ledger"],
  },
  {
    name: "Atlas Billing",
    slug: "billing",
    description: "Subscription billing — products, prices, coupons, invoices",
    color: "#6366f1",
    workspaceId: "77c06e4d-ef42-4659-8ade-0b146df14573",
    collectionUid: "51415493-1240b313-37e4-42a8-a54f-26082118c15b",
    envUid: "51415493-cc04c89b-2bff-4805-913e-f522b29fadaa",
    ops: 64,
    tags: ["Products", "Prices", "Coupons", "PromoCodes", "TaxRates", "Subscriptions", "Invoices", "InvoiceItems", "CreditNotes"],
  },
  {
    name: "Atlas Risk & Disputes",
    slug: "risk",
    description: "Risk engine, fraud signals, dispute management",
    color: "#ef4444",
    workspaceId: "872c0588-477b-472b-8782-da47e22647de",
    collectionUid: "51415493-bad4c188-37de-4781-8340-3873c3487af0",
    envUid: "51415493-e613a6c9-e57f-4606-ace8-228bd5403782",
    ops: 39,
    tags: ["RiskSignals", "RiskRules", "RiskDecisions", "RiskReviews", "Disputes", "DisputeEvidence", "Representment"],
  },
  {
    name: "Atlas Treasury",
    slug: "treasury",
    description: "Transfers, reserves, holds, reconciliation",
    color: "#10b981",
    workspaceId: "d2ab189f-83c4-4a39-bd5d-a035e75e0788",
    collectionUid: "51415493-265480de-c3af-45ad-8ca2-ace697338403",
    envUid: "51415493-02e34be3-eb51-4314-885e-e09faffa1cd1",
    ops: 36,
    tags: ["Transfers", "Reserves", "Reconciliation"],
  },
  {
    name: "Atlas Platform",
    slug: "platform",
    description: "Orgs, onboarding, webhooks, events, reports, cron jobs",
    color: "#8b5cf6",
    workspaceId: "16d351b5-69d0-446c-b37f-f989ae5bff81",
    collectionUid: "51415493-9cd4c25d-02e3-4b44-9e13-8aad6b450598",
    envUid: "51415493-05aee230-bf54-477d-84d3-5c8262686f1e",
    ops: 98,
    tags: ["Orgs", "Teams", "Onboarding", "Underwriting", "Events", "Webhooks", "Reports", "Exports", "Cron"],
  },
];

const FULL_WORKSPACE = {
  name: "AtlasPayments Full API",
  workspaceId: "f931037d-9b28-4c1f-bdda-b4be0a1cd96a",
  collectionUid: "51415493-375d83b9-7226-4544-b324-2a44f653efc8",
  envUid: "51415493-a61a8f6a-ad25-4dfe-9ab2-7a4e0e253306",
};

export async function getEstateOverview() {
  const [
    customerCount,
    paymentIntentCount,
    refundCount,
    subscriptionCount,
    invoiceCount,
    productCount,
    disputeCount,
    transferCount,
    reserveCount,
    holdCount,
    orgCount,
    eventCount,
    webhookEndpointCount,
    reportCount,
    exportCount,
    riskSignalCount,
    riskDecisionCount,
    creditNoteCount,
    capturedPayments,
    eventsToday,
    recentEvents,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.paymentIntent.count(),
    prisma.refund.count(),
    prisma.subscription.count(),
    prisma.invoice.count(),
    prisma.product.count(),
    prisma.dispute.count(),
    prisma.transfer.count(),
    prisma.reserve.count(),
    prisma.hold.count(),
    prisma.org.count(),
    prisma.event.count(),
    prisma.webhookEndpoint.count(),
    prisma.report.count(),
    prisma.export.count(),
    prisma.riskSignal.count(),
    prisma.riskDecision.count(),
    prisma.creditNote.count(),
    prisma.paymentIntent.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED" } }),
    prisma.event.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.event.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      select: { id: true, type: true, entityType: true, entityId: true, createdAt: true },
    }),
  ]);

  const serviceEntityCounts: Record<string, { label: string; count: number }[]> = {
    "Atlas Payments": [
      { label: "Customers", count: customerCount },
      { label: "Payment Intents", count: paymentIntentCount },
      { label: "Refunds", count: refundCount },
    ],
    "Atlas Billing": [
      { label: "Products", count: productCount },
      { label: "Subscriptions", count: subscriptionCount },
      { label: "Invoices", count: invoiceCount },
      { label: "Credit Notes", count: creditNoteCount },
    ],
    "Atlas Risk & Disputes": [
      { label: "Risk Signals", count: riskSignalCount },
      { label: "Risk Decisions", count: riskDecisionCount },
      { label: "Disputes", count: disputeCount },
    ],
    "Atlas Treasury": [
      { label: "Transfers", count: transferCount },
      { label: "Reserves", count: reserveCount },
      { label: "Holds", count: holdCount },
    ],
    "Atlas Platform": [
      { label: "Orgs", count: orgCount },
      { label: "Events", count: eventCount },
      { label: "Webhooks", count: webhookEndpointCount },
      { label: "Reports", count: reportCount },
      { label: "Exports", count: exportCount },
    ],
  };

  const totalEntities = customerCount + paymentIntentCount + refundCount +
    subscriptionCount + invoiceCount + productCount + disputeCount +
    transferCount + reserveCount + holdCount + orgCount + reportCount +
    exportCount + riskSignalCount + riskDecisionCount + creditNoteCount;

  return {
    workspaces: WORKSPACE_REGISTRY,
    fullWorkspace: FULL_WORKSPACE,
    totalEndpoints: 272,
    totalWorkspaces: WORKSPACE_REGISTRY.length,
    totalEntities,
    totalCapturedCents: Number(capturedPayments._sum.amount ?? 0),
    eventCount,
    eventsToday,
    serviceEntityCounts,
    recentEvents: recentEvents.map((e) => ({
      ...e,
      service: ENTITY_SERVICE_MAP[e.entityType] ?? "Other",
      color: SERVICE_COLORS[ENTITY_SERVICE_MAP[e.entityType] ?? ""] ?? "#94a3b8",
    })),
  };
}

export { SERVICE_COLORS, ENTITY_SERVICE_MAP };
