import Anthropic from '@anthropic-ai/sdk';
import { PROPOSALS } from '@/lib/proposals';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { proposalId, stance, whyCare } = await req.json();

    const proposal = PROPOSALS.find((p) => p.id === proposalId);
    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const stancePhrase =
      stance === 'Support'
        ? 'I support this proposal'
        : stance === 'Oppose'
        ? 'I oppose this proposal'
        : 'I support this proposal with modifications';

    const whyCareSection = whyCare?.trim()
      ? `Personal connection: ${whyCare.trim()}`
      : 'The angler did not provide a personal statement — write a general comment from the perspective of a concerned Montana angler.';

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `You are helping a Montana angler write an effective public comment for the Montana Fish, Wildlife & Parks 2027–2028 fishing regulation scoping process. Comments are submitted to FWP staff and will influence the final regulation package presented to the Fish and Wildlife Commission.

PROPOSAL: ${proposal.title}
WHAT IT CHANGES: ${proposal.change}
FWP'S RATIONALE: ${proposal.rationale}
ANGLER'S POSITION: ${stancePhrase}
${whyCareSection}

Write a 150–220 word public comment that:
- Opens with a clear, direct statement of position on this specific proposal
- Naturally weaves in the angler's personal connection to make it authentic and individual (not a form letter)
- Engages with the biological or management reasoning FWP cited — agree with it, push back on it, or suggest how to address it better
- Ends with a specific, actionable ask
- Is respectful, factual, and reads like a real person — not corporate PR, not an advocacy template
- Does NOT use phrases like "as an avid angler" or "I have always loved Montana's waterways"

Write ONLY the comment text. No preamble, no headings, no quotation marks around the whole thing.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return Response.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    return Response.json({ comment: content.text });
  } catch (err) {
    console.error('Generate error:', err);
    return Response.json({ error: 'Failed to generate comment' }, { status: 500 });
  }
}
