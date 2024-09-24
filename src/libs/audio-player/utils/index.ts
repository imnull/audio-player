const _drawFrequency = (ctx: CanvasRenderingContext2D | null | undefined, queue: Uint8Array[] = []) => {
    if (!ctx) {
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

    if (!ctx) {
        return
    }
    const { width, height } = ctx.canvas
    const c = width / 2
    const len = frequency.length * 2
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#05f'
    ctx.fillRect(0, 0, width, height)
    const w = width / len
    ctx.beginPath()
    frequency.forEach((n, i) => {
        const h = n / 256 * 0.8 * height
        ctx.rect(c + i * w, (height - h) / 2, w, h)
        ctx.rect(c - i * w, (height - h) / 2, w, h)
    })
    ctx.fillStyle = 'rgba(255,255,255, 0.8)'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    for (let i = 1; i < len; i++) {
        ctx.moveTo(w * i, 0)
        ctx.lineTo(w * i, height)
    }
    ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`
    ctx.lineWidth = 1
    ctx.stroke()
    // ctx.strokeStyle = 'rgba(0,0,255, 0.3)'
    // ctx.stroke()
}

export const drawSpectrum = (ctx: CanvasRenderingContext2D, spectrum?: Float32Array) => {
    const { width, height } = ctx.canvas
    const center = height * 0.5
    ctx.beginPath()
    ctx.moveTo(0, center)
    if (spectrum) {
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
    if (!ctx) {
        return
    }
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawFrequency(ctx, data.frequency)
    drawSpectrum(ctx, data.spectrum)
}


export const getBlobHash = async (file: Blob) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export const getTextHash = async (txt: string) => {
    const enc = new TextEncoder()
    const arrayBuffer = enc.encode(txt).buffer
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}


export type TPlayListItem = {
    id: string;
    name: string;
    ext: string;
    url: string;
    from: string;
    size: number;
}

const getPathName = (path: string) => {
    const fullname = path.trim().split(/[\/\\]+/).pop() || ''
    const [name, ext = ''] = fullname.split('.')
    return { name, ext }
}
export const parseListItem = async (it: string | File | TPlayListItem): Promise<TPlayListItem> => {
    if (typeof it === 'string') {
        const id = await getTextHash(it)
        const names = getPathName(it)
        return { id, url: it, from: 'link', size: -1, ...names }
    } else if (it instanceof Blob) {
        const id = await getBlobHash(it)
        const names = getPathName(it.name)
        const url = URL.createObjectURL(it)
        await saveAudioFromIndexedDB(id, it)
        return { id, url, from: 'file', size: it.size, ...names }
    } else {
        return it
    }
}

export const genPlayList = async (list: (string | File | TPlayListItem)[]) => {
    const raw: TPlayListItem[] = await Promise.all(list.map(parseListItem))
    const ids = Array.from(new Set(raw.map(({ id }) => id)))
    return ids.map(id => raw.find(it => it.id === id)) as TPlayListItem[]
}

const LIST_CACHE_KEY = 'audio-player-list'
const LIST_CACHE_AUDIO_TABLE = 'audios'
export const getCacheList = async (): Promise<TPlayListItem[]> => {
    const obj = localStorage.getItem(LIST_CACHE_KEY)
    if (!obj) {
        const list = await genPlayList(['./assets/viper.mp3', './assets/file_example_MP3_700KB.mp3'])
        updateCacheList(list)
        return await getCacheList()
    }
    try {
        const list = JSON.parse(obj) as TPlayListItem[]
        const _list = await Promise.all(list.map(async item => {
            if (item.from === 'file') {
                const it = await loadAudioFromIndexedDB(item.id)
                if (it) {
                    item.url = URL.createObjectURL(it)
                }
            }
            return item
        }))
        return _list
    } catch (ex) {
        console.log('getCacheList failed:', obj)
        return []
    }
}

export const updateCacheList = (list: TPlayListItem[]) => {
    localStorage.setItem(LIST_CACHE_KEY, JSON.stringify(list))
}

export const initDnD = (dropArea: HTMLElement, callback: (files: File[]) => void) => {

    const preventDefaults = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: any) => {
        const dt = e.dataTransfer;
        const files: File[] = dt.files.length ? Array.from(dt.files) : [];
        callback(files)
    }

    // 阻止默认的拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    // 当拖拽文件进入/悬停/离开时，修改样式
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
    });

    // 处理文件拖放
    dropArea.addEventListener('drop', handleDrop, false);
}

export const saveAudioFromIndexedDB = (id: string, blob: Blob) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(LIST_CACHE_KEY, 1);

    request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result
        db.createObjectStore(LIST_CACHE_AUDIO_TABLE, { keyPath: 'id' });
    }

    request.onsuccess = event => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(LIST_CACHE_AUDIO_TABLE, 'readwrite');
        const store = transaction.objectStore(LIST_CACHE_AUDIO_TABLE);
        const audioData = { id, blob }
        store.put(audioData)
        resolve()
    }

    request.onerror = event => {
        reject(event)
    }
})

export const loadAudioFromIndexedDB = async (id: string) => {
    return new Promise<Blob | null>(resolve => {
        const request = indexedDB.open(LIST_CACHE_KEY, 1);

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            const transaction = db.transaction(LIST_CACHE_AUDIO_TABLE, 'readonly');
            const store = transaction.objectStore(LIST_CACHE_AUDIO_TABLE);
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    resolve(getRequest.result.blob);
                } else {
                    resolve(null)
                }
            };

            getRequest.onerror = () => {
                resolve(null)
            };
        };
    });
}

export const removeAudioFromIndexedDB = (id: string) => {
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(LIST_CACHE_KEY, 1);

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(LIST_CACHE_AUDIO_TABLE, 'readwrite');
            const store = transaction.objectStore(LIST_CACHE_AUDIO_TABLE);
            const deleteRequest = store.delete(id);

            deleteRequest.onsuccess = () => {
                resolve();
            };

            deleteRequest.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
}