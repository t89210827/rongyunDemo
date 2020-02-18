<template>
    <div class="test" style="width: 100%;height: 100%; ">
        <div v-if="currentUser">
            <div>当前用户 {{currentUser}}</div>
            <hr/>

            <div @click="getConversationList"
                 style="width: 380px;line-height: 35px;background: #0094FF;text-align: center;">
                获取会话列表(会话数量:{{conversationList.length}},点击用户查询历史消息)
            </div>

            <div v-for="item in conversationList" :key="item + 'b'">
                <div style="display: flex; flex-direction: row;">
                    <div @click="getHistoryMessages(item.targetId)"
                         style="margin: 0px 10px;background:royalblue;line-height: 60px;">
                        {{item.targetId}}
                    </div>

                    <div style="margin-left: 50px;line-height: 60px;">历史消息：</div>

                    <div v-for="(historyMessageItem ,historyMessageIndex) in historyMessage"
                         :key="historyMessageIndex + 'c'">
                        <div style="padding: 0px 20px;border-right: 1px solid red;line-height: 60px;">
                            {{historyMessageItem.content.content}}
                        </div>
                    </div>

                </div>
            </div>

        </div>
        <div v-else>
            <div>选择登录用户</div>
            <div v-for="item in contactsList" :key="item + 'a'">
                <div @click="setCurrentUser(item)" style="margin: 20px 0;">{{item}}</div>
            </div>
        </div>

        <hr/>
        <div>当前用户token {{token}}</div>
        <hr/>
        <div>接受人手机号: {{phonenum}}</div>
        <div style="height: 10px;"></div>
        <div @click="sendMessage" style="width: 100px;line-height: 35px;background: #0094FF;text-align: center;">发送消息
        </div>
        <hr/>
        用户列表 点击可以设置接受;
        <div v-for="item in contactsList" :key="item">
            <div @click="setPhonenum(item)" style="margin: 20px 0;">{{item}}</div>
        </div>
    </div>
</template>

