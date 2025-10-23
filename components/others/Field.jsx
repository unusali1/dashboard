import React from "react";
import { Label } from "../ui/label";

const Field = ({ label, children, htmlFor, error, description }) => {
  const id = htmlFor || getChildId(children);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label
          htmlFor={id}
          className={`text-sm font-medium transition-colors ${
            error ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"
          }`}
        >
          {label}
        </Label>
      )}
      <div
        className={`rounded-lg border bg-white dark:bg-gray-900 transition-colors ${
          error ? "border-red-500 focus-within:border-red-600" : "border-gray-300 focus-within:border-blue-500"
        } px-3 py-2 shadow-sm`}
      >
        {children}
      </div>

      {description && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {!!error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          {error.message}
        </p>
      )}
    </div>
  );
};

const getChildId = (children) => {
  const childArray = React.Children.toArray(children);
  if (childArray.length === 0) return undefined;
  const firstChild = childArray[0];
  return firstChild.props?.id;
};

export default Field;
