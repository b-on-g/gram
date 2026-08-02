namespace $ {

	/** Голосу хватает скромного потока: на такой скорости запись звучит как
	 * телефонный разговор, а минута весит четверть мегабайта. Дожимать её
	 * нечем и незачем — опус и так плотнее любого нашего пережатия. */
	const rate = 32000

	/** Форматы по убыванию желанности: опус компактнее всех, но у Safari
	 * своего опуса нет, и там остаётся только контейнер от четвёртого мпега. */
	const types = [ 'audio/webm;codecs=opus', 'audio/webm', 'audio/mp4' ]

	/** Потолок длительности в секундах: на нём запись останавливается сама.
	 * Получасовой монолог никто не дослушает, а микрофон, забытый включённым,
	 * лучше выключить за пользователя. */
	const span_limit = 5 * 60

	/** Короче этого удержание считаем промахом по кнопке, а не сообщением. */
	const span_min = 0.7

	/** Готовая к отправке запись. */
	export type $bog_gram_voice_take = {
		bytes: Uint8Array< ArrayBuffer >,
		type: string,
		/** Длительность в секундах. */
		span: number,
	}

	/** Запись голоса с микрофона: один объект — одна запись. Начало и конец
	 * приходят разными событиями, поэтому она не может жить ни в меме, ни
	 * внутри одной фибры: фибра нажатия к моменту отпускания давно кончилась. */
	export class $bog_gram_voice extends $mol_object {

		/** Длительность строкой: семь секунд — это «0:07», а не «7». */
		static stamp( span: number ) {
			const whole = Math.max( 0, Math.round( span ) )
			const min = Math.floor( whole / 60 )
			const sec = whole % 60
			return min + ':' + String( sec ).padStart( 2, '0' )
		}

		/** Формат, который здешний браузер умеет писать. Пусто — не умеет ни
		 * одного из наших, и микрофон показывать незачем. */
		static type() {
			const maker = $mol_dom_context.MediaRecorder
			if( !maker ) return ''
			return types.find( type => maker.isTypeSupported( type ) ) ?? ''
		}

		static supported() {
			if( !$mol_dom_context.navigator?.mediaDevices?.getUserMedia ) return false
			return Boolean( this.type() )
		}

		/** Кого позвать, когда запись упёрлась в потолок длительности. */
		filled = ()=> {}

		/** Итог отдаём одним и тем же промисом, и это принципиально: фибра
		 * перезапускается на каждом ожидании, а новый промис на каждом её
		 * заходе означал бы запись, которая никогда не кончается. */
		done = ( take: $bog_gram_voice_take | null )=> {}
		result = new Promise< $bog_gram_voice_take | null >( done => { this.done = done } )

		/** Микрофон просим тоже ровно один раз — по той же причине. */
		opening = null as Promise< boolean > | null

		stream = null as MediaStream | null
		recorder = null as MediaRecorder | null

		/** Просили остановиться. Взводится и до того, как браузер отдал
		 * микрофон: тогда его сразу же и возвращаем. */
		asked = false

		/** Момент, с которого пошла запись: по нему считается её длина. */
		moment = 0

		limit = null as ReturnType< typeof setTimeout > | null

		open() {
			return this.opening ??= this.open_run()
		}

		/** Разрешение спрашивает браузер, и ответа можно ждать сколько
		 * угодно, поэтому внутри обычный async без фибр. */
		async open_run() {

			const type = $bog_gram_voice.type()
			if( !type ) throw new Error( 'Запись звука тут не поддерживается' )

			const stream = await $mol_dom_context.navigator.mediaDevices.getUserMedia({ audio: true })

			// Палец отпустили, пока браузер спрашивал разрешение: микрофон
			// возвращаем сразу, записывать уже нечего
			if( this.asked ) {
				this.hush( stream )
				this.done( null )
				return false
			}

			const chunks = [] as Blob[]

			const recorder = new $mol_dom_context.MediaRecorder( stream, {
				mimeType: type,
				audioBitsPerSecond: rate,
			} )

			recorder.ondataavailable = event => {
				if( event.data.size ) chunks.push( event.data )
			}

			recorder.onstop = ()=> {
				this.hush( stream )
				const span = ( Date.now() - this.moment ) / 1000
				if( span < span_min || !chunks.length ) return this.done( null )
				void this.pack( chunks, type, span )
			}

			this.stream = stream
			this.recorder = recorder
			this.moment = Date.now()

			recorder.start()

			this.limit = $mol_dom_context.setTimeout( ()=> this.filled(), span_limit * 1000 )

			return true
		}

		/** Кодировщик отдаёт запись кусками, а ленду нужен цельный буфер. */
		async pack( chunks: readonly Blob[], type: string, span: number ) {
			try {
				const blob = new $mol_blob( chunks, { type } )
				const bytes = new Uint8Array( await blob.arrayBuffer() )
				this.done({ bytes, type: blob.type || type, span })
			} catch( error ) {
				$mol_fail_log( error )
				this.done( null )
			}
		}

		/** Микрофон отпускаем сразу, как запись кончилась: иначе на телефоне
		 * так и останется гореть индикатор записи. */
		hush( stream: MediaStream | null ) {
			for( const track of stream?.getTracks() ?? [] ) track.stop()
		}

		/** Остановка синхронная и повторов не боится: палец могли отпустить
		 * ровно тогда же, когда сработал потолок длительности. */
		stop() {

			if( this.asked ) return
			this.asked = true

			if( this.limit !== null ) $mol_dom_context.clearTimeout( this.limit )
			this.limit = null

			const recorder = this.recorder

			// Микрофон ещё не отдали: разрешение доедет и само всё уберёт
			if( !recorder ) return

			if( recorder.state === 'inactive' ) {
				this.hush( this.stream )
				this.done( null )
			} else {
				recorder.stop()
			}

		}

		/** Отмена: микрофон отпускаем так же, а записанное выкидываем. */
		drop() {
			this.stop()
			this.done( null )
		}

		/** Итог записи. Пусто — записывать было нечего или вышло короче
		 * случайного тычка в кнопку. */
		take() {
			return this.result
		}

	}

}
