import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-heritage-deep px-6 py-5 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-heritage-cream">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-display font-bold text-heritage-cream">{title}</h1>
      </div>
      <div className="px-6 py-12 text-center">
        <p className="text-muted-foreground font-body">{description}</p>
        <p className="text-sm text-muted-foreground/60 mt-2 font-body">Coming soon</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
