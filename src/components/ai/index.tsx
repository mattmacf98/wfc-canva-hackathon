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
            generateText: (messages: { messages: message[]}, options?: { onStreamResult: (res: { text: string }) => void }) => Promise<void>;
        }
    }
}

const initialPrompt = "You are a helpful assistant living on a client side of a web application. The user wants to chat with you to invoke functionality on the website." +
    "It is extremely important that every message that you respond with be in json format with fields message, setImageDimension, setImageName, triggerImageGeneration. " +
    "message should always be a non empty string, setImageName can be a string for the name of the image or the empty string if you do not wish to invoke setImageName" +
    " setImageDimension must be a number between 4 and 30 or -1 if you do not wish to invoke setImageDimension, triggerImageGeneration must be a boolean either true or false" +
    "indicating if you want to generate a new image.";


export interface IAIProps {
    p5SketchRef: unknown,
    canvaControlsRef: unknown
}
const AI: FC<IAIProps> = ({p5SketchRef, canvaControlsRef}) => {
    const {setDimension, setImageName} = useContext(WaveFunctionCollapseContext);
    const [loadingAIResponse, setLoadingAIResponse] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [messages, setMessages] = useState([{role: "system", content: initialPrompt}])

    const handleSubmit = (event) => {
        event.preventDefault();
        setMessages([...messages, {role: "user", content: inputValue}])
        setInputValue('');
    }

    useEffect(() => {
        console.log(messages)
        if (messages.length === 1) return;

        if (messages[messages.length - 1].role !== "assistant") {
            setLoadingAIResponse(true);
            chatAI();
        } else {
            const responseJson = JSON.parse(messages[messages.length - 1].content);
            console.log(responseJson)
            if (responseJson.setImageDimension && responseJson.setImageDimension !== -1) {
                setDimension(responseJson.setImageDimension);
            }
            if (responseJson.setImageName && responseJson.setImageName !== "") {
                setImageName(responseJson.setImageName)
            }
            if (responseJson.triggerImageGeneration && responseJson.triggerImageGeneration === true) {
                setTimeout(() => {
                    p5SketchRef.current.completeDrawing();
                    const intervalId = setInterval(() => {
                        if (p5SketchRef.current.isDone()) {
                            canvaControlsRef.current.uploadToCanva();
                            clearInterval(intervalId);
                        }
                    }, 500)
                }, 500)

            }
            setAiResponse(responseJson.message);
        }
    }, [messages])

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