<script>
    export default {

        data() {
            return {
                currentUser: false,
                token: '',
                phonenum: '',
                contactsList: [],
                conversationList: [],
                historyMessage: [],
            }
        },

        methods: {
            setCurrentUser(phonenum) {
                this.userLogin(phonenum);
            },

            setPhonenum(phonenum) {
                this.phonenum = phonenum
            },

            //获取历史消息
            getHistoryMessages(targetId) {
                console.log('获取历史消息----->', JSON.stringify(targetId));

                var conversationType = RongIMLib.ConversationType.PRIVATE;
                var targetId = targetId;
                var timestrap = 0; // 默认传 null, 若从头开始获取历史消息, 请赋值为 0
                var count = 20;
                RongIMLib.RongIMClient.getInstance().getHistoryMessages(conversationType, targetId, timestrap, count, {
                    onSuccess: (list, hasMsg) => {

                        /*
                            list: 获取的历史消息列表
                            hasMsg: 是否还有历史消息可以获取
                          */
                        this.historyMessage = list;
                        console.log('获取历史消息成功', JSON.stringify(list));

                    },
                    onError: function (error) {
                        // 请排查：单群聊消息云存储是否开通
                        console.log('获取历史消息失败', error);
                    }
                });
            },

            //获取会话列表
            getConversationList() {
                var conversationTypes = [RongIMLib.ConversationType.PRIVATE];
                var count = 150;
                RongIMClient.getInstance().getConversationList({
                    onSuccess: list => {
                        this.conversationList = list
                        console.log('获取会话列表成功', JSON.stringify(list));
                    },
                    onError: function (error) {
                        console.log('获取会话列表失败', error);
                    }
                }, conversationTypes, count);
            },

            sendMessage() {
                if (!this.currentUser) {
                    this.$message('未登录');
                    return;
                }

                var msg = new RongIMLib.TextMessage({content: 'hello RongCloud!', extra: '附加信息'});
                var conversationType = RongIMLib.ConversationType.PRIVATE;
                var targetId = this.phonenum;  // 目标 Id

                RongIMClient.getInstance().sendMessage(conversationType, targetId, msg, {
                    onSuccess: function (message) {
                        // message 为发送的消息对象并且包含服务器返回的消息唯一 id 和发送消息时间戳
                        console.log('发送文本消息成功', message);
                    },
                    onError: function (errorCode) {
                        console.log('发送文本消息失败', errorCode);
                    }
                });
            },

            //连接
            connect(token) {
                console.log('-------------------------->' + token);
                RongIMClient.connect(token, {

                    onSuccess: userId => {
                        console.log('连接成功, 用户 id 为', userId);
                        this.currentUser = userId;
                        this.setOnReceiveMessageListener();

                        // 连接已成功, 此时可通过 getConversationList 获取会话列表并展示
                    },
                    onTokenIncorrect: function () {
                        console.log('连接失败, 失败原因: token 无效');
                    },
                    onError: function (errorCode) {
                        var info = '';
                        switch (errorCode) {
                            case RongIMLib.ErrorCode.TIMEOUT:
                                info = '链接超时';
                                break;
                            case RongIMLib.ConnectionState.UNACCEPTABLE_PAROTOCOL_VERSION:
                                info = '不可接受的协议版本';
                                break;
                            case RongIMLib.ConnectionState.IDENTIFIER_REJECTED:
                                info = 'appkey 不正确';
                                break;
                            case RongIMLib.ConnectionState.SERVER_UNAVAILABLE:
                                info = '服务器不可用';
                                break;
                            default:
                                info = errorCode;
                                break;
                        }
                        console.log('连接失败, 失败原因: ', info);
                    }
                });
            },

            //监听消息
            setOnReceiveMessageListener() {
                console.log("监听消息")
                RongIMClient.setOnReceiveMessageListener({
                    // 接收到的消息
                    onReceived: function (message) {
                        console.log("接收到的消息-->" + message)

                        var messageContent = message.content;
                        // 判断消息类型
                        switch (message.messageType) {
                            case RongIMClient.MessageType.TextMessage: // 文字消息
                                console.log('文字内容', messageContent.content);
                                break;
                            case RongIMClient.MessageType.ImageMessage: // 图片消息
                                console.log('图片缩略图 base64', messageContent.content);
                                console.log('原图 url', messageContent.imageUri);
                                break;
                            case RongIMClient.MessageType.HQVoiceMessage: // 音频消息
                                console.log('音频 type ', messageContent.type); // 编解码类型，默认为 aac 音频
                                console.log('音频 url', messageContent.remoteUrl); // 播放：<audio src={remoteUrl} />
                                console.log('音频 时长', messageContent.duration);
                                break;
                            case RongIMClient.MessageType.RichContentMessage: // 富文本(图文)消息
                                console.log('文本内容', messageContent.content);
                                console.log('图片 base64', messageContent.imageUri);
                                console.log('原图 url', messageContent.url);
                                break;
                            case RongIMClient.MessageType.UnknownMessage: // 未知消息
                                console.log('未知消息, 请检查消息自定义格式是否正确', message);
                                break;
                            default:
                                console.log('收到消息', message);
                                break;
                        }
                    }
                })
            },

            //获取列表
            user_getListByCon() {
                _api.user_getListByCon()
                    .then(data => {
                        // console.log(JSON.stringify(data))
                        this.contactsList = data
                        // this.connect(data);
                    })
                    .catch(error => {
                        console.log('失败或then中抛出了错误时调用')
                        console.log(error)
                    })
            },


            userLogin(phonenum) {
                _api.user_login({phonenum})
                    .then(data => {
                        this.token = data.rongCloud_token
                        this.connect(data.rongCloud_token);
                    })
                    .catch(error => {
                        console.log('失败或then中抛出了错误时调用')
                        console.log(error)
                    })
            }
        },

        mounted() {
            // this.userLogin();
            this.user_getListByCon();
        }
        ,

    }
</script>

<style lang="scss" scoped>
    .testSass {
        color: $main;
    }

    .testColor {
        @media (max-width: 900px) {
            background: #0094FF;
            font-size: 100px;
        }
    }

</style>