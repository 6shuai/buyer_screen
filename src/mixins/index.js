
import { reactive, toRefs, onUnmounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import {Howl, Howler} from 'howler'

export default function () {
    
    const store = useStore()

    const videoAdvDuration = computed(() => {
        return store.state.videoAdvDuration
    })

    //开始前 语音时长
     let beforeStageVoiceDuration = 15      

    //猜价开始前 10秒  语音时长
    let guessBeforeVoiceDuration = 10

    //猜价阶段 语音时长
    let guessPriceStageVoiceDuration01 = 8
    let guessPriceStageVoiceDuration02 = 6
    

    //广告间隔时长
    let advDiffDuration = 60

    //教学阶段 时长  02_01 = 5s   02_02 = 3s      rule_01 = 21s  rule_02 = 33s       5 + 3 + 21 + 33 = 62
    //猜价结束前30秒  猜价阶段即将结束，还没有参与朋友们请抓紧扫码参与。已经参与的朋友们千万不要⾛开，激动⼈⼼的抢购阶段将在30秒后开始！

    let guideDuration = 97


    let currentVideoIndex = 0



    //每个状态 搁一分钟播放一次视频  duration = -1 无限次循环播放
    //开始前 播完广告后 播阶段语音  最后时间不够播语音 就只播广告
    //插入广告前后的语音是在  猜价阶段播放广告出现
    //教学阶段是在 猜价阶段最后
    const videoPlay = (duration, type) => {
        if(!store.state.goodsDataDetail || ! store.state.goodsDataDetail.goods) return
        try {

                let videoDuration  = store.state.goodsDataDetail.goods.video[currentVideoIndex].duration
        
                //广告时长
                let advDuration = videoDuration ? videoDuration : 30
        
                clearTimeout(state.playTimer)
                clearTimeout(state.videoTimer)
        
                switch (type) {
                    case -1:
                        // advDuration += beforeStageVoiceDuration
                        break;
                    case 0:
                        duration -= guessBeforeVoiceDuration
                        break;
                    case 1: 
                        duration -= guideDuration
                        advDuration += guessPriceStageVoiceDuration01
                        break;
                
                    default:
                        break;
                }

                console.log(duration, advDiffDuration + advDuration )
        
                if (duration > advDiffDuration + advDuration || type == 3) {
        
                    state.playTimer = setTimeout(() => {
        
                        if(type == 1){
                            playJxmsSounds('./voice/01_03.mp3', () => {
                                store.state.showAdvVideo = true
                                videoPlayEnd(type)
                            })
                        }else{
                            console.log('广告----------->', type, duration)
                            store.state.showAdvVideo = true
                            videoPlayEnd(type, duration, advDuration)
                        }
                        
        
                    }, advDiffDuration * 1000)
        
                }
        } catch (error) {
            console.log('error', error)
        }
    }


    //广告播放结束
    const videoPlayEnd = (type, duration, advDuration) =>{
        let videoTotal = store.state.goodsDataDetail.goods.video.length
        currentVideoIndex + 1 >= videoTotal ? 0 : state.currentVideoIndex + 1

        state.videoTimer = setTimeout(() => {
            duration = duration - advDiffDuration - advDuration

            if(type == -1){
                if(duration >= beforeStageVoiceDuration){
                    playJxmsSounds('./voice/00_01.mp3', () => {
                        videoPlay(duration, type)
                    })
                }
            }else if(type == 1){
                if(duration >= guessPriceStageVoiceDuration02){
                    playJxmsSounds('./voice/01_02.mp3', () => {
                        duration = duration - guessPriceStageVoiceDuration02
                        videoPlay(duration, type)
                    })
                }
            }else{
                videoPlay(duration, type)
            }

        }, advDuration * 1000);
    }


    //竞猜阶段  抢购教学
    const guideStart = (duraton) => {
        clearTimer(state.guideTimer)
        let d = duraton - guideDuration <= 0 ? 1 : duraton - guideDuration

        console.log('竞猜阶段--------->', d, duraton, guideDuration)

        state.guideTimer = setTimeout(() => {
            pauseJxmsBgm()
            playJxmsSounds('./voice/02_01.mp3', () => {
                store.state.showGuide = true
                store.state.guideStep = 1
                setTimeout(() => {
                    store.state.guideStep = 2
                }, 10000);
                playJxmsSounds('./voice/rule_01.mp3', () => {

                    store.state.guideStep = 3

                    playJxmsSounds('./voice/rule_02.mp3', () => {
                        store.state.showGuide = false

                        playJxmsSounds('./voice/01_04.mp3', () => {
                            playJxmsBgm('./sounds/guess.mp3', true)
                        })
                    })
                })
            })
        }, d * 1000);
    }


    //清除定时器
    const clearTimer = () => {
        clearTimeout(state.playTimer)
        clearTimeout(state.videoTimer)
    }

    //播放背景音乐
    const playJxmsBgm = (src, loop = true, autoplay = true, volume = 1, call) => {
        if(src) state.bgmUrl = src
        try {
            state.jxmsAudio.unload()
        } catch (error) {
            
        }
        state.jxmsAudio = new Howl({
            src: [src || state.bgmUrl],
            autoplay,
            loop,
            volume,
            onend: function() {
                if(call){
                    console.log('Finished!');
                    call()
                }
            }
        })
    }

    //关闭背景音乐
    const pauseJxmsBgm = (e) => {
        console.log(e)
        try {
            state.jxmsAudio.fade(1, 0, 1500)
        } catch (error) {
            console.log(error)
        }
    }

    //播放音效
    const playJxmsSounds = (src, call) => {
        state.jxmsSounds = new Howl({
            src: [src || state.bgmUrl],
            autoplay: true,
            loop: false,
            volume: 1,
            onend: function() {
                if(call){
                    console.log('Finished!');
                    call()
                }
            }
        })
    }

    onUnmounted(() => {
        clearTimer()
    })


    const state = reactive({
        playTimer: undefined,
        videoTimer: undefined,
        videoPlay,
        clearTimer,
        bgmUrl: '',
        jxmsAudio: undefined,
        jxmsSounds: undefined,
        playJxmsBgm,
        pauseJxmsBgm,
        playJxmsSounds,
        guideStart,
        guideTimer: undefined,

        guideStep: 0
    })

    return toRefs(state)
}