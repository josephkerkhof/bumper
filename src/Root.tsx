import "./index.css";
import { Composition } from "remotion";
import { IntroBumper } from "./IntroBumper";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="IntroBumper"
        component={IntroBumper}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
