import { Smartphone, Camera, FileText } from "lucide-react";
import paytmQR from "@/assets/paytm-qr.png";

interface PaytmQRCardProps {
  amount: number;
  refId: string;
}

const PaytmQRCard = ({ amount, refId }: PaytmQRCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-heritage-deep text-heritage-cream px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.15em] font-bold">
            Pay with Paytm
          </span>
          <span className="text-xs font-semibold">{refId}</span>
        </div>
      </div>

      <div className="flex items-center justify-center bg-heritage-cream py-6">
        <div className="bg-white p-3 rounded-lg border border-border">
          <img
            src={paytmQR}
            alt="Paytm QR code"
            className="w-48 h-48 object-contain"
          />
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground font-body">
            Amount to pay
          </span>
          <span className="text-xl font-display font-bold text-foreground">
            ₹{amount.toLocaleString("en-IN")}
          </span>
        </div>

        <ol className="space-y-2 text-[12px] text-muted-foreground font-body">
          <li className="flex gap-2">
            <Smartphone className="w-3.5 h-3.5 text-heritage-terracotta flex-shrink-0 mt-0.5" />
            <span>
              Open Paytm / any UPI app and scan this QR code
            </span>
          </li>
          <li className="flex gap-2">
            <FileText className="w-3.5 h-3.5 text-heritage-terracotta flex-shrink-0 mt-0.5" />
            <span>
              Send exactly <strong>₹{amount.toLocaleString("en-IN")}</strong> and note the
              transaction ID (UTR) shown after payment
            </span>
          </li>
          <li className="flex gap-2">
            <Camera className="w-3.5 h-3.5 text-heritage-terracotta flex-shrink-0 mt-0.5" />
            <span>
              Take a screenshot of the success page, then upload it below along with the UTR
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default PaytmQRCard;
