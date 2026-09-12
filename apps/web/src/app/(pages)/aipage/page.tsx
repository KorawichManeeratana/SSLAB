'use client'

import { useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const [input, setInput] = useState("")
  const {
    messages,
    sendMessage,
    status
  } = useChat();

  // ดู messages ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    console.log("===== MESSAGES UPDATED =====");
    console.log(messages);
  }, [messages]);

  // ดู status ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    console.log("===== STATUS UPDATED =====");
    console.log(status);
  }, [status]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("===== USER CLICK SEND =====");

    console.log("Input:");
    console.log(input);

    if (!input.trim()) {
      console.log("Input is empty");
      return;
    }

    console.log("Calling sendMessage()...");

    sendMessage({
      text: input,
    });

    console.log("sendMessage() called");

    setInput("");
  };
  return (
    <>
      <main className="bg-black min-h-screen p-10">

        <div>
          respon will be here
          <hr />
          <br />
          {
            messages.map((message) => (
              <div key={message.id}>
                <strong>
                  {message.role}
                </strong>
                {
                  message.parts.map((part, index) => {
                    if (part.type == "text") {
                      return (
                        <p key={index}>
                          {part.text}
                        </p>
                      )
                    }
                    return null
                  })
                }
              </div>
            ))
          }

          <hr />

        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <input type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="code........." className="border-2 p-3 mr-5" />
          <button type="submit" disabled={status !== "ready"} className="border-2 p-3 hover:cursor-pointer hover:text-black hover:bg-white">Send</button>
        </form>
      </main>
    </>
  )
}