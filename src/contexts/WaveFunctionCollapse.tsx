import {createContext, FC, ReactNode, useState} from "react";

interface IWaveFunctionCollapseContext {
    imageUrls: string[],
    setImageUrls: (imageUrls: string[]) => void,
    dimension: number,
    setDimension: (dimension: number) => void,
    imageName: string,
    setImageName: (name: string) => void
}

const initialContext: IWaveFunctionCollapseContext = {
    imageUrls: [],
    setImageUrls: () => null,
    dimension: 0,
    setDimension: () => null,
    imageName: "",
    setImageName: () => null
}

export const WaveFunctionCollapseContext = createContext<IWaveFunctionCollapseContext>({...initialContext});


interface IProps {
    children: ReactNode;
}
export const WaveFunctionCollapseProvider: FC<IProps> = ({children}) => {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [dimension, setDimension] = useState<number>(6);
    const [imageName, setImageName] = useState('MyImage');

    const context: IWaveFunctionCollapseContext = {
        imageUrls,
        setImageUrls,
        dimension,
        setDimension,
        imageName,
        setImageName
    }

    return <WaveFunctionCollapseContext.Provider value={context}>{children}</WaveFunctionCollapseContext.Provider>
}
