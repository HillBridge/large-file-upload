self.importScripts("./spark-md5.min.js")

self.onmessage = function(e){
	let file  = e.data
	let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
	let chunkSize = 0.5*1024*1024                        
    let chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
	let spark = new SparkMD5.ArrayBuffer()
	let fileReader = new FileReader()

	fileReader.onload = function (e) {
        spark.append(e.target.result);          
        currentChunk++;

        if (currentChunk < chunks) {
            loadNext();
        } else {
        	let hash = spark.end()
        	// 向主线程广播信息
			self.postMessage(hash);
        }
    };
	function loadNext() {
        let start = currentChunk * chunkSize
        let end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
}

