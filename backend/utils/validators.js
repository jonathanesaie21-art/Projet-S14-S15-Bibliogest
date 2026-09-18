export function isValidId(value) {
  if (typeof value === "number") return Number.isInteger(value) && value > 0;
  if (typeof value === "string") return /^[1-9]\d*$/.test(value);
  return false;
}
