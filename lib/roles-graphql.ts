import { gql } from "./graphql";
import { getOrCreateClientId } from "./client-id";

export type Role = {
  role_name: string;
  role_description: string | null;
  client_id: string | null;
};

// always get a client_id on the client
function getClientIdOrThrow(): string {
  if (typeof window === "undefined") {
    throw new Error("getClientIdOrThrow called on the server");
  }
  const id = getOrCreateClientId();
  if (!id) {
    throw new Error("Failed to get or create client_id");
  }
  return id;
}

// READ: get all roles for this device
export async function getRoles(): Promise<Role[]> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    rolesCollection: { edges: { node: Role }[] };
  }>(
    `
    query GetRoles($client_id: String!) {
      rolesCollection(
        filter: { client_id: { eq: $client_id } }
        orderBy: [{ role_name: AscNullsLast }]
      ) {
        edges {
          node {
            role_name
            role_description
            client_id
          }
        }
      }
    }
  `,
    { client_id }
  );

  return data.rolesCollection.edges.map((e) => e.node);
}

// CREATE: insert a new role for this device
export async function createRole(input: {
  role_name: string;
  role_description: string;
}): Promise<Role> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    insertIntorolesCollection: { records: Role[] };
  }>(
    `
    mutation CreateRole(
      $role_name: String!
      $role_description: String!
      $client_id: String!
    ) {
      insertIntorolesCollection(
        objects: [
          {
            role_name: $role_name
            role_description: $role_description
            client_id: $client_id
          }
        ]
      ) {
        records {
          role_name
          role_description
          client_id
        }
      }
    }
  `,
    {
      role_name: input.role_name,
      role_description: input.role_description,
      client_id,
    }
  );

  return data.insertIntorolesCollection.records[0];
}

// UPDATE: update an existing role owned by this device
// Here we treat role_name as the identifier and only update the description.
export async function updateRole(input: {
  role_name: string;
  role_description: string;
}): Promise<Role> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    updaterolesCollection: { records: Role[] };
  }>(
    `
    mutation UpdateRole(
      $role_name: String!
      $role_description: String!
      $client_id: String!
    ) {
      updaterolesCollection(
        filter: {
          role_name: { eq: $role_name }
          client_id: { eq: $client_id }
        }
        set: {
          role_description: $role_description
        }
      ) {
        records {
          role_name
          role_description
          client_id
        }
      }
    }
  `,
    {
      role_name: input.role_name,
      role_description: input.role_description,
      client_id,
    }
  );

  return data.updaterolesCollection.records[0];
}

// DELETE: delete a role owned by this device
export async function deleteRole(role_name: string): Promise<void> {
  const client_id = getClientIdOrThrow();

  await gql<{
    deleteFromrolesCollection: { affectedCount: number };
  }>(
    `
    mutation DeleteRole($role_name: String!, $client_id: String!) {
      deleteFromrolesCollection(
        filter: {
          role_name: { eq: $role_name }
          client_id: { eq: $client_id }
        }
      ) {
        affectedCount
      }
    }
  `,
    { role_name, client_id }
  );
}
