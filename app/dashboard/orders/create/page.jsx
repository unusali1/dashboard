"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import dayjs from "dayjs";
import FieldSet from "@/components/others/FieldSet";
import Field from "@/components/others/Field";
import Navbar from "@/components/Navbar/Navbar";

// Fetch products dynamically
const fetchProducts = async () => {
  const res = await axios.get("https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/products");
  return res.data;
};

const OrderCreatePage = () => {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
  queryKey: ["products"],
  queryFn: fetchProducts,
});


  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      orderId: `ORD-${Math.floor(Math.random() * 100000)}`,
      items: [],
      clientName: "",
      deliveryAddress: "",
      paymentStatus: "Paid",
      deliveryStatus: "Pending",
      expectedDelivery: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchItems = watch("items");

  // Calculate total dynamically
  const totalAmount = watchItems.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product?.price || 0) * (item.quantity || 0);
  }, 0);

 const mutation = useMutation({
  mutationFn: async (orderData) =>
    axios.post("https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/orders", orderData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    toast.success("✅ Order created successfully!");
  },
  onError: () => toast.error("❌ Failed to create order."),
});


  const onSubmit = (data) => {
    mutation.mutate({ ...data, totalAmount, createdAt: new Date().toISOString() });
  };

  return (
    <div className="w-full">
    <Navbar />
    <div className="p-6 w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 space-y-6">
        <FieldSet label="Order Details">
          <Field label="Order ID">
            <Input {...register("orderId")} readOnly />
          </Field>

          <Field label="Client Name" error={errors.clientName}>
            <Input
              {...register("clientName", { required: "Client name is required" })}
              placeholder="Enter client name"
            />
          </Field>

          <Field label="Delivery Address" error={errors.deliveryAddress}>
            <Textarea
              {...register("deliveryAddress", { required: "Delivery address is required" })}
              placeholder="Enter delivery address"
            />
          </Field>

          <Field label="Payment Status">
            <Controller
              name="paymentStatus"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Delivery Status">
            <Controller
              name="deliveryStatus"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Expected Delivery Date" error={errors.expectedDelivery}>
            <Controller
              name="expectedDelivery"
              control={control}
              rules={{ required: "Expected delivery date is required" }}
              render={({ field }) => (
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(dayjs(date).format("YYYY-MM-DD"))}
                  className="w-full"
                />
              )}
            />
          </Field>
        </FieldSet>

        <FieldSet label="Products & Quantity">
          {fields.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-center">
              <Controller
                name={`items.${index}.productId`}
                control={control}
                rules={{ required: "Product required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.productName} (${p.price})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                type="number"
                placeholder="Qty"
                {...register(`items.${index}.quantity`, { valueAsNumber: true, min: 1, required: true })}
                className="w-20"
              />
              <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
            </div>
          ))}
          <Button type="button" onClick={() => append({ productId: "", quantity: 1 })}>
            + Add Product
          </Button>
        </FieldSet>

        <Button type="submit" className="mt-4" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Create Order"}
        </Button>
      </form>

      {/* Summary Card */}
      <div className="space-y-4">
        <FieldSet label="Order Summary">
          <div className="flex flex-col gap-2">
            <p><strong>Products:</strong> {watchItems.length}</p>
            <ul className="pl-4 list-disc">
              {watchItems.map((item, i) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return <li key={i}>{product.productName} x {item.quantity} = ${(product.price * item.quantity).toFixed(2)}</li>
              })}
            </ul>
            <p className="mt-2 text-lg font-semibold">Total: ${totalAmount.toFixed(2)}</p>
          </div>
        </FieldSet>
      </div>
    </div>
    </div>
  );
};

export default OrderCreatePage;
