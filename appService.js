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
    } = params;

    fileName ||= 'sharp-' + fileId;

    let file = await svc.files.download(fileId);
    let sharpFile = sharp(file);
    for (let operation of operations) {
        let [name, params] = operation;
        sharpFile = sharpFile[name](params);
    }

    sharpFile
        .toBuffer()
        .then(async (data) => {
            // Upload file to Slingr app
            console.log('Uploading file...');
            let file = await svc.files.upload(fileName, data);
            // Send callback event to the app with the file
            console.log('Sending OK event');
            svc.events.send('imageProcessed', {
                file,
                ok: true,
            }, id);
        })
        .catch(err => {
            // On Error send back to the app to handle the error
            console.log('Sending ERROR event');
            svc.events.send('imageProcessed', {
                ok: false,
                error: err.message,
                params: params,
            }, id);
        })
    return { ok: true };
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
