import { gql } from "./graphql";
import { getOrCreateClientId } from "./client-id";

export type Play = {
  play_id: string;
  play_name: string;
  client_id: string | null;
};

export type PlayStep = {
  id: string;
  play_id: string;
  client_id: string | null;
  step_name: string;
  step_description: string | null;
  step_num: number;
  step_role_name: string | null; 
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


// READ: get all plays for this device

export async function getPlays(): Promise<Play[]> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    playsCollection: { edges: { node: Play }[] };
  }>(
    `
    query GetPlays($client_id: String!) {
      playsCollection(
        filter: { client_id: { eq: $client_id } }
        orderBy: [{ play_name: AscNullsLast }]
      ) {
        edges {
          node {
            play_id
            play_name
            client_id
          }
        }
      }
    }
  `,
    { client_id },
  );

  return data.playsCollection.edges.map((e) => e.node);
}


// CREATE: insert a new play for this device

export async function createPlay(input: {
  play_name: string;
}): Promise<Play> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    insertIntoplaysCollection: { records: Play[] };
  }>(
    `
    mutation CreatePlay(
      $play_name: String!
      $client_id: String!
    ) {
      insertIntoplaysCollection(
        objects: [
          {
            play_name: $play_name
            client_id: $client_id
          }
        ]
      ) {
        records {
          play_id
          play_name
          client_id
        }
      }
    }
  `,
    {
      play_name: input.play_name,
      client_id,
    },
  );

  return data.insertIntoplaysCollection.records[0];
}


// UPDATE: update an existing play owned by this device

export async function updatePlay(input: {
  play_id: string;
  play_name: string;
}): Promise<Play> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    updateplaysCollection: { records: Play[] };
  }>(
    `
    mutation UpdatePlay(
      $play_id: uuid!
      $play_name: String!
      $client_id: String!
    ) {
      updateplaysCollection(
        filter: {
          play_id: { eq: $play_id }
          client_id: { eq: $client_id }
        }
        set: {
          play_name: $play_name
        }
      ) {
        records {
          play_id
          play_name
          client_id
        }
      }
    }
  `,
    {
      play_id: input.play_id,
      play_name: input.play_name,
      client_id,
    },
  );

  return data.updateplaysCollection.records[0];
}


// DELETE: delete a play owned by this device

export async function deletePlay(play_id: string): Promise<void> {
  const client_id = getClientIdOrThrow();

  await gql<{
    deleteFromplaysCollection: { affectedCount: number };
  }>(
    `
    mutation DeletePlay($play_id: UUID!, $client_id: String!) {
      deleteFromplaysCollection(
        filter: {
          play_id: { eq: $play_id }
          client_id: { eq: $client_id }
        }
      ) {
        affectedCount
      }
    }
  `,
    { play_id, client_id },
  );
}


// read steps from a play
export async function getPlaySteps(play_id: string): Promise<PlayStep[]> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    play_stepsCollection: { edges: { node: PlayStep }[] };
  }>(
    `
    query GetPlaySteps($play_id: uuid!, $client_id: String!) {
      play_stepsCollection(
        filter: {
          play_id: { eq: $play_id }
          client_id: { eq: $client_id }
        }
        orderBy: [{ step_num: AscNullsLast }]
      ) {
        edges {
          node {
            id
            play_id
            client_id
            step_name
            step_description
            step_num
            step_role_name   # <— was step_role_id
          }
        }
      }
    }
  `,
    { play_id, client_id },
  );

  return data.play_stepsCollection.edges.map((e) => e.node);
}


// get play_id by client_id
export async function getPlay(play_id: string): Promise<Play | null> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    playsCollection: { edges: { node: Play }[] };
  }>(
    `
    query GetPlay($play_id: uuid!, $client_id: String!) {
      playsCollection(
        filter: {
          play_id: { eq: $play_id }
          client_id: { eq: $client_id }
        }
        first: 1
      ) {
        edges {
          node {
            play_id
            play_name
            client_id
          }
        }
      }
    }
  `,
    { play_id, client_id },
  );

  const node = data.playsCollection.edges[0]?.node ?? null;
  return node;
}

