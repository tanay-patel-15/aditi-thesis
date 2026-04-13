export interface StayPackage {
  id: string;
  duration: string;
  days: number;
  pricePerDay: number;
  totalPrice: number;
  features: string[];
  popular?: boolean;
}

export const stayPackages: StayPackage[] = [
  {
    id: "3day",
    duration: "3 Days",
    days: 3,
    pricePerDay: 1200,
    totalPrice: 3600,
    features: [
      "Heritage Accommodation",
      "Co-working Space Access",
      "Brewery & Café Access",
      "1 Guided Heritage Walk",
    ],
  },
  {
    id: "5day",
    duration: "5 Days",
    days: 5,
    pricePerDay: 1000,
    totalPrice: 5000,
    features: [
      "Heritage Accommodation",
      "Co-working Space Access",
      "Brewery & Café Access",
      "2 Guided Heritage Walks",
      "Food Trail Experience",
    ],
    popular: true,
  },
  {
    id: "7day",
    duration: "7 Days",
    days: 7,
    pricePerDay: 900,
    totalPrice: 6300,
    features: [
      "Heritage Accommodation",
      "Co-working Space Access",
      "Brewery & Café Access",
      "All Heritage Walks",
      "Food Trail Experience",
      "Photo Archive Access",
    ],
  },
  {
    id: "10day",
    duration: "10 Days",
    days: 10,
    pricePerDay: 800,
    totalPrice: 8000,
    features: [
      "Heritage Accommodation",
      "Co-working Space Access",
      "Brewery & Café Access",
      "All Heritage Walks",
      "Food Trail Experience",
      "1 Guided Tour (nearby attraction)",
      "Photo Archive Access",
    ],
  },
  {
    id: "15day",
    duration: "15 Days",
    days: 15,
    pricePerDay: 700,
    totalPrice: 10500,
    features: [
      "Heritage Accommodation",
      "Co-working Space Access",
      "Brewery & Café Access",
      "All Heritage Walks & Food Trails",
      "2 Guided Tours",
      "Cultural Events Access",
      "Photo Archive Access",
    ],
  },
  {
    id: "1month",
    duration: "1 Month",
    days: 30,
    pricePerDay: 600,
    totalPrice: 18000,
    features: [
      "Heritage Accommodation",
      "Unlimited Co-working Access",
      "Brewery & Café Access",
      "All Heritage Walks & Food Trails",
      "All Guided Tours",
      "Cultural Events Access",
      "Photo Archive Access",
      "Community Meetups",
    ],
  },
];
