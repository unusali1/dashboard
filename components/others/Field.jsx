import React from 'react'
import { Label } from '../ui/label'

const Field = ({label,children,htmlFor,error}) => {
    const id = htmlFor || getChildId(children);


  return (
    <div>
        { label && <Label htmlFor={id} className={error ? "text-red-600" : ""}>{label}</Label>}
        {children}
        {!!error && <div> <p className='text-red-600 text-sm mt-1'>{error.message}</p></div>}
    </div>
  )
}


const getChildId = (children) => {
   const child = React.Children.only(children);

   if("id" in child.props){ 
    return child.props.id;
   }

   return undefined;
}

export default Field

