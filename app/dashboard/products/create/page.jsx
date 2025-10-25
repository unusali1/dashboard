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
import Navbar from "@/components/Navbar/Navbar";

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
    trigger,
    setValue,
  } = useForm({
    defaultValues: { activeStatus: true },
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: async (newProduct) =>
      axios.post(
        "https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/products",
        newProduct
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully!");
      setTimeout(() => {
        router.push("/dashboard/products");
      }, 1500);
    },
    onError: () => toast.error("Failed to create product. Try again."),
  });

  const preventEnterSubmit = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("productImage", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    const valid = await trigger([
      "productName",
      "sku",
      "category",
      "price",
      "stock",
    ]);
    if (!valid) {
      toast.error("Please fill out all required fields before submitting!");
      return;
    }

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

  const nextStep = async () => {
    let valid = false;
    if (step === 1) valid = await trigger(["productName", "sku", "category"]);
    if (step === 2) valid = await trigger(["price", "stock"]);
    if (valid) setStep((s) => s + 1);
    else toast.error("⚠️ Please complete all required fields.");
  };

  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="w-full bg-white dark:bg-gray-900">
      <Navbar />
      <div className="p-4 sm:p-16 w-full mx-auto">
        <div className="flex items-center justify-center mb-8 space-x-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
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

              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mt-5 transition-all duration-300 ${
                    step > s.id ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={preventEnterSubmit}
          className="space-y-6"
        >
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
                      className="w-full h-12"
                    />
                  </Field>

                  <Field label="SKU" error={errors.sku}>
                    <Input
                      {...register("sku", { required: "SKU is required" })}
                      placeholder="Enter SKU"
                      onChange={(e) =>
                        setValue("sku", e.target.value.toUpperCase())
                      }
                      className="w-full h-12"
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Categories</SelectLabel>
                              <SelectItem value="electronics">
                                Electronics
                              </SelectItem>
                              <SelectItem value="furniture">
                                Furniture
                              </SelectItem>
                              <SelectItem value="clothing">Clothing</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
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
                      className="w-full h-12"
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
                      className="w-full h-12"
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
                    <Button type="button" variant="outline" onClick={prevStep}>
                      ← Back
                    </Button>
                    <Button
                      type="button"
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
                  <Field label="Product Image (optional)">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full h-12"
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

                  <Field label="Description (optional)">
                    <Textarea
                      {...register("description")}
                      placeholder="Enter product description (optional)"
                      className="min-h-[100px]"
                    />
                  </Field>

                  <div className="flex justify-between mt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>
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
    </div>
  );
};

export default Page;
