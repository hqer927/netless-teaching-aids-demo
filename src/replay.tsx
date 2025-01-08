import './App.css';
import video_playSVG from "./assets/image/video-play.svg";
import PlayerController from "@netless/player-controller";
import { useLayoutEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { PlayerPhase, type Player } from "white-web-sdk";
import { ReplayerTopTools } from './view/topTools';
import React from 'react';

export const Replay = () => {
    const data = useLoaderData() as {player: Player };
    const [phase, setPhase]= useState<PlayerPhase>();
    useLayoutEffect(()=>{
        window.player.callbacks.on('onPhaseChanged', playerPhaseChangeListener);
    },[])
    const controller = useMemo(()=>{
        return <PlayerController player={data.player} />
    },[data.player])
    const playerPhaseChangeListener = (phase:PlayerPhase) => {
        // console.log('onPhaseChanged', phase)
        setPhase(phase);
    }
    const onClickOperationButton = (): void => {
        switch (data.player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause: {
                data.player.play();
                break;
            }
            case PlayerPhase.Playing: {
                data.player.pause();
                break;
            }
            case PlayerPhase.Ended: {
                data.player.seekToProgressTime(1000)
                      .catch((error) => console.error(error));
                break;
            }
        }
    };
    return <div className='Replay'>
        {controller}
        <div className="player-board-inner" onClick={() => onClickOperationButton()}>
            <div className="player-mask">
                {(phase === PlayerPhase.Pause || phase === PlayerPhase.Ended) && (
                    <img
                        style={{ width: 50, marginLeft: 6 }}
                        src={video_playSVG}
                        alt="video_play" />
                )}
            </div>
        </div>
        <ReplayerTopTools/>
    </div>
};

 