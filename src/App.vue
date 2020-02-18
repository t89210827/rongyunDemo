<template>

    <div style="height:100%;">
        <keep-alive>
            <transition name="fadeMove">
                <router-view v-if="$route.meta.keepAlive"/>
            </transition>
        </keep-alive>
        <transition name="fadeMove">
            <router-view v-if="!$route.meta.keepAlive"/>
        </transition>
    </div>

</template>

<script>

    export default {
        data() {
            return {}
        },

        mounted() { //生命周期函数-可发起求
            this.init();
            // this.initRongRTC();
        },

        methods: {
            init() {
                var appkey = 'tdrvipkstnyi5';
                RongIMLib.RongIMClient.init(appkey);
            },

            initRongRTC() {
                let rongRTC = new RongRTC({
                    // 开启调试模式，SDK 会向控制台输出日志，默认 false
                    debug: true,
                    // IM SDK ，使用可参考: https://docs.rongcloud.cn/im/imlib/web/summary/
                    RongIMLib: RongIMLib,
                    created: function () {
                        console.log('---------------->创建')
                    },
                    mounted: function () {
                        console.log('---------------->mounted')
                    },
                    destroyed: function () {
                        console.log('---------------->destroyed')
                    },
                    error: function (error) {
                        console.log('---------------->error')
                    }
                });
                let {Room, Stream, Message, Device, Storage} = rongRTC;
            }
        }

    }
</script>

<style lang="scss">
    @import '@/styles/main';
</style>
