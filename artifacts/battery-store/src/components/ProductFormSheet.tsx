import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Loader2, X, AlertCircle } from "lucide-react";
import { Product, NewProduct, addProduct, updateProduct } from "@/lib/products-db";
import { uploadProductImage, UploadProgress } from "@/lib/storage";

const PRESETS = [
  { label: "Car Battery", value: "/images/battery-car.png" },
  { label: "Truck Battery", value: "/images/battery-truck.png" },
  { label: "Marine Battery", value: "/images/battery-marine.png" },
  { label: "Industrial Battery", value: "/images/battery-industrial.png" },
];

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["Car", "Truck", "Marine", "Industrial"]),
  price: z.coerce.number().positive("Must be a positive number"),
  voltage: z.coerce.number().positive("Must be a positive number"),
  cca: z.string().optional(),
  warranty: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  capacity: z.string().min(1, "Required"),
  weight: z.string().min(1, "Required"),
  dimensions: z.string().min(1, "Required"),
  image: z.string().min(1, "Required"),
  description: z.string().min(10, "Must be at least 10 characters"),
  compatibility: z.string().min(1, "Required"),
  features: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(p: Product): FormValues {
  return {
    name: p.name,
    category: p.category,
    price: p.price,
    voltage: p.voltage,
    cca: p.cca != null ? String(p.cca) : "",
    warranty: p.warranty,
    type: p.type,
    capacity: p.capacity,
    weight: p.weight,
    dimensions: p.dimensions,
    image: p.image,
    description: p.description,
    compatibility: p.compatibility.join(", "),
    features: p.features.join("\n"),
  };
}

function toProduct(values: FormValues): NewProduct {
  return {
    name: values.name,
    category: values.category,
    price: values.price,
    voltage: values.voltage,
    cca: values.cca && values.cca.trim() !== "" ? Number(values.cca) : null,
    warranty: values.warranty,
    type: values.type,
    capacity: values.capacity,
    weight: values.weight,
    dimensions: values.dimensions,
    image: values.image,
    description: values.description,
    compatibility: values.compatibility
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    features: values.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

const DEFAULTS: FormValues = {
  name: "",
  category: "Car",
  price: 0,
  voltage: 12,
  cca: "",
  warranty: "3 years",
  type: "",
  capacity: "",
  weight: "",
  dimensions: "",
  image: "/images/battery-car.png",
  description: "",
  compatibility: "",
  features: "",
};

function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<UploadProgress | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const isPreset = PRESETS.some((p) => p.value === value);
  const isUploaded = !isPreset && value.startsWith("http");
  const isCustomUrl = !isPreset && !isUploaded && value !== "";

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (cancelRef.current) cancelRef.current();
    setUpload({ state: "running", percent: 0 });
    cancelRef.current = uploadProductImage(file, (progress) => {
      setUpload(progress);
      if (progress.state === "done") {
        onChange(progress.url);
      }
    });
  }

  function handleCancel() {
    if (cancelRef.current) cancelRef.current();
    setUpload(null);
  }

  const uploading = upload?.state === "running";
  const uploadError = upload?.state === "error" ? upload.message : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-start">
        <div className="h-20 w-20 flex-shrink-0 border border-border bg-muted/30 flex items-center justify-center overflow-hidden relative">
          {value ? (
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none uppercase text-xs font-bold flex-1 border-border gap-1.5"
              disabled={uploading}
              onClick={() => cameraInputRef.current?.click()}
              data-testid="button-camera"
            >
              <Camera className="h-3.5 w-3.5" />
              Camera
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none uppercase text-xs font-bold flex-1 border-border gap-1.5"
              disabled={uploading}
              onClick={() => galleryInputRef.current?.click()}
              data-testid="button-gallery"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Gallery
            </Button>
          </div>

          {uploading && upload.state === "running" && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${upload.percent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                {upload.percent}%
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-1.5 text-destructive text-xs">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {upload?.state === "done" && (
            <p className="text-xs text-green-400">Photo uploaded successfully.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Or choose a preset</p>
        <Select
          value={isPreset ? value : isCustomUrl ? "custom" : ""}
          onValueChange={(v) => {
            setUpload(null);
            if (v !== "custom") onChange(v);
            else onChange("");
          }}
        >
          <SelectTrigger className="rounded-none border-border bg-background text-sm">
            <SelectValue placeholder={isUploaded ? "Uploaded photo" : "Choose a preset…"} />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {PRESETS.map((img) => (
              <SelectItem key={img.value} value={img.value}>
                {img.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom URL…</SelectItem>
          </SelectContent>
        </Select>

        {isCustomUrl && (
          <Input
            placeholder="https://example.com/image.png"
            className="rounded-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        data-testid="input-gallery"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        data-testid="input-camera"
      />
    </div>
  );
}

export default function ProductFormSheet({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}) {
  const [saving, setSaving] = useState(false);
  const isEdit = product !== null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      form.reset(product ? toFormValues(product) : DEFAULTS);
    }
  }, [open, product]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      if (isEdit && product) {
        await updateProduct(product.id, toProduct(values));
      } else {
        await addProduct(toProduct(values));
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto bg-background border-border"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-black uppercase tracking-tight">
            {isEdit ? "Edit Product" : "Add New Product"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            {isEdit
              ? "Update product details. Changes save to the storefront immediately."
              : "New products appear in the shop instantly after saving."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. VoltEdge Pro 600" className="rounded-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-none border-border bg-background">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none">
                        {["Car", "Truck", "Marine", "Industrial"].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="99.99" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="voltage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voltage (V)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CCA (optional — leave blank for deep cycle)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 600" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warranty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty</FormLabel>
                    <FormControl>
                      <Input placeholder="3 years" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Battery Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Flooded Lead-Acid" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input placeholder="55 Ah" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input placeholder="14.5 kg" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input placeholder="242 × 175 × 190 mm" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <ImagePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this battery and its key benefits…"
                      className="rounded-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compatibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compatible Vehicles <span className="text-muted-foreground font-normal">(comma-separated)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Sedan, Hatchback, SUV" className="rounded-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Features <span className="text-muted-foreground font-normal">(one per line)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={"Maintenance-free sealed design\nVibration-resistant construction"}
                      className="rounded-none min-h-[90px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2 sticky bottom-0 bg-background pb-4">
              <Button
                type="submit"
                className="flex-1 uppercase font-bold rounded-none"
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                ) : isEdit ? "Save Changes" : "Add Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-none uppercase"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
