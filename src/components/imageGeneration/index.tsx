import {useContext, useRef, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import {
    WaveFunctionCollapseImageControls,
    WaveFunctionCollapseNextBackControls,
    WaveFunctionControls
} from "./WaveFunctionControls";
import {CanvaControls} from "./CanvaControls";
import {ImageTileSelectModal} from "./ImageTileSelectModal";
import {P5Sketch} from "./P5Sketch";
import {WaveFunctionCollapseContext} from "../../contexts/WaveFunctionCollapse";
import AI from "../ai";

export const ImageGeneration = () => {
    const canvasDimension  = 700;
    const p5SketchRef = useRef(null);
    const canvaControlsRef = useRef(null);
    const [showImageSelectModal, setShowImageSelectModal] = useState(false);
    const {imageUrls} = useContext(WaveFunctionCollapseContext);

    return (
        <>
            <Container fluid className="d-flex flex-column vh-100">
                <WaveFunctionCollapseImageControls/>
                <Row className="flex-grow-1 justify-content-center align-items-center">
                    <Col lg={3}>
                        <AI p5SketchRef={p5SketchRef} canvaControlsRef={canvaControlsRef}/>
                    </Col>
                    <Col lg={6}>
                        <div style={
                            {
                                border: '2px solid #ccc', borderRadius: '2px',
                                overflow: 'hidden', width: `${canvasDimension}px`, height: `${canvasDimension}px`,
                                margin: '0 auto'}
                        }>
                            {
                                imageUrls.length > 0 &&
                                <P5Sketch canvasDimension={canvasDimension} ref={p5SketchRef}/>
                            }
                        </div>
                    </Col>
                    <Col lg={3}>
                        <WaveFunctionControls p5SketchRef={p5SketchRef}/>

                        <CanvaControls openImageSelectModal={() => setShowImageSelectModal(true)} ref={canvaControlsRef}/>
                    </Col>
                </Row>

                <WaveFunctionCollapseNextBackControls p5SketchRef={p5SketchRef}/>
            </Container>

            <ImageTileSelectModal show={showImageSelectModal} hide={() => setShowImageSelectModal(false)}/>
        </>
    )
}

export default ImageGeneration
