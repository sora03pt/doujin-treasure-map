import type {
  ItemFieldErrors,
  ItemFormValues,
  ValidatedItemInput,
} from "@/features/items/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NAME_MAX_LENGTH = 200;
const MEMO_MAX_LENGTH = 2000;
const POSTGRES_INTEGER_MAX = 2_147_483_647;

type ItemValidationResult =
  | {
      ok: true;
      input: ValidatedItemInput;
      values: ItemFormValues;
    }
  | {
      ok: false;
      fieldErrors: ItemFieldErrors;
      values: ItemFormValues;
    };

function readText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function parseInteger(value: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function isItemId(value: string) {
  return UUID_PATTERN.test(value);
}

export function validateItemForm(formData: FormData): ItemValidationResult {
  const values: ItemFormValues = {
    name: readText(formData, "name"),
    price: readText(formData, "price"),
    quantity: readText(formData, "quantity"),
    memo: readText(formData, "memo"),
  };
  const fieldErrors: ItemFieldErrors = {};
  const price = values.price ? parseInteger(values.price) : null;
  const quantity = parseInteger(values.quantity);

  if (!values.name) {
    fieldErrors.name = "頒布物名を入力してください。";
  } else if (values.name.length > NAME_MAX_LENGTH) {
    fieldErrors.name = `頒布物名は${NAME_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (
    values.price &&
    (price === null || price < 0 || price > POSTGRES_INTEGER_MAX)
  ) {
    fieldErrors.price = "価格は0以上の整数で入力してください。";
  }

  if (
    quantity === null ||
    quantity < 1 ||
    quantity > POSTGRES_INTEGER_MAX
  ) {
    fieldErrors.quantity = "数量は1以上の整数で入力してください。";
  }

  if (values.memo.length > MEMO_MAX_LENGTH) {
    fieldErrors.memo = `メモは${MEMO_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (Object.keys(fieldErrors).length > 0 || quantity === null) {
    return { ok: false, fieldErrors, values };
  }

  return {
    ok: true,
    input: {
      name: values.name,
      price,
      quantity,
      memo: values.memo || null,
    },
    values,
  };
}
