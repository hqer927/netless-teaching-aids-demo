/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Select } from "antd";
import { useEffect, useState } from "react";
import { Region, regions } from "./region";
import { createRoom } from "./api";
import React from "react";
import type { Room, WindowManager } from "@netless/window-manager";
// import { useNavigate } from "react-router-dom";
const IndexPage = ()=>{
    const [region,setRegion] = useState<Region>('cn-hz');
    const [loading,setLoading] = useState<boolean>(false);
    const [loading1,setLoading1] = useState<boolean>(false);
    // const navigate = useNavigate();
    const handleChange = (value: Region) => {
        setRegion(value);
    };
    async function go(hash:string){
        const room = await createRoom(region);
        const {roomToken,roomUUID} = room
        if (hash==='/multi') {
            sessionStorage.setItem('uid','uid-1234')
        }
        window.location.href= `${document.location.origin}${document.location.pathname}#${hash}?roomToken=${roomToken}&uuid=${roomUUID}`;
    }
    useEffect(()=>{
        if (window.room) {
            if(!window.manager){
                (window.room as Room).bindHtmlElement(null);
                window.appliancePlugin?.destroy();
            }
            if (window.manager) {
                (window.manager as WindowManager).destroy();
                window.manager = undefined;
                (window.appliancePlugin as any)?.destroy();
                window.appliancePlugin = undefined;
            }
            if (window.room && !window.room.didConnected) {
                (window.room as Room).disconnect().then(()=>{
                    window.room = undefined;
                }) 
            }      
        }
    },[])
    return <Flex justify="center" align="center" vertical style={{position:'absolute',width:'100vw', height:'100vh'}}>
        <Flex style={{width:200}} vertical justify="center" align="center" gap='small'>
                <Select
                defaultValue="cn-hz"
                style={{ width: 120 }}
                onChange={handleChange}
                options={regions.map(v=>({value:v.region,label:v.emoji + v.name}))}
                />
                <Button type="primary" block onClick={()=>{
                    if (!loading) {
                        setLoading(true);
                        go('/single');
                    }
                }} loading ={loading}>
                    单白板
                </Button>
                <Button type="primary" block onClick={()=>{
                    if (!loading1) {
                        setLoading1(true);
                        go('/multi');
                    }
                }} loading ={loading1}>
                    多窗口
                </Button>
                
                {/* <Button
                    type="primary"
                    block
                    onClick={() => {
                        window.location.href = `https://hqer927.github.io/netless-teaching-aids-demo/#/single?roomToken=NETLESSROOM_YWs9eTBJOWsxeC1IVVo4VGh0NyZub25jZT0xNzIxMTE3NDM5NTg0MDAmcm9sZT0wJnNpZz0yZjYwMmY3ZGFmMDc5MTZmMDEwMTFkMGFkODJmMTUzZmIzNjljMGEwOGY4NTdjNDZjNzUwNjVmOTRlNDE5NTc2JnV1aWQ9ZTM1MjA5NjA0MzRhMTFlZjgzODYzZDA2ODJhNmM5YmQ&uuid=e3520960434a11ef83863d0682a6c9bd`
                    }}
                    >
                    单白板测试专用
                </Button> */}
                <Button
                    type="primary"
                    block
                    onClick={() => {
                        window.location.href = `/netless-teaching-aids-demo/#/multi?roomToken=NETLESSROOM_YWs9eTBJOWsxeC1IVVo4VGh0NyZub25jZT0xNzI2NzI3NDQ5MzI2MDAmcm9sZT0wJnNpZz1hNDJjMGYzOWNhNDgxMzgyMzM1NTcwNGJkNjU4NGEzOWEyNDZkZWQ0MTRkNDBkYmU5ZDUxMDBiM2MyMjFhNWQwJnV1aWQ9YjVhZDlkMTA3NjUwMTFlZjgzODYzZDA2ODJhNmM5YmQ&uuid=b5ad9d10765011ef83863d0682a6c9bd
`
                    }}
                    >
                    新版本 测试专用
                </Button>
                <Button
                    type="primary"
                    block
                    onClick={() => {
                        window.location.href =
                        'https://demo.whiteboard.agora.io/room/42485580765111ef83863d0682a6c9bd?region=cn-hz'
                    }}
                    >
                    旧版本 测试房间
                </Button>
        </Flex>
    </Flex>
}
export default IndexPage;