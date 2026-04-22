import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MenuItem {
  name: string;
  description: string;
}

interface MenuSection {
  emoji: string;
  title: string;
  items: MenuItem[];
}

const menu: MenuSection[] = [
  {
    emoji: "☕",
    title: "Chai & Beverages",
    items: [
      { name: "Pol Masala Chai", description: "Traditional strong tea with ginger and cardamom." },
      { name: "Kesar Elaichi Tea", description: "Saffron and cardamom infused milk tea." },
      { name: "Lemongrass Black Tea", description: "Refreshing clear tea with fresh lemongrass." },
      { name: "Desi Coffee", description: "Frothy milk coffee prepared in the traditional style." },
      { name: "Lemon Pudina Cooler", description: "A chilled mint and lemon drink for warm afternoons." },
    ],
  },
  {
    emoji: "🍪",
    title: "Classic Tea Snacks (Nasta)",
    items: [
      { name: "Maskabun", description: "Fresh bun with a generous layer of butter." },
      { name: "Sadi Khari", description: "Plain, crispy puff pastry biscuits." },
      { name: "Masala Khari", description: "Khari topped with spicy pav bhaji masala." },
      { name: "Mawa Cake", description: "Traditional dense cardamom-flavored cake slice." },
    ],
  },
  {
    emoji: "🥟",
    title: "Pol Specialties",
    items: [
      { name: "Steamed Khichu", description: "Soft rice flour dough served with peanut oil and red chili powder." },
      { name: "Baked Handvo", description: "Savory vegetable lentil cake served with green chutney." },
      { name: "Methi na Gota", description: "Fenugreek fritters — a traditional Gujarati snack." },
      { name: "Fafda-Jalebi Duo", description: "A small portion of the classic salty-sweet combination." },
    ],
  },
  {
    emoji: "🥪",
    title: "Toasts & Rolls",
    items: [
      { name: "Aloo Matar Sandwich", description: "Classic grilled sandwich with spiced potato and peas." },
      { name: "Chutney Toast", description: "Open-faced bread with green coriander chutney and cheese." },
      { name: "Thepla Wrap", description: "Warm methi thepla rolled with butter and spicy achar." },
      { name: "Garlic Butter Toast", description: "Thick slices of local bread toasted with garlic and herbs." },
    ],
  },
  {
    emoji: "🍧",
    title: "Desserts",
    items: [
      { name: "Dry Fruit Shrikhand", description: "A small bowl of chilled, creamy hung curd with nuts." },
      { name: "Basundi Shot", description: "A small serving of thickened sweet milk with saffron." },
    ],
  },
];

interface CafeMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CafeMenuSheet = ({ open, onOpenChange }: CafeMenuSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-heritage-cream border-heritage-sand/40 px-5 pb-8"
      >
        <SheetHeader className="text-left pt-2 pb-1">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-heritage-terracotta">
            Menu
          </p>
          <SheetTitle className="font-display text-2xl text-heritage-deep leading-tight">
            Brewery & Café
          </SheetTitle>
          <SheetDescription className="font-body text-sm text-muted-foreground">
            A taste of the pol, served warm.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-2">
          {menu.map((section, sIdx) => (
            <section key={section.title} className={sIdx === 0 ? "mt-4" : "mt-6"}>
              <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-3">
                <span aria-hidden className="text-base leading-none">{section.emoji}</span>
                {section.title}
              </h3>
              <ul>
                {section.items.map((item, iIdx) => (
                  <li
                    key={item.name}
                    className={
                      iIdx === section.items.length - 1
                        ? "py-2.5"
                        : "py-2.5 border-b border-border/40"
                    }
                  >
                    <p className="font-display font-semibold text-sm text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
