const _drawFrequency = (ctx: CanvasRenderingContext2D | null | undefined, queue: Uint8Array[] = []) => {
    if(!ctx) {
        return
    }
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'rgba(0,0,255, 0.1)'
    ctx.strokeStyle = 'rgba(0,0,255, 0.3)'
    ctx.beginPath()
    queue.forEach(frequency => {
        const w = width / frequency.length
        frequency.forEach((n, i) => {
            const h = n / 255 * height
            ctx.rect(i * w, height - h, w, h)
        })
        ctx.fill()
        ctx.stroke()
    })
}


const FrequencyQueue: Uint8Array[] = []
export const drawFrequency = (ctx: CanvasRenderingContext2D | null | undefined, frequency: Uint8Array) => {
    // FrequencyQueue.push(frequency)
    // while(FrequencyQueue.length > 1) {
    //     FrequencyQueue.shift()
    // }
    // _drawFrequency(ctx, FrequencyQueue)

    if(!ctx) {
        return
    }
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    const w = width / frequency.length
    ctx.beginPath()
    frequency.forEach((n, i) => {
        const h = n / 255 * height
        ctx.rect(i * w, height - h, w, h)
    })
    ctx.fillStyle = 'rgba(0,0,255, 0.1)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,255, 0.3)'
    ctx.stroke()
}

export const drawSpectrum = (ctx: CanvasRenderingContext2D, spectrum?: Float32Array) => {
    const { width, height } = ctx.canvas
    const center = height * 0.5
    ctx.beginPath()
    ctx.moveTo(0, center)
    if(spectrum) {
        const w = width / (spectrum.length - 1)
        ctx.beginPath()
        ctx.moveTo(0, center)
        spectrum.forEach((n, i) => {
            ctx.lineTo(i * w, (1 + n) * center)
        })
    } else {
        ctx.lineTo(width, center)
        return
    }
    ctx.strokeStyle = '#000'
    ctx.stroke()
}

export const drawData = (ctx: CanvasRenderingContext2D | null | undefined, data: { spectrum: Float32Array; frequency: Uint8Array }) => {
    if(!ctx) {
        return
    }
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawFrequency(ctx, data.frequency)
    drawSpectrum(ctx, data.spectrum)
}
