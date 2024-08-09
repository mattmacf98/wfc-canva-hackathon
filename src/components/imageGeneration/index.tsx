import {useContext, useRef, useState} from "react";
import {Col, Row} from "react-bootstrap";
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
import Notification from "../notification";

export const ImageGeneration = () => {
    const canvasDimension  = 700;
    const p5SketchRef = useRef(null);
    const canvaControlsRef = useRef(null);
    const [showImageSelectModal, setShowImageSelectModal] = useState(false);
    const {imageUrls} = useContext(WaveFunctionCollapseContext);

    return (
        <>
            <Row>
                <Col lg={3} style={{ borderRight: "3px solid #e8ebeb", height: "100vh"}}>
                    <AI p5SketchRef={p5SketchRef} canvaControlsRef={canvaControlsRef}/>
                </Col>
                <Col lg={9}>
                    <Row className="flex-grow-1 justify-content-center align-items-center">
                        <Col lg={8}>
                            <Notification/>
                            <WaveFunctionCollapseImageControls/>
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
                            <div style={{height:16}}/>
                            <WaveFunctionCollapseNextBackControls p5SketchRef={p5SketchRef}/>
                        </Col>
                        <Col lg={4}>
                            <WaveFunctionControls p5SketchRef={p5SketchRef}/>
                            <div style={{height:16}}/>
                            <CanvaControls openImageSelectModal={() => setShowImageSelectModal(true)} ref={canvaControlsRef}/>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <ImageTileSelectModal show={showImageSelectModal} hide={() => setShowImageSelectModal(false)}/>
        </>
    )
}

export default ImageGeneration
