export function getOrCreateClientId() {
  if (typeof window === "undefined") return null; // SSR safety

  let id = localStorage.getItem("client_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("client_id", id);
  }
  return id;
}
