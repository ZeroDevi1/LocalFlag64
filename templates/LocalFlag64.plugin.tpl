#!name= LocalFlag64
#!desc= 本地为 Base64 节点订阅添加 emoji 国旗
#!author= __AUTHOR__
#!homepage= __HOMEPAGE__
#!version= __VERSION__
#!date= __DATE__

[Script]
http-request ^https?:\/\/localflag64\.loon\/sub(?:\?.*)?$ script-path=__SCRIPT_URL__, timeout=60, tag=LocalFlag64

[MITM]
hostname = localflag64.loon
