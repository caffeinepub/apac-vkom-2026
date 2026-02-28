import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Loader2,
  Mail,
  UserCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onSubmit: (employeeId: string, email: string) => void;
  isLoading?: boolean;
  sessionCount?: number;
  onNavigateAdmin?: () => void;
}

export default function EmployeeForm({
  onSubmit,
  isLoading,
  sessionCount,
  onNavigateAdmin,
}: Props) {
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [errors, setErrors] = useState<{ email?: string; employeeId?: string }>(
    {},
  );

  const validate = () => {
    const errs: { email?: string; employeeId?: string } = {};
    if (!email) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!employeeId.trim()) {
      errs.employeeId = "Employee ID is required.";
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(employeeId.trim(), email.trim());
  };

  return (
    <div className="container py-12 max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Intro */}
        <div className="mb-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "oklch(var(--primary) / 0.1)" }}
          >
            <UserCircle2
              className="w-7 h-7"
              style={{ color: "oklch(var(--primary))" }}
            />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Register for APAC VKOM 2026
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enter your details below to start selecting training sessions for
            the event.
          </p>
        </div>

        <Card className="shadow-card border-border">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-sm">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className="pl-10"
                    autoComplete="email"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-destructive text-xs"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="font-semibold text-sm">
                  Employee ID <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="e.g. EMP12345"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                      if (errors.employeeId)
                        setErrors((prev) => ({
                          ...prev,
                          employeeId: undefined,
                        }));
                    }}
                    className="pl-10"
                    autoComplete="off"
                    aria-describedby={
                      errors.employeeId ? "empid-error" : undefined
                    }
                    aria-invalid={!!errors.employeeId}
                  />
                </div>
                {errors.employeeId && (
                  <p
                    id="empid-error"
                    className="text-destructive text-xs"
                    role="alert"
                  >
                    {errors.employeeId}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full font-display font-semibold text-base py-5 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Sessions...
                  </>
                ) : (
                  "Continue to Session Selection →"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Session availability indicator */}
        {!isLoading && sessionCount !== undefined && (
          <div className="mt-4">
            {sessionCount > 0 ? (
              <div className="flex gap-2 items-start p-3 rounded-lg bg-muted/60 border border-border">
                <CalendarDays
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: "oklch(var(--primary))" }}
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    {sessionCount} sessions
                  </span>{" "}
                  available across March 6–7, 2026. Continue to browse and
                  select your schedule.
                </p>
              </div>
            ) : (
              <div className="flex gap-2 items-start p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Sessions not yet loaded
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The session schedule is not available yet.{" "}
                    {onNavigateAdmin ? (
                      <>
                        If you are an administrator,{" "}
                        <button
                          type="button"
                          onClick={onNavigateAdmin}
                          className="underline text-foreground hover:text-primary transition-colors"
                        >
                          go to Admin &rarr;
                        </button>{" "}
                        and click "Initialize Courses".
                      </>
                    ) : (
                      "Please contact the event administrator."
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info blurb */}
        <div className="mt-4 flex gap-2 items-start p-3 rounded-lg bg-muted/60 border border-border">
          <BadgeCheck
            className="w-4 h-4 mt-0.5 shrink-0"
            style={{ color: "oklch(var(--solution-overview))" }}
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            A confirmation email with your selected sessions will be sent to the
            provided email address after registration.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
