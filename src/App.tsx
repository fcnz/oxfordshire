import { Show, createSignal } from "solid-js";

const actions = {
  tile_phase: ["place_tile", "rotate_tile"],
  meeple_phase: ["place_meeple", "place_abbot", "recall_abbot"],
  end_phase: ["end_turn"],
};

type TileType = {
  edges: string[];
  joins: number[][];
  orientation: number;
  garden: boolean;
  abby: boolean;
};
type PlayerType = {
  name: string;
  score: number;
  meeple: number;
  abbot: boolean;
};

function App() {
  const players: PlayerType[] = [
    {
      name: "Fraser",
      score: 0,
      meeple: 5,
      abbot: true,
    },
    {
      name: "Megan",
      score: 0,
      meeple: 5,
      abbot: true,
    },
  ];
  const [activePlayer, setActivePlayer] = createSignal("Fraser");

  const [turnPhase, setTurnPhase] =
    createSignal<keyof typeof actions>("tile_phase");

  const allowedActions = () => actions[turnPhase()];

  const [stack, setStack] = createSignal<TileType[]>([
    {
      edges: ["city", "road", "grass", "road"],
      joins: [[1, 3]],
      orientation: 0,
      abby: false,
      garden: false,
    },
    {
      edges: ["grass", "road", "grass", "road"],
      joins: [],
      orientation: 0,
      abby: false,
      garden: false,
    },
    {
      edges: ["city", "city", "grass", "grass"],
      joins: [[0, 1]],
      orientation: 0,
      abby: false,
      garden: false,
    },
  ]);

  const [nextTile, setNextTile] = createSignal<TileType | null>(stack()[0]);

  const gameComplete = () => !stack().length;

  const doAction = (action: string) => {
    switch (action) {
      case "place_meeple":
        setTurnPhase("end_phase");
        break;
      case "place_abbot":
        setTurnPhase("end_phase");
        break;
      case "recall_abbot":
        setTurnPhase("end_phase");
        break;
      case "rotate_tile":
        setNextTile({
          ...nextTile()!,
          orientation: (nextTile()!.orientation + 1) % 4,
        });
        break;

      case "place_tile":
        setNextTile(null);
        setTurnPhase("meeple_phase");
        break;

      case "end_turn":
        setActivePlayer(
          () =>
            players[
              (players.indexOf(
                players.find((p) => p.name === activePlayer())!
              ) +
                1) %
                players.length
            ].name
        );
        setStack(stack().slice(0, -1));
        setNextTile(stack().slice(-1)[0]);
        setTurnPhase("tile_phase");
        break;
    }
  };
  return (
    <>
      <div class="flex gap-4">
        <div class="border flex-1">Board</div>
        <div class="flex flex-col gap-4">
          {players.map((p) => (
            <div
              class={`border ${
                p.name === activePlayer() ? "border-black border-2" : ""
              } p-1`}
            >
              <Player
                player={p}
                isActive={p.name === activePlayer()}
                act={doAction}
                options={allowedActions()}
                gameComplete={gameComplete()}
              />
            </div>
          ))}

          <Show
            when={!gameComplete()}
            fallback={<div class="border px-2 py-1">Game Complete!</div>}
          >
            <div class="border p-2">
              Tile:
              <Show when={nextTile()} fallback={<div>&ndash;</div>}>
                <Tile tile={nextTile()!} />
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </>
  );
}

function Tile(props: { tile: TileType }) {
  return (
    <div class="w-40 h-40 grid grid-cols-3 grid-rows-3 p-1 border">
      <div class="col-span-3 text-center">
        {props.tile.edges[props.tile.orientation]}
      </div>
      <div class="">{props.tile.edges[(props.tile.orientation + 3) % 4]}</div>
      <div></div>
      <div class="ml-auto">
        {props.tile.edges[(props.tile.orientation + 1) % 4]}
      </div>
      <div class="col-span-3 text-center mt-auto">
        {props.tile.edges[(props.tile.orientation + 2) % 4]}
      </div>
    </div>
  );
}

function Player(props: {
  player: PlayerType;
  isActive: boolean;
  act: (action: string) => void;
  options: string[];
  gameComplete: boolean;
}) {
  return (
    <div>
      <div>
        {props.player.name} score: {props.player.score} meeple:{" "}
        {props.player.meeple}
        {props.player.abbot && <> + Abbot</>}
      </div>
      {props.isActive &&
        !props.gameComplete &&
        props.options.map((o) => (
          <>
            <button onClick={() => props.act(o)}>{o}</button>
            <br />
          </>
        ))}
    </div>
  );
}
export default App;
