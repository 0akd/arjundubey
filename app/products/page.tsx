import { Download } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ paddingTop: '30vh' }}>
      <h1 className="text-3xl md:text-2xl font-semibold mb-12 md:mb-8 text-center">deArKs Version 9</h1>
      <a
        href="https://mkw3xpovahzkrpq2.public.blob.vercel-storage.com/product/deArKs.apk"
        download
        className="inline-flex items-center gap-3 px-8 py-4 md:px-6 md:py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-lg md:text-base"
      >
        <Download size={24} className="md:w-5 md:h-5" />
        Download
      </a>
    </div>
  );
}