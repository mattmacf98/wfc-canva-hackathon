import { useRef, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import {
    WaveFunctionCollapseImageControls,
    WaveFunctionCollapseNextBackControls,
    WaveFunctionControls
} from "./components/imageGeneration/WaveFunctionControls";
import {CanvaControls} from "./components/imageGeneration/CanvaControls";
import {ImageTileSelectModal} from "./components/imageGeneration/ImageTileSelectModal";
import {P5Sketch} from "./components/imageGeneration/P5Sketch";
declare global {
    interface Window {
        ai: {
            generateText: (prompt: { prompt: string }, options?: { onStreamResult: (res: { text: string }) => void }) => Promise<void>;
        }
    }
}

export const App = () => {
    const canvasDimension  = 700;
    const p5SketchRef = useRef(null);
    const [showImageSelectModal, setShowImageSelectModal] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [dimension, setDimension] = useState<number>(6);
    const [name, setName] = useState('MyImage');


    // async function talkToAi() {
    //       const [ response ] = await window.ai.generateText(
    //         {
    //             prompt: "Hello world!"
    //         });
    //
    //       console.log(response);
    // }

      return (
          <>
              <Container fluid className="d-flex flex-column vh-100">
                  <WaveFunctionCollapseImageControls setName={setName} setDimension={setDimension} name={name} dimension={dimension}/>
                  <Row className="flex-grow-1 justify-content-center align-items-center">
                      <Col lg={3}/>
                      <Col lg={6}>
                          <div style={
                              {
                                  border: '2px solid #ccc', borderRadius: '2px',
                                  overflow: 'hidden', width: `${canvasDimension}px`, height: `${canvasDimension}px`,
                                  margin: '0 auto'}
                          }>
                              {
                                  imageUrls.length > 0 &&
                                  <P5Sketch canvasDimension={canvasDimension} ref={p5SketchRef} imageUrls={imageUrls} dimension={dimension}/>
                              }
                          </div>
                      </Col>
                      <Col lg={3}>
                          <WaveFunctionControls p5SketchRef={p5SketchRef} imageUrls={imageUrls} setImageUrls={setImageUrls} />

                          <CanvaControls openImageSelectModal={() => setShowImageSelectModal(true)} imageName={name}/>
                      </Col>
                  </Row>

                  <WaveFunctionCollapseNextBackControls p5SketchRef={p5SketchRef}/>
              </Container>

              <ImageTileSelectModal show={showImageSelectModal} hide={() => setShowImageSelectModal(false)} setImageUrls={setImageUrls}/>
          </>
      )
}

export default App
