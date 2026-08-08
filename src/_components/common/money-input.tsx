import { type ComponentProps, type ForwardedRef, forwardRef } from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";

import { Input } from "@/_components/ui/input";

export const MoneyInput = forwardRef(
  (
    props: NumericFormatProps<ComponentProps<typeof Input>>,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <NumericFormat
        {...props}
        thousandSeparator="."
        decimalSeparator=","
        prefix="R$ "
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        customInput={Input}
        getInputRef={ref}
      />
    );
  }
);

MoneyInput.displayName = "MoneyInput";
