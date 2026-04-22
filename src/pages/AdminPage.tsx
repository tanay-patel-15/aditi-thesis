import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  confirmPayment,
  listPaymentsByStatus,
  rejectPayment,
  type PendingPayment,
} from "@/lib/payment";

const SESSION_KEY = "admin_authed";

const isAuthed = () => sessionStorage.getItem(SESSION_KEY) === "1";

const AdminPage = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAuthed());

  if (!authed) {
    return <PasswordGate onAuthed={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Admin</h1>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Review and confirm pending payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY);
              navigate("/");
            }}
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending_verification" className="w-full">
        <div className="px-5 pt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pending_verification">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending_verification">
          <PaymentsList status="pending_verification" />
        </TabsContent>
        <TabsContent value="confirmed">
          <PaymentsList status="confirmed" />
        </TabsContent>
        <TabsContent value="rejected">
          <PaymentsList status="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Password gate
// ---------------------------------------------------------------------------

const PasswordGate = ({ onAuthed }: { onAuthed: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!expected) {
      setError("Admin password not configured. Set VITE_ADMIN_PASSWORD in .env");
      return;
    }
    if (password === expected) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onAuthed();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground">Admin Access</h1>
            <p className="text-xs text-muted-foreground">Staff only</p>
          </div>
        </div>

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          autoFocus
        />

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Payments list
// ---------------------------------------------------------------------------

interface PaymentsListProps {
  status: "pending_verification" | "confirmed" | "rejected";
}

const PaymentsList = ({ status }: PaymentsListProps) => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [rejectingRefId, setRejectingRefId] = useState<string | null>(null);
  const [busyRefId, setBusyRefId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await listPaymentsByStatus(status);
      setPayments(rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleConfirm = async (refId: string) => {
    if (!confirm(`Confirm booking ${refId}? This sends a confirmation email to the customer.`)) {
      return;
    }
    setBusyRefId(refId);
    try {
      await confirmPayment(refId);
      toast.success(`${refId} confirmed — email sent`);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Confirmation failed";
      toast.error(msg);
    } finally {
      setBusyRefId(null);
    }
  };

  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground font-body">
          {loading ? "Loading…" : `${payments.length} booking${payments.length === 1 ? "" : "s"}`}
        </p>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No {status.replace("_", " ")} bookings
        </div>
      ) : (
        payments.map((p) => (
          <PaymentRow
            key={p.id}
            payment={p}
            busy={busyRefId === p.ref_id}
            onConfirm={() => handleConfirm(p.ref_id)}
            onReject={() => setRejectingRefId(p.ref_id)}
          />
        ))
      )}

      <RejectDialog
        refId={rejectingRefId}
        onClose={() => setRejectingRefId(null)}
        onRejected={() => {
          setRejectingRefId(null);
          load();
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Payment row
// ---------------------------------------------------------------------------

interface PaymentRowProps {
  payment: PendingPayment;
  busy: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

const formatDetail = (p: PendingPayment): string => {
  const d = p.booking_details;
  if (p.booking_type === "stay") {
    return [d.packageLabel, d.checkIn && `from ${d.checkIn}`, d.guests && `${d.guests} guest(s)`]
      .filter(Boolean)
      .join(" · ");
  }
  if (p.booking_type === "coworking") {
    return [d.planLabel, d.startDate && `from ${d.startDate}`, d.seats && `${d.seats} seat(s)`]
      .filter(Boolean)
      .join(" · ");
  }
  return "";
};

const PaymentRow = ({ payment, busy, onConfirm, onReject }: PaymentRowProps) => {
  const isActionable = payment.status === "pending_verification";

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-foreground text-sm">
              {payment.customer_name}
            </span>
            <Badge variant="outline" className="text-[10px] uppercase">
              {payment.booking_type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {payment.customer_email} · {payment.customer_phone}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDetail(payment)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-display font-bold text-lg text-foreground">
            ₹{Number(payment.amount).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {payment.ref_id}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {payment.screenshot_url && (
          <a
            href={payment.screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-heritage-terracotta hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Screenshot
          </a>
        )}
        {payment.utr && (
          <span className="text-muted-foreground">
            UTR: <span className="font-mono text-foreground">{payment.utr}</span>
          </span>
        )}
        <span className="ml-auto text-muted-foreground">
          {format(parseISO(payment.created_at), "d MMM, HH:mm")}
        </span>
      </div>

      {payment.admin_notes && (
        <p className="text-xs bg-muted/40 rounded-md px-2 py-1.5 text-muted-foreground">
          <span className="font-semibold">Admin note: </span>
          {payment.admin_notes}
        </p>
      )}

      {isActionable && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                Confirm
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={busy}
            className="flex-1"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Reject dialog
// ---------------------------------------------------------------------------

interface RejectDialogProps {
  refId: string | null;
  onClose: () => void;
  onRejected: () => void;
}

const RejectDialog = ({ refId, onClose, onRejected }: RejectDialogProps) => {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!refId) setNotes("");
  }, [refId]);

  const handleConfirm = async () => {
    if (!refId) return;
    setSubmitting(true);
    try {
      await rejectPayment(refId, notes);
      toast.success(`${refId} rejected`);
      onRejected();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Rejection failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!refId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {refId}?</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Reason (optional)</label>
          <Textarea
            placeholder="e.g. Amount doesn't match / UTR not verifiable"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPage;
