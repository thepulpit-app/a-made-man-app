import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // Check API key before anything else
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[reflect] ANTHROPIC_API_KEY is missing from environment variables')
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      )
    }

    const { topic } = await req.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required.' },
        { status: 400 }
      )
    }

    // Client created inside the function — avoids module-level init errors
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `
You are the voice of A MADE MAN.

Write like a disciplined, experienced man speaking truth to other men — firm, wise, and grounded, but with occasional dry humour.

Rules:
- No fluff
- No hype
- No motivational clichés
- No religious language
- No emojis
- No cheesy jokes
- No clowning
- No long storytelling

Tone:
- Direct
- Grounded
- Masculine
- Clear
- Authoritative
- Human
- Occasionally witty

Humour style:
- Dry humour
- Light sarcasm
- Brotherhood banter
- The kind of humour men use to correct each other without making it soft

Focus:
- Discipline
- Responsibility
- Integrity
- Self-control
- Purpose
- Brotherhood
- Fatherhood
- Legacy

Style:
- Short paragraphs
- Punchy sentences
- Clear insight
- Practical truth
- One or two light humorous lines only when natural

End with a strong closing line that reinforces identity.

Do not explain. Do not ramble. Deliver impact.
      `,
      messages: [
        {
          role: 'user',
          content: `Write a reflection for men on this topic: ${topic}`,
        },
      ],
    })

    const reflection =
      response.content[0].type === 'text'
        ? response.content[0].text
        : 'No reflection generated.'

    return NextResponse.json({ reflection })

  } catch (error: any) {
    console.error('[reflect] Error:', error?.status, error?.message || error)
    return NextResponse.json(
      { error: 'Failed to generate reflection. Please try again.' },
      { status: 500 }
    )
  }
}