// Create a new step for play
export async function createPlayStep(input: {
  play_id: string;
  step_name: string;
  step_description: string | null;
  step_num: number;
  step_role_name: string | null;
}): Promise<PlayStep> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    insertIntoplay_stepsCollection: { records: PlayStep[] };
  }>(
    `
    mutation CreatePlayStep(
      $play_id: uuid!
      $client_id: String!
      $step_name: String!
      $step_description: String
      $step_num: Int!
      $step_role_name: String
    ) {
      insertIntoplay_stepsCollection(
        objects: [
          {
            play_id: $play_id
            client_id: $client_id
            step_name: $step_name
            step_description: $step_description
            step_num: $step_num
            step_role_name: $step_role_name
          }
        ]
      ) {
        records {
          id
          play_id
          client_id
          step_name
          step_description
          step_num
          step_role_name
        }
      }
    }
  `,
    {
      play_id: input.play_id,
      client_id,
      step_name: input.step_name,
      step_description: input.step_description,
      step_num: input.step_num,
      step_role_name: input.step_role_name,
    },
  );

  const record = data.insertIntoplay_stepsCollection.records[0];
  if (!record) {
    throw new Error("createPlayStep: no record returned");
  }
  return record;
}

// Update existing steps name + description + role
export async function updatePlayStepName(
  step_id: string,
  step_name: string,
  step_description: string | null,
  step_role_name: string | null,
  step_num: number,             
): Promise<PlayStep> {
  const client_id = getClientIdOrThrow();

  const data = await gql<{
    updateplay_stepsCollection: { records: PlayStep[] };
  }>(
    `
    mutation UpdatePlayStepName(
      $id: uuid!
      $client_id: String!
      $step_name: String!
      $step_description: String
      $step_role_name: String
      $step_num: Int!          
    ) {
      updateplay_stepsCollection(
        filter: {
          id: { eq: $id }
          client_id: { eq: $client_id }
        }
        set: {
          step_name: $step_name
          step_description: $step_description
          step_role_name: $step_role_name
          step_num: $step_num 
        }
      ) {
        records {
          id
          play_id
          client_id
          step_name
          step_description
          step_num
          step_role_name
        }
      }
    }
  `,
    {
      id: step_id,
      client_id,
      step_name,
      step_description,
      step_role_name,
      step_num,                    
    },
  );

  const record = data.updateplay_stepsCollection.records[0];
  if (!record) {
    throw new Error(
      `updatePlayStepName: no record returned for id=${step_id}`,
    );
  }
  return record;
}


// Delete a step
export async function deletePlayStep(step_id: string): Promise<void> {
  const client_id = getClientIdOrThrow();

  await gql<{
    deleteFromplay_stepsCollection: { affectedCount: number };
  }>(
    `
    mutation DeletePlayStep($id: uuid!, $client_id: String!) {
      deleteFromplay_stepsCollection(
        filter: {
          id: { eq: $id }
          client_id: { eq: $client_id }
        }
      ) {
        affectedCount
      }
    }
  `,
    { id: step_id, client_id },
  );
}


// Save all steps:
export async function saveStepNames(steps: PlayStep[]): Promise<void> {
  const existing = steps.filter(
    (s) => s.id && !s.id.startsWith("temp-") && s.step_name?.trim(),
  );

  const fresh = steps.filter(
    (s) => s.id && s.id.startsWith("temp-") && s.step_name?.trim(),
  );

  // Update existing steps
  for (const step of existing) {
    const name = step.step_name.trim();

    const desc =
      step.step_description === undefined ||
      step.step_description === null ||
      step.step_description.trim() === ""
        ? null
        : step.step_description;

    const role =
      step.step_role_name === undefined ||
      step.step_role_name === null ||
      step.step_role_name.trim() === ""
        ? null
        : step.step_role_name;

    await updatePlayStepName(
    step.id,
    name,
    desc,
    role,
    step.step_num,
  );

  }

  // Insert newly added steps
  for (const step of fresh) {
    const name = step.step_name.trim();

    const desc =
      step.step_description === undefined ||
      step.step_description === null ||
      step.step_description.trim() === ""
        ? null
        : step.step_description;

    const role =
      step.step_role_name === undefined ||
      step.step_role_name === null ||
      step.step_role_name.trim() === ""
        ? null
        : step.step_role_name;

    const step_num = step.step_num;

    await createPlayStep({
      play_id: step.play_id,
      step_name: name,
      step_description: desc,
      step_num,
      step_role_name: role,
    });
  }
}

