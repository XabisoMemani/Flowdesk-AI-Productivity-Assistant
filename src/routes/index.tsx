import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import {
  Mail,
  ListChecks,
  Sparkles,
  Copy,
  Check,
  Sun,
  Moon,
  Loader2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";

import { useTheme } from "@/hooks/use-theme";
import {
  generateEmail,
  planTasks,
  researchAnalyze,
  type PlanItem,
  type ResearchResult,
} from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flowdesk — AI assistant for busy professionals" },
      {
        name: "description",
        content:
          "Draft polished emails, plan your day, and summarize any article — all with one AI workspace.",
      },
    ],
  }),
  component: FlowdeskApp,
});

type TabId = "email" | "planner" | "research";

const NAV: { id: TabId; label: string; icon: typeof Mail; hint: string }[] = [
  { id: "email", label: "Email Generator", icon: Mail, hint: "Draft professional emails" },
  { id: "planner", label: "Task Planner", icon: ListChecks, hint: "Prioritize your day" },
  { id: "research", label: "Research Assistant", icon: Sparkles, hint: "Summarize any content" },
];

function FlowdeskApp() {
  const [active, setActive] = useState<TabId>("email");
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-right" />

      {/* Ambient warm gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(1200px 600px at 90% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 60%), radial-gradient(900px 500px at -10% 20%, color-mix(in oklab, var(--primary) 6%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-72 border-b lg:border-b-0 lg:border-r border-border/60 backdrop-blur-sm">
          <div className="flex h-full flex-col p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Flowdesk</h1>
                <p className="text-xs text-muted-foreground">AI workspace</p>
              </div>
            </div>

            <nav className="mt-8 flex flex-row gap-2 lg:flex-col">
              {NAV.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={cn(
                      "group flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all lg:flex-none",
                      isActive
                        ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="hidden flex-col lg:flex">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                    <span className="font-medium lg:hidden">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto hidden lg:block">
              <div className="rounded-2xl border border-border/70 bg-card/60 p-4 text-xs leading-relaxed text-muted-foreground">
                Powered by AI. Review any generated content before sending or acting on it.
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-6 py-8 md:px-10 md:py-10">
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">
                {NAV.find((n) => n.id === active)?.hint}
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
                {NAV.find((n) => n.id === active)?.label}
              </h2>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-10 w-10 rounded-full border-border/70 bg-card/70"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </header>

          <section>
            {active === "email" && <EmailPanel />}
            {active === "planner" && <PlannerPanel />}
            {active === "research" && <ResearchPanel />}
          </section>

          <footer className="mt-16 border-t border-border/60 pt-6 text-xs text-muted-foreground">
            Flowdesk uses AI models to generate content. Always review AI-generated output for
            accuracy, tone, and appropriateness before using it.
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ---------- Feature 1: Email Generator ---------- */

function EmailPanel() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("client");
  const [tone, setTone] = useState("formal");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useServerFn(generateEmail);
  const mutation = useMutation({
    mutationFn: () => generate({ data: { purpose, recipient, tone } }),
    onSuccess: (d) => setResult(d.content),
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2 border-border/70 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Compose</CardTitle>
          <CardDescription>Describe the email and Flowdesk will draft it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="e.g. Follow up on our meeting last Tuesday and propose next steps"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-28 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || purpose.trim().length < 3}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting…</>
            ) : (
              <>Generate email</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Draft</CardTitle>
            <CardDescription>Edit freely, then copy to your email client.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!result}
            onClick={copy}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="Your generated email will appear here…"
            className="min-h-[380px] resize-none bg-background/60 font-mono text-sm leading-relaxed"
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Feature 2: Task Planner ---------- */

function PlannerPanel() {
  const [tasks, setTasks] = useState("");
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [done, setDone] = useState<Record<number, boolean>>({});

  const runPlan = useServerFn(planTasks);
  const mutation = useMutation({
    mutationFn: () => runPlan({ data: { tasks } }),
    onSuccess: (d) => {
      setPlan(d.items);
      setDone({});
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const priorityStyles: Record<PlanItem["priority"], string> = {
    High: "bg-primary/12 text-primary ring-1 ring-primary/20",
    Medium: "bg-accent text-accent-foreground ring-1 ring-border/70",
    Low: "bg-muted text-muted-foreground ring-1 ring-border/60",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2 border-border/70 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Your tasks</CardTitle>
          <CardDescription>
            List tasks and rough deadlines. One per line works best.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Textarea
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            placeholder={"Finish investor deck — Friday\nReply to Sarah about contract\nGym — this week\nPrep interview questions — Wed"}
            className="min-h-[240px] resize-none"
          />
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || tasks.trim().length < 3}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Prioritizing…</>
            ) : (
              <>Build my plan</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-border/70 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Prioritized plan</CardTitle>
          <CardDescription>Sorted by urgency and importance.</CardDescription>
        </CardHeader>
        <CardContent>
          {plan.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-background/40 py-16 text-center text-sm text-muted-foreground">
              Your plan will appear here.
            </div>
          ) : (
            <ul className="space-y-3">
              {plan.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-xl border border-border/60 bg-background/60 p-4 transition-shadow hover:shadow-sm"
                >
                  <Checkbox
                    checked={!!done[i]}
                    onCheckedChange={(v) => setDone((s) => ({ ...s, [i]: !!v }))}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          done[i] && "text-muted-foreground line-through",
                        )}
                      >
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          priorityStyles[item.priority],
                        )}
                      >
                        {item.priority}
                      </span>
                      {item.deadline && (
                        <span className="text-xs text-muted-foreground">· {item.deadline}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Feature 3: Research Assistant ---------- */

function ResearchPanel() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);

  const run = useServerFn(researchAnalyze);
  const mutation = useMutation({
    mutationFn: () => run({ data: { text } }),
    onSuccess: (d) => setResult(d),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2 border-border/70 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Paste content</CardTitle>
          <CardDescription>An article, job posting, or your notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text here (min 20 characters)…"
            className="min-h-[280px] resize-none"
          />
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || text.trim().length < 20}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>
            ) : (
              <>Summarize & extract insights</>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 space-y-6">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <p className="text-sm leading-relaxed text-foreground/90">{result.summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">A concise summary will appear here.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Key insights</CardTitle>
            <CardDescription>The 3–5 most important takeaways.</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <ul className="space-y-3">
                {result.insights.map((ins, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-xl border border-border/60 bg-background/60 p-3.5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{ins}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Insights will appear here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}