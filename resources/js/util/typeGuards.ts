/**
 * value が候補配列(types)に含まれる文字列か判定する型ガード
 *
 * @param value 判定対象の値
 * @param types 許可する文字列一覧
 * @returns value が types に含まれる場合は true
 */
export function isIncludeType<T extends readonly string[]>(
  value: unknown,
  types: T,
): value is T[number] {
  return typeof value === "string" && types.includes(value as T[number]);
}

/**
 * value が null、undefined、空文字、空配列でないか判定する型ガード
 * 
 * @param value 判定対象の値
 * @returns boolean
 */
export function isNotEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;

  return true;
}

/**
 * value から型レベルで null と undefined を除外する
 *
 * @param value 判定対象の値
 * @returns value が null または undefined でない場合は value
 */
export function removeNull<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new TypeError('This value is required');
  }
  return value;
}