import LetterTile from "../Components/LetterTile";
import DraggableItem from "../Components/DraggableItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SettingsData } from "../Data/SaveData/Settings";
import { useCorrectChime, useFailureChime, useLightPingChime, useClickChime } from "../Data/Sounds";
import { ArithmeticDragProps, ExpressionTile, ResultTile } from "../Pages/ArithmeticDrag";

interface ArithmeticDragTilesProps extends ArithmeticDragProps {
  expressionTiles: ExpressionTile[];
  resultTiles: ResultTile[];
  setExpressionTiles: (expressionTiles: ExpressionTile[]) => void;
  setResultTiles: (resultTiles: ResultTile[]) => void;
  settings: SettingsData;
}

const ArithmeticDragTiles = (props: ArithmeticDragTilesProps) => {
  const [parent] = useAutoAnimate<HTMLDivElement>();

  // dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  function handleDragEnd<
    T extends { id: number },
    TOpposite extends { id: number; status: "incorrect" | "correct" | "not set" }
  >(
    event: DragEndEvent,
    // tiles uses generic type which extends id (acting as a general constraint)
    tiles: T[],
    // oppositeTiles uses another generic type (with id and status general constraints)
    oppositeTiles: TOpposite[],
    setTiles: (tiles: T[]) => void,
    setOppositeTiles: (oppositeTiles: TOpposite[]) => void
  ) {
    const { active, over } = event;

    // Drag was started but the order of the tiles wasn't changed
    if (active.id === over?.id) {
      return;
    }

    // The tile which is being dragged
    const oldTile: T | undefined = tiles.find((tile) => tile.id === active.id);
    // The tile below where the tile being dragged has been dragged to
    const newTile: T | undefined = tiles.find((tile) => tile.id === over?.id);

    // Either of the required tiles for the switch to be made are missing
    if (!oldTile || !newTile) {
      return;
    }

    // Find the indexes of the tiles within the wordTiles array
    const oldIndex: number = tiles.indexOf(oldTile);
    const newIndex: number = tiles.indexOf(newTile);

    // Switch the positions of the tiles (using the indexes)
    const newTiles: T[] = arrayMove(tiles, oldIndex, newIndex);

    // Reset status of tiles when moved
    setTiles(newTiles.map((tile) => ({ ...tile, status: "not set" })));
    setOppositeTiles(oppositeTiles.map((tile) => ({ ...tile, status: "not set" })));
    playLightPingSoundEffect();
  }

  const draggableExpressionTiles = (
    <div className="draggable_tiles_wrapper" data-operands={props.gamemodeSettings.numOperands} ref={parent}>
      {props.expressionTiles.map((tile) => (
        <DraggableItem key={tile.id} id={tile.id}>
          <LetterTile letter={tile.expression} status={tile.status} settings={props.settings} />
        </DraggableItem>
      ))}
    </div>
  );

  const draggableResultTiles = (
    <div className="draggable_tiles_wrapper" data-operands={props.gamemodeSettings.numOperands} ref={parent}>
      {props.resultTiles.map((tile) => (
        <DraggableItem key={tile.id} id={tile.id}>
          <LetterTile letter={tile.total.toString()} status={tile.status} settings={props.settings} />
        </DraggableItem>
      ))}
    </div>
  );

  return (
    <div className="tile_row">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) =>
          handleDragEnd(event, props.expressionTiles, props.resultTiles, props.setExpressionTiles, props.setResultTiles)
        }
      >
        <SortableContext items={props.expressionTiles} strategy={verticalListSortingStrategy}>
          {draggableExpressionTiles}
        </SortableContext>
      </DndContext>

      {props.mode === "match" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) =>
            handleDragEnd(
              event,
              props.resultTiles,
              props.expressionTiles,
              props.setResultTiles,
              props.setExpressionTiles
            )
          }
        >
          <SortableContext items={props.resultTiles} strategy={verticalListSortingStrategy}>
            {draggableResultTiles}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default ArithmeticDragTiles;
