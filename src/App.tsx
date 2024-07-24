import {FC, forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import p5 from "p5";
import {Button, Col, Container, Row} from "react-bootstrap";
import {Sketch} from "./waveFunctionCollapse/Sketch";

export const App = () => {
      const canvasDimension  = 700;
      const buttonSpacing = {
          margin: "0 20px"
      }

      const p5SketchRef = useRef(null);


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
                          <P5Sketch canvasDimension={canvasDimension} ref={p5SketchRef}/>
                      </div>
                  </Col>
              </Row>
              <Row className="justify-content-center mb-3">
                  <Col xs="auto">
                      <Button variant="secondary" style={buttonSpacing} onClick={() => p5SketchRef.current.goBack()}>Back</Button>
                      <Button variant="secondary" style={buttonSpacing} onClick={() => p5SketchRef.current.drawNext()}>Next</Button>
                      <Button variant="primary" style={buttonSpacing} onClick={() => p5SketchRef.current.completeDrawing()}>Auto-complete</Button>
                  </Col>
              </Row>
          </Container>
      )
}

interface IProps {
    canvasDimension: number;
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
        sketch = new Sketch(props.canvasDimension, 30, "circuit", 13);

        const p5Instance = new p5(sketch.createSketch(), sketchRef.current!);

        return () => {
            p5Instance.remove();
        };
    }, [])

    return <div ref={sketchRef} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}></div>
});

export default App
