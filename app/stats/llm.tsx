'use client'
import React, { useState } from 'react'
import { Lightbulb, Loader2 } from 'lucide-react'

const AWANLLM_API_KEY = '0fb30cc8-f5d7-407b-ab38-279a8be29658'

export default function HintBox({ questionTitle,questioncontent }: { questionTitle: string ,questioncontent:string}) {
  const [showHint, setShowHint] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [renderedChunks, setRenderedChunks] = useState<JSX.Element[]>([])

  const fetchHintStream = async () => {
    setStreaming(true)
    setRenderedChunks([])

    try {
      const res = await fetch('https://api.awanllm.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AWANLLM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'Meta-Llama-3-8B-Instruct',
          stream: true,
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant that gives detailed algorithmic hints for solving problems without directly spoonfeeding the full solution.'
            },
            {
              role: 'user',
              content: `Give a helpful detailed stepwise methodological hints for solving the following question:\n\n"${questionTitle}""${questioncontent}".`
            }
          ],
          repetition_penalty: 1.1,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          max_tokens: 300
        })
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.trim() || line === 'data: [DONE]') continue

          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6))
              const content = json.choices?.[0]?.delta?.content
              if (content) {
                buffer += content

                // Try to process full lines as they stream in
                const parts = buffer.split('\n')
                const completedLines = parts.slice(0, -1)
                buffer = parts[parts.length - 1] // keep remainder

                const jsx = completedLines.map((line, i) =>
                  parseMarkdownLine(line + '\n', `${Date.now()}-${i}`)
                )

                setRenderedChunks((prev) => [...prev, ...jsx])
              }
            } catch {}
          }
        }
      }

      // flush remaining buffer
      if (buffer.trim()) {
        setRenderedChunks((prev) => [...prev, parseMarkdownLine(buffer, `final-${Date.now()}`)])
      }
    } catch (err) {
      setRenderedChunks([
        <p key="error" className="text-red-500">Failed to fetch hint.</p>
      ])
    } finally {
      setStreaming(false)
    }
  }

  const parseMarkdownLine = (line: string, key: string): JSX.Element => {
    const trimmed = line.trim()

    if (/^\*\*.+\*\*$/.test(trimmed)) {
      const text = trimmed.replace(/^\*\*(.+)\*\*$/, '$1')
      return <h3 key={key} className="font-bold text-base text-gray-900 mt-3">{text}</h3>
    }

    if (/^\*.+\*$/.test(trimmed)) {
      const text = trimmed.replace(/^\*(.+)\*$/, '$1')
      return <h4 key={key} className="font-semibold text-sm text-gray-700 mt-2">{text}</h4>
    }

    return <p key={key} className="text-sm text-gray-800">{trimmed}</p>
  }

  const handleToggleHint = () => {
    if (!showHint && renderedChunks.length === 0) {
      fetchHintStream()
    }
    setShowHint((prev) => !prev)
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleToggleHint}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition"
      >
        <Lightbulb size={18} />
        {showHint ? 'Hide Hint' : 'Show Hint'}
      </button>

      {showHint && (
        <div className="mt-3 border border-yellow-300 bg-yellow-50 rounded p-3 text-sm space-y-1 max-w-xl">
          {renderedChunks}
          {streaming && (
            <span className="inline-block animate-pulse text-gray-400">▍</span>
          )}
        </div>
      )}
    </div>
  )
}
