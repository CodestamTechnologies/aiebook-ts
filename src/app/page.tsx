"use client";

import { useEffect, useRef, useState } from "react";
import { gemini_completion } from "@/gemini";
import MarkdownEditor from "@/components/MarkdownEditor";
import { useReactToPrint } from 'react-to-print';
import Html2Pdf from 'js-html2pdf';


interface SubChapter {
  name: string;
  content?: string;
}

interface Chapter {
  name: string;
  subChapters: SubChapter[];
  content?: string;
}

export default function Home() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);


  const contentToPrint = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    onPrintError: (error) => console.log(error),
    content: () => contentToPrint.current,
    removeAfterPrint: true,
    print: async (printIframe) => {

      const document = printIframe.contentDocument;
      if (document) {
        setLoading(true)
        const html = document.getElementsByTagName("html")[0];
        console.log(html);
        const exporter = new Html2Pdf(html);
        await exporter.getPdf(true);
        await setLoading(false)
      }
    },
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await gemini_completion(`
        The title of the book is 'The Bride Guide'. The book is a self-help book for men to avoid the wrong bride in the modern world. We all know some girls these days are so degraded. How to avoid them and get the best bride possible. Don't argue with me. Just return a stringified JSON that I can simply use JSON.parse() with the key as 'chapters' and the value as an array of objects. Each object should have a 'name' key for the chapter name and a 'subChapters' key which is an array of objects, each with a 'name' key for the subchapter name. Don't add 'chapter n' before the name of the chapter. Each chapter should also have an array of 'subChapters' with at least 2 items. Don't return any text.
      `);

      console.log(data);
      console.log(JSON.parse(data.replaceAll('`', '').replace('json', '')));


      const chapters: Chapter[] = (JSON.parse(data.replaceAll('`', '').replace('json', ''))).chapters;

      const contentPromises = chapters.map(async (chapter) => {
        const newContent = await gemini_completion(`
          Here is the outline of the book :
          ${data}
          
          write content for the chapter ${chapter.name} both the chapter and sub sections Elaborate as much as possible. Keep things impactful. Return the markdown content only. Keep markdown as consistent possible. Use heading properly. Be consistent with tags. Remember there should be a flow in the book. 
        `);
        console.log(newContent);

        return newContent;
      });

      const allContent = await Promise.all(contentPromises);
      setContent(allContent.join('\n\n'));
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <button className="relative inline-block px-4 py-2 font-medium group" onClick={handlePrint}>
            <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
            <span className="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
            <span className="relative text-black group-hover:text-white">Button Text</span>
          </button>
          <div ref={contentToPrint}>
            <MarkdownEditor markdown={content} dontShowTools />
          </div>
        </>
      )}
    </main>
  );
}
