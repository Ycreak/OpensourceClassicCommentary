// import React, { React.useEffect, React.useState, useRef } from "react";
import * as React from "react";
//import { Excalidraw } from "@excalidraw/excalidraw";
// import InitialData from "./initialData";

// import "../reactstyles.scss";
// import initialData from "./initialData";

const renderTopRightUI = () => {
    return (
        <button onClick={() => alert("This is dummy top right UI")}>
            {" "}
            Click me{" "}
        </button>
    );
};

const renderFooter = () => {
    return (
        <button onClick={() => alert("This is dummy footer")}>
            {" "}
            custom footer{" "}
        </button>
    );
};

export default function App() {
    const excalidrawRef = React.useRef(null);

    const [viewModeEnabled, setViewModeEnabled] = React.useState(false);
    const [zenModeEnabled, setZenModeEnabled] = React.useState(false);
    const [gridModeEnabled, setGridModeEnabled] = React.useState(false);
    const [blobUrl, setBlobUrl] = React.useState(null);
    const [canvasUrl, setCanvasUrl] = React.useState(null);
    const [exportWithDarkMode, setExportWithDarkMode] = React.useState(false);
    const [shouldAddWatermark, setShouldAddWatermark] = React.useState(false);
    const [theme, setTheme] = React.useState("light");

    React.useEffect(() => {
        const onHashChange = () => {
            const hash = new URLSearchParams(window.location.hash.slice(1));
            const libraryUrl = hash.get("addLibrary");
            if (libraryUrl) {
                excalidrawRef.current.importLibrary(libraryUrl, hash.get("token"));
            }
        };
        window.addEventListener("hashchange", onHashChange, false);
        return () => {
            window.removeEventListener("hashchange", onHashChange);
        };
    }, []);

    const updateScene = () => {
        const sceneData = {
            elements: [
                {
                    type: "rectangle",
                    version: 141,
                    versionNonce: 361174001,
                    isDeleted: false,
                    id: "oDVXy8D6rom3H1-LLH2-f",
                    fillStyle: "hachure",
                    strokeWidth: 1,
                    strokeStyle: "solid",
                    roughness: 1,
                    opacity: 100,
                    angle: 0,
                    x: 100.50390625,
                    y: 93.67578125,
                    strokeColor: "#c92a2a",
                    backgroundColor: "transparent",
                    width: 186.47265625,
                    height: 141.9765625,
                    seed: 1968410350,
                    groupIds: []
                }
            ],
            appState: {
                viewBackgroundColor: "#edf2ff"
            }
        };
        excalidrawRef.current.updateScene(sceneData);
    };

    //   React.FunctionComponent

    return (
        <div className="App">
            <h1> Excalidraw Here</h1>
            <div className="excalidraw-wrapper">
                hello there
                <div style={{ height: "500px" }}>
      hello
                </div>
            </div>
        </div>
    );
}

{/* <Excalidraw
ref={excalidrawRef}
//   initialData={InitialData}
onChange={(elements, state) =>
  console.log("Elements :", elements, "State : ", state)
}
onPointerUpdate={(payload) => console.log(payload)}
onCollabButtonClick={() =>
  window.alert("You clicked on collab button")
}
viewModeEnabled={viewModeEnabled}
zenModeEnabled={zenModeEnabled}
gridModeEnabled={gridModeEnabled}
theme={theme}
name="Custom name of drawing"
UIOptions={{ canvasActions: { loadScene: false } }}
renderTopRightUI={renderTopRightUI}
renderFooter={renderFooter}
/> */}
