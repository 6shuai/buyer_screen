<template>
    <div 
        class="video_adv_wrap"
        :style="{ transition: `all .5s ease-in ${ showAdvVideo ? '.3s' : '0s' }` }"
        :class="{ show: showAdvVideo }"
    >
        <video id="video" :autoplay="showAdvVideo" :loop="isLoop" :src="videoUrl"></video>
        <div class="count_down_wrap" v-if="!showTomorrowGoods">
            {{ countDownTime }}
        </div>

        <div class="buying_continues" v-if="gameState == 3">
            <div class="text_wrap">
                <img src="../images/light_red.png" class="light">
                <p class="text">抢购持续进行中</p>
            </div>
        </div>
    </div>


</template>

<script>
import { reactive, toRefs, computed, watch, nextTick } from 'vue'
import { translatesToHoursMinutesSeconds } from '../util/index'
import { useStore } from 'vuex'
export default {
    setup(props) {
        const store = useStore()
        
        //抢购状态
        const gameState = computed(() => {
            return store.state.gameState
        })

        //是否显示视频
        const showAdvVideo = computed(() => {
            return store.state.showAdvVideo
        })
        
        //显示明日宝贝
        const showTomorrowGoods = computed(() => {
            return store.state.showTomorrowGoods
        })

        //播放视频
        const videoPlay = () => {

            if(!state.resData.goods || !state.resData.goods.video  || !state.resData.goods.video.length) return

            let { url, duration } = state.resData.goods.video[state.currentVideoIndex || 0]

            console.log('视频时长---------->', duration, state.resData.goods.video[state.currentVideoIndex || 0])
            
            state.videoUrl = url
            var elevideo = document.getElementById("video");

            nextTick(() => {
                elevideo.currentTime = 0
                elevideo.play()

                // elevideo.addEventListener('ended', () => { //结束.
                //     let videoTotal = 3
                //     console.log('视频播放结束')
                //     state.currentVideoIndex = state.currentVideoIndex + 1 >= videoTotal ? 0 : state.currentVideoIndex + 1
                // //     videoPlay()
                // }, false);

                countDownFun(duration)
            })

            
            // state.isLoop = false
            setTimeout(() => {
                
                console.log('视频播放结束')

                let videoTotal = state.resData.goods.video.length
                // console.log('视频播放结束')
                state.currentVideoIndex = state.currentVideoIndex + 1 >= videoTotal ? 0 : state.currentVideoIndex + 1

                //显示明日宝贝时  循环播放视频
                if(state.showTomorrowGoods){
                    videoPlay()
                    return
                }else{
                    store.state.showAdvVideo = false
                }

            }, duration * 1000);
        } 

        //广告倒计时
        const countDownFun = (num) => {
            num -= 1
            state.countDownTime = translatesToHoursMinutesSeconds(num)
            if(num <= 0){
                clearTimeout(state.timer)
                return
            }
            state.timer = setTimeout(() => {
                countDownFun(num)
            }, 1000);
        }

         //猜价通知
         watch(showAdvVideo, (newData, oldData) => {
            var elevideo = document.getElementById("video");
            if(newData){
                state.resData = store.state.goodsDataDetail

                let num = state.resData.preheatTime
                videoPlay()
                elevideo.addEventListener('ended', () => { //结束.
                    // let videoTotal = state.resData.goods.video.length
                    // console.log('视频播放结束')
                    // state.currentVideoIndex = state.currentVideoIndex + 1 >= videoTotal ? 0 : state.currentVideoIndex + 1
                    // videoPlay()
                }, false);
            }else{
                elevideo.pause()
            }
        })


        const state = reactive({
            gameState,
            showAdvVideo,
            showTomorrowGoods,
            videoUrl: '',
            isLoop: false,
            currentVideoIndex: 0,
            resData: {},
            countDownTime: '00:00',
            timer: undefined,
            video: [
                { 
                    url: 'https://static.xfengjing.com/video/2021/07/30/5b5be1a9-8ee9-4a9b-975c-0780b4d38d01.mp4',
                    duration: 33
                },
                { 
                    url: 'https://static.xfengjing.com/video/2021/07/30/b78fdc33-1bd7-422f-852f-1c10973919e8.mp4',
                    duration: 33
                },
                // { 
                //     url: 'https://static.xfengjing.com/video/2021/07/30/64e1aa49-602d-467b-a9e2-66c7779e1824.mp4',
                //     duration: 54
                // }
            ]
        })

        return toRefs(state)
    }
}
</script>

<style lang="less" scope>
    .video_adv_wrap{
        width: 1324px;
        height: 790px;
        background: url('../images/video_bg.png') center no-repeat;
        background-size: 100% 100%;
        position: absolute;
        z-index: 99;
        top: 6%;
        left: 50%;
        margin-left: -662px;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: translateY(-100vh);

        &.show{
            transform: translateY(0);
        }


        video{
            width: 1168px;
            height: 648px;
            object-fit: fill;
            margin-top: -34px;
        }

        .count_down_wrap{
            width: 296px;
            height: 57px;
            background: url('../images/count_down_bg.png') center no-repeat;
            background-size: 100% 100%;
            line-height: 57px;
            color: #fff;
            font-size: 30px;
            text-align: center;
            position: absolute;
            bottom: 70px;
            right: 30px;
        }
        
        .buying_continues{
            position: absolute;
            width: 100%;
            height: 59px;
            bottom: 20px;
            text-align: center;

            .text_wrap{
                width: 453px;
                height: 59px;
                display: inline-block;
                background: url('../images/buying_continues.png') center no-repeat;
                background-size: 100% 100%;
                line-height: 59px;
                color: #fff;
                font-size: 40px;
                text-align: center;
                position: relative;
                border-radius: 20px;
                overflow: hidden;

                .light{
                    height: 100%;
                    position: absolute;
                    left: 0;
                    animation: continueLightRedAnim 2s ease-out infinite;
                }

                .text{
                    position: absolute;
                    width: 100%;
                    z-index: 99;
                }
            }
        }
    }

    @keyframes continueLightRedAnim {
        0%{ transform: translate(-10vw) }
        50%{ transform: translate(453px) }
        100%{ transform: translate(453px) }
    }

</style>