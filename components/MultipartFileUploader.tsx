import React from "react";
import Uppy, { type UploadResult } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3Multipart from "@uppy/aws-s3-multipart";

// Uppy styles
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

const fetchUploadApiEndpoint = async (endpoint: string, data: any) => {
  const res = await fetch(`/api/multipart-upload/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return res.json();
};

export function MultipartFileUploader({
  onUploadSuccess,
}: {
  onUploadSuccess: (result: UploadResult) => void;
}) {
  const uppy = React.useMemo(() => {
    const uppy = new Uppy({
      autoProceed: true,
    }).use(AwsS3Multipart, {
      createMultipartUpload: async (file) => {
        const contentType = file.type;
        return fetchUploadApiEndpoint("create-multipart-upload", {
          file,
          contentType,
        });
      },
      listParts: (file, props) =>
        fetchUploadApiEndpoint("list-parts", { file, ...props }),
      signPart: (file, props) =>
        fetchUploadApiEndpoint("sign-part", { file, ...props }),
      abortMultipartUpload: (file, props) =>
        fetchUploadApiEndpoint("abort-multipart-upload", { file, ...props }),
      completeMultipartUpload: (file, props) =>
        fetchUploadApiEndpoint("complete-multipart-upload", { file, ...props }),
    });
    return uppy;
  }, []);
  uppy.on("complete", (result) => {
    onUploadSuccess(result);
  });
  uppy.on("upload-success", (file, response) => {
    uppy.setFileState(file.id, {
      progress: uppy.getState().files[file.id].progress,
      uploadURL: response.body.Location,
      response: response,
      isPaused: false,
    });
  });

  return <Dashboard uppy={uppy} showLinkToFileUploadResult={true} />;
}





import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import RemoteSources from '@uppy/remote-sources';
import Webcam from '@uppy/webcam';
import ScreenCapture from '@uppy/screen-capture';
import GoldenRetriever from '@uppy/golden-retriever';
import Tus from '@uppy/tus';
import AwsS3 from '@uppy/aws-s3';
import AwsS3Multipart from '@uppy/aws-s3-multipart';
import XHRUpload from '@uppy/xhr-upload';
import ImageEditor from '@uppy/image-editor';
import DropTarget from '@uppy/drop-target';
import Audio from '@uppy/audio';
import Compressor from '@uppy/compressor';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/audio/dist/style.css';
import '@uppy/screen-capture/dist/style.css';
import '@uppy/image-editor/dist/style.css';

const UPLOADER = 'tus';
const COMPANION_URL = 'http://companion.uppy.io';
const companionAllowedHosts = [];
const TUS_ENDPOINT = 'https://tusd.tusdemo.net/files/';
const XHR_ENDPOINT = '';

const RESTORE = false;

const uppyDashboard = new Uppy({ debug: true })
  .use(Dashboard, {
    inline: true,
    target: '#app',
    showProgressDetails: true,
    proudlyDisplayPoweredByUppy: true,
  })
  .use(RemoteSources, {
    companionUrl: COMPANION_URL,
    sources: [
      'Box',
      'Dropbox',
      'Facebook',
      'GoogleDrive',
      'Instagram',
      'OneDrive',
      'Unsplash',
      'Url',
    ],
    companionAllowedHosts,
  })
  .use(Webcam, {
    target: Dashboard,
    showVideoSourceDropdown: true,
    showRecordingLength: true,
  })
  .use(Audio, {
    target: Dashboard,
    showRecordingLength: true,
  })
  .use(ScreenCapture, { target: Dashboard })
  .use(ImageEditor, { target: Dashboard })
  .use(DropTarget, {
    target: document.body,
  })
  .use(Compressor);

switch (UPLOADER) {
  case 'tus':
    uppyDashboard.use(Tus, { endpoint: TUS_ENDPOINT, limit: 6 });
    break;
  case 's3':
    uppyDashboard.use(AwsS3, { companionUrl: COMPANION_URL, limit: 6 });
    break;
  case 's3-multipart':
    uppyDashboard.use(AwsS3Multipart, {
      companionUrl: COMPANION_URL,
      limit: 6,
    });
    break;
  case 'xhr':
    uppyDashboard.use(XHRUpload, {
      endpoint: XHR_ENDPOINT,
      limit: 6,
      bundle: true,
    });
    break;
  default:
}

if (RESTORE) {
  uppyDashboard.use(GoldenRetriever, { serviceWorker: true });
}

window.uppy = uppyDashboard;

uppyDashboard.on('complete', (result) => {
  if (result.failed.length === 0) {
    console.log('Upload successful üòÄ');
  } else {
    console.warn('Upload failed üòû');
  }
  console.log('successful files:', result.successful);
  console.log('failed files:', result.failed);
});
