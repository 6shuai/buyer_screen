<template>
	<div
		class="main"
	>
		<div 
			class="left_goods_list">
			<left-goods-list></left-goods-list>
		</div>

		<div class="goods_content">
			<!-- 竞拍历史 扫码查看更多宝贝 -->
			<miniview v-if="showHistryGoods"></miniview>

			<!-- 抢购 -->
			<div v-if="!showHistryGoods">
				<goods-content></goods-content>
			</div>
		</div>

		<div class="right_info">
			<right-info></right-info>
		</div>

		<!-- 数量不多了 警告 -->
		<warning v-if="showWarning && !closeWarning && gameState != gameStateId.panicBuyEnd "></warning>

		<!-- 倒计时 -->
		<count-down
			v-if="showCountDown"
			@countDown="countDown"
		></count-down>

	</div>
</template>

<script>
import {
	reactive,
	toRefs,
	computed,
	onMounted,
	nextTick,
	watch,
	ref,
} from "vue"
import { useStore } from "vuex"
import LeftGoodsList from "./layout/left.vue"
import GoodsContent from "./layout/content.vue"
import RightInfo from "./layout/right.vue"
import Warning from "./components/Warning.vue"
import CountDown from "./components/CountDown.vue"
import Miniview from "./components/Miniview.vue"
import socketMixin from "./mixins/socket"
import mixin from "./mixins/index"
import { gameStateId } from './util/index'

