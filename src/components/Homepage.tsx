import { useRef, useState } from "react";
import { gemini_completion } from "@/gemini";
import MarkdownEditor from "@/components/MarkdownEditor";
import { useReactToPrint } from 'react-to-print';
import Html2Pdf from 'html2pdf.js';

interface SubChapter {
    name: string;
    content?: string;
}

interface Chapter {
    name: string;
    subChapters: SubChapter[];
    content?: string;
}

export default function Homepage() {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [bookTitle, setBookTitle] = useState<string>('');
    const [bookDescription, setBookDescription] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const contentToPrint = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        onPrintError: (error) => console.log(error),
        content: () => contentToPrint.current,
        removeAfterPrint: true,
        print: async (printIframe) => {
            if (typeof window !== "undefined") { // Check if window is defined
                const document = printIframe.contentDocument;
                if (document) {
                    setLoading(true);
                    const html = document.getElementsByTagName("html")[0];
                    await Html2Pdf().from(html).save();
                    await setLoading(false);
                }
            }
        },
    });

    const fetchData = async (title: string, description: string) => {
        setLoading(true);
        try {
            const data = await gemini_completion(`
        The title of the book is '${title}'. The book is described as: '${description}'. Just return a stringified JSON that I can simply use JSON.parse() with the key as 'chapters' and the value as an array of objects. Each object should have a 'name' key for the chapter name and a 'subChapters' key which is an array of objects, each with a 'name' key for the subchapter name. Don't add 'chapter n' before the name of the chapter. Each chapter should also have an array of 'subChapters' with at least 2 items. Don't return any text.
      `);

            console.log(data);
            console.log(JSON.parse(data.replaceAll('`', '').replace('json', '')));

            const chapters: Chapter[] = (JSON.parse(data.replaceAll('`', '').replace('json', ''))).chapters;

            const contentPromises = chapters.map(async (chapter) => {
                const newContent = await gemini_completion(`
          Here is the outline of the book:
          ${data}
          
          Write content for the chapter ${chapter.name} both the chapter and sub sections. Elaborate as much as possible. Keep things impactful. Return the markdown content only. Keep markdown as consistent as possible. Use headings properly. Be consistent with tags. Remember there should be a flow in the book. Guidelines for markdown

          h1 for chapter heading
          h2 for sub title heading
          h3 for sub sub title heading
          h4 for sub sub sub title heading
          h5 for sub sub sub sub title heading
          h6 for sub sub sub sub sub title heading
          p for paragraph
          ul for unordered list
          ol for ordered list
          li for list item
          blockquote for quote
          code for code
          pre for preformatted text
          hr for horizontal rule
          em for emphasis
          strong for strong emphasis
          del for strikethrough
          ins for insertion
          sup for superscript
          sub for subscript

        `);
                console.log(newContent);

                return newContent;
            });

            const allContent = await Promise.all(contentPromises);
            setContent(allContent.join('\n\n'));
            setLoading(false);
        } catch (err) {
            setError("An error occurred while fetching the book content. Please try again.");
            setLoading(false);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (bookTitle.trim() === '' || bookDescription.trim() === '') {
            setError("Both book title and description are required.");
            return;
        }
        setError(null);
        fetchData(bookTitle, bookDescription);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <form onSubmit={handleSubmit} className="w-full max-w-lg">
                <div className="mb-4">
                    <input
                        type="text"
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        placeholder="Enter book title"
                        className="appearance-none bg-transparent border px-6 py-2 w-full text-gray-700 mr-3 rounded-lg  leading-tight focus:outline-none"
                    />
                </div>
                <div className="mb-4">
                    <textarea
                        rows={10}
                        value={bookDescription}
                        onChange={(e) => setBookDescription(e.target.value)}
                        placeholder="Enter book description"
                        className="appearance-none bg-transparent border w-full text-gray-700 mr-3 py-2 px-6 rounded-lg leading-tight focus:outline-none"
                    />
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="flex-shrink-0 w-full bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
                >
                    Generate Book
                </button>
                {error && <p className="text-red-500 text-xs italic">{error}</p>}
            </form>

            {loading ? (
                <div>Loading...</div>
            ) : (
                content && (
                    <>
                        <button className="relative inline-block px-4 py-2 font-medium group" onClick={handlePrint}>
                            <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                            <span className="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
                            <span className="relative text-black group-hover:text-white">Print Book</span>
                        </button>
                        <div ref={contentToPrint}>
                            <MarkdownEditor markdown={content} dontShowTools />
                        </div>
                    </>
                )
            )}
        </main>
    );
}
