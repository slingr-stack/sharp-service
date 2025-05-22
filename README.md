<table class="table" style="margin-top: 10px">
    <thead>
    <tr>
        <th>Title</th>
        <th>Last Updated</th>
        <th>Summary</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Sharp Service</td>
        <td>May 21, 2025</td>
        <td>Process images with the Sharp Library</td>
    </tr>
    </tbody>
</table>

# Overview

Sharp is a Node-API module that can resize, convert, rotate, crop and edit
images in various formats.

For more information check the
[sharp.pixelplumbing.com](https://sharp.pixelplumbing.com/) documentation.

# Javascript API

## Process Image

`svc.sharp.processImage`

- Parameters
  - `fileId` - Mandatory - The Slingr File ID
  - `fileName` - Non-Mandatory - The resultant file name. Default `sharp-` + fileId.
  - `operations` - Mandatory - Array with the list of the sharp operations.
    - `[operationName, parameter1, parameter2, ...]` - Operation name is mandatory. Parameters depends on the sharp operation.
  - `downloadSync` - Non-Mandatory - Set to true if process should be synchronously. Default: `false`

```js
let fileId = record.field('image').id();

let options = {
  fileId: fileId,
  fileName: `${record.id()}-thumbnail.jpg`,
  operations: [
    ['resize', { width: 480 }],
  ]
}

let callbackData = {
  recordId: record.id(),
}

let callback = function(res, callbackData) {
  if (! res.ok) {
    return sys.logs.error(`Unable to process file with sharp`, res);
  }
  let record = sys.data.findById('images', callbackData.recordId);
  record.lock(record => {
    record.field('thumbnail').val({
      id: res.file.fileId,
      name: res.file.fileName,
    });
    sys.data.save(record);
  });
}

svc.sharp.processImage(options, callbackData, {
  imageProcessed: callback,
});
```

### Download Sync

If the process of the file takes less than 60 seconds you can use the `downloadSync` flag to get the response synchronously.

```js
let res = svc.sharp.processImage({
  fileId: fileId,
  fileName: `${record.id()}-thumbnail.jpg`,
  operations: [
    ['resize', { width: 480 }],
  ],
  downloadSync: true,
});
sys.logs.info(`File resized: [${res.fileId}]`);
```

### Other examples

```js
let res = svc.sharp.processImage({
  fileId: fileId,
  operations: [
    ['resize', 400, 600], // Set image size to width 400 and height 600
    ['rotate', 90], // Rotate image 90 degrees
    ['flip'], // Flip image horizontally
    ['flop'], // Flip image vertically
    ['blur', 5], // Blur image with a radius of 5
    ['negate'], // Invert image colors
    ['grayscale'], // Convert image to grayscale
    ['png'] // Convert image to PNG format
  ],
  downloadSync: true,
});
sys.logs.info(`File resized: [${res.fileId}]`);
```

# About SLINGR

SLINGR is a low-code rapid application development platform that accelerates development,
with robust architecture for integrations and executing custom workflows and automation.

[More info about SLINGR](https://slingr.io)

# License

This package is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
