import { EmptyChatLoader } from "@/components/Loader";
// import { animationDefaultOptions } from "@/lib/utils";
// import Lottie from "react-lottie";
import { useState } from "react";
import { streamAIResponse } from "@/lib/streamAIResponse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // or another theme
import { ClipboardCopy, ClipboardCheck } from "lucide-react";
const EmptyChatContainer = () => {
  return (
    <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden transition-all duration-100">
      <div className="size-80">
        <EmptyChatLoader />
      </div>
      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center ">
        <h3 className="poppins-medium">
          Hi <span className="text-purple-500">!</span> Welcome to{" "}
          <span className="text-purple-500">Gossip</span> Chat 🚀
          <span className="text-purple-500">.</span>
        </h3>
      </div>
      <AIChat />
    </div>
  );
};

export default EmptyChatContainer;

const AIChat = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    setResponse(""); // clear previous output
    await streamAIResponse(
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
      (partialText) => {
        setResponse(partialText); // updates progressively
        if (partialText && message) {
          setMessage(""); // clear message when response is received
        }
      }
    );
  };

  return (
    <div className="p-5 flex flex-col items-center w-full overflow-y-scroll">
      <div className="w-full flex justify-between items-center gap-4 p-2">
        <Input
          className="w-full p-2 border text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Ask something..."
        />
        <Button
          onClick={handleSend}
          className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all"
        >
          Ask
        </Button>
      </div>
      {response === "" ? (
        <div className="text-gray-500 text-sm mt-2">
          Ask me anything! I will respond here.
        </div>
      ) : null}
      {response !== "" && (
        <div className="border w-full rounded-md p-4 whitespace-pre-wrap prose prose-invert max-w-none">
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            // components={{
            //   code: CodeBlockWithCopy,
            // }}
          >
            {response}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

const CodeBlockWithCopy = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace("language-", "") || "";

  if (inline) {
    return (
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{code}</ReactMarkdown>
    );
  }

  const code = String(children).trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1 bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition"
        title="Copy code"
      >
        {copied ? <ClipboardCheck size={16} /> : <ClipboardCopy size={16} />}
      </button>
      <pre className={`overflow-x-auto rounded-md bg-gray-900 text-white p-4`}>
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{code}</ReactMarkdown>
      </pre>
    </div>
  );
};
