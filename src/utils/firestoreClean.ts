/**
 * Utility to strip undefined properties from data objects before saving to Firestore.
 * Firestore throws `invalid-argument: Unsupported field value: undefined` if undefined keys exist.
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}
