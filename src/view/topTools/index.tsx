/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './index.module.less';
import { LogoutOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import { useContext, useState } from 'react';
import type { Player, Room } from 'white-web-sdk';
import { Identity } from '../../replayMulti';
import { WindowManager } from '@netless/window-manager';
import { AppContext } from '../../App';
import React from 'react';

export const TopTools = () => {
    const {beginAt} = useContext(AppContext);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const handleGoReplay = async() => {
        setConfirmLoading(true);
        await new Promise((resolve)=>{
            setTimeout(resolve,2000);
        })
        const slice = (window.room as Room).slice;
        const uuid = (window.room as Room).uuid;
        const region = (window.room as Room).region;
        const roomToken = (window.room as Room).roomToken;
        const isWritable = (window.room as Room).isWritable;
        const identity = Identity.Joiner;
        let url = `uuid=${uuid}&region=${region}&roomToken=${roomToken}&isWritable=${isWritable}&identity=${identity}`;
        let isMulti = false;
        if(!window.manager){
            (window.room as Room).bindHtmlElement(null);
            window.appliancePlugin?.destroy();
        }
        if (window.manager) {
            isMulti = true;
            (window.manager as WindowManager).destroy();
            window.manager = undefined;
            (window.appliancePlugin as any)?.destroy();
            window.appliancePlugin = undefined;
        }
        await (window.room as Room).disconnect();
        window.room = undefined;
        setConfirmLoading(false);
        if (isMulti) {
            const now = Date.now();
            const duration = now - beginAt;
            url = `${url}&duration=${duration}&beginAt=${beginAt}`
            // window.location.replace(`${document.location.origin}${document.location.pathname}#/replayMulti?${url}`);
            setTimeout(()=>{
                console.log('replace=======replace')
                window.location.replace(`${document.location.origin}${document.location.pathname}#/replayMulti?${url}`);
                // window.location.reload();
            },500)
            return;
        }
        url = `${url}&slice=${slice}`
        // window.location.replace(`${document.location.origin}${document.location.pathname}#/replaySingle?${url}`);
        setTimeout(()=>{
            window.location.replace(`${document.location.origin}${document.location.pathname}#/replaySingle?${url}`);
            // window.location.reload();
        },500)
    }
    const handleGoBack = async() => {
        if(!window.manager){
            (window.room as Room).bindHtmlElement(null);
            window.appliancePlugin?.destroy();
        }
        if (window.manager) {
            (window.manager as WindowManager).destroy();
            window.manager = undefined;
            window.appliancePlugin?.destroy();
            window.appliancePlugin = undefined;
        }
        await window.room.disconnect();
        window.room = undefined;
        window.location.href= `${document.location.origin}${document.location.pathname}`;
    }
    return (
        <div className={styles['TopTools']}>
            <Button.Group>
                <Popconfirm
                    placement="rightBottom"
                    title={'是否回放'}
                    description={'是否进入回放?'}
                    okText="进入回放"
                    cancelText="直接退出"
                    okButtonProps={{ loading: confirmLoading }}
                    onCancel={handleGoBack}
                    onConfirm={handleGoReplay}
                >
                    <Button icon={<LogoutOutlined />}/>
                </Popconfirm>
            </Button.Group>
        </div>
    )
}

export const ReplayerTopTools = () => {
    const handleGoBack = async() => {
        (window.player as Player).stop();
        if (window.manager) {
            (window.manager as WindowManager).destroy();
            window.manager = undefined;
            window.appliancePlugin?.destroy();
        } 
        window.location.href= `${document.location.origin}${document.location.pathname}`;
    }
    return (
        <div className={styles['TopTools']}>
            <Button.Group>
                <Popconfirm
                    placement="rightBottom"
                    title={'退出'}
                    description={'是否退出?'}
                    okText="退出"
                    cancelText="取消"
                    onConfirm={handleGoBack}
                >
                    <Button icon={<LogoutOutlined />}/>
                </Popconfirm>
            </Button.Group>
        </div>
    )
}