import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, CheckCircle2, RotateCcw, ShoppingCart } from "lucide-react";

type Step = 1 | 2 | 3;

interface Answers {
  vehicleType: string;
  usage: string;
  budget: string;
}

const STEPS = [
  {
    number: 1 as Step,
    title: "What type of vehicle?",
    subtitle: "Choose the category that best matches your vehicle.",
    key: "vehicleType" as keyof Answers,
    options: [
      {
        value: "Car",
        label: "Car / SUV",
        description: "Sedans, hatchbacks, crossovers, passenger cars",
        icon: "🚗",
      },
      {
        value: "Truck",
        label: "Truck / Commercial",
        description: "Pickups, work trucks, cargo vans, diesel engines",
        icon: "🚛",
      },
      {
        value: "Marine",
        label: "Marine / Boat",
        description: "Powerboats, pontoons, bass boats, trolling motors",
        icon: "⛵",
      },
      {
        value: "Industrial",
        label: "Industrial / Equipment",
        description: "Forklifts, floor equipment, golf carts, aerial lifts",
        icon: "🏭",
      },
    ],
  },
  {
    number: 2 as Step,
    title: "How do you use it?",
    subtitle: "This helps match you with the right performance level.",
    key: "usage" as keyof Answers,
    options: [
      {
        value: "light",
        label: "Everyday Reliability",
        description: "Regular commuting, moderate electrical loads, standard use",
        icon: "☀️",
      },
      {
        value: "performance",
        label: "High Performance",
        description: "Large engines, lots of accessories, demanding conditions",
        icon: "⚡",
      },
      {
        value: "deepcycle",
        label: "Deep Cycle / Extended Draw",
        description: "Long discharge sessions, electronics, trolling motors",
        icon: "🔋",
      },
      {
        value: "commercial",
        label: "Heavy Commercial / Multi-shift",
        description: "All-day operation, multiple loads, industrial environments",
        icon: "🏗️",
      },
    ],
  },
  {
    number: 3 as Step,
    title: "What's your budget?",
    subtitle: "We'll show you the best options within your range.",
    key: "budget" as keyof Answers,
    options: [
      { value: "under100", label: "Under $100", description: "Great value, solid everyday performance", icon: "💵" },
      { value: "100to150", label: "$100 – $150", description: "Mid-range power with extended warranty", icon: "💳" },
      { value: "150to200", label: "$150 – $200", description: "High-output and AGM technology", icon: "💎" },
      { value: "over200", label: "Over $200", description: "Top-tier commercial and industrial grade", icon: "🏆" },
    ],
  },
];

function matchProducts(answers: Answers, products: Product[]): Product[] {
  let filtered = [...products];

  if (answers.vehicleType) {
    filtered = filtered.filter((p) => p.category === answers.vehicleType);
  }

  if (answers.usage) {
    if (answers.usage === "light") {
      filtered = filtered.filter((p) => !p.cca || p.cca <= 680);
    } else if (answers.usage === "performance") {
      filtered = filtered.filter((p) => p.cca && p.cca >= 680);
    } else if (answers.usage === "deepcycle") {
      filtered = filtered.filter((p) => p.cca === null || (p.type && p.type.toLowerCase().includes("deep")));
    } else if (answers.usage === "commercial") {
      filtered = filtered.filter((p) => p.price >= 199);
    }
  }

  if (answers.budget) {
    if (answers.budget === "under100") {
      filtered = filtered.filter((p) => p.price < 100);
    } else if (answers.budget === "100to150") {
      filtered = filtered.filter((p) => p.price >= 100 && p.price <= 150);
    } else if (answers.budget === "150to200") {
      filtered = filtered.filter((p) => p.price > 150 && p.price <= 200);
    } else if (answers.budget === "over200") {
      filtered = filtered.filter((p) => p.price > 200);
    }
  }

  if (filtered.length === 0 && answers.vehicleType) {
    const byCategory = products.filter((p) => p.category === answers.vehicleType);
    return byCategory.length > 0 ? byCategory : products.slice(0, 3);
  }

  return filtered;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25 } }),
};

