import { gql } from "@/lib/graphql";

export default async function TestPage() {
  const data = await gql(`
    query {
      __schema {
        queryType { name }
      }
    }
  `);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
