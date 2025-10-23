import React from 'react';

const FieldSet = ({ label, children }) => {
  return (
    <fieldset className="border border-gray-300 rounded-md p-4">
      {label && (
        <legend className="text-sm font-medium text-gray-700 px-2">
          {label}
        </legend>
      )}
      <div className="space-y-2">
        {children}
      </div>
    </fieldset>
  );
};

export default FieldSet;
