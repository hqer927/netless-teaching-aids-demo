/* eslint-disable @typescript-eslint/no-explicit-any */
import { WhiteWebSdk, DeviceType, RenderEngine} from "white-web-sdk";
import polly from "polly-js";
import { CursorTool } from '@netless/cursor-tool';
import { ApplianceSinglePlugin, ApplianceSigleWrapper } from '@netless/appliance-plugin';
import fullWorkerString from '@netless/appliance-plugin/dist/fullWorker.js?raw';
import subWorkerString from '@netless/appliance-plugin/dist/subWorker.js?raw';
export enum Identity {
    Creator = "creator",
    Joiner = "joiner",
}
export async function createReplaySingleWhiteWebSdk(params:{
    elm: HTMLDivElement;
    uuid: string;
    roomToken: string;
    appIdentifier: string;
    slice?:string;
    beginAt?:string;
    duration?:string;
}) {
    const {elm, uuid, roomToken, slice, beginAt, duration, appIdentifier} = params;
    const region = "cn-hz";
    const whiteWebSdk = new WhiteWebSdk({
        deviceType: DeviceType.Surface,
        useMobXState: true,
        preloadDynamicPPT: true,
        appIdentifier,
        renderEngine: RenderEngine.Canvas,
        region
    });
    await polly().waitAndRetry(10).executeForPromise(async () => {
        const isPlayable = await whiteWebSdk.isPlayable({
            region,
            room: uuid,
            roomToken,
        });
        if (!isPlayable) {
            throw Error("the current room cannot be replay");
        }

    });
    const cursorAdapter = new CursorTool();
    const player = await whiteWebSdk.replayRoom(
        {
            slice,
            beginTimestamp: beginAt && parseInt(beginAt, 10) || undefined,
            duration: duration && parseInt(duration, 10) || undefined,
            region,
            room: uuid,
            roomToken,
            cursorAdapter,
            invisiblePlugins: [ApplianceSinglePlugin],
            wrappedComponents: [ApplianceSigleWrapper]
        }, {
            onPhaseChanged: (phase) => {
                console.log('onPhaseChanged === 1', phase)
            },
        },
    );
    cursorAdapter.setPlayer(player);
    const fullWorkerBlob = new Blob([fullWorkerString], {type: 'text/javascript'});
    const fullWorkerUrl = URL.createObjectURL(fullWorkerBlob);
    const subWorkerBlob = new Blob([subWorkerString], {type: 'text/javascript'});
    const subWorkerUrl = URL.createObjectURL(subWorkerBlob);
    await ApplianceSinglePlugin.getInstance(player,
        {   // 获取插件实例，全局应该只有一个插件实例，必须在 joinRoom 之后调用
            options: {
                cdn:{
                    fullWorkerUrl,
                    subWorkerUrl
                }
            },
            cursorAdapter
        }
    );
    player.bindHtmlElement(elm);
    player.play();
    // try {
    //     await player.seekToProgressTime(100);
    // } catch (error) {console.error(error);}
    console.log('player', player)
    return {player, whiteWebSdk}
}
