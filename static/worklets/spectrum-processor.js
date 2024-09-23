// spectrum-processor.js
class SpectrumProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        // const output = outputs[0];
        // output.forEach((channel) => {
        //     for (let i = 0; i < channel.length; i++) {
        //         channel[i] = Math.random() * 2 - 1;
        //     }
        // });
        const input = inputs[0]
        const channelData = input[0] || 0
        this.port.postMessage(channelData)
        return true;
    }
}

registerProcessor('spectrum-processor', SpectrumProcessor);