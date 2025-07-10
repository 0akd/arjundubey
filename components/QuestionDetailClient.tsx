'use client'

import { useRef } from 'react'
import HintBox from '@/app/stats/llm'

export default function QuestionDetailClient({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const urls = Array.isArray(data.youtube_url)
    ? data.youtube_url
    : typeof data.youtube_url === 'string'
    ? data.youtube_url.split(',').map((u) => u.trim())
    : []

  const handleFullscreen = () => {
    const elem = containerRef.current
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen()
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen()
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <pre><code>{data.content}</code></pre>

      {data.code && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap text-sm text-gray-800">
          <code>{data.code}</code>
        </pre>
      )}

      <HintBox questionTitle={data.title} questioncontent={data.content} />

      <div className="overflow-x-auto space-x-4 flex snap-x snap-mandatory">
        {urls.map((url: string, index: number) => (
          <div
            key={index}
            className="min-w-[320px] snap-center relative"
            ref={index === 0 ? containerRef : null}
          >
            <iframe
              className="w-full aspect-video"
              src={url}
              title={`YouTube video ${index + 1}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
            {index === 0 && (
              <button
                onClick={handleFullscreen}
                className="absolute bottom-2 right-2 bg-black text-white px-3 py-1 text-sm rounded"
              >
                Fullscreen
              </button>
            )}
          </div>
        ))}
      </div>

      {data.code_blocks?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Code Examples</h2>
          <div className="flex space-x-4 overflow-x-auto snap-x snap-mandatory pb-4">
            {data.code_blocks.map((codeBlock: string, index: number) => {
              const [titleLine, ...codeLines] = codeBlock.split('\n')
              const codeBody = codeLines.join('\n')
              return (
                <div
                  key={index}
                  className="min-w-[300px] max-w-[500px] bg-white border shadow rounded p-4 snap-center"
                >
                  <p className="font-semibold mb-2">
                    {titleLine || `Code Block ${index + 1}`}
                  </p>
                  <pre className="bg-gray-100 p-3 rounded overflow-auto whitespace-pre-wrap text-sm text-gray-800 max-h-64">
                    <code>{codeBody}</code>
                  </pre>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
