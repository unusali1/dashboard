import React from "react";

const FieldSet = ({ label, children }) => {
  return (
    <fieldset className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40 transition-all duration-200 hover:border-blue-400">
      {label && (
        <legend className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
          {label}
        </legend>
      )}
      <div className="mt-2 space-y-3">
        {children}
        </div>
    </fieldset>
  );
};

export default FieldSet;
