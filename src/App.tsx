import {ChangeEvent, FC, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import p5 from "p5";
import {Button, Col, Container, Row} from "react-bootstrap";
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
                              <P5Sketch canvasDimension={canvasDimension} ref={p5SketchRef} files={files}/>
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
                      <Button onClick={() => talkToAi()}>Talk To AI</Button>
                  </Col>
              </Row>
          </Container>
      )
}

interface IProps {
    canvasDimension: number;
    files: File[];
}
const P5Sketch: FC = forwardRef((props: IProps, ref) => {
    const sketchRef = useRef<HTMLDivElement | null>(null);
    let sketch: Sketch | null = null;

    useImperativeHandle(ref, () => ({
        drawNext: () => {
            sketch?.drawNext();
        },
        goBack: () => {
            sketch?.goBack();
        },
        completeDrawing: () => {
            sketch?.completeDrawing();
        }
    }), [])

    useEffect(() => {
        sketch = new Sketch(props.canvasDimension, 20, props.files);

        const p5Instance = new p5(sketch.createSketch(), sketchRef.current!);

        return () => {
            p5Instance.remove();
        };
    }, [props.files])

    return <div ref={sketchRef} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}></div>
});

export default App
