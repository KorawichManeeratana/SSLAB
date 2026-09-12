import { google } from "@ai-sdk/google"
import {
    convertToModelMessages,
    streamText,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    console.log("================================");
    console.log("BACKEND: Request received");
    console.log("================================");


    try {

        const body = await req.json();

        console.log("BACKEND: Raw body");
        console.log(body);


        const { messages } = body;

        console.log("BACKEND: Messages");
        console.log(messages);


        const modelMessages =
            await convertToModelMessages(messages);

        console.log("BACKEND: Model messages");
        console.log(modelMessages);


        console.log("BACKEND: Calling LLM...");


        const result = streamText({
            model: google("models/gemini-3.5-flash"),
            messages: modelMessages,
        });


        console.log("BACKEND: streamText() created");


        return result.toUIMessageStreamResponse();

    } catch (error) {

        console.error("BACKEND ERROR:");
        console.error(error);

        return new Response(
            JSON.stringify({
                error: "Internal server error",
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
}