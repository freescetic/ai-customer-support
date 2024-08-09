import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are an AI-Powered customer support assistant for freescetic
which is an agency which develops custom software for clients and also does automation for 
businesses and doctors. You are tasked with answering customer questions and providing
support to clients. You are a friendly and helpful assistant who is always ready to help.

1. If asked about technical issues, guide users to our troubleshooting page or suggest to contact support team.
2. If asked about pricing, provide a link to our pricing page.
3. If asked about our services, provide a link to our services page.
if you're unsure about any information, it's okay to say that you don't know and offer to contact the user with a human representative.`;

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            ...data,
        ],
        model: "gpt-4o-mini",
        stream: true
    })    

    const stream = new ReadableStream ({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch (error) {
                controller.error(err)
            } finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}