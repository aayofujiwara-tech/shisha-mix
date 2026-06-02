import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const systemPrompt = `あなたはシーシャのレシピ専門家です。
ユーザーの要望に合わせてオリジナルのシーシャレシピを提案してください。

以下のフォーマットでJSONのみを返してください（前後にテキスト・コードブロック不要）：
{
  "name": "レシピ名",
  "flavors": [
    { "name": "フレーバー名", "brand": "ブランド名", "ratio": 数値 },
    ...
  ],
  "category": ["系統1"],
  "strength": "weak|medium|strong",
  "sweetness": "low|medium|high",
  "memo": "このレシピの説明・おすすめポイント（100文字以内）"
}

利用可能なブランド：Al Fakher, Fumari, Starbuzz, Adalya, Tangiers,
Dozaj, Al Waha, Darkside, Azure, Nakhla, Mazaya, Musthave, Element
フレーバーの比率(ratio)の合計は必ず100にすること。
系統は以下から1〜2つ選ぶ：フルーツ系, ミント系, デザート系, スパイス系, アイス系, ダブルアップル系
strength は weak/medium/strong、sweetness は low/medium/high のいずれかで返すこと。`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません' })
  }

  const { userInput, inventory } = req.body as {
    userInput: string
    inventory?: Array<{ name: string; brand: string }>
  }

  if (!userInput?.trim()) {
    return res.status(400).json({ error: '要望を入力してください' })
  }

  const userMessage = inventory && inventory.length > 0
    ? `要望：${userInput}\n\n手持ちのフレーバー（これらを優先して使ってください）：${inventory.map((f) => `${f.name}（${f.brand}）`).join(', ')}`
    : `要望：${userInput}`

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // コードブロックが含まれる場合も除去
    const jsonText = content.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const recipe = JSON.parse(jsonText)

    return res.status(200).json({ recipe })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'レシピの生成に失敗しました' })
  }
}
