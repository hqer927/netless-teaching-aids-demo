/* eslint-disable @typescript-eslint/no-explicit-any */
import { WhiteWebSdk, DeviceType, RenderEngine} from "white-web-sdk";
import polly from "polly-js";
import LittleBoard from "@netless/app-little-white-board";
import { WindowManager } from "@netless/window-manager";
import SlideApp, { addHooks } from "@netless/app-slide";
import { ApplianceMultiPlugin } from '@netless/appliance-plugin';
import fullWorkerString from '@netless/appliance-plugin/dist/fullWorker.js?raw';
import subWorkerString from '@netless/appliance-plugin/dist/subWorker.js?raw';
const fullWorkerBlob = new Blob([fullWorkerString], {type: 'text/javascript'});
const fullWorkerUrl = URL.createObjectURL(fullWorkerBlob);
const subWorkerBlob = new Blob([subWorkerString], {type: 'text/javascript'});
const subWorkerUrl = URL.createObjectURL(subWorkerBlob);
export enum Identity {
    Creator = "creator",
    Joiner = "joiner",
}
export async function createReplayMultiWhiteWebSdk(params:{
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
        region,
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
    const player = await whiteWebSdk.replayRoom(
        {
            slice,
            beginTimestamp: beginAt && parseInt(beginAt, 10) + 1000 || undefined,
            duration: duration && parseInt(duration, 10) || undefined,
            region,
            room: uuid,
            roomToken,
            invisiblePlugins: [WindowManager as any, ApplianceMultiPlugin],
            useMultiViews: true,
        }, {
            onPhaseChanged: (phase) => {
                console.log('onPhaseChanged', phase)
            },
        },
    );
    WindowManager.register({
        kind: "Slide",
        appOptions: { debug: false },
        src: SlideApp,
        addHooks,
    });
    WindowManager.register({
        kind: "Countdown",
        src: "https://netless-app.oss-cn-hangzhou.aliyuncs.com/@netless/app-countdown/0.0.2/dist/main.iife.js",
    });
    const managerPromise = WindowManager.mount({ room:player , container:elm, chessboard: true, cursor: true, supportAppliancePlugin: true});
    player.play();
    const manager = await managerPromise;
    const plugin = await ApplianceMultiPlugin.getInstance(manager, {
        options:{
            cdn:{
                subWorkerUrl,
                fullWorkerUrl
            }
        }
    });
    await WindowManager.register({
        kind: "LittleBoard",
        src: LittleBoard,
        appOptions: {
            disableCameraTransform: true,
            /** 上传图片,返回插入图片的信息 */
            async onClickImage(){
                // 弹出云盘,模拟1s之后放回图片信息
                return new Promise((resolve) => {
                    setTimeout(()=>{
                        resolve({
                            uuid: Date.now().toString(),
                            src: 'https://p5.ssl.qhimg.com/t01a2bd87890397464a.png',
                            centerX: 0,
                            centerY: 0,
                            width: 100,
                            height: 100,
                            uniformScale: false
                        });
                    }, 1000)
                });
            }
        }
    });
    player.pause();
    // await player.seekToProgressTime(1);
    player.play();
    window.appliancePlugin = plugin;
    window.manager = manager;
    console.log('player', player)
    return {player, whiteWebSdk}
}
