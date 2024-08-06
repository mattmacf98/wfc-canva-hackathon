import {FC, forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import {Sketch} from "../../waveFunctionCollapse/Sketch";
import p5 from "p5";

export interface IP5SketchProps {
    canvasDimension: number;
    dimension: number;
    imageUrls: string[];
}
export const P5Sketch: FC = forwardRef((props: IP5SketchProps, ref) => {
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
        sketchRef.current = new Sketch(props.canvasDimension, props.dimension, props.imageUrls);

        const p5Instance = new p5(sketchRef.current!.createSketch(), p5Ref.current!);

        return () => {
            p5Instance.remove();
        };
    }, [props.imageUrls, props.dimension, props.canvasDimension])

    return (
                <div ref={p5Ref} style={{
                    display: props.imageUrls.length > 0 ? 'flex' : 'none',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%'
                }}></div>
    )
});

