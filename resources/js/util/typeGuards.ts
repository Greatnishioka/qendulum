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