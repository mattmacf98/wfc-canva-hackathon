import {CSSProperties, FC, useContext, useEffect, useState} from "react";
import {Col, Container, Form, Row} from "react-bootstrap";
import {WaveFunctionCollapseContext} from "../../contexts/WaveFunctionCollapse";
import ReactLoading from 'react-loading'

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

const messageInputStyle: CSSProperties = {
    border: "none",
    outline: "none",
    width: "100%"
}

const assistantBubbleStyle: CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '10px 15px',
    maxWidth: '60%',
    alignSelf: 'flex-start',
    marginBottom: '10px',
    wordWrap: 'break-word',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const userBubbleStyle: CSSProperties = {
    backgroundColor: '#F5F5FA',
    color: '#7878AB',
    borderRadius: '20px',
    padding: '10px 15px',
    maxWidth: '60%',
    alignSelf: 'flex-end',
    marginBottom: '16px',
    wordWrap: 'break-word',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const AI: FC<IAIProps> = ({p5SketchRef, canvaControlsRef}) => {
    const {setDimension, setImageName} = useContext(WaveFunctionCollapseContext);
    const [loadingAIResponse, setLoadingAIResponse] = useState(false);
    const [inputValue, setInputValue] = useState('');
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
            const {imageGenerations} = responseJson
            generateImages(0, imageGenerations)
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
        <Col className="d-flex flex-column" style={{ height: '100%'}}>
            <Row className="flex-fill">
                <Container>
                    <Col style={{ display: 'flex', flexDirection: 'column', padding:24 }}>
                        {messages.filter(( message) => message.role !== "system" ).map(({content, role}, index) => {
                            if (role === "assistant") {
                                return (
                                    <Row key={index} style={{display: "flex", justifyContent: "flex-start"}}>
                                        <div style={assistantBubbleStyle}>
                                            {JSON.parse(content)["message"]}
                                        </div>
                                    </Row>
                                )
                            } else {
                                return (
                                    <Row key={index} style={{display: "flex", justifyContent: "flex-end"}} >
                                        <div style={userBubbleStyle}>
                                            {content}
                                        </div>
                                    </Row>
                                )
                            }
                        })}
                        {loadingAIResponse && <ReactLoading type={"bubbles"} color={"#7878AB"} height={45} width={45} />}
                    </Col>
                </Container>
            </Row>
            <Row lg={1}>
                <div style={{borderTop: "3px solid #e8ebeb", width: "100%", padding: 24}}>
                    <Container>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formInput">
                                <Form.Control
                                    style={messageInputStyle}
                                    type="text"
                                    placeholder="Enter text..."
                                    value={inputValue}
                                    onChange={(event) => setInputValue(event.target.value)}
                                />
                            </Form.Group>
                        </Form>
                    </Container>
                </div>
            </Row>
        </Col>
    );
}

export default AI;
