import { GET_AI_RESPONSE_ROUTE, HOST } from "../utils/constants";
export const streamAIResponse = async (messages, onDataChunk) => {
  const response = await fetch(`${HOST}/${GET_AI_RESPONSE_ROUTE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // for cookies if needed
    body: JSON.stringify({ messages }),
  });

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;
  let fullText = "";

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    const chunk = decoder.decode(value, { stream: true });

    const lines = chunk
      .split("\n")
      .filter((line) => line.trim().startsWith("data:"));
    for (const line of lines) {
      const json = line.replace("data: ", "").trim();

      if (json === "[DONE]") {
        done = true;
        break;
      }

      try {
        const parsed = JSON.parse(json);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") {
          fullText += delta;
          onDataChunk(fullText);
        }
      } catch (err) {
        console.error("Failed to parse chunk", err, json);
      }
    }
  }
};
