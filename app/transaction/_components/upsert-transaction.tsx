"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionCategory, TransactionPaymentMethod, TransactionType } from "@prisma/client";
import { useEffect, useRef } from "react";
import { Controller, Form, useForm } from "react-hook-form";
import { z } from "zod";
import { MoneyInput } from "../../shared/_components/common/money-input";

import { Field, FieldError, FieldGroup, FieldLabel } from "../../shared/_components/ui/field";
import { Input } from "../../shared/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/_components/ui/select";
import { upsertTransaction } from "../_actions/upsert-transaction";
import {
  TRANSACTION_CATEGORY_OPTIONS,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "../_constants/transactions";

const formSchema = z.object({
  name: z.string().trim().min(1, {
    error: "O nome é obrigatório.",
  }),
  amount: z
    .number({
      error: "O valor é obrigatório.",
    })
    .positive({
      error: "O valor deve ser positivo.",
    }),
  type: z.enum(TransactionType, {
    error: "O tipo é obrigatório.",
  }),
  category: z.enum(TransactionCategory, {
    error: "A categoria é obrigatória.",
  }),
  paymentMethod: z.enum(TransactionPaymentMethod, {
    error: "O método de pagamento é obrigatório.",
  }),
  date: z.date({
    error: "A data é obrigatória.",
  }),
});

export type FormSchema = z.infer<typeof formSchema>;

const DEFAULT_FORM_VALUES: FormSchema = {
  amount: 0,
  category: TransactionCategory.OTHER,
  date: new Date(),
  name: "",
  paymentMethod: TransactionPaymentMethod.CASH,
  type: TransactionType.EXPENSE,
};

interface UpsertTransactionProps {
  isOpen: boolean;
  defaultValues?: Partial<FormSchema>;
  transactionId?: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const UpsertTransaction = ({
  isOpen,
  defaultValues,
  transactionId,
  onSuccess,
  onLoadingChange,
}: UpsertTransactionProps) => {
  const { control, reset } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      ...defaultValues,
    },
  });

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset({
        ...DEFAULT_FORM_VALUES,
        ...defaultValues,
      });
    }

    wasOpenRef.current = isOpen;
  }, [defaultValues, isOpen, reset]);

  const onSubmit = async (data: FormSchema) => {
    try {
      onLoadingChange?.(true);
      await upsertTransaction({ ...data, id: transactionId });
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <Form
      id="transaction-form"
      control={control}
      onSubmit={async ({ data }) => {
        await onSubmit(data);
      }}
    >
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="transaction-form-name">Título</FieldLabel>
              <Input
                {...field}
                id="transaction-form-name"
                aria-invalid={fieldState.invalid}
                placeholder="Digite o título da transação"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="transaction-form-amount">Valor</FieldLabel>
              <MoneyInput
                placeholder="Digite o valor..."
                value={field.value}
                onValueChange={({ floatValue }) => field.onChange(floatValue ?? undefined)}
                onBlur={field.onBlur}
                disabled={field.disabled}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="transaction-form-type">Tipo da transação</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                items={TRANSACTION_TYPE_OPTIONS}
                onValueChange={(value) => {
                  if (value) field.onChange(value);
                }}
              >
                <SelectTrigger id="transaction-form-type" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="transaction-form-category">Categoria da transação</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                items={TRANSACTION_CATEGORY_OPTIONS}
                onValueChange={(value) => {
                  if (value) field.onChange(value);
                }}
              >
                <SelectTrigger id="transaction-form-category" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="paymentMethod"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="transaction-form-payment-method">Método de pagamento</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                items={TRANSACTION_PAYMENT_METHOD_OPTIONS}
                onValueChange={(value) => {
                  if (value) field.onChange(value);
                }}
              >
                <SelectTrigger
                  id="transaction-form-payment-method"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione um método de pagamento..." />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="transaction-form-date">Data</FieldLabel>
              <Input
                id="transaction-form-date"
                type="date"
                aria-invalid={fieldState.invalid}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                disabled={field.disabled}
                value={field.value ? formatDateInput(field.value) : ""}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value ? new Date(`${value}T00:00:00`) : undefined);
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </Form>
  );
};

export default UpsertTransaction;
