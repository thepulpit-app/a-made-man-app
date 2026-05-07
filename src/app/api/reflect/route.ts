import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { topic } = await req.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required.' },
        { status: 400 }
      )
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
    messages: [
  {
    role: 'system',
    content: `
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
  },
  {
    role: 'user',
    content: `Write a reflection for men on this topic: ${topic}`,
  },
]
    })

    const reflection =
      response.choices[0]?.message?.content || 'No reflection generated.'

    return NextResponse.json({ reflection })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to generate reflection.' },
      { status: 500 }
    )
  }
}