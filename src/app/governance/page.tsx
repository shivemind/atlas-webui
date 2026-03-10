import { Shield, Terminal, Fingerprint } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { CopyButton, EndpointRunner, WorkspaceCard } from "@/components/governance-runner";

export const dynamic = "force-dynamic";

const BASE_URL = "";

const WORKSPACES = [
  {
    name: "Atlas Payments",
    ops: 37,
    workspaceId: "36dcb763-84e2-4a02-9cbf-0da2b17e7438",
    collectionUid: "51415493-6b6c6d8e-1046-4d8f-a597-e357a5fe0bad",
    envUid: "51415493-ce39bde3-a72e-48a5-b65c-2a97023e1cbf",
    color: "#ff6c37",
  },
  {
    name: "Atlas Billing",
    ops: 64,
    workspaceId: "77c06e4d-ef42-4659-8ade-0b146df14573",
    collectionUid: "51415493-1240b313-37e4-42a8-a54f-26082118c15b",
    envUid: "51415493-cc04c89b-2bff-4805-913e-f522b29fadaa",
    color: "#6366f1",
  },
  {
    name: "Atlas Risk & Disputes",
    ops: 39,
    workspaceId: "872c0588-477b-472b-8782-da47e22647de",
    collectionUid: "51415493-bad4c188-37de-4781-8340-3873c3487af0",
    envUid: "51415493-e613a6c9-e57f-4606-ace8-228bd5403782",
    color: "#ef4444",
  },
  {
    name: "Atlas Treasury",
    ops: 36,
    workspaceId: "d2ab189f-83c4-4a39-bd5d-a035e75e0788",
    collectionUid: "51415493-265480de-c3af-45ad-8ca2-ace697338403",
    envUid: "51415493-02e34be3-eb51-4314-885e-e09faffa1cd1",
    color: "#10b981",
  },
  {
    name: "Atlas Platform",
    ops: 98,
    workspaceId: "16d351b5-69d0-446c-b37f-f989ae5bff81",
    collectionUid: "51415493-9cd4c25d-02e3-4b44-9e13-8aad6b450598",
    envUid: "51415493-05aee230-bf54-477d-84d3-5c8262686f1e",
    color: "#8b5cf6",
  },
];

const FULL_COLLECTION = "51415493-375d83b9-7226-4544-b324-2a44f653efc8";
const FULL_ENV = "51415493-a61a8f6a-ad25-4dfe-9ab2-7a4e0e253306";
const FULL_WORKSPACE = "f931037d-9b28-4c1f-bdda-b4be0a1cd96a";
const FULL_CLI = `postman collection run ${FULL_COLLECTION} \\
  -e ${FULL_ENV} \\
  --reporters cli,json`;
const FULL_CLI_COPY = `postman collection run ${FULL_COLLECTION} -e ${FULL_ENV} --reporters cli,json`;

export default function GovernancePage() {
  return (
    <>
      <PageHeader
        title="API Governance"
        description="Run, test, and govern 272 endpoints across 5 services — from the CLI or directly in the browser"
      />

      {/* Full API CLI Command */}
      <div className="mb-8 rounded-xl border border-card-border bg-card-bg p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Run All 272 Endpoints</h2>
            <p className="text-xs text-muted">
              Postman CLI command — use as CI/CD gate or from your terminal
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-slate-900 p-4">
          <div className="flex items-start justify-between gap-4">
            <pre className="overflow-x-auto text-sm leading-relaxed text-slate-300">
              <code>{FULL_CLI}</code>
            </pre>
            <CopyButton text={FULL_CLI_COPY} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={`https://go.postman.co/workspace/${FULL_WORKSPACE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Fingerprint className="h-4 w-4" />
            Open Full API in Postman
          </a>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>Collection: <code className="font-mono">{FULL_COLLECTION.slice(0, 20)}...</code></span>
            <span>Environment: <code className="font-mono">{FULL_ENV.slice(0, 20)}...</code></span>
          </div>
        </div>
      </div>

      {/* Live Health Check */}
      <div className="mb-8 rounded-xl border border-card-border bg-card-bg p-6 shadow-sm">
        <EndpointRunner baseUrl={BASE_URL} />
      </div>

      {/* Per-Service Workspaces */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Service Workspaces</h2>
          <p className="text-xs text-muted">
            Each service has its own workspace, collection with assertions, and environment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {WORKSPACES.map((ws) => (
          <WorkspaceCard key={ws.workspaceId} {...ws} />
        ))}
      </div>
    </>
  );
}
