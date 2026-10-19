/**
 * Utility to strip undefined properties from data objects before saving to Firestore.
 * Firestore throws `invalid-argument: Unsupported field value: undefined` if undefined keys exist.
 */
export function cleanFirestoreData<T = any>(data: T): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(data as Record<string, any>)) {
      const val = (data as Record<string, any>)[key];
      if (val !== undefined) {
        cleaned[key] = typeof val === 'object' && val !== null ? cleanFirestoreData(val) : val;
      }
    }
    return cleaned;
  }
  return data;
}
