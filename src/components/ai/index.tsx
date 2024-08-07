import {FC, useContext, useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import {WaveFunctionCollapseContext} from "../../contexts/WaveFunctionCollapse";

declare global {
    type message = {
        role: string;
        content: string;
    }
    interface Window {
        ai: {
            generateText: (messages: { messages: message[]}, options?: { onStreamResult: (res: { text: string }) => void }) => Promise<any[]>;
        }
    }
}

const initialPrompt = "You are a helpful assistant living on a client side of a web application. The user wants to chat with you to invoke functionality on the website." +
    "It is extremely important that every message that you respond with be in json format with fields message, and imageGenerations" +
    "imageGenerations is an array of JSON objects with fields dimension and imageName"+
    "message should always be a non empty string, imageName should always be a non empty string" +
    "dimension must be a number between 4 and 30";

export interface IAIProps {
    p5SketchRef: any,
    canvaControlsRef: any
}
const AI: FC<IAIProps> = ({p5SketchRef, canvaControlsRef}) => {
    const {setDimension, setImageName} = useContext(WaveFunctionCollapseContext);
    const [loadingAIResponse, setLoadingAIResponse] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [messages, setMessages] = useState([{role: "system", content: initialPrompt}])

    const handleSubmit = (event: any) => {
        event.preventDefault();
        setMessages([...messages, {role: "user", content: inputValue}])
        setInputValue('');
    }

    useEffect(() => {
        if (messages.length === 1) return;

        if (messages[messages.length - 1].role !== "assistant") {
            setLoadingAIResponse(true);
            chatAI();
        } else {
            const responseJson = JSON.parse(messages[messages.length - 1].content);
            const {imageGenerations, message} = responseJson
            generateImages(0, imageGenerations)
            setAiResponse(message);
        }
    }, [messages])

    const generateImages = async (index: number, imageGenerations: any[]) => {
        if (index >= imageGenerations.length) {
            return;
        }
        setDimension(imageGenerations[index].dimension);
        setImageName(imageGenerations[index].imageName);

        setTimeout(() => {
            p5SketchRef.current.completeDrawing();
            const intervalId = setInterval(() => {
                if (p5SketchRef.current.isDone()) {
                    canvaControlsRef.current.uploadToCanva(imageGenerations[index].imageName);
                    clearInterval(intervalId);
                    generateImages(index + 1, imageGenerations)
                }
            }, 500)
        }, 500)
    }

    const chatAI = async () => {
        const [ response ] = await window.ai.generateText({
            messages: messages.map(message => {
                // the AI model doesn't like json for the message content, so we extract just the text
                if(message.role === "assistant") {
                    return {
                        role: "assistant",
                        content: JSON.parse(message.content).message
                    }
                } else {
                    return message
                }
            })
        });
        setMessages([...messages, response.message]);
        setLoadingAIResponse(false)
    }

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formInput">
                    <Form.Label>Enter text</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter text..."
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
            { loadingAIResponse && <p>Loading AI response...</p>}
            { !loadingAIResponse && <p>{aiResponse}</p> }
        </>
    );
}

export default AI;
