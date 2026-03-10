import { BookOpen, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export default async function ApiDocsPage() {
  const specPath = join(process.cwd(), "openapi", "openapi.yaml");
  let specContent: string;
  try {
    specContent = await readFile(specPath, "utf-8");
  } catch {
    specContent = "# Unable to load spec";
  }

  const lines = specContent.split("\n");
  const pathLines = lines.reduce<string[]>((acc, line) => {
    if (/^\s{2}\/api\//.test(line)) {
      acc.push(line.trim().replace(/:$/, ""));
    }
    return acc;
  }, []);

  const tags = new Set<string>();
  let inTags = false;
  for (const line of lines) {
    if (/^tags:/.test(line)) {
      inTags = true;
      continue;
    }
    if (inTags && /^\s+-\s+name:/.test(line)) {
      tags.add(line.replace(/^\s+-\s+name:\s*/, "").trim());
    }
    if (inTags && /^\S/.test(line) && !/^tags:/.test(line)) {
      inTags = false;
    }
  }

  return (
    <>
      <PageHeader
        title="API Documentation"
        description="OpenAPI spec overview — the single source of truth"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">
            Endpoints ({pathLines.length} paths)
          </h2>
          <div className="rounded-xl border border-card-border bg-card-bg p-4 shadow-sm">
            <div className="space-y-1 font-mono text-xs">
              {pathLines.map((p, i) => (
                <div key={i} className="rounded px-2 py-1 hover:bg-muted-bg">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold">Tags / Folders</h2>
            <div className="flex flex-wrap gap-1.5">
              {[...tags].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent ring-1 ring-inset ring-accent/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Spec File</h2>
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted" />
                <code className="text-xs">openapi/openapi.yaml</code>
              </div>
              <p className="mt-2 text-xs text-muted">
                OpenAPI 3.1 — {lines.length} lines
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Postman Spec Hub</h2>
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <p className="text-xs text-muted">
                The spec auto-syncs to Postman Spec Hub on every push to{" "}
                <code className="rounded bg-muted-bg px-1">main</code>.
                Collections and environments are generated from the spec.
              </p>
              <a
                href="https://postman.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                Open in Postman <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">Spec Preview (first 100 lines)</h2>
      <div className="rounded-xl border border-card-border bg-sidebar-bg p-4 shadow-sm">
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-sidebar-fg/80">
          {lines.slice(0, 100).join("\n")}
        </pre>
      </div>
    </>
  );
}
