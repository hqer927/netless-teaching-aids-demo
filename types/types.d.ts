/* eslint-disable @typescript-eslint/no-explicit-any */
export {}
declare global {
    interface Window {
      __netlessMobXUseProxies:any;
      player: any;
      room: any;
      syncedStore: any;
      appliancePlugin: any;
      autoDrawPlugin: any;
      manager: any;
      clipboardData: any;
      getSelection(): Selection;
    }
}