function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: { value: string; label: string; description: string; icon: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-testid={`option-${option.value}`}
      className={`w-full text-left p-5 border-2 transition-all flex items-start gap-4 ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
      }`}
    >
      <span className="text-3xl leading-none mt-0.5 select-none">{option.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-base uppercase tracking-tight">{option.label}</p>
          {selected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
      </div>
    </motion.button>
  );
}

function ResultCard({ product }: { product: Product }) {
  const { dispatch } = useCart();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border bg-card flex flex-col overflow-hidden hover:border-primary/50 transition-colors"
      data-testid={`result-card-${product.id}`}
    >
      <div className="bg-muted p-6 flex items-center justify-center h-44">
        <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">{product.category}</span>
          <h3 className="text-lg font-black uppercase tracking-tight mt-0.5">{product.name}</h3>
          <p className="text-2xl font-bold text-primary mt-1">${product.price.toFixed(2)}</p>
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {product.cca && (
            <span className="flex items-center gap-1 text-xs border border-border bg-background px-2 py-1">
              <Zap className="h-3 w-3 text-primary" /> {product.cca} CCA
            </span>
          )}
          <span className="flex items-center gap-1 text-xs border border-border bg-background px-2 py-1">
            <Zap className="h-3 w-3 text-primary" /> {product.voltage}V
          </span>
          <span className="flex items-center gap-1 text-xs border border-border bg-background px-2 py-1">
            <ShieldCheck className="h-3 w-3 text-primary" /> {product.warranty}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Link href={`/product/${product.id}`}>
            <Button variant="outline" className="w-full rounded-none uppercase font-bold text-xs" data-testid={`button-details-${product.id}`}>
              Details
            </Button>
          </Link>
          <Button
            className="w-full rounded-none uppercase font-bold text-xs"
            onClick={() => dispatch({ type: "ADD_ITEM", payload: product })}
            data-testid={`button-addcart-${product.id}`}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FinderPage() {
  const { products } = useProducts();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ vehicleType: "", usage: "", budget: "" });
  const [done, setDone] = useState(false);

  const currentStep = STEPS[step - 1];
  const currentAnswer = answers[currentStep.key];

  function selectOption(value: string) {
    setAnswers((prev) => ({ ...prev, [currentStep.key]: value }));
  }

  function goNext() {
    if (!currentAnswer) return;
    if (step < 3) {
      setDirection(1);
      setStep((s) => (s + 1) as Step);
    } else {
      setDone(true);
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => (s - 1) as Step);
    }
  }

  function restart() {
    setAnswers({ vehicleType: "", usage: "", budget: "" });
    setStep(1);
    setDirection(-1);
    setDone(false);
  }

  const results = done ? matchProducts(answers, products) : [];
  const isBudgetRelaxed = done && matchProducts(answers, products).length === 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-zinc-950 border-b border-border px-6 py-12 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 mb-4">
            <Zap className="h-3 w-3" /> Battery Finder
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Find Your Perfect Match
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Answer 3 quick questions and we'll recommend the exact battery your vehicle needs.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        {!done ? (
          <>
            <div className="flex items-center gap-2 mb-10">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div
                    className={`h-8 w-8 flex items-center justify-center text-xs font-bold border-2 transition-all flex-shrink-0 ${
                      n < step
                        ? "border-primary bg-primary text-primary-foreground"
                        : n === step
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {n < step ? <CheckCircle2 className="h-4 w-4" /> : n}
                  </div>
                  {n < 3 && (
                    <div className={`h-0.5 flex-1 transition-all ${n < step ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                    Step {step} of 3
                  </p>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-1">{currentStep.title}</h2>
                  <p className="text-muted-foreground text-sm mb-6">{currentStep.subtitle}</p>

                  <div className="flex flex-col gap-3">
                    {currentStep.options.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        option={opt}
                        selected={currentAnswer === opt.value}
                        onClick={() => selectOption(opt.value)}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                className="rounded-none uppercase font-bold gap-2"
                onClick={goBack}
                disabled={step === 1}
                data-testid="button-back"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                className="rounded-none uppercase font-bold gap-2 px-8"
                onClick={goNext}
                disabled={!currentAnswer}
                data-testid="button-next"
              >
                {step === 3 ? "See My Matches" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Your Matches</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {results.length > 0
                    ? `${results.length} battery${results.length > 1 ? "ies" : ""} matched your profile.`
                    : "We broadened the search to find your closest matches."}
                </p>
                {isBudgetRelaxed && (
                  <p className="text-xs text-primary mt-1">Budget filter relaxed — showing nearest alternatives.</p>
                )}
              </div>
              <Button
                variant="outline"
                className="rounded-none uppercase font-bold gap-2 text-xs"
                onClick={restart}
                data-testid="button-restart"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Start Over
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
              {results.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <ResultCard product={p} />
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">Want to browse everything?</p>
              <Link href="/shop">
                <Button variant="outline" className="rounded-none uppercase font-bold" data-testid="link-browse-all">
                  View Full Catalog
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
