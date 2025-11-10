const SNAPSHOT_HUB_URL = 'https://hub.snapshot.org/graphql';
const SNAPSHOT_SPACE = process.env.SNAPSHOT_SPACE || 'kongsdao.eth';

export async function fetchSnapshotProposals() {
  const query = `
    query Proposals {
      proposals(
        first: 20,
        skip: 0,
        where: {
          space_in: ["${SNAPSHOT_SPACE}"]
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        author
        space {
          id
          name
        }
      }
    }
  `;

  try {
    const response = await fetch(SNAPSHOT_HUB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Snapshot API error: ${response.statusText}`);
    }

    const data = await response.json();
    const proposals = data.data?.proposals || [];

    return proposals.map((proposal: any) => ({
      id: proposal.id,
      title: proposal.title,
      state: proposal.state,
      start: proposal.start,
      end: proposal.end,
      link: `https://snapshot.org/#/${SNAPSHOT_SPACE}/proposal/${proposal.id}`,
      choices: proposal.choices || [],
      body: proposal.body || '',
    }));
  } catch (error) {
    console.error('Error fetching Snapshot proposals:', error);
    return [];
  }
}
