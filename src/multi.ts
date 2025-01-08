/* eslint-disable @typescript-eslint/no-explicit-any */
import '@netless/window-manager/dist/style.css';
import { WhiteWebSdk, DeviceType, DefaultHotKeys, HotKeyEvent, KeyboardKind } from "white-web-sdk";
import { WindowManager } from "@netless/window-manager";
import { ApplianceMultiPlugin, AutoDrawPlugin } from '@netless/appliance-plugin';
import SlideApp, { addHooks } from "@netless/app-slide";
// import IframeBridgePage from "@netless/app-iframe-bridge";
import Talkative from "@netless/app-talkative";
import LittleBoard from "@netless/app-little-white-board";
import fullWorkerString from '@netless/appliance-plugin/dist/fullWorker.js?raw';
import subWorkerString from '@netless/appliance-plugin/dist/subWorker.js?raw';
const ctrlShiftHotKeyCheckerWith = (k:string) =>{
    return (event: HotKeyEvent, kind: KeyboardKind) => {
        const { key, altKey, ctrlKey, shiftKey, nativeEvent } = event;
        switch (kind) {
            case KeyboardKind.Mac: {
                return (
                    key === k &&
                    !ctrlKey &&
                    !altKey &&
                    shiftKey &&
                    !!nativeEvent?.metaKey
                );
            }
            case KeyboardKind.Windows: {
                return (
                    key === k &&
                    ctrlKey &&
                    !altKey &&
                    shiftKey &&
                    event.kind === "KeyDown"
                );
            }
            default: {
                return false;
            }
        }
    };

}
export async function createMultiWhiteWebSdk(params:{
    elm:HTMLDivElement;
    uuid:string;
    roomToken:string;
    appIdentifier:string;
    topBarDiv: HTMLDivElement;
}) {
    const {elm, uuid, roomToken, appIdentifier, topBarDiv} = params;
    const whiteWebSdk = new WhiteWebSdk({
        appIdentifier,
        useMobXState: true,
        deviceType: DeviceType.Surface,
        // apiHosts: [
        //     "api-cn-hz.netless.group",
        // ],
    })
    const sUid = sessionStorage.getItem('uid');
    const isWritable = !!(sUid && sUid.indexOf('1234') > 0);
    const uid = sUid || 'uid-' + Math.floor(Math.random() * 10000);
    if (!sUid) {
        sessionStorage.setItem('uid', uid); 
    }
    const userid = isWritable && '082dcced-8b26-afc7-f2de-5afc8d1214d3' || uid;
    const room = await whiteWebSdk.joinRoom({
        uuid,
        roomToken,
        uid:userid,
        region: "cn-hz",
        isWritable: isWritable,
        floatBar: true,
        userPayload: {
            // userId: uid.split('uid-')[1],
            // userUUID: uid,
            nickName: isWritable ? `teacher-${uid}` : `studenr-${uid}`,
            // nickName: "nickName-${uid}",
        },
        hotKeys: {
            ...DefaultHotKeys,
            redo: ctrlShiftHotKeyCheckerWith("z"),
            changeToSelector: "s",
            changeToLaserPointer: "z",
            changeToPencil: "p",
            changeToRectangle: "r",
            changeToEllipse: "c",
            changeToEraser: "e",
            changeToText: "t",
            changeToStraight: "l",
            changeToArrow: "a",
            changeToHand: "h",
        },
        invisiblePlugins: [WindowManager as any, ApplianceMultiPlugin],
        disableNewPencil: false,
        useMultiViews: true, 
    })
    if (room.isWritable) {
        room.setScenePath("/init");
    }
    // let manager = room.getInvisiblePlugin(WindowManager.kind) as unknown as WindowManager;
    // manager?.destroy();
    WindowManager.register({
        kind: "Slide",
        // appOptions: { debug: false, 
        //     navigatorDelegate: {
        //         openUrl: (url:string) => {
        //             console.log('goTo H5 url', url)
        //             window.manager.addApp({
        //                 kind: 'IframeBridgePage',
        //                 options: { title: "chick", scenePath: '/h5/chick', scenes: []},
        //                 attributes: {
        //                     src: 'https://demo-h5.netless.group/dist2020/',
        //                     displaySceneDir: `/h5/chick`
        //                 },
        //             });
        //         }
        //     }
        // },
        src: SlideApp,
        addHooks,
    });
    WindowManager.register({
        kind: "Talkative",
        src: Talkative,
        appOptions: { debug: false, 
            onLocalMessage: (appId: string, event: Record<string, unknown>) => {
                const {data} = event;
                if (data && (data as any)?.cwd) {
                  switch ((data as any)?.cwd) {
                    case 'CLOSE':
                      window.manager.closeApp(appId);
                      break;
                    default:
                      break;
                  }
                }
            }
        }
    });
    // WindowManager.register({
    //     kind: "IframeBridgePage",
    //     src: IframeBridgePage
    // });
    WindowManager.register({
        kind: "Quill",
        src: ()=>import('@netless/app-quill')
    });
    WindowManager.register({
        kind: "Countdown",
        src: "https://netless-app.oss-cn-hangzhou.aliyuncs.com/@netless/app-countdown/0.0.2/dist/main.iife.js",
    });
    const manager = await WindowManager.mount({ room , container:elm, chessboard: true, cursor: true, supportAppliancePlugin: true});
    if (manager) {
        // await manager.switchMainViewToWriter();
        const fullWorkerBlob = new Blob([fullWorkerString], {type: 'text/javascript'});
        const fullWorkerUrl = URL.createObjectURL(fullWorkerBlob);
        const subWorkerBlob = new Blob([subWorkerString], {type: 'text/javascript'});
        const subWorkerUrl = URL.createObjectURL(subWorkerBlob);
        const plugin = await ApplianceMultiPlugin.getInstance(manager,
            {   // 获取插件实例，全局应该只有一个插件实例，必须在 joinRoom 之后调用
                options: {
                    cdn: {
                        fullWorkerUrl,
                        subWorkerUrl
                    },
                    canvasOpt: {
                        // 指定白板的渲染上下文，可选，默认为 webgl2
                        contextType: '2d',
                    }
                }
            }
        );
        const autoDrawPlugin = new AutoDrawPlugin({
            container: topBarDiv,
            hostServer: 'https://autodraw-white-backup-hk-hkxykbfofr.cn-hongkong.fcapp.run',
            delay: 2000
        });
        plugin.usePlugin(autoDrawPlugin);
        await WindowManager.register({
            kind: "LittleBoard",
            src: LittleBoard,
            appOptions: {
                disableCameraTransform: true,
                // 可选, 发布问题
                onMount:(appId:string, userId:string)=>{
                    console.log('LittleBoard Mount', appId, userId);
                    !isWritable && manager?.setReadonly(true);
                },
                // 可选, 发布问题
                // onPublishQuestion:(appId:string, userId:string)=>{
                //     console.log('LittleBoard PublishQuestion', appId, userId);
                // },
                // // 可选, 提交答案
                // onCommit:(appId:string, userId:string) => {
                //     console.log('LittleBoard Commit', appId, userId);
                //     if (uid === userId && room.isWritable) {
                //         room.setWritable(false);
                //     }
                // },
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
        if (isWritable) {
            room.disableSerialization = false;
        }
        // room.callbacks.on("onCanUndoStepsUpdate", (step: number): void => {
        //     console.log('onCanUndoStepsUpdate1', step)
        // });
        // room.callbacks.on("onCanRedoStepsUpdate", (step: number): void => {
        //     console.log('onCanRedoStepsUpdate1', step)
        // });
        window.appliancePlugin = plugin;
        window.autoDrawPlugin = autoDrawPlugin;
    }
    window.manager = manager;
    return {room, whiteWebSdk, manager}
}