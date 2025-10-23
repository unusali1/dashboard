"use client";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import FieldSet from "@/components/others/FieldSet";
import Field from "@/components/others/Field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";

const Page = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError
  } = useForm();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newProduct) =>
      axios.post(
        "https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/products",
        newProduct
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleCreateProduct = (formData) => {
    console.log(formData); // ✅ Now you'll see category too
    // mutation.mutate(formData);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(handleCreateProduct)}
        className="flex flex-col gap-4 p-4"
      >
        <FieldSet label="Create New Product">
          <Field label="Product Name" htmlFor="productName" error={errors.productName}>
            <Input
              {...register("productName", {required: "Product Name is required"})}
              type="text"
              id="productName"
              placeholder="Enter product name"
              className="p-2 border border-gray-300 rounded-md w-[300px] mt-2"
            />
          </Field>

          <Field label="SKU" htmlFor="sku" error={errors.sku}>
            <Input
              {...register("sku", { required: "SKU is required" })}
              type="text"
              id="sku"
              placeholder="Enter product sku"
              className="p-2 border border-gray-300 rounded-md w-[300px] mt-2"
            />
          </Field>

          {/* ✅ Correct way to handle shadcn Select with react-hook-form */}
          <Field label="Category" htmlFor="category" error={errors.category}>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fruits</SelectLabel>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="blueberry">Blueberry</SelectItem>
                      <SelectItem value="grapes">Grapes</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Price" htmlFor="price" error={errors.price}>
            <Input
              {...register("price", {
                min: { value: 0, message: "Price must be at least 0" },
                required: "Price is required",
              })}
              type="number"
              id="price"
              placeholder="Enter product price"
              className="p-2 border border-gray-300 rounded-md w-[300px] mt-2"
            />
          </Field>

          <Field label="Stock" htmlFor="stock" error={errors.stock}>
            <Input
              {...register("stock", { 
                min: { value: 1, message: "Stock must be at least 1" },
                required: "Stock is required"
              })}
              type="number"
              id="stock"
              placeholder="Enter product stock"
              className="p-2 border border-gray-300 rounded-md w-[300px] mt-2"
            />
          </Field>
        </FieldSet>

        <Field>
          <Button type="submit">Create Product</Button>
        </Field>
      </form>
    </div>
  );
};

export default Page;
