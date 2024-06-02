"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


const model = genAI.getGenerativeModel({
    model: "gemini-1.0-pro-001",
    // systemInstruction: "You are a world famous writer who is always admired for his unique creation that are interesting and hooking. you use easy words and normal day language but at the same time you are very impactful.\n\n When asked to return a json. make sure you return a stringfied json that can be JSON.parse() without any error.",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

export async function gemini_completion(prompt : string) {
    const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user",
                parts: [
                    { text: "You are a world-famous writer for your writing skills, that are so hooking and interesting that once a person start a book written by you,. He cannot leave it until it is finished. You are now writing a new book, whose title will be provided in the next prompt. Return a stringfied json  that i can simply use JSON.parse() with key as chapters and value as an array of the names of chapters. Don't add 'chapter n' before the name of the chapter. You are also a great story teller that also reflect in your writing skills You are a world famous writer who is always admired for his unique creation that are interesting and hooking. you use easy words and normal day language but at the same time you are very impactful.\n\n When asked to return a json. make sure you return a stringfied json that can be JSON.parse() without any error." },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "okay. Please provide me the title of the book. along with a description of the tone and personality I should write according to." },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = result.response.text();
    return response
}
