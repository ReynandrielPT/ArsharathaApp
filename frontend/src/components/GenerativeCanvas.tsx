import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Text, Image, Rect, Line } from 'react-konva';
import useImage from 'use-image';

interface CanvasCommand {
  type: 'speak' | 'createText' | 'drawImage' | 'createShape' | 'clear';
  parameters: any;
}

interface GenerativeCanvasProps {
  commands: CanvasCommand[];
  onSpeakStart: () => void;
  onSpeakEnd: () => void;
}

const GenerativeCanvas: React.FC<GenerativeCanvasProps> = ({
  commands,
  onSpeakStart,
  onSpeakEnd
}) => {
  const [elements, setElements] = useState<any[]>([]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (commands.length === 0) return;

    const executeCommands = async () => {
      setElements([]);
      setCurrentCommandIndex(0);

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        
        if (command.type === 'speak') {
          onSpeakStart();
          await new Promise(resolve => setTimeout(resolve, command.parameters.duration));
          onSpeakEnd();
        } else if (command.type === 'createText') {
          setElements(prev => [...prev, {
            id: `text-${Date.now()}-${i}`,
            type: 'text',
            ...command.parameters
          }]);
        } else if (command.type === 'drawImage') {
          setElements(prev => [...prev, {
            id: `image-${Date.now()}-${i}`,
            type: 'image',
            ...command.parameters
          }]);
        } else if (command.type === 'createShape') {
          setElements(prev => [...prev, {
            id: `shape-${Date.now()}-${i}`,
            type: 'shape',
            ...command.parameters
          }]);
        } else if (command.type === 'clear') {
          setElements([]);
        }

        setCurrentCommandIndex(i + 1);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    executeCommands();
  }, [commands, onSpeakStart, onSpeakEnd]);

  const ImageComponent = ({ src, x, y, width, height }: any) => {
    const [image] = useImage(src);
    return image ? <Image image={image} x={x} y={y} width={width} height={height} /> : null;
  };

  const ArrowComponent = ({ x, y, width, height, fill }: any) => {
    const points = [
      x, y + height / 2,
      x + width - 20, y + height / 2,
      x + width - 20, y,
      x + width, y + height / 2,
      x + width - 20, y + height,
      x + width - 20, y + height / 2
    ];

    return <Line points={points} fill={fill} closed stroke={fill} strokeWidth={2} />;
  };

  return (
    <div className="w-full h-full">
      <Stage width={window.innerWidth / 2} height={window.innerHeight} ref={stageRef}>
        <Layer>
          {elements.map((element) => {
            if (element.type === 'text') {
              return (
                <Text
                  key={element.id}
                  text={element.text}
                  x={element.x}
                  y={element.y}
                  fontSize={element.fontSize}
                  fontFamily="Inter, Arial, sans-serif"
                  fontStyle={element.fontWeight}
                  fill={element.fill}
                />
              );
            } else if (element.type === 'image') {
              return (
                <ImageComponent
                  key={element.id}
                  src={element.src}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                />
              );
            } else if (element.type === 'shape') {
              if (element.parameters?.type === 'arrow') {
                return (
                  <ArrowComponent
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    fill={element.fill}
                  />
                );
              } else {
                return (
                  <Rect
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    fill={element.fill}
                  />
                );
              }
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default GenerativeCanvas;