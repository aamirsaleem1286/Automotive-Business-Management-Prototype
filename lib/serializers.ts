export function serialize<T>(doc: T): T & { id: string } {
  const plain = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  const rawId = plain.id ?? plain._id;
  delete plain._id;
  delete plain.__v;
  plain.id = String(rawId ?? "");
  return plain as T & { id: string };
}

export function serializeMany<T>(docs: T[]): Array<T & { id: string }> {
  return docs.map((doc) => serialize(doc));
}
