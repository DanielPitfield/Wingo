import React from "react";
import LetterTile from "./LetterTile";

export const Logo: React.FC = (props) => {
    return (
        <div className="logo">
            <LetterTile letter={"W"} status={"not set"}></LetterTile>
            <LetterTile letter={"I"} status={"contains"}></LetterTile>
            <LetterTile letter={"N"} status={"correct"}></LetterTile>
            <LetterTile letter={"G"} status={"incorrect"}></LetterTile>
            <LetterTile letter={"O"} status={"contains"}></LetterTile>
        </div>
    );
};
