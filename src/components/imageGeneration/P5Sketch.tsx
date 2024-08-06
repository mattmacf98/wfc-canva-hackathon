import {FC, forwardRef, useContext, useEffect, useImperativeHandle, useRef} from "react";
import {Sketch} from "../../waveFunctionCollapse/Sketch";
import p5 from "p5";
import {WaveFunctionCollapseContext} from "../../contexts/WaveFunctionCollapse";

export interface IP5SketchProps {
    canvasDimension: number
}
export const P5Sketch: FC = forwardRef((props: IP5SketchProps, ref) => {
    const {dimension, imageUrls} = useContext(WaveFunctionCollapseContext);
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
        },
        isDone: () => {
            return sketchRef.current?.isDone()
        }
    }), [])

    useEffect(() => {
        sketchRef.current = new Sketch(props.canvasDimension, dimension, imageUrls);

        const p5Instance = new p5(sketchRef.current!.createSketch(), p5Ref.current!);

        return () => {
            p5Instance.remove();
        };
    }, [imageUrls, dimension, props.canvasDimension])

    return (
        <div ref={p5Ref} style={{
            display: imageUrls.length > 0 ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%'
        }}/>
    )
});

