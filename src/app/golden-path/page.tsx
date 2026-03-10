import {
  Route,
  GitBranch,
  FileText,
  Shield,
  TestTube2,
  Rocket,
  Eye,
  Bot,
  Terminal,
  Network,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { PageHeader, Badge } from "@/components/ui";

const POSTMAN_ORANGE = "text-accent";

function Step({
  number,
  title,
  description,
  icon,
  tools,
  command,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tools: string[];
  command?: string;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-sm">
          {number}
        </div>
        <div className="mt-2 w-px flex-1 bg-card-border" />
      </div>

      <div className="pb-8">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <p className="mt-1 text-sm text-muted">{description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tools.map((t) => (
            <Badge key={t} variant="info">
              {t}
            </Badge>
          ))}
        </div>
        {command && (
          <div className="mt-2 rounded-lg bg-sidebar-bg px-3 py-2">
            <code className="font-mono text-xs text-sidebar-fg/80">
              {command}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoldenPathPage() {
  return (
    <>
      <PageHeader
        title="The Golden Path"
        description="How Postman is baked into every stage of the API lifecycle — saving dev time and preventing rollbacks"
      />

      <div className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-6">
        <div className="flex items-center gap-3">
          <Route className={`h-6 w-6 ${POSTMAN_ORANGE}`} />
          <div>
            <h2 className="text-lg font-semibold">
              One Repo · One Workspace · One Service
            </h2>
            <p className="mt-1 text-sm text-muted">
              Postman&apos;s enterprise principle: your Git repository, your
              Postman workspace, and your deployed service are a unified system.
              The OpenAPI spec is the single source of truth that flows through
              every stage.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold">
            CI/CD Pipeline with Postman Baked In
          </h2>

          <Step
            number={1}
            title="Design in Spec Hub"
            description="Developers design the API contract in Postman Spec Hub or edit openapi/openapi.yaml directly. The spec is the starting point — not an afterthought."
            icon={<FileText className={`h-4 w-4 ${POSTMAN_ORANGE}`} />}
            tools={["Spec Hub", "OpenAPI 3.1", "Postman Editor"]}
          />
          <Step
            number={2}
            title="Push to Git"
            description="A pull request triggers the CI pipeline. The spec is validated and linted before any code review begins."
            icon={<GitBranch className="h-4 w-4 text-foreground" />}
            tools={["GitHub Actions", "Git"]}
            command="git push origin feature/add-subscriptions"
          />
          <Step
            number={3}
            title="OpenAPI Governance Gate"
            description="Automated governance checks enforce team standards: unique operationIds, required tags, security schemes per path prefix, Spectral lint rules, and x-platform extensions."
            icon={<Shield className={`h-4 w-4 ${POSTMAN_ORANGE}`} />}
            tools={["pnpm openapi:validate", "pnpm openapi:lint", "Spectral", "Postman API Governance"]}
            command="pnpm openapi:validate && pnpm openapi:lint"
          />
          <Step
            number={4}
            title="Postman CLI Collection Tests"
            description="The Postman CLI runs the generated collection as integration tests in CI. This catches contract drift, broken endpoints, and regressions before merge."
            icon={<Terminal className={`h-4 w-4 ${POSTMAN_ORANGE}`} />}
            tools={["Postman CLI", "Newman", "Collection Runner"]}
            command="postman collection run postman/AtlasPayments.postman_collection.json -e postman/AtlasPayments.postman_environment.json"
          />
          <Step
            number={5}
            title="Application Tests"
            description="Unit and integration tests run against a real PostgreSQL instance. Vitest validates business logic, ledger invariants, webhook delivery, idempotency, and rate limiting."
            icon={<TestTube2 className="h-4 w-4 text-foreground" />}
            tools={["Vitest", "PostgreSQL", "Prisma"]}
            command="pnpm test"
          />
          <Step
            number={6}
            title="Spec Hub Auto-Sync"
            description="On merge to main, the workflow pushes the updated spec to Postman Spec Hub via the v12 Specs API. Collections and environments regenerate automatically."
            icon={<Rocket className={`h-4 w-4 ${POSTMAN_ORANGE}`} />}
            tools={["Postman Specs API", "Spec Hub Sync", "Collection Generation"]}
          />
          <Step
            number={7}
            title="Deploy to Production"
            description="Vercel automatically deploys the service. Prisma migrations run. The deployed API matches the spec exactly — no drift possible."
            icon={<Rocket className="h-4 w-4 text-success" />}
            tools={["Vercel", "Prisma Migrate", "PostgreSQL (Neon)"]}
          />
          <Step
            number={8}
            title="Private API Network"
            description="The API is published to Postman's Private API Network, where internal teams and AI agents can discover it. The generated collection serves as living documentation."
            icon={<Network className={`h-4 w-4 ${POSTMAN_ORANGE}`} />}
            tools={["Private API Network", "API Discovery", "Agent Mode"]}
          />
          <Step
            number={9}
            title="Monitor & Observe"
            description="Postman Monitors run the collection on a schedule to detect regressions in production. Webhook health, latency, and error rates are visible in the dashboard."
            icon={<Eye className={`h-4 w-4 ${POSTMAN_ORANGE}`} />}
            tools={["Postman Monitors", "Dashboard", "Alerts"]}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <h3 className="mb-3 text-sm font-semibold">Enterprise Value</h3>
            <ul className="space-y-3 text-xs text-muted">
              {[
                "Eliminate spec-to-code drift with CI governance gates",
                "Reduce rollbacks by catching breaking changes pre-merge",
                "Postman CLI tests run in the same pipeline as unit tests",
                "Collections auto-generated from spec — zero manual maintenance",
                "Private API Network enables AI agent discovery",
                "One workspace per service = clear ownership",
                "Developers spend time building, not debugging integration issues",
              ].map((v, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Bot className={`h-5 w-5 ${POSTMAN_ORANGE}`} />
              <h3 className="text-sm font-semibold">Agent Mode</h3>
            </div>
            <p className="text-xs text-muted">
              Postman Agent Mode can discover this API on the Private API
              Network, understand its spec, generate requests, and run test
              flows — all without human intervention. Agents become API consumers
              alongside developers.
            </p>
          </div>

          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <div className="mb-2 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-foreground" />
              <h3 className="text-sm font-semibold">Postman CLI</h3>
            </div>
            <div className="space-y-2 text-xs text-muted">
              <p>Run collections from your terminal or CI pipeline:</p>
              <div className="rounded-lg bg-sidebar-bg px-3 py-2">
                <code className="font-mono text-sidebar-fg/80">
                  postman login --with-api-key $KEY
                </code>
              </div>
              <div className="rounded-lg bg-sidebar-bg px-3 py-2">
                <code className="font-mono text-sidebar-fg/80">
                  postman collection run &lt;id&gt;
                </code>
              </div>
              <div className="rounded-lg bg-sidebar-bg px-3 py-2">
                <code className="font-mono text-sidebar-fg/80">
                  postman api lint --spec openapi.yaml
                </code>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <h3 className="mb-3 text-sm font-semibold">Flow Summary</h3>
            <div className="space-y-2 text-xs">
              {[
                ["Spec Hub", "Git Repo"],
                ["Git Repo", "CI Pipeline"],
                ["CI Pipeline", "Governance + Tests"],
                ["Governance + Tests", "Deploy"],
                ["Deploy", "Private API Network"],
                ["Private API Network", "Agents + Devs"],
              ].map(([from, to], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="rounded bg-muted-bg px-2 py-0.5 font-medium">
                    {from}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted" />
                  <span className="rounded bg-muted-bg px-2 py-0.5 font-medium">
                    {to}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
