window.addEventListener('load', () => {
    const worker = new Tesseract.TesseractWorker()

    const camera = document.querySelector('video#camera')
    const constraints = { video: true, audio: false }

    const handleStream = stream => {
        camera.src = stream
        camera.play()
    }

    navigator.mediaDevices.getUserMedia(constraints, handleStream)
        .then(stream => {
            camera.srcObject = stream
            const canvas = document.createElement('canvas')
            canvas.height = 640
            canvas.width = 480
            const context = canvas.getContext('2d')
            let interval = setInterval(() => {
                context.drawImage(camera, 0, 0, canvas.width, canvas.height)
                const data = canvas.toDataURL('image/jpeg')

                const image = new Image()

                image.src = data

                image.offsetHeight = image.height / 2
                image.offsetWidth = image.width / 2

                worker.recognize(image, 'swe', {
                    tessedit_char_whitelist: '0123456789#&'
                })
                    .progress(progress => {
                        console.log('progress', progress)
                    })
                    .then(result => {
                        console.log('result', result)
                        document.querySelector('div#result').innerText = result.text
                        const regex = /\w+[0-9]{9,}\w+/g
                        const stripped = result.text.replace('\n', '')
                        if (regex.test(stripped)) {
                            const ocr = stripped.match(regex)[0]
                            const heading = document.createElement('h1')
                            const textNode = document.createTextNode(`Ditt ocr är: ${ocr}`)
                            heading.appendChild(textNode)
                            document.querySelector('div#result').appendChild(heading)
                            document.querySelector('img#final').src = data
                            clearInterval(interval)
                        }
                    })

            }, 2000)
        })

})