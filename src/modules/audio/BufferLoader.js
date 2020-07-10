
export default class BufferLoader {
	constructor(context) {

		this.context = context
	}

	loadBuffer(key) {
		return new Promise(resolve => {

			let request = new XMLHttpRequest()
			request.open('GET', this.url[key], true)
			request.responseType = 'arraybuffer'
	
			request.onload = () => {
	
				this.context.decodeAudioData(
					request.response,
					buffer => {
						if (!buffer) {
							console.log('error decoding file data: ' + this.urlList[index])
							resolve()
							return
						}
	
						this.bufferList[key] = buffer
						resolve()
					},
					error => {
						console.error('decodeAudioData error', error)
						resolve()
					},
				)
			}
			request.onerror = () => {
				console.log('BufferLoader: XHR error')
				resolve()
			}
	
			request.send()
		})
	}

	async load(url) {

		this.url = url
		this.bufferList = {}

		await Promise.all(
			Object.keys(this.url).map(key => this.loadBuffer(key))
		)

		return this.bufferList
	}
}
