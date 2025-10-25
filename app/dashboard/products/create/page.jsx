"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import FieldSet from "@/components/others/FieldSet";
import Field from "@/components/others/Field";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Inventory & Pricing" },
  { id: 3, title: "Media & Description" },
];

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: { activeStatus: true },
  });

  const mutation = useMutation({
    mutationFn: async (newProduct) =>
      axios.post(
        "https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/products",
        newProduct
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("✅ Product created successfully!");
      router.push("/dashboard/products");
    },
    onError: () => toast.error("❌ Failed to create product. Try again."),
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("productImage", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      sku: data.sku.toUpperCase(),
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      activeStatus: data.activeStatus ? "active" : "inactive",
      productImage: imagePreview || "",
      createdAt: new Date().toISOString(),
    };
    mutation.mutate(formattedData);
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="p-6 w-full mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
      {/* 🧭 Step Progress Header */}
      <div className="flex justify-between mb-6">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center flex-1">
            <div
              className={`w-9 h-9 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                s.id === step
                  ? "bg-blue-600 text-white border-blue-600"
                  : s.id < step
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-200 text-gray-600 border-gray-300"
              }`}
            >
              {s.id}
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                s.id === step ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {s.title}
            </p>
          </div>
        ))}
      </div>

      {/* 🧾 Form Sections */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <FieldSet label="Basic Information">
                <Field label="Product Name" error={errors.productName}>
                  <Input
                    {...register("productName", {
                      required: "Product name is required",
                    })}
                    placeholder="Enter product name"
                  />
                </Field>

                <Field label="SKU" error={errors.sku}>
                  <Input
                    {...register("sku", { required: "SKU is required" })}
                    placeholder="Enter SKU"
                    onChange={(e) =>
                      setValue("sku", e.target.value.toUpperCase())
                    }
                  />
                </Field>

                <Field label="Category" error={errors.category}>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Categories</SelectLabel>
                            <SelectItem value="electronics">
                              Electronics
                            </SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next →
                  </Button>
                </div>
              </FieldSet>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <FieldSet label="Inventory & Pricing">
                <Field label="Price" error={errors.price}>
                  <Input
                    {...register("price", {
                      required: "Price is required",
                      min: { value: 0, message: "Must be positive" },
                    })}
                    type="number"
                    placeholder="Enter product price"
                  />
                </Field>

                <Field label="Stock Quantity" error={errors.stock}>
                  <Input
                    {...register("stock", {
                      required: "Stock quantity is required",
                      min: { value: 0, message: "Must be 0 or more" },
                    })}
                    type="number"
                    placeholder="Enter stock quantity"
                  />
                </Field>

                <Field label="Active Status">
                  <div className="flex items-center gap-3 mt-2">
                    <Controller
                      name="activeStatus"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label>{field.value ? "Active" : "Inactive"}</Label>
                        </>
                      )}
                    />
                  </div>
                </Field>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={prevStep}>
                    ← Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next →
                  </Button>
                </div>
              </FieldSet>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <FieldSet label="Media & Description">
                <Field label="Product Image">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                      />
                    </div>
                  )}
                </Field>

                <Field label="Description">
                  <Textarea
                    {...register("description")}
                    placeholder="Enter product description (optional)"
                    className="min-h-[100px]"
                  />
                </Field>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={prevStep}>
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {mutation.isPending ? "Saving..." : "Create Product"}
                  </Button>
                </div>
              </FieldSet>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default Page;
