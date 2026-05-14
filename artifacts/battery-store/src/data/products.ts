export interface Product {
  id: string;
  name: string;
  category: "Car" | "Truck" | "Marine" | "Industrial";
  cca: number | null;
  voltage: number;
  warranty: string;
  price: number;
  description: string;
  image: string;
}

export const products: Product[] = [
  { id: "1", name: "VoltEdge Pro 600", category: "Car", cca: 600, voltage: 12, warranty: "3 years", price: 89.99, description: "Reliable starter battery for most passenger vehicles.", image: "/images/battery-car.png" },
  { id: "2", name: "VoltEdge Pro 800", category: "Car", cca: 800, voltage: 12, warranty: "4 years", price: 119.99, description: "High-performance battery for demanding engines.", image: "/images/battery-car.png" },
  { id: "3", name: "VoltEdge Truck 950", category: "Truck", cca: 950, voltage: 12, warranty: "4 years", price: 159.99, description: "Heavy-duty battery built for diesel pickups and work trucks.", image: "/images/battery-truck.png" },
  { id: "4", name: "VoltEdge Truck 1100", category: "Truck", cca: 1100, voltage: 12, warranty: "5 years", price: 199.99, description: "Commercial-grade power for the hardest-working trucks.", image: "/images/battery-truck.png" },
  { id: "5", name: "VoltEdge Marine 750", category: "Marine", cca: 750, voltage: 12, warranty: "3 years", price: 134.99, description: "Dual-purpose marine battery — starting and deep cycle.", image: "/images/battery-marine.png" },
  { id: "6", name: "VoltEdge Marine Deep 100", category: "Marine", cca: null, voltage: 12, warranty: "3 years", price: 179.99, description: "100Ah deep cycle battery for trolling motors and electronics.", image: "/images/battery-marine.png" },
  { id: "7", name: "VoltEdge Industrial 200", category: "Industrial", cca: null, voltage: 6, warranty: "5 years", price: 249.99, description: "Industrial-grade battery for forklifts and floor equipment.", image: "/images/battery-industrial.png" },
  { id: "8", name: "VoltEdge AGM Elite", category: "Car", cca: 680, voltage: 12, warranty: "5 years", price: 149.99, description: "AGM technology for start-stop vehicles and premium cars.", image: "/images/battery-car.png" },
];
