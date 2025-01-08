import { ApplianceSinglePlugin, ApplianceSigleWrapper } from '@netless/appliance-plugin';
import { CursorTool } from '@netless/cursor-tool';
import { WhiteWebSdk, DeviceType, DefaultHotKeys} from "white-web-sdk";
import fullWorkerString from '@netless/appliance-plugin/dist/fullWorker.js?raw';
import subWorkerString from '@netless/appliance-plugin/dist/subWorker.js?raw';
export async function createWhiteWebSdk(params:{
    elm:HTMLDivElement;
    uuid:string;
    roomToken:string;
    appIdentifier:string;
}) {
    const {elm, uuid, roomToken, appIdentifier} = params;
    const whiteWebSdk = new WhiteWebSdk({
        appIdentifier,
        useMobXState: true,
        deviceType: DeviceType.Surface,
        invisiblePlugins: [ApplianceSinglePlugin],
        wrappedComponents: [ApplianceSigleWrapper]
    })
    const uid = 'uid-' + Math.floor(Math.random() * 10000);
    const cursorAdapter = new CursorTool();
    const room = await whiteWebSdk.joinRoom({
        uuid,
        roomToken,
        uid,
        region: "cn-hz",
        isWritable: true,
        floatBar: true,
        cursorAdapter,
        userPayload: {
            userId: uid.split('uid-')[1],
            userUUID: uid,
            cursorName: `user-${uid}`,
        },
        hotKeys: {
            ...DefaultHotKeys,
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
        disableNewPencil: false,
    })
    const fullWorkerBlob = new Blob([fullWorkerString], {type: 'text/javascript'});
    const fullWorkerUrl = URL.createObjectURL(fullWorkerBlob);
    const subWorkerBlob = new Blob([subWorkerString], {type: 'text/javascript'});
    const subWorkerUrl = URL.createObjectURL(subWorkerBlob);
    const plugin = await ApplianceSinglePlugin.getInstance(room, 
        {   // 获取插件实例，全局应该只有一个插件实例，必须在 joinRoom 之后调用
            options: {
                cdn: {
                    fullWorkerUrl,
                    subWorkerUrl
                }
            },
            cursorAdapter
        }
    );
    cursorAdapter.setRoom(room);
    
    room.bindHtmlElement(elm);
    room.disableSerialization = false;
    window.appliancePlugin = plugin;
    return {room, whiteWebSdk}
} 