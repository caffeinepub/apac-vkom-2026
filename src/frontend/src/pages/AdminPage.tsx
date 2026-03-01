import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAssignUserRole,
  useGetAdminStats,
  useGetRegistrations,
  useGetRegistrationsCsv,
  useInitializeCourses,
  useIsCallerAdmin,
  useSelfGrantAdmin,
} from "../hooks/useQueries";

interface Props {
  onNavigateHome: () => void;
}

export default function AdminPage({ onNavigateHome }: Props) {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  if (isInitializing || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AdminHeader
          onNavigateHome={onNavigateHome}
          onLogout={clear}
          isLoggedIn={false}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm w-full text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "oklch(var(--primary) / 0.1)" }}
            >
              <ShieldCheck
                className="w-8 h-8"
                style={{ color: "oklch(var(--primary))" }}
              />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Sign in with Internet Identity to access the admin panel.
            </p>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full font-display font-semibold gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const principalId = identity?.getPrincipal().toText() ?? "";
    return (
      <AccessDeniedScreen
        principalId={principalId}
        onNavigateHome={onNavigateHome}
        onLogout={clear}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader
        onNavigateHome={onNavigateHome}
        onLogout={clear}
        isLoggedIn
      />
      <AdminDashboard />
    </div>
  );
}

function AccessDeniedScreen({
  principalId,
  onNavigateHome,
  onLogout,
}: {
  principalId: string;
  onNavigateHome: () => void;
  onLogout: () => void;
}) {
  const selfGrantAdmin = useSelfGrantAdmin();

  const handleGrantAdmin = async () => {
    try {
      const success = await selfGrantAdmin.mutateAsync("APACVKOM2026ADMIN");
      if (success) {
        toast.success("Admin access granted! Refreshing...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Failed to grant admin access. Invalid secret.");
      }
    } catch {
      toast.error("Failed to grant admin access. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader
        onNavigateHome={onNavigateHome}
        onLogout={onLogout}
        isLoggedIn
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your account does not have admin privileges.
          </p>
          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Your Principal ID
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono break-all text-foreground flex-1">
                {principalId}
              </code>
              <button
                type="button"
                className="shrink-0 text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                onClick={() => {
                  navigator.clipboard.writeText(principalId);
                }}
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this ID with your app administrator to get access.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleGrantAdmin}
              disabled={selfGrantAdmin.isPending}
              className="w-full gap-2 font-semibold"
            >
              {selfGrantAdmin.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Granting Access...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Grant Admin Access
                </>
              )}
            </Button>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onNavigateHome}>
                Go Home
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AdminHeader({
  onNavigateHome,
  onLogout,
  isLoggedIn,
}: {
  onNavigateHome: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}) {
  return (
    <header className="bg-navy border-b border-white/10 sticky top-0 z-40">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-md bg-gold flex items-center justify-center">
              <span className="text-xs font-display font-bold text-navy-dark">
                V
              </span>
            </div>
            <span className="font-display text-white font-semibold text-sm tracking-wide group-hover:text-white/80 transition-colors">
              APAC VKOM 2026
            </span>
          </button>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Admin Panel
          </div>
        </div>
        {isLoggedIn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5 text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </Button>
        )}
      </div>
    </header>
  );
}

function AdminDashboard() {
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetAdminStats();
  const {
    data: registrations = [],
    isLoading: regsLoading,
    refetch: refetchRegs,
  } = useGetRegistrations();
  const initMutation = useInitializeCourses();
  const csvMutation = useGetRegistrationsCsv();
  const assignRoleMutation = useAssignUserRole();

  const [principalInput, setPrincipalInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>(UserRole.admin);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Auto-initialize courses when stats load and courses are empty
  // This handles post-deployment data wipe (non-stable Motoko state)
  const autoInitRef = useRef(false);
  useEffect(() => {
    if (
      !statsLoading &&
      stats &&
      stats.courseStats.length === 0 &&
      !autoInitRef.current &&
      !initMutation.isPending
    ) {
      autoInitRef.current = true;
      initMutation
        .mutateAsync()
        .then(() => {
          toast.success("Sessions loaded successfully.");
          refetchStats();
        })
        .catch(() => {
          toast.error(
            "Could not auto-load sessions. Click 'Initialize Courses' to retry.",
          );
        });
    }
  }, [statsLoading, stats, initMutation, refetchStats]);

  const handleDownloadCsv = async () => {
    try {
      const csv = await csvMutation.mutateAsync();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `apac-vkom-registrations-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded successfully");
    } catch {
      toast.error("Failed to download CSV");
    }
  };

  const handleInitCourses = async () => {
    try {
      await initMutation.mutateAsync();
      toast.success("Courses initialized successfully");
    } catch {
      toast.error("Failed to initialize courses");
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalRegs = stats ? Number(stats.totalRegistrations) : 0;

  return (
    <main className="container py-8 space-y-8">
      {/* Page title + actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            APAC VKOM 2026 · Enrollment Management
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInitCourses}
            disabled={initMutation.isPending}
            className="gap-1.5"
          >
            {initMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BookOpen className="w-3.5 h-3.5" />
            )}
            Initialize Courses
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchStats();
              refetchRegs();
            }}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadCsv}
            disabled={csvMutation.isPending}
            className="gap-1.5"
          >
            {csvMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Download CSV
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Registrations"
          value={statsLoading ? "—" : String(totalRegs)}
          icon={<Users className="w-5 h-5" />}
          color="oklch(var(--primary))"
        />
        <StatCard
          title="Courses Available"
          value={statsLoading ? "—" : String(stats?.courseStats.length ?? 0)}
          icon={<BookOpen className="w-5 h-5" />}
          color="oklch(0.5 0.14 145)"
        />
        <StatCard
          title="Avg Sessions/Registration"
          value={
            statsLoading || registrations.length === 0
              ? "—"
              : (
                  registrations.reduce(
                    (sum, r) => sum + r.courseIds.length,
                    0,
                  ) / registrations.length
                ).toFixed(1)
          }
          icon={<LayoutDashboard className="w-5 h-5" />}
          color="oklch(var(--gold))"
        />
      </div>

      {/* Course enrollment table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base font-display">
            Course Enrollment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">
                      Course Title
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Capacity
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Enrolled
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Remaining
                    </TableHead>
                    <TableHead className="font-semibold min-w-[120px]">
                      Fill Rate
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats?.courseStats ?? []).map(
                    ([id, title, capacity, enrolled]) => {
                      const cap = Number(capacity);
                      const enr = Number(enrolled);
                      const remaining = cap - enr;
                      const pct = cap > 0 ? Math.round((enr / cap) * 100) : 0;
                      return (
                        <TableRow key={id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-sm max-w-xs">
                            <span className="line-clamp-2">{title}</span>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {cap}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {enr}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            <span
                              className={
                                remaining === 0
                                  ? "text-destructive font-bold"
                                  : remaining < 10
                                    ? "text-amber-600 font-semibold"
                                    : "text-foreground"
                              }
                            >
                              {remaining}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {pct}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registrations table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display">
            All Registrations
          </CardTitle>
          <span className="text-sm text-muted-foreground font-normal">
            {registrations.length} record{registrations.length !== 1 ? "s" : ""}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {regsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No registrations yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-8" />
                    <TableHead className="font-semibold">Employee ID</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold text-center">
                      Sessions
                    </TableHead>
                    <TableHead className="font-semibold">
                      Submitted At
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => {
                    const isExpanded = expandedRows.has(reg.id);
                    const submittedAt = new Date(
                      Number(reg.submittedAt) / 1_000_000,
                    );
                    return (
                      <>
                        <TableRow
                          key={reg.id}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => toggleRow(reg.id)}
                        >
                          <TableCell className="pr-0">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold">
                            {reg.employeeId}
                          </TableCell>
                          <TableCell className="text-sm">{reg.email}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-mono">
                              {reg.courseIds.length}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {submittedAt.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow
                            key={`${reg.id}-expanded`}
                            className="bg-muted/20"
                          >
                            <TableCell />
                            <TableCell colSpan={4} className="py-3">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                  Registered Sessions ({reg.courseIds.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {reg.courseIds.map((id) => (
                                    <span
                                      key={id}
                                      className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-mono"
                                    >
                                      {id}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card className="shadow-card">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base font-display">
              Role Management
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-3 items-end max-w-lg">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <Label
                htmlFor="principal-input"
                className="text-sm font-semibold"
              >
                User Principal
              </Label>
              <Input
                id="principal-input"
                placeholder="aaaaa-bbbbb-..."
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="w-36 space-y-1.5">
              <Label className="text-sm font-semibold">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.admin}>Admin</SelectItem>
                  <SelectItem value={UserRole.user}>User</SelectItem>
                  <SelectItem value={UserRole.guest}>Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={async () => {
                try {
                  // Note: Principal parsing handled by backend
                  toast.error(
                    "Role assignment requires a valid Principal object. Use the Principal SDK.",
                  );
                } catch {
                  toast.error("Invalid principal");
                }
              }}
              disabled={!principalInput || assignRoleMutation.isPending}
              className="gap-1.5"
            >
              {assignRoleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Assign Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pb-4">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-foreground hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color.replace(")", " / 0.1)")}`, color }}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-display font-bold text-foreground mt-0.5">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
