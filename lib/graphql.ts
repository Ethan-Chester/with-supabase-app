import { getOrCreateClientId } from "./client-id";

const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

if (!PROJECT_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}
if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set");
}

const GRAPHQL_URL = `${PROJECT_URL}/graphql/v1`;

export async function gql<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  // run only on client
  const clientId =
    typeof window !== "undefined" ? getOrCreateClientId() : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: API_KEY,
  };

  // attach per-device id so RLS can use it
  if (clientId) {
    headers["x-client-id"] = clientId;
  }

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables: variables ?? {} }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error(
      "GraphQL error: " + JSON.stringify(json.errors, null, 2)
    );
  }

  return json.data;
}