export default {
	setup(props) {
		const store = useStore()
		const { initWebsocket, test } = socketMixin()
		const { videoPlay, clearTimer, playJxmsBgm, pauseJxmsBgm, playJxmsSounds, jxmsAudio, guideStart, guideDuration } = mixin()

		//是否显示倒计时
		const showCountDown = computed(() => {
			return store.state.showCountDown
		})

		//游戏状态
		const gameState = computed(() => {
			return store.state.gameState
		})
	
		//倒计时
		const countDown = (e) => {
			try {
				if(jxmsAudio.value.playing()) jxmsAudio.value.unload()
			} catch (error) {
				
			}
			nextTick(() => {
				if (e == "end") {
					playJxmsSounds.value("./sounds/count_down_end.wav")
				} else {
					playJxmsSounds.value("./sounds/count_down_num.mp3")
				}
			})
		}

		//是否显示  库存不足警告
		const showWarning = computed(() => {
			return store.state.showWarning
		})

		const closeWarning = computed(() => {
			return store.state.closeWarning
		})

		//是否显示竞拍历史
		const showHistryGoods = computed(() => {
			return store.state.showHistryGoods
		})

		const showAdvVideo = computed(() => {
			return store.state.showAdvVideo
		})

		onMounted(() => {
			//socket 初始化 连接
			initWebsocket.value();

			//开始之前 背景音乐
			gameBgm()

			//音频预加载
			preload()
		})

		watch(gameState, (newState, oldState) => {
			let { guessTime, countdown, preheatTime } =
				store.state.goodsDataDetail
			let { goodsListData, currentGoodsIndex } = store.state
			state.isLoop = false
			store.state.showAdvVideo = false;
			switch (newState) {
				case 0:
					//预热阶段
					videoPlay.value(preheatTime - 10, 0)
					gameGuessPriceStartVoice(preheatTime)
					// goodsListData[currentGoodsIndex].hide = true
					break
				case 1:
					// 竞猜阶段
					store.commit('SET_VOICE_CAPTION', 'guessStart')
					playJxmsSounds.value("./voice/01_01.mp3", () => {
						store.state.showGuide = true
						store.commit('SET_VOICE_CAPTION', 1)
						setTimeout(() => {
							store.commit('SET_VOICE_CAPTION', 2)
						}, 10000);
						playJxmsSounds.value('./voice/rule_01.mp3', () => {
							playJxmsBgm.value("./sounds/guess.mp3", true)
						})
					})
					
					guideStart.value(guessTime + countdown - 9)
					// 9 = 倒计时9秒   55 =抢购教学时长 
					videoPlay.value(guessTime + countdown - 9 - guideDuration.value, 1)
					break
				case 2:
					// 倒计时

					break
				case 3:
					//抢购中
					store.state.showCountDown = false
					store.commit('SET_VOICE_CAPTION', 'panicBuyStart')
					playJxmsSounds.value("./voice/02_03.mp3", () => {
						playJxmsBgm.value("./sounds/buy_ing.mp3", true)
					})
					videoPlay.value(-1, 3)
					break
				case 4:
					//抢购结束
					gameEnd()
					videoPlay.value(30, 4)
					
					break
				default:
					break
			}
		})

		//预热阶段后十秒   （猜价开始前10秒）
		const gameGuessPriceStartVoice = (duration) =>{
			setTimeout(() => {
				store.commit('SET_VOICE_CAPTION', 'guessBefore')
				playJxmsSounds.value("./voice/00_02.mp3")
			}, (duration - 14)  * 1000);
		}

		//开始之前 和 结束后的 背景音乐
		const gameBgm = () => {
			playJxmsBgm.value("./sounds/before.mp3", true)
		}

		//抢购结束
		const gameEnd = () => {
			clearTimer.value()
			pauseJxmsBgm.value()
			playJxmsSounds.value("./sounds/buy_end.mp3", () => {
				store.commit('SET_VOICE_CAPTION', 'panicBuyEnd')
				playJxmsSounds.value("./voice/02_05.mp3", () => {
					setTimeout(() => {
						gameBgm()
					}, 2000)
				})
			})
		}

		//资源预加载
		const preload = () => {
			let audios = [
				{ id: 'before', src: "./sounds/before.mp3" },
				{ id: 'buy_end', src: "./sounds/buy_end.mp3" },
				{ id: 'buy_ing', src: "./sounds/buy_ing.mp3" },
				{ id: 'buy_success', src: "./sounds/buy_success.mp3" },
				{ id: 'count_down_end', src: "./sounds/count_down_end.wav" },
				{ id: 'count_down_num', src: "./sounds/count_down_num.mp3" },
				{ id: 'guess', src: "./sounds/guess.mp3" },
				{ id: 'warning', src: "./sounds/warning.mp3" },
				{ id: '00_01', src: "./voice/00_01.mp3" },
				{ id: '00_02', src: "./voice/00_02.mp3" },
				{ id: '01_01', src: "./voice/01_01.mp3" },
				{ id: '01_02', src: "./voice/01_02.mp3" },
				{ id: '01_03', src: "./voice/01_03.mp3" },
				{ id: '02_01', src: "./voice/02_01.mp3" },
				{ id: '02_02', src: "./voice/02_02.mp3" },
				{ id: '02_03', src: "./voice/02_03.mp3" },
				{ id: '02_04', src: "./voice/02_04.mp3" },
				{ id: '02_05', src: "./voice/02_05.mp3" },
				{ id: '02_07', src: "./voice/02_07.mp3" },
				{ id: '02_08', src: "./voice/02_08.mp3" },
				{ id: '02_09', src: "./voice/02_09.mp3" },
				{ id: '03_01', src: "./voice/03_01.mp3" },
				{ id: '03_02', src: "./voice/03_02.mp3" },
				{ id: '04_01', src: "./voice/04_01.mp3" },
				{ id: '04_02', src: "./voice/04_02.mp3" },
				{ id: 'digi_1', src: "./voice/digi_1.mp3" },
				{ id: 'digi_2', src: "./voice/digi_2.mp3" },
				{ id: 'digi_3', src: "./voice/digi_3.mp3" },
				{ id: 'digi_4', src: "./voice/digi_4.mp3" },
				{ id: 'digi_5', src: "./voice/digi_5.mp3" },
				{ id: 'digi_6', src: "./voice/digi_6.mp3" },
				{ id: 'digi_7', src: "./voice/digi_7.mp3" },
				{ id: 'digi_8', src: "./voice/digi_8.mp3" },
				{ id: 'digi_9', src: "./voice/digi_9.mp3" },
				{ id: 'discount1', src: "./voice/discount1.mp3" },
				{ id: 'discount2', src: "./voice/discount2.mp3" },
				{ id: 'discount3', src: "./voice/discount3.mp3" },
				{ id: 'discount4', src: "./voice/discount4.mp3" },
				{ id: 'discount5', src: "./voice/discount5.mp3" },
				{ id: 'discount6', src: "./voice/discount6.mp3" },
				{ id: 'discount7', src: "./voice/discount7.mp3" },
				{ id: 'discount8', src: "./voice/discount8.mp3" },
				{ id: 'discount9', src: "./voice/discount9.mp3" },
				{ id: 'rule_01', src: "./voice/rule_01.mp3" },
				{ id: 'rule_02', src: "./voice/rule_02.mp3" },
				{ src: "./Dior口红套装.png" },
				{ src: "./戴森无绳吸尘器V11.png" },
				{ src: "./索尼85寸液晶电视.png" },
				{ src: "./count_down/count_down_1.png" },
				{ src: "./count_down/count_down_2.png" },
				{ src: "./count_down/count_down_3.png" },
				{ src: "./count_down/count_down_4.png" },
				{ src: "./count_down/count_down_5.png" },
				{ src: "./count_down/count_down_6.png" },
				{ src: "./count_down/count_down_7.png" },
				{ src: "./count_down/count_down_8.png" },
				{ src: "./count_down/count_down_9.png" }
			]

			var queue = new createjs.LoadQueue()
			queue.installPlugin(createjs.Sound)
			queue.on("complete", handleComplete, this)
			queue.loadManifest(audios)
			function handleComplete() {
				console.log('preload')
				// audios.forEach(e => {
				// 	store.state.jxmsudio[e.id] = queue.getResult(e.id).src
				// })
			}

		}

		watch(showAdvVideo, (newState, oldState) => {
			if (newState) {
				pauseJxmsBgm.value()
			} else {
				if(state.gameState != 4) playJxmsBgm.value(null, true)
			}
		})

		//抢购1结束后  抢购2预览开始
		watch(gameState, (newState, oldState) => {
			if(newState == null){
				test.value(23)
			}
		})

		const state = reactive({
			gameState,
			showCountDown,
			showWarning,
			closeWarning,
			isLoop: false,
			audioUrl: "",
			playTimer: undefined,
			countDown,
			showHistryGoods,
			gameStateId
		})

		return toRefs(state)
	},
	components: {
		LeftGoodsList,
		GoodsContent,
		RightInfo,
		Warning,
		CountDown,
		Miniview,
	}
}
</script>

<style lang="less" scope>
.main {
	width: 100%;
	height: 100%;
	overflow: hidden;
	display: flex;

	&.miniview {
		background: url("./images/miniview_bg.png") center no-repeat;
		// background-size: 100% 100%;
		overflow: hidden;
	}

	.left_goods_list,
	.right_info {
		width: 17.8%;
		min-width: 17.8%;
		height: 100%;
	}

	.goods_content {
		flex: 1;
		height: 100%;
		position: relative;
		overflow: hidden;

		.goods_box {
			width: 100%;
			height: 100%;
			position: relative;
		}

		.card {
			width: 100%;
			height: 100px;
			position: absolute;
			bottom: -100%;
			left: 0;
			background: #000;

			&1 {
				animation: cardHide 1s ease-in;
			}
			&2 {
				animation: cardShow 1s ease-out;
			}
		}

		@keyframes cardHide {
			0% {
				bottom: 0px;
				opacity: 1;
			}
			100% {
				bottom: 100px;
				opacity: 0;
			}
		}

		@keyframes cardShow {
			0% {
				bottom: -100px;
				opacity: 0;
			}
			100% {
				bottom: 0px;
				opacity: 1;
			}
		}
	}
}

</style>
