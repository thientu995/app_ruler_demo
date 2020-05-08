const { desktopCapturer } = require('electron');
const request = require('request');
const timeForm = 1;
const timeTo = 10;

module.exports.funcCapture = function(){
    var timeout = randomCap();

    function randomCap() {
        const value = (Math.floor(Math.random() * timeTo) + timeForm) * 1000 * 60;
        console.log(value);
        return setTimeout(fullscreenScreenshot, value);
    }
    
    function fullscreenScreenshot() {
        var _this = this;
        // this.callback = callback;
        // imageFormat = imageFormat || 'image/jpeg';
        const imageFormat = 'image/png';
    
        this.handleStream = (stream) => {
            let imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
            console.log(stream.getVideoTracks()[0])
    
            var canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
            imageCapture.grabFrame()
                .then(imageBitmap => {
                    canvas.width = imageBitmap.width;
                    canvas.height = imageBitmap.height;
                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                    canvas.getContext('2d').drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
                    const data = canvas.toDataURL(imageFormat).replace(new RegExp('data:' + imageFormat + ";base64,", 'g'), "");
                    try {
                        stream.getTracks()[0].stop();
                    } catch (e) { }
    
                    request.post('http://192.168.40.21:4444/home/getpost', {
                        json: { base64: data }
                    }, (error, res, body) => {
                        if (error) {
                            console.error(error)
                            return
                        }
                        console.log(body)
                    })
                })
                .catch(error => console.log(error));
    
    
    
    
            // // Create hidden video tag
            // var video = document.createElement('video');
            // video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';
    
    
    
            // // Event connected to stream
            // video.onloadedmetadata = function () {
            //     // Set video ORIGINAL height (screenshot)
            //     video.style.height = this.videoHeight + 'px'; // videoHeight
            //     video.style.width = this.videoWidth + 'px'; // videoWidth
    
            //     video.play();
    
            //     // Create canvas
            //     var canvas = document.createElement('canvas');
            //     canvas.width = this.videoWidth;
            //     canvas.height = this.videoHeight;
            //     var ctx = canvas.getContext('2d');
            //     // Draw video on canvas
            //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
            //     if (_this.callback) {
            //         // Save screenshot to base64
            //         _this.callback(canvas.toDataURL(imageFormat));
            //     } else {
            //         console.log('Need callback!');
            //     }
    
            //     // Remove hidden video tag
            //     video.remove();
            //     try {
            //         // Destroy connect to stream
            //         stream.getTracks()[0].stop();
            //     } catch (e) { }
            // }
    
            // video.srcObject = stream;
            // document.body.appendChild(video);
        };
    
        this.handleError = function (e) {
            console.log(e);
        };
    
        desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
            const source = sources[0];
            // for (const source of sources) {
            // Filter: main screen
            // if ((source.name === "Entire screen") || (source.name === "Screen 1") || (source.name === "Screen 2")) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: source.id,
                        }
                    }
                });
    
                _this.handleStream(stream);
    
            } catch (e) {
                _this.handleError(e);
            }
            finally {
                clearTimeout(timeout);
                timeout = randomCap();
            }
            // }
            // }
        });
    }
}
