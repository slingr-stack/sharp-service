const svc = require('@slingr/slingr-services');
const sharp = require('sharp');

svc.hooks.onSvcStart = () => {
    svc.logger.info('Sharp Service has started');
}

svc.hooks.onSvcStop = (cause) => {
    svc.logger.info('Sharp Service is stopping.');
}

svc.functions.processImage = async ({ params, id }) => {
    let {
        fileId,
        fileName,
        operations,
        downloadSync,
    } = params;

    fileName ||= 'sharp-' + fileId;

    let file = await svc.files.download(fileId);
    let sharpFile = sharp(file);
    for (let operation of operations) {
        let [name, params] = operation;
        sharpFile = sharpFile[name](params);
    }

    // Instant response and keep processing the image on the background
    // Send the callback event to the function
    if (! downloadSync) {
        sharpFile
            .toBuffer()
            .then(async (data) => {
                let file = await successProcessFile(fileName, data);
                svc.events.send('imageProcessed', {
                    file,
                    ok: true,
                }, id);
            })
            .catch(async (err) => {
                svc.events.send('imageProcessed', {
                    ok: false,
                    error: err.message,
                    params: params,
                }, id);
            });
        return { ok: true };
    }

    // Wait until the image is processed and return
    // the file as the function response
    if (downloadSync) {
        let data = await sharpFile.toBuffer();
        return await successProcessFile(fileName, data);
    }
}

async function successProcessFile(fileName, data) {
    return await svc.files.upload(fileName, data);
}

svc.functions.info = () => {
    return {
        node: {
            version: process.version,
            platform: process.platform,
            arch: process.arch,
            memoryUsage: process.memoryUsage(),
        }
    }
}

svc.start();
