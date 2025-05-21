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

# Javascript API

## Process Image

- `svc.sharp.processImage`

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

# About SLINGR

SLINGR is a low-code rapid application development platform that accelerates development,
with robust architecture for integrations and executing custom workflows and automation.

[More info about SLINGR](https://slingr.io)

# License

This package is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
