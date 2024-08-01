import {ChangeEvent, FC, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import p5 from "p5";
import {Button, Col, Container, Row, Form} from "react-bootstrap";
import {Sketch} from "./waveFunctionCollapse/Sketch";
declare global {
    interface Window {
        ai: {
            generateText: (prompt: { prompt: string }, options?: { onStreamResult: (res: { text: string }) => void }) => Promise<void>;
        }
    }
}

export const App = () => {
    const canvasDimension  = 700;
    const buttonSpacing = {
      margin: "0 20px"
    }
    const p5SketchRef = useRef(null);
    const [files, setFiles] = useState<File[]>([]);
    const [dimension, setDimension] = useState<number>(6);

    async function talkToAi() {
          const [ response ] = await window.ai.generateText(
            {
                prompt: "Hello world!"
            });

          console.log(response);
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
        }
    }


      return (
          <Container fluid className="d-flex flex-column vh-100">
              <Row className="justify-content-center mb-3">
                  <Col xs="auto">
                      <h2>Wave Function Collapse Generator</h2>
                      <div className="p-3">
                          <Form.Group controlId="exampleForm.ControlRange1">
                              <Form.Label>Choose a value:</Form.Label>
                              <Form.Range
                                  min={4}
                                  max={30}
                                  value={dimension}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDimension(Number(e.target.value))}
                              />
                              <Form.Text className="text-muted">
                                  {dimension}x{dimension}
                              </Form.Text>
                          </Form.Group>
                      </div>
                  </Col>
              </Row>
              <Row className="flex-grow-1 justify-content-center align-items-center">
                  <Col>
                      <div style={
                          {
                              border: '2px solid #ccc', borderRadius: '2px',
                              overflow: 'hidden', width: `${canvasDimension}px`, height: `${canvasDimension}px`,
                              margin: '0 auto'}
                      }>
                          {
                              files.length > 0 &&
                              <P5Sketch canvasDimension={canvasDimension} ref={p5SketchRef} files={files} dimension={dimension}/>
                          }
                      </div>
                  </Col>
              </Row>
              <Row className="justify-content-center mb-3">
                  <Col xs="auto">
                      {
                          files.length === 0 &&
                          <input
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              accept=".jpg,.jpeg,.png,.pdf"
                          />
                      }
                      {
                          files.length !== 0 &&
                          <Button variant="danger" onClick={() => setFiles([])}>Clear Tiles</Button>
                      }
                      <Button variant="secondary" style={buttonSpacing} onClick={() => p5SketchRef.current.goBack()}>Back</Button>
                      <Button variant="secondary" style={buttonSpacing} onClick={() => p5SketchRef.current.drawNext()}>Next</Button>
                      <Button variant="primary" style={buttonSpacing} onClick={() => p5SketchRef.current.completeDrawing()}>Auto-complete</Button>
                      <Button variant="warning" style={buttonSpacing} onClick={() => p5SketchRef.current.startOver()}>Start Over</Button>
                      <Button onClick={() => talkToAi()}>Talk To AI</Button>
                  </Col>
              </Row>
          </Container>
      )
}

interface IProps {
    canvasDimension: number;
    dimension: number;
    files: File[];
}
const P5Sketch: FC = forwardRef((props: IProps, ref) => {
    const p5Ref = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Sketch | null>(null);

    useImperativeHandle(ref, () => ({
        drawNext: () => {
            sketchRef.current?.drawNext();
        },
        goBack: () => {
            sketchRef.current?.goBack();
        },
        completeDrawing: () => {
            sketchRef.current?.completeDrawing();
        },
        startOver: () => {
            sketchRef.current?.startOver();
        }
    }), [])

    useEffect(() => {
        sketchRef.current = new Sketch(props.canvasDimension, props.dimension, props.files);

        const p5Instance = new p5(sketchRef.current!.createSketch(), p5Ref.current!);

        return () => {
            p5Instance.remove();
        };
    }, [props.files, props.dimension])

    return <div ref={p5Ref} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}></div>
});

export default App